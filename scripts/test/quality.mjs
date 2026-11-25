// Separation and harmony on the test song (scripts/test/quality.html), in Chromium.
// With the real model (node scripts/fetch-model.mjs) this checks the quality; with the fake model only that it runs.
// Usage: node scripts/test/quality.mjs <base url, e.g. http://localhost:8788> <onnxruntime-web dist dir> <lamejs.js>
// (the server: node scripts/test/serve.mjs 8788 <dir with song.wav from make-test-song.mjs>)
import { createRequire } from "node:module";
import { routeCdn } from "./routes.mjs";
const { chromium } = createRequire(import.meta.url)("playwright");
const [BASE, ORT_DIR, LAME_FILE] = process.argv.slice(2);
const browser = await chromium.launch();
const context = await browser.newContext({ serviceWorkers: "block" });
await routeCdn(context, ORT_DIR, LAME_FILE);
const page = await context.newPage();
page.on("pageerror", (e) => console.error("page error:", e));
await page.goto(BASE + "/__scripts/test/quality.html");
await page.waitForFunction(() => window.result, null, { timeout: 600000 });
const r = await page.evaluate(() => window.result);
console.log(JSON.stringify(r, null, 1));
await browser.close();
if (r.error) process.exit(1);
