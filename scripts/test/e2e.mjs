// End-to-end check in Chromium (WEBAPP_BASELINE §12-9, §12-11, §12-14), without the CDN:
//   - ONNX Runtime Web and lamejs come from the npm packages, routed in place of jsDelivr (routes.mjs)
//   - the model is whatever scripts/fetch-model.mjs put in public/vocalharmonymaker/models/ (the real one, or the
//     small fake: python3 scripts/test/make-fake-model.py <dir> && node scripts/fetch-model.mjs --from <dir> --force)
// Steps: the greyed-out demo → choose song.wav (separation starts by itself) → chords and harmony → play / pause / stop →
// save the mix as MP3 →
// key +1 → another harmony part → reload (model cached, Service Worker in control) → the Japanese page, separating
// again there, and from MP4 / WebM videos.
//
// Usage: node scripts/test/e2e.mjs <base url, e.g. http://localhost:8788> <dir with song.wav> <onnxruntime-web dist dir> <lamejs.js> [shots dir]

import { createRequire } from "node:module";
import { join } from "node:path";
import { statSync, existsSync } from "node:fs";
import { routeCdn, ORT_URL, LAME_URL } from "./routes.mjs";
const { chromium } = createRequire(import.meta.url)("playwright");

const [BASE, AUDIO, ORT_DIR, LAME_FILE, SHOTS] = process.argv.slice(2);
const APP = BASE + "/vocalharmonymaker/";
const fail = (msg) => { console.error("FAIL: " + msg); process.exitCode = 1; };
const ok = (msg) => console.log("ok   " + msg);
const check = (cond, msg, detail) => (cond ? ok(msg) : fail(msg + (detail != null ? " — " + detail : "")));

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
await routeCdn(context, ORT_DIR, LAME_FILE);
const errors = [];
const external = [];
context.on("request", (r) => {
  const u = r.url();
  if (u.startsWith("http") && !u.startsWith(BASE) && !u.startsWith(ORT_URL) && u !== LAME_URL && !u.startsWith("https://static.cloudflareinsights.com/")) external.push(u);
});
const page = await context.newPage();
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
const toastIs = (re, timeout) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector("#toast").textContent), re.source, { timeout: timeout || 120000 });

// Choosing a file starts the separation by itself (there is no separate button)
async function separateAndHarmonize(label, file = "song.wav") {
  const t0 = Date.now();
  await page.setInputFiles("#fileInput", join(AUDIO, file));
  // The previous song is released (the mixer greys out) when the new separation starts
  await page.waitForFunction((f) => document.getElementById("songName").textContent === f && document.getElementById("mixer").classList.contains("ghost"), file, { timeout: 60000 });
  await page.waitForSelector("#mixer:not(.ghost)", { timeout: 300000 });
  ok(label + " (" + file + "): separated in " + ((Date.now() - t0) / 1000).toFixed(1) + " s; " + (await page.textContent("#backend")));
  // Then the chords and the harmony, by themselves
  await page.waitForFunction(() => document.querySelectorAll("#strips .strip").length === 4 && document.querySelector("#harmProgress").hidden, null, { timeout: 300000 });
  ok(label + ": harmony made in " + ((Date.now() - t0) / 1000).toFixed(1) + " s from the start");
}

// ---- First visit: the greyed-out demo
await page.goto(APP);
await page.waitForSelector("#mixer.ghost");
check(await page.evaluate(() => crossOriginIsolated), "cross-origin isolated");
check((await page.$$("#strips .strip")).length === 4, "the demo shows 4 strips");
await page.waitForFunction(() => /MB/.test(document.querySelector("#modelState").textContent));
ok("model note: " + (await page.textContent("#modelState")));
if (SHOTS) await page.screenshot({ path: join(SHOTS, "1-start.png") });

