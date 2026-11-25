#!/usr/bin/env node
// Puts the Spleeter 2stems ONNX model (vocals.onnx / accompaniment.onnx) into
// public/vocalharmonymaker/models/spleeter-2stems-v2/, so this site serves it itself (no outside CDN).
//
// Source: the sherpa-onnx project (k2-fsa, Apache-2.0) converted Deezer's Spleeter 2stems model (MIT) to ONNX
// and publishes it as a GitHub release asset (MODEL_URL below; docs:
// https://k2-fsa.github.io/sherpa/onnx/source-separation/index.html).
//
// The ONNX files declare the frequency axis (the last one of input x and output y) as 1024 bins (11 kHz). The
// network has no fixed size along it, so it is changed to a free dimension "F", and dsp.js passes 1536 bins
// (16 kHz), as Spleeter's own 2stems-16kHz configuration does with the same trained weights. Nothing else in
// the files changes (v1 was the files as published).
//
// Cloudflare Workers static assets take files up to 25 MiB, so each model file is cut into parts of
// PART_BYTES. manifest.json lists the parts, the size, and the SHA-256 of each whole file; separator.js
// joins the parts again.
//
// Runs in the build (build.command in wrangler.jsonc) and does nothing when the files are already there.
// The model files are not committed (.gitignore).
//
// Usage: node scripts/fetch-model.mjs [--from <dir with vocals.onnx and accompaniment.onnx>] [--force] [--check]
//   --from   use local files instead of downloading (also how the tests put a small fake model in place)
//   --force  replace files that are already there
//   --check  do not write; exit 1 if the model files are missing or a part is larger than 25 MiB
//
// If you change the model files (another variant such as fp16 / int8, or a new release), change MODEL_DIR to
// a new folder (-v2) here and in separator.js / index.html (MODEL_DIR, MODEL_CACHE) and sw.js (KEEP), so
// browsers that kept the old files download the new ones.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const MODEL_URL = "https://github.com/k2-fsa/sherpa-onnx/releases/download/source-separation-models/sherpa-onnx-spleeter-2stems.tar.bz2";
const OUT = fileURLToPath(new URL("../public/vocalharmonymaker/models/spleeter-2stems-v2/", import.meta.url));
const NAMES = ["vocals", "accompaniment"];
const LIMIT = 25 * 1024 * 1024;
const PART_BYTES = 20 * 1024 * 1024;

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const FORCE = args.includes("--force");
const CHECK = args.includes("--check");
const FROM = opt("--from");
const partBytes = Number(opt("--part-bytes")) || PART_BYTES;

// ---- The frequency axis made free: a minimal protobuf walk (ModelProto → graph → input / output → type →
// tensor_type → shape → the 4th dim). A Dimension {dim_value: 1024} is the bytes 08 80 08 and
// {dim_param: "F"} is 12 01 46: the same length, so the bytes are replaced in place and no length around them
// changes.
function varint(buf, pos) {
  let v = 0, mul = 1, b;
  do { b = buf[pos++]; v += (b & 0x7f) * mul; mul *= 128; } while (b & 0x80);
  return [v, pos];
}
// Fields of the message in buf[start, end): [{ field, wire, start, end }] (start / end of the value; LEN only)
function fieldsOf(buf, start, end) {
  const out = [];
  let pos = start;
  while (pos < end) {
    let tag, len;
    [tag, pos] = varint(buf, pos);
    const field = Math.floor(tag / 8), wire = tag & 7;
    if (wire === 0) { [, pos] = varint(buf, pos); continue; }
    if (wire === 1) { pos += 8; continue; }
    if (wire === 5) { pos += 4; continue; }
    if (wire !== 2) throw new Error("Unexpected protobuf wire type " + wire);
    [len, pos] = varint(buf, pos);
    out.push({ field, start: pos, end: pos + len });
    pos += len;
  }
  return out;
}
const child = (buf, m, field) => fieldsOf(buf, m.start, m.end).filter((f) => f.field === field);
function freeFrequencyAxis(bytes) {
  const buf = Buffer.from(bytes);
  const graph = child(buf, { start: 0, end: buf.length }, 7)[0];
  if (!graph) throw new Error("No graph in the ONNX file");
  let changed = 0;
  for (const io of [...child(buf, graph, 11), ...child(buf, graph, 12)]) {
    const tensor = child(buf, child(buf, io, 2)[0], 1)[0];
    const dims = child(buf, child(buf, tensor, 2)[0], 1);
    if (dims.length !== 4) throw new Error("Expected 4 dimensions, found " + dims.length);
    const d = dims[3], raw = buf.subarray(d.start, d.end);
    if (raw[0] === 0x12 && raw[1] === raw.length - 2) continue; // already free (a dim_param only)
    if (!raw.equals(Buffer.from([0x08, 0x80, 0x08]))) throw new Error("The last dimension is not 1024: " + raw.toString("hex"));
    raw.set([0x12, 0x01, 0x46]);
    changed++;
  }
  if (!changed && !child(buf, graph, 11).length) throw new Error("No inputs in the ONNX graph");
  return buf;
}

