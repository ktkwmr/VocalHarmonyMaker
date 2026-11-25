#!/usr/bin/env node
// Renders scripts/og-image.html to public/vocalharmonymaker/og-image.png (1200x630).
// Requires Playwright (once):
//   npm install --no-save playwright && npx playwright install chromium
// Or, with Chrome or Edge already installed:
//   npm install --no-save playwright-core   (then set PW_CHANNEL=chrome or msedge)
// Then:
//   node scripts/render-og-image.mjs
import { fileURLToPath } from "node:url";

import { createRequire } from "node:module";
// require() (not import) so a globally installed Playwright is found too (WEBAPP_BASELINE.md §12-11)
const requireCjs = createRequire(import.meta.url);
const { chromium } = (() => { try { return requireCjs("playwright"); } catch (e) { return requireCjs("playwright-core"); } })();
const src = new URL("og-image.html", import.meta.url).href;
const out = fileURLToPath(new URL("../public/vocalharmonymaker/og-image.png", import.meta.url));

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(src);
await page.screenshot({ path: out });
await browser.close();
console.log("Wrote " + out);