// ---- Separate, chords, harmony
await separateAndHarmonize("en");
const names = await page.$$eval("#strips .sname", (els) => els.map((e) => e.textContent.trim()));
check(names.join("|") === "Vocals|Backing|Harmony (voice)|Harmony guide tone", "strips: " + names.join(", "));
const bpm = await page.textContent("#bpmVal");
ok("tempo: " + bpm);
check(!(await page.isHidden("#harmView")), "piano roll shown");
check((await page.getAttribute("#harmBtn", "class")) === "chip", "harmony button is grey once made");
if (SHOTS) await page.screenshot({ path: join(SHOTS, "2-harmony.png") });

// ---- Play (▶), pause (❚❚) keeps the position, stop (■) goes back to the start (WEBAPP_BASELINE §9-15)
const iconShown = () => page.evaluate(() => (document.getElementById("playIcon").hasAttribute("hidden") ? "pause" : "play"));
check((await iconShown()) === "play" && (await page.getAttribute("#playBtn", "aria-label")) === "Play", "▶ before playing");
await page.click("#playBtn");
await page.waitForTimeout(1500);
const now = await page.textContent("#timeNow");
check(now !== "0:00", "playing: " + now);
check((await iconShown()) === "pause" && (await page.getAttribute("#playBtn", "title")) === "Pause", "❚❚ while playing");
await page.click("#playBtn");
await page.waitForTimeout(300);
const paused = await page.textContent("#timeNow");
check(paused !== "0:00" && (await iconShown()) === "play", "pause keeps the position: " + paused);
await page.click("#playBtn");
await page.waitForTimeout(500);
await page.click("#stopBtn");
await page.waitForTimeout(300);
check((await page.textContent("#timeNow")) === "0:00" && (await iconShown()) === "play", "■ stops and goes back to 0:00");

// ---- Save the mix as MP3
const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 120000 }), page.click("#saveMix")]);
const file = join(SHOTS || AUDIO, "mix.mp3");
await dl.saveAs(file);
check(/\.mp3$/.test(dl.suggestedFilename()) && statSync(file).size > 10000, "saved " + dl.suggestedFilename() + " (" + statSync(file).size + " bytes)");

// ---- Key +1 (both parts, then the harmony again)
await page.click("#keyUp");
await toastIs(/Key changed \(\+1\)/);
check((await page.textContent("#keyVal")) === "+1", "key +1");

// ---- Another part: 3rd below
await page.selectOption("#harmDir", "-3");
check((await page.getAttribute("#harmBtn", "class")) === "primary", "remake button turns black when the part changes");
await page.click("#harmBtn");
await toastIs(/Harmony made/);
ok("remade the harmony 3rd below");

// ---- Second visit: model cached, Service Worker in control
await page.reload();
await page.waitForFunction(() => /saved on this device/.test(document.querySelector("#modelState").textContent), null, { timeout: 20000 });
ok("after reload: " + (await page.textContent("#modelState")));
check(await page.evaluate(() => !!navigator.serviceWorker.controller), "Service Worker in control");

// ---- The Japanese page (workers and fetches resolved against <base>)
await page.goto(APP + "ja/");
await page.waitForSelector("#mixer.ghost");
check((await page.textContent("[data-i18n='file.choose']")).trim() === "曲のファイルを選ぶ", "Japanese page: " + (await page.title()));
await separateAndHarmonize("ja");
const jaNames = await page.$$eval("#strips .sname", (els) => els.map((e) => e.textContent.trim()));
check(jaNames.join("|") === "ボーカル|伴奏|ハモリ（声）|ハモリのガイド音", "ja strips: " + jaNames.join(", "));
if (SHOTS) await page.screenshot({ path: join(SHOTS, "3-ja.png") });

// ---- Video files: the sound of an MP4 (H.264 / AAC) and a WebM (VP8 / Opus) video, made by make-test-song.mjs with ffmpeg
for (const v of ["song.mp4", "song.webm"]) {
  if (!existsSync(join(AUDIO, v))) { console.log("skip " + v + " (not made: ffmpeg missing)"); continue; }
  await separateAndHarmonize("ja", v);
  check((await page.textContent("#bpmVal")).includes("120"), v + ": " + (await page.textContent("#bpmVal")));
}

check(!errors.length, "no console errors", errors.join("\n"));
check(!external.length, "no other outside requests", external.join("\n"));
await browser.close();
