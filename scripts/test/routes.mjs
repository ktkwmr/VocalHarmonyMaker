// Shared by the test scripts: answers the CDN requests (ONNX Runtime Web, lamejs, the Web Analytics beacon) from
// local npm packages, since the test environment cannot reach jsDelivr (WEBAPP_BASELINE.md §12-11).
// context.route also catches the requests the Service Worker makes (page.route does not).
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
export const ORT_URL = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";
export const LAME_URL = "https://cdn.jsdelivr.net/npm/@breezystack/lamejs@1.2.7/dist/lamejs.js";
const CORS = { "access-control-allow-origin": "*", "cross-origin-resource-policy": "cross-origin" };
export async function routeCdn(context, ortDir, lameFile) {
  await context.route(ORT_URL + "**", (route) => {
    const file = join(ortDir, route.request().url().slice(ORT_URL.length));
    if (!existsSync(file)) return route.fulfill({ status: 404 });
    route.fulfill({ status: 200, body: readFileSync(file), headers: { "content-type": file.endsWith(".wasm") ? "application/wasm" : "text/javascript", ...CORS } });
  });
  await context.route(LAME_URL, (route) => route.fulfill({ status: 200, body: readFileSync(lameFile), headers: { "content-type": "text/javascript", ...CORS } }));
  await context.route("https://static.cloudflareinsights.com/**", (route) => route.fulfill({ status: 200, body: "", headers: { "content-type": "text/javascript", ...CORS } }));
}
