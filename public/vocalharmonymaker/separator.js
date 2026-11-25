// Separation worker (module worker, started by index.html).
// Downloads the Spleeter 2stems model once (kept in Cache Storage, so later runs need no download) and splits a
// song into vocals and accompaniment with ONNX Runtime Web. The chords, the melody and the harmony are found
// afterwards by harmony.js.
//
// Model: Spleeter 2stems (Deezer; code and trained models under the MIT License), converted to ONNX by the
// sherpa-onnx project (k2-fsa, Apache-2.0): vocals.onnx and accompaniment.onnx. Both allow commercial use. The
// files are served by this site (models/<MODEL_DIR>/, made by scripts/fetch-model.mjs), not by an outside CDN.
// Files larger than Cloudflare's 25 MiB limit are split into parts; manifest.json lists them.
// The STFT, masks and inverse STFT around the model are in dsp.js.
// This file and dsp.js are copied from Karaoke Trainer (ktkwmr/KaraokeTrainer, same author; the melody line and
// the beats are left out): a bug fixed in one should be fixed in the other too.
//
// Messages from the page:
//   { type: "run", left: Float32Array, right: Float32Array, gpu, safe, threads? }  (44.1 kHz)
// Messages to the page:
//   { type: "progress", stage: "download" | "lib" | "init" | "separate", loaded?, total?, done?, chunks?, elapsed? }
//   { type: "backend", name: "webgpu" | "wasm", threads, safe }
//   { type: "done", stems: [[Int16Array L, R] vocals, [L, R] accompaniment] }  (shared memory when isolated)
//   { type: "error", code: "offline" | "download" | "memory" | "run", stage, message }

import { createSpleeter, SPLEETER } from "./dsp.js";

// Keep these in sync with MODEL_DIR / MODEL_CACHE in index.html, CDN / KEEP in sw.js and scripts/fetch-model.mjs
const ORT_BASE = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";
const MODEL_DIR = "models/spleeter-2stems-v2/";
const MODEL_CACHE = "vocalharmonymaker-model-v2";
const STEMS = ["vocals", "accompaniment"];

const post = (msg, transfer) => self.postMessage(msg, transfer || []);
const modelUrl = (name) => new URL(MODEL_DIR + name + ".onnx", self.location.href).href;
const fail = (message, code) => Object.assign(new Error(message), { code });

async function fetchOk(url) {
  let res;
  try {
    res = await fetch(url, { cache: "no-cache" });
  } catch (e) {
    throw fail(String((e && e.message) || e), navigator.onLine === false ? "offline" : "download");
  }
  if (!res.ok) throw fail("HTTP " + res.status + " " + url, "download");
  return res;
}

async function cached(name) {
  try {
    const cache = await caches.open(MODEL_CACHE);
    const hit = await cache.match(modelUrl(name));
    return hit ? new Uint8Array(await hit.arrayBuffer()) : null;
  } catch (e) {
    return null; // Cache Storage unavailable (private mode etc.): download every time
  }
}

// Both model files (each possibly in parts), with one progress bar over all the bytes still to download
async function loadModels() {
  const out = {};
  const missing = [];
  for (const name of STEMS) {
    out[name] = await cached(name);
    if (!out[name]) missing.push(name);
  }
  if (!missing.length) return out;
  post({ type: "progress", stage: "download", loaded: 0, total: 0 });
  const manifest = await (await fetchOk(new URL(MODEL_DIR + "manifest.json", self.location.href).href)).json();
  let total = 0, loaded = 0, last = 0;
  for (const name of missing) total += manifest.files[name].bytes;
  for (const name of missing) {
    const info = manifest.files[name];
    const bytes = new Uint8Array(info.bytes);
    let at = 0;
    for (const part of info.parts) {
      const res = await fetchOk(new URL(MODEL_DIR + part, self.location.href).href);
      const reader = res.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (at + value.length > bytes.length) throw fail("model file larger than expected", "download");
        bytes.set(value, at);
        at += value.length;
        loaded += value.length;
        const now = Date.now();
        if (now - last > 150) { last = now; post({ type: "progress", stage: "download", loaded, total }); }
      }
    }
    if (at !== bytes.length) throw fail("incomplete download", "download");
    try {
      const cache = await caches.open(MODEL_CACHE);
      await cache.put(modelUrl(name), new Response(bytes, { headers: { "content-type": "application/octet-stream" } }));
    } catch (e) {
      // Not enough storage, or Cache Storage unavailable: downloaded again next time
    }
    out[name] = bytes;
  }
  post({ type: "progress", stage: "download", loaded: total, total });
  return out;
}

// gpu: WebGPU (falls back to the CPU in the same session). safe: at most 2 threads and no memory arena
// (phones and retries). threads: a fixed number of CPU threads. index.html picks these per device and
// moves on to the next setting in a fresh worker when one fails (a failed backend cannot be restarted).
async function createSessions(models, gpu, safe, fixedThreads) {
  post({ type: "progress", stage: "lib" });
  // Only when the browser really gives a GPU (otherwise ONNX Runtime drops WebGPU silently and runs on the CPU)
  let useGpu = false;
  if (gpu && "gpu" in navigator) {
    try { useGpu = !!(await navigator.gpu.requestAdapter()); } catch (e) {}
  }
  // The WebGPU build includes the CPU backend too, but its .wasm file is about twice as large
  const ort = await import(ORT_BASE + (useGpu ? "ort.webgpu.min.mjs" : "ort.wasm.min.mjs"));
  ort.env.wasm.wasmPaths = ORT_BASE;
  // Several threads only work on a cross-origin isolated page (COOP / COEP in public/_headers)
  const cores = navigator.hardwareConcurrency || 4;
  const threads = !self.crossOriginIsolated ? 1 : fixedThreads > 0 ? fixedThreads : safe ? Math.min(2, cores) : Math.max(1, Math.min(8, cores));
  ort.env.wasm.numThreads = threads;
  post({ type: "progress", stage: "init" });
  const opts = safe
    ? { graphOptimizationLevel: "basic", enableCpuMemArena: false, enableMemPattern: false }
    : { graphOptimizationLevel: "basic" };
  const ep = useGpu ? ["webgpu", "wasm"] : ["wasm"];
  const sessions = {};
  for (const name of STEMS) sessions[name] = await ort.InferenceSession.create(models[name], { ...opts, executionProviders: ep });
  post({ type: "backend", name: useGpu ? "webgpu" : "wasm", threads, safe: !!safe });
  return { ort, sessions };
}