async function current() {
  try {
    const m = JSON.parse(await readFile(join(OUT, "manifest.json"), "utf8"));
    for (const name of NAMES) {
      const f = m.files[name];
      let total = 0;
      for (const p of f.parts) {
        const s = await stat(join(OUT, p));
        if (s.size > LIMIT) return { ok: false, why: `${p} is larger than 25 MiB` };
        total += s.size;
      }
      if (total !== f.bytes) return { ok: false, why: `${name}: the parts add up to ${total} bytes, manifest says ${f.bytes}` };
    }
    return { ok: true, manifest: m };
  } catch (e) {
    return { ok: false, why: String(e.message || e) };
  }
}

async function findFile(dir, name) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) { const hit = await findFile(p, name); if (hit) return hit; }
    else if (entry.name === name) return p;
  }
  return null;
}

const state = await current();
if (CHECK) {
  if (!state.ok) { console.error("Model files are missing or invalid: " + state.why + "\nRun: node scripts/fetch-model.mjs"); process.exit(1); }
  console.log("Model files are in place.");
  process.exit(0);
}
if (state.ok && !FORCE) {
  console.log("Model files are already in place (" + OUT + ").");
  process.exit(0);
}

let srcDir = FROM;
let tmp = null;
if (!srcDir) {
  tmp = await mkdtemp(join(tmpdir(), "spleeter-"));
  console.log("Downloading " + MODEL_URL);
  const res = await fetch(MODEL_URL);
  if (!res.ok) throw new Error("Download failed: HTTP " + res.status);
  const archive = join(tmp, "model.tar.bz2");
  await writeFile(archive, Buffer.from(await res.arrayBuffer()));
  // Node has no bzip2; the build image's tar does
  execFileSync("tar", ["-xjf", archive, "-C", tmp], { stdio: "inherit" });
  srcDir = tmp;
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
const manifest = { source: FROM ? "local files" : MODEL_URL, files: {} };
for (const name of NAMES) {
  const file = await findFile(srcDir, name + ".onnx");
  if (!file) throw new Error(name + ".onnx not found in " + srcDir);
  const bytes = freeFrequencyAxis(await readFile(file));
  const parts = [];
  for (let at = 0, i = 0; at < bytes.length; at += partBytes, i++) {
    const part = `${name}.onnx.${String(i).padStart(3, "0")}`;
    await writeFile(join(OUT, part), bytes.subarray(at, Math.min(bytes.length, at + partBytes)));
    parts.push(part);
  }
  manifest.files[name] = { bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), parts };
  console.log(`${name}.onnx: ${(bytes.length / 1048576).toFixed(1)} MB in ${parts.length} part(s)`);
}
await writeFile(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
if (tmp) await rm(tmp, { recursive: true, force: true });
if (existsSync(join(OUT, "manifest.json"))) console.log("Wrote " + OUT);
