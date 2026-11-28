# Vocal Harmony Maker

Add a harmony part to the vocals of any song, right in your browser. AI separates the vocals from the backing, the app finds the key, the tempo, and the chords, follows the vocal melody, and adds a harmony a 3rd or a 5th above or below it — sung in the singer's own voice (pitch-shifted and pitch-corrected) and as a guide tone to practice along. Edit the chords, change the key, and save each part or your mix as MP3. The song is never uploaded.

曲のボーカルにハモリのパートを付ける Web アプリです。AI でボーカルと伴奏を分離し、キー・テンポ・コードを推定し、ボーカルの旋律を追って、3 度か 5 度の上（または下）のハモリを、歌っている人の声のまま（音程を変えて音程補正したもの）と、練習用のガイド音で作ります。コードの修正、キーの変更、各パートとミックスの MP3 保存もできます。曲はアップロードしません。

**▶ https://ktkwmr.com/vocalharmonymaker/** (日本語: https://ktkwmr.com/vocalharmonymaker/ja/)

## Features / 機能

- **Vocal separation**: vocals and accompaniment with [Spleeter](https://github.com/deezer/spleeter) 2stems (Deezer; code and trained models MIT), the ONNX conversion of [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) (Apache-2.0), run by [ONNX Runtime Web](https://onnxruntime.ai/) in a worker. The model is served by this site
  ボーカルと伴奏の分離（Spleeter 2stems を ONNX Runtime Web でブラウザ内実行。モデルはこのサイトから配信）
- **Harmony**: right after separating, the app finds the beats and the tempo (Loop Trainer's beat detection), one chord per beat (from the accompaniment), the key, and the vocal melody (YIN), and makes a harmony a 3rd or a 5th above or below: the vocals moved to the harmony notes (TD-PSOLA, with pitch correction like Auto-Tune) and a guide tone. The chords, the melody, and the harmony notes scroll in a piano roll. Plain JavaScript in a worker (`harmony.js`, the same as Band Stem Mixer's), no AI model
  分離が終わると続けて、拍とテンポ・拍ごとのコード（伴奏から）・キー・ボーカルの旋律を推定し、3 度か 5 度の上（下）のハモリ（ボーカルの音程を変えた声と、ガイド音）を作る。コード・旋律・ハモリの音はピアノロールで表示。ワーカー（`harmony.js`）の JavaScript だけで、AI モデルは使わない
- **Chord editing**: tap a beat in the chord row and type any chord (Am7, F#m7b5, C/E…); bars like `| C | G | Am | F G |` are poured in from that beat. “Remake the harmony” uses them
  コードの編集（拍をタップして自由入力。`| C | G | Am | F G |` の小節入力も可）。「ハモリを再生成」で反映
- **Mixer**: fader, mute (M), and solo (S) for the vocals, the backing, the harmony voice, and the guide tone, master volume, level meters, seek, keyboard shortcuts (AudioWorklet, sample-accurate sync)
  ボーカル・伴奏・ハモリの声・ガイド音のフェーダー・ミュート・ソロ、全体の音量、レベルメーター、シーク、キーボード操作
- **Key change**: ±12 semitones for the whole song with the chords and the harmony; same tempo (phase vocoder in workers, `keyshift.js`)
  キーの変更（±12 半音。テンポはそのまま。コードとハモリも一緒に）
- **Save**: each part, or the current mix, as a 192 kbps MP3 (`encoder.js`, [lamejs](https://github.com/shijinyu/lamejs), LGPL-3.0, loaded unmodified from a CDN)
  各パートとミックスを MP3（192 kbps）で保存
- **Large-download warning** before the first separation on mobile data or when the connection type is unknown on a phone; the model (about 75 MB) is kept in Cache Storage (`vocalharmonymaker-model-v2`). ⚙ → “Delete the AI model” removes it
  初回のダウンロード（約 75 MB）の前に、モバイルデータ通信や接続の種類が分からないスマホでは確認する。モデルは Cache Storage に保存
- **Choose a file and it starts**: no separate button. Audio files (MP3, WAV, M4A, FLAC, Ogg…) and videos (MP4, MOV, WebM…: the sound is used), up to 12 minutes (8 on phones and tablets); WebGPU when available, several CPU threads otherwise
  ファイルを選ぶとすぐに分離が始まる（分離ボタンなし）。音声ファイルと動画（MP4・MOV・WebM など。音声を使う）、12 分まで（スマホ・タブレットは 8 分）
- **Transport**: ▶ / ❚❚ in one button, ■ stops and goes back to the start (WEBAPP_BASELINE §9-15); Space / Home
  再生ボタンは ▶ と ❚❚ の切り替え、■ で止めて最初に戻る
- **Installable PWA**, English / Japanese UI (`/vocalharmonymaker/ja/`, `?lang=en|ja`)

The separation (`separator.js`, `dsp.js`, `scripts/fetch-model.mjs`) is copied from [Karaoke Trainer](https://github.com/ktkwmr/KaraokeTrainer), and the harmony, the key change, the mixer, and the MP3 encoder from [Band Stem Mixer](https://github.com/ktkwmr/BandStemMixer) (same author). A bug fixed in one should be fixed in the other.
分離は Karaoke Trainer から、ハモリ・キー変更・ミキサー・MP3 は Band Stem Mixer からコピーしたもの（同じ作者）。片方で直した不具合はもう片方にも移します。

## Privacy / プライバシー

- The song is read, separated, analyzed, and played only in your browser. It is never uploaded. No accounts, cookies, or microphone.
- The browser downloads the AI model from this site, and ONNX Runtime Web and (when saving) lamejs from **jsDelivr** (they receive the IP address and browser information, as with any download; nothing about the song).
- Saved in the browser: the model, mixer settings, and the app files for offline use.
- The site is hosted on Cloudflare (standard access logs). Page views are counted with Cloudflare Web Analytics, which uses no cookies.
- Only if you choose “Accept all” in the cookie banner, Google Analytics (through Cloudflare Zaraz, sent from Cloudflare's servers with a shortened IP address) records how the app is used: pages viewed and for how long, buttons tapped and settings changed, playing time, the kind and length of the songs opened, how the separation went, and the harmony settings. File names, the music itself, and the chords are never sent. Change your choice from “Cookie settings” at the bottom of the page. See [docs/analytics.md](docs/analytics.md).
- 曲の読み込み・分離・解析・再生はブラウザ内だけで行い、アップロードしません。アカウント・Cookie・マイクはありません。
- ブラウザがこのサイトから AI モデルを、**jsDelivr** から ONNX Runtime Web と（保存するときは）lamejs をダウンロードします（IP アドレス等が届きます。曲の情報は送りません）。
- ブラウザに保存するもの: AI モデル、ミキサーの設定、オフライン用のアプリのファイル。
- サイトは Cloudflare で配信（標準的なアクセスログ）。閲覧数は Cookie を使わない Cloudflare Web Analytics で集計しています。
- Cookie のバナーで「すべて同意」を選んだ場合に限り、Google アナリティクス（Cloudflare Zaraz 経由。Cloudflare のサーバーから IP アドレスの末尾を削って送信）でアプリの使われ方（見たページと時間、押したボタンと変えた設定、再生した時間、開いた曲の種類と長さ、分離の結果、ハモリの設定）を記録します。ファイル名・曲そのもの・コードは送りません。選択はページ下の「Cookie の設定」から変えられます。

Full policy: `/vocalharmonymaker/privacy/` (`/vocalharmonymaker/ja/privacy/`). Operator: `/vocalharmonymaker/about/`.

## Guides / ガイド記事

`/vocalharmonymaker/<slug>/` (`/vocalharmonymaker/ja/<slug>/`): `guide` (how to use), `harmony` (practicing harmonies), `chords-and-key` (chords, tempo, and key change), `how-it-works` (how the harmony is made), `faq`. Written in `scripts/pages/<slug>.mjs`; values shared with the app (model size, song length limit, fader range, MP3 bitrate, split length) are read from the app's files by `scripts/pages/app.mjs`. Before an article change is merged, a person reads it on the PR preview (`docs/article-review.md`).
使い方・ハモリの練習・コードとキー変更・仕組み・FAQ の 5 本。記事を変えたら、マージ前に PR のプレビューで人間が内容を確認します。

## Project structure / 構成

```
public/
  _headers                      # security headers (CSP, COOP / COEP credentialless, etc.)
  404.html                      # page for unknown URLs under /vocalharmonymaker/ (status 404)
  vocalharmonymaker/
    index.html                  # the app (HTML / CSS / JS, English and Japanese text)
    separator.js                # module worker: downloads / caches the model, runs the separation
    dsp.js                      # STFT / masks / inverse STFT around Spleeter, and an FFT
    harmony.js                  # worker: beats, chords, key, vocal melody, harmony voice and guide tone
    keyshift.js                 # worker: key change of one part (phase vocoder)
    mixer.js                    # AudioWorklet: plays and mixes the parts
    encoder.js                  # worker: makes the MP3 files (lamejs)
    models/spleeter-2stems-v2/  # the model, made by scripts/fetch-model.mjs in the build (not in Git)
    ja/index.html               # Japanese page, generated from index.html (do not edit)
    about/ privacy/ guide/ … ja/…  # info pages and guides, generated from scripts/pages/ (do not edit)
    images/guide/               # guide screenshots, made by scripts/render-guide-images.mjs
    sitemap.xml                 # generated by scripts/build-pages.mjs (do not edit)
    sw.js  manifest.json  icons/  og-image.png  THIRD_PARTY_LICENSES.md
scripts/
  fetch-model.mjs               # downloads Spleeter 2stems (sherpa-onnx release), splits it into ≤ 25 MiB parts
  build-ja.mjs  build-pages.mjs  pages/  update-third-party-licenses.mjs  build-preview.mjs
  render-guide-images.mjs  guide-song.mjs   # guide screenshots (a made-up song, no AI model needed)
  og-image.html  render-og-image.mjs  render-icons.mjs
  test/                         # fake model, test song, local server, E2E and quality checks
wrangler.jsonc                  # Cloudflare Workers (static assets, route ktkwmr.com/vocalharmonymaker*)
CLAUDE.md  docs/baseline-status.md  docs/article-review.md
```

This Worker only serves `/vocalharmonymaker/*`; the domain root belongs to the `ktkwmr-home` Worker ([ktkwmr/ktkwmr.com](https://github.com/ktkwmr/ktkwmr.com)).
When you load anything from a new external host, add it to the CSP in `public/_headers` and update the privacy text.

## Development / 開発

```sh
npx wrangler dev        # http://localhost:8787/vocalharmonymaker/ (downloads the model once, runs the generators, applies _headers)
```

`node scripts/fetch-model.mjs` downloads the model (about 75 MB, from the sherpa-onnx GitHub release) into `public/vocalharmonymaker/models/` and does nothing when it is already there. Opening `index.html` as a `file://` URL does not work (Service Worker, module workers, AudioWorklet).
`file://` で直接開くと動きません。`npx wrangler dev` で開いてください（初回はモデルをダウンロードします）。

Tests (Playwright with the Chromium in your environment; the CDN files come from npm packages):

```sh
npm pack onnxruntime-web@1.30.0 @breezystack/lamejs@1.2.7   # then extract both .tgz files
node scripts/test/make-test-song.mjs /tmp/audio               # song.wav (the made-up song, Am F C G at 120 BPM), and song.mp4 / song.webm with ffmpeg
node scripts/test/serve.mjs 8788 /tmp/audio &                 # public/ with the headers of public/_headers
node scripts/test/e2e.mjs http://localhost:8788 /tmp/audio <onnxruntime-web>/package/dist <lamejs>/package/dist/lamejs.js
node scripts/test/quality.mjs http://localhost:8788 <onnxruntime-web>/package/dist <lamejs>/package/dist/lamejs.js
```

`e2e.mjs` goes through the app (choosing a file starts the separation, harmony, play / pause / stop, MP3, key change, another part, reload, the Japanese page, MP4 and WebM videos). `quality.mjs` separates the test song and compares the chords, the BPM, and the melody found from the separated parts with those found from the true parts. They run with the real model, or with a small fake one (`python3 scripts/test/make-fake-model.py <dir> && node scripts/fetch-model.mjs --from <dir> --force`; the separation is then meaningless, but everything around it runs).

To change the model or the library versions, update `MODEL_DIR` / `MODEL_CACHE` in `index.html` and `separator.js`, `ORT_BASE` in `separator.js`, `CDN` / `KEEP` in `sw.js`, and `scripts/fetch-model.mjs` together.

## Deploy / デプロイ

Cloudflare Workers static assets. With Workers Builds connected, a push to `main` deploys (the build downloads the model); other branches get preview builds. By hand: `npx wrangler deploy`.

## Generated files / 生成ファイル

Edit only `public/vocalharmonymaker/index.html`, `separator.js`, `dsp.js`, `harmony.js`, `keyshift.js`, `mixer.js`, `encoder.js`, `sw.js`, and `scripts/`. `ja/index.html`, the info pages, and `sitemap.xml` are generated by `wrangler deploy` / `wrangler dev` and by the **Build generated pages** workflow on push to `main`:

```sh
node scripts/build-ja.mjs             # regenerate ja/index.html
node scripts/build-pages.mjs          # regenerate the info pages and sitemap.xml
node scripts/build-ja.mjs --check     # exit 1 if out of date (same for build-pages.mjs)
```

The guide screenshots are made with `node scripts/render-guide-images.mjs` (Playwright; a stand-in replaces `separator.js`, so the AI model is not needed). Re-run it when the app's look changes.

## License / ライセンス

MIT © 2026 ktkwmr. The AI model is Spleeter 2stems (Deezer, MIT) in the ONNX conversion of sherpa-onnx (Apache-2.0); ONNX Runtime Web (© Microsoft Corporation) is MIT; lamejs (LAME) is LGPL-3.0, loaded unmodified as a separate file. All of them allow commercial use; see `public/vocalharmonymaker/THIRD_PARTY_LICENSES.md`. Before adding a library or a model, check its license — for a model, the license of the trained weights too, separately from the code.
AI モデル（Spleeter、MIT）とライブラリはどれも商用利用できるライセンスです。ライブラリやモデルを足すときは、モデルの重みのライセンスもコードとは別に確かめてください。
