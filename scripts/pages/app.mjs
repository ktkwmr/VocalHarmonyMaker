// Values shared by the articles and the app, read from the app's own files so the articles never
// disagree with it (WEBAPP_BASELINE.md §10-8). The build stops if a value cannot be found.
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(`../../public/vocalharmonymaker/${file}`, import.meta.url), "utf8");
function num(src, re, file) {
  const m = src.match(re);
  if (!m) throw new Error(`scripts/pages/app.mjs: ${re} not found in ${file}`);
  return Number(m[1]);
}

const html = read("index.html");
const encoder = read("encoder.js");
const dsp = read("dsp.js");

// The download size shown before the model's manifest.json has been read (the real size replaces it in the app)
export const MODEL_MB = num(html, /let MODEL_MB = (\d+);/, "index.html");
const engine = html.match(/const ENGINE_MB = \{ cpu: (\d+), gpu: (\d+) \};/);
if (!engine) throw new Error("scripts/pages/app.mjs: ENGINE_MB not found in index.html");
export const ENGINE_MB = { cpu: Number(engine[1]), gpu: Number(engine[2]) };
export const MAX_MIN = num(html, /const MAX_SEC = (\d+) \* 60;/, "index.html");
export const MAX_MIN_LOW_MEM = num(html, /const MAX_SEC_LOW_MEM = (\d+) \* 60;/, "index.html");
export const FADER_MAX = Math.round(num(html, /range\.max = "([\d.]+)"/, "index.html") * 100);
export const KBPS = num(encoder, /const KBPS = (\d+);/, "encoder.js");
export const SR = 44100;
// Spleeter's processing unit (dsp.js): frames × hop samples
const sp = dsp.match(/export const SPLEETER = \{ rate: (\d+), nFft: (\d+), hop: (\d+), bins: (\d+), frames: (\d+) \};/);
if (!sp) throw new Error("scripts/pages/app.mjs: SPLEETER not found in dsp.js");
export const SPLIT_SEC = Math.round(((+sp[5] * +sp[3]) / +sp[1]) * 10) / 10; // 11.9
export const TOP_KHZ = Math.floor((+sp[4] * +sp[1]) / +sp[2] / 1000); // 16 (bins × rate / nFft)
// MP3 size in MB for a song of `sec` seconds
export const mp3Mb = (sec) => (sec * KBPS * 1000) / 8 / 1e6;

// The intro, the help and the "Delete the AI model" dialog write the model size as text: they must match MODEL_MB
for (const s of [`about ${MODEL_MB} MB`, `約 ${MODEL_MB} MB`]) {
  const n = html.split(s).length - 1;
  if (n < (s.startsWith("about") ? 6 : 3)) throw new Error(`scripts/pages/app.mjs: "${s}" should appear in the intro, the help and the delete dialog of index.html (English: in the markup and in I18N) (MODEL_MB = ${MODEL_MB}); found ${n}`);
}
// … and the file length limit
for (const s of [`up to ${MAX_MIN} min`, `${MAX_MIN} 分まで`]) {
  if (!html.includes(s)) throw new Error(`scripts/pages/app.mjs: "${s}" not found in index.html (MAX_SEC = ${MAX_MIN} min)`);
}
