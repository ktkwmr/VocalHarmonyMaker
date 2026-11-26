#!/usr/bin/env node
// Builds a copy of the app that runs as a claude.ai Artifact, so a working version can be shown
// before the app is deployed (WEBAPP_BASELINE.md §12-12). Output: .preview/ (not committed).
//
// Changes from public/<slug>/index.html:
// - drops <!DOCTYPE>/<html>/<head>/<body> (the Artifact adds its own) and sets <title> to the app name
// - drops the Service Worker registration, the manifest link, and the analytics beacon
//   (the Artifact frame allows neither service workers nor scripts from other hosts)
// - copies the files the page loads with relative URLs (FILES below); publish them with the page as `files`
// - separator.js is a stand-in: the AI model (about 75 MB, served by the site itself) cannot run in an
//   Artifact, so whatever file is chosen, the stand-in returns the two parts of the made-up song of
//   scripts/guide-song.mjs (Am F C G at 120 BPM, up to 60 s). The chords, the harmony, the key change, the
//   mixer and the MP3 saving are the real ones. A note at the top of the page says so.
//
// Usage: node scripts/build-preview.mjs
// Then publish .preview/index.html as an Artifact, with each of FILES as a supporting file.
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SLUG = "vocalharmonymaker";
const NAME = "Vocal Harmony Maker";
// Files the page fetches or starts with a relative URL
const FILES = ["harmony.js", "keyshift.js", "mixer.js", "encoder.js", "THIRD_PARTY_LICENSES.md", "icons/icon.svg"];
const STUB = `// Preview stand-in for separator.js (scripts/build-preview.mjs): returns the made-up song's parts
import { makeParts, twoStems } from "./guide-song.mjs";
self.onmessage = async (e) => {
  const msg = e.data;
  if (!msg || msg.type !== "run") return;
  self.postMessage({ type: "backend", name: "wasm", threads: 1, safe: false });
  const n = Math.min(msg.left.length, 60 * 44100), chunks = 4;
  for (let i = 0; i < chunks; i++) {
    await new Promise((r) => setTimeout(r, 300));
    self.postMessage({ type: "progress", stage: "separate", done: i + 1, chunks, elapsed: (i + 1) * 300 });
  }
  const parts = twoStems(makeParts(n));
  const stems = ["vocals", "accompaniment"].map((k) => parts[k].map((ch) => {
    const o = new Int16Array(n);
    for (let i = 0; i < n; i++) o[i] = Math.max(-32768, Math.min(32767, Math.round(ch[i] * 32767)));
    return o;
  }));
  self.postMessage({ type: "done", stems }, stems.flatMap((s) => [s[0].buffer, s[1].buffer]));
};
`;
const NOTE = '<p style="margin:0;padding:10px 16px;background:#fff7d6;border-bottom:1px solid #e5d58a;font:14px/1.5 system-ui,sans-serif">Preview: the AI separation is replaced by a made-up demo song (Am F C G, 120 BPM). Choose any audio file to see the chords and the harmony. / プレビュー：AI の分離の代わりに、架空のデモ曲（Am F C G・BPM 120）を使います。どの音声ファイルでも選ぶと、コードとハモリを確かめられます。</p>';

const src = new URL(`../public/${SLUG}/`, import.meta.url);
const out = new URL("../.preview/", import.meta.url);
let html = (await readFile(new URL("index.html", src), "utf8")).replace(/\r\n/g, "\n");

function drop(re, label) {
  if (!re.test(html)) throw new Error(`build-preview: ${label} not found in index.html`);
  html = html.replace(re, "");
}
drop(/^<!DOCTYPE html>\n/i, "doctype");
drop(/^<html[^>]*>\n/m, "<html>");
drop(/^<head>\n/m, "<head>");
drop(/^\s*<meta charset="UTF-8" \/>\n/m, "charset");
drop(/^\s*<meta name="viewport"[^>]*>\n/m, "viewport");
drop(/^\s*<link rel="manifest"[^>]*>\n/m, "manifest link");
drop(/^\s*<link rel="apple-touch-icon"[^>]*>\n/m, "apple-touch-icon link");
drop(/^<\/head>\n/m, "</head>");
drop(/^<body>\n/m, "<body>");
drop(/<script>\s*if \("serviceWorker" in navigator\)[\s\S]*?<\/script>\n/, "Service Worker registration");
drop(/<!-- Cloudflare Web Analytics[^\n]*\n<script[^>]*cloudflareinsights[^>]*><\/script>\n/, "analytics beacon");
drop(/^<\/body>\n/m, "</body>");
drop(/^<\/html>\n?/m, "</html>");
html = html.replace(/<title>[^<]*<\/title>/, `<title>${NAME}</title>`);
if (!/<header class="topbar"/.test(html)) throw new Error("build-preview: topbar not found");
html = html.replace(/<header class="topbar"/, NOTE + "\n<header class=\"topbar\"");

await mkdir(out, { recursive: true });
await writeFile(new URL("index.html", out), html);
for (const f of FILES) {
  await mkdir(dirname(fileURLToPath(new URL(f, out))), { recursive: true });
  await copyFile(new URL(f, src), new URL(f, out));
}
await writeFile(new URL("separator.js", out), STUB);
await copyFile(new URL("guide-song.mjs", import.meta.url), new URL("guide-song.mjs", out));
console.log(`Wrote .preview/index.html, separator.js (stand-in), guide-song.mjs and ${FILES.join(", ")}`);
