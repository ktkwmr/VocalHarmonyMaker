// Fixed cache name: fetches are network first, so the cache only needs to hold the latest copy.
// Older caches of this app (e.g. "vocalharmonymaker-<build>") are removed on activate.
const PREFIX = "vocalharmonymaker-";
const CACHE = PREFIX + "cache";
const CORE = ["./", "index.html", "ja/", "manifest.json", "THIRD_PARTY_LICENSES.md", "icons/icon.svg",
  "separator.js", "dsp.js", "mixer.js", "harmony.js", "keyshift.js", "encoder.js"];
// The AI model is kept by separator.js in its own cache (vocalharmonymaker-model-v2), which activate below leaves
// alone; its files (models/) are not cached here a second time (WEBAPP_BASELINE.md §2-20).
const KEEP = ["vocalharmonymaker-model-v2"];
// Libraries loaded from a CDN with a pinned version (WEBAPP_BASELINE.md §3-10): the content of such a URL
// never changes, so it is cached on first use and served from the cache, which makes it work offline.
// Also add the host to connect-src in public/_headers. Leave empty when no CDN library is used.
// Keep the version in sync with ORT_BASE in separator.js.
const ORT = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";
const CDN = [
  // CPU (WebAssembly) build
  ORT + "ort.wasm.min.mjs", ORT + "ort-wasm-simd-threaded.mjs", ORT + "ort-wasm-simd-threaded.wasm",
  // WebGPU build (used when the browser has WebGPU)
  ORT + "ort.webgpu.min.mjs", ORT + "ort-wasm-simd-threaded.asyncify.mjs", ORT + "ort-wasm-simd-threaded.asyncify.wasm",
  // lamejs: the MP3 encoder (encoder.js; keep the version in sync with LAME_URL there)
  "https://cdn.jsdelivr.net/npm/@breezystack/lamejs@1.2.7/dist/lamejs.js",
];

// A worker script answered from the cache must carry COEP, or the cross-origin isolated page cannot start it
// (WEBAPP_BASELINE.md §3-9). Responses cached from the network keep their headers; this covers any that lost them.
function withWorkerHeaders(req, res) {
  if (!res || (req.destination !== "worker" && req.destination !== "sharedworker") || res.headers.get("cross-origin-embedder-policy")) return res;
  const headers = new Headers(res.headers);
  headers.set("Cross-Origin-Embedder-Policy", "credentialless");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        CORE.map((url) =>
          fetch(new Request(url, { cache: "reload" }))
            .then((res) => res.ok && cache.put(url, res))
            .catch(() => {})
        )
      )
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      // Only touch this app's caches (other apps on the same origin share Cache Storage)
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE && !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first (always the latest when online), cache as offline fallback.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Pinned CDN files: cache first
  if (CDN.includes(req.url)) {
    event.respondWith(
      caches.match(req.url).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req.url, copy));
            }
            return res;
          })
      )
    );
    return;
  }
  if (new URL(req.url).origin !== self.location.origin) return;
  // Cloudflare Zaraz (/cdn-cgi/zaraz/…, §17): always from the network, never cached. Its script is made
  // for each request. Harmless when the app does not use Zaraz
  if (new URL(req.url).pathname.startsWith("/cdn-cgi/")) return;
  // The AI model's files: straight from the network (separator.js keeps them in its own cache)
  if (new URL(req.url).pathname.includes("/vocalharmonymaker/models/")) return;
  event.respondWith(
    fetch(new Request(req.url, { cache: "no-cache" }))
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((r) => withWorkerHeaders(req, r) || (req.mode === "navigate" ? caches.match("index.html") : undefined))
      )
  );
});