// float16 input / output (the fp16 model variants) as Uint16Array, for ONNX Runtime
function toHalf(f32) {
  const out = new Uint16Array(f32.length);
  const f = new Float32Array(1), u = new Uint32Array(f.buffer);
  for (let i = 0; i < f32.length; i++) {
    f[0] = f32[i];
    const x = u[0], sign = (x >>> 16) & 0x8000, exp = ((x >>> 23) & 0xff) - 112, mant = x & 0x7fffff;
    out[i] = exp <= 0 ? sign : exp >= 31 ? sign | 0x7c00 : sign | (exp << 10) | (mant >>> 13);
  }
  return out;
}
function fromHalf(u16) {
  const out = new Float32Array(u16.length);
  for (let i = 0; i < u16.length; i++) {
    const h = u16[i], s = h & 0x8000 ? -1 : 1, e = (h >> 10) & 0x1f, m = h & 0x3ff;
    out[i] = e === 0 ? s * m * Math.pow(2, -24) : e === 31 ? s * Infinity : s * (1 + m / 1024) * Math.pow(2, e - 15);
  }
  return out;
}
function inputType(session) {
  const meta = session.inputMetadata && session.inputMetadata[0];
  return meta && meta.type === "float16" ? "float16" : "float32";
}

async function runModel(ort, session, mag, dims) {
  const half = inputType(session) === "float16";
  const tensor = half ? new ort.Tensor("float16", toHalf(mag), dims) : new ort.Tensor("float32", mag, dims);
  const results = await session.run({ [session.inputNames[0]]: tensor });
  const t = results[session.outputNames[0]];
  let data = t.location && t.location !== "cpu" ? await t.getData(true) : t.data;
  if (t.type === "float16") data = typeof Float16Array === "function" && data instanceof Float16Array ? Float32Array.from(data) : fromHalf(data);
  else data = new Float32Array(data); // own copy (the tensor is released below)
  for (const name of session.outputNames) { try { results[name].dispose(); } catch (e) {} }
  return data;
}

function makePcm(n) {
  // On a cross-origin isolated page the stems are shared memory, so the page, the player and the other
  // workers use them without copying
  const shared = self.crossOriginIsolated && typeof SharedArrayBuffer === "function";
  return new Int16Array(shared ? new SharedArrayBuffer(n * 2) : n);
}

async function separate(ort, sessions, left, right) {
  const n = left.length;
  let outV, outA;
  try {
    outV = [makePcm(n), makePcm(n)];
    outA = [makePcm(n), makePcm(n)];
  } catch (e) {
    throw fail("out of memory", "memory");
  }
  const sp = createSpleeter(left, right);
  const dims = [2, 1, SPLEETER.frames, SPLEETER.bins];
  const t0 = Date.now();
  post({ type: "progress", stage: "separate", done: 0, chunks: sp.splits, elapsed: 0 });
  for (let s = 0; s < sp.splits; s++) {
    const mag = sp.input(s);
    const vocals = await runModel(ort, sessions.vocals, mag, dims);
    const accompaniment = await runModel(ort, sessions.accompaniment, mag, dims);
    sp.output(s, vocals, accompaniment, outV, outA);
    post({ type: "progress", stage: "separate", done: s + 1, chunks: sp.splits, elapsed: Date.now() - t0 });
    // A short pause between splits gives the browser a chance to free memory (matters on a phone)
    await new Promise((r) => setTimeout(r, 0));
  }
  return [outV, outA];
}

self.onmessage = async (e) => {
  const msg = e.data;
  if (!msg || msg.type !== "run") return;
  // Which step failed, for the error message: download / init (loading the model) / separate (running it)
  let stage = "download";
  try {
    let models = await loadModels();
    stage = "init";
    let ort, sessions;
    try {
      ({ ort, sessions } = await createSessions(models, !!msg.gpu, !!msg.safe, msg.threads | 0));
    } catch (err) {
      const text = String((err && err.message) || err);
      throw fail(text, /memory|alloc|RangeError/i.test(text) ? "memory" : navigator.onLine === false ? "offline" : "run");
    }
    models = null;
    stage = "separate";
    const stems = await separate(ort, sessions, msg.left, msg.right);
    for (const name of STEMS) { try { await sessions[name].release(); } catch (err) {} }
    const transfer = stems.flatMap((s) => [s[0].buffer, s[1].buffer]).filter((b) => b instanceof ArrayBuffer);
    post({ type: "done", stems }, transfer);
  } catch (err) {
    const text = String((err && err.message) || err);
    post({ type: "error", code: err.code || (/memory|alloc/i.test(text) ? "memory" : "run"), stage, message: text });
  }
};
