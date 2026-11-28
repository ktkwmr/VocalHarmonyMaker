# Vocal Harmony Maker

読み込んだ曲のボーカルを AI（Spleeter 2stems、ONNX Runtime Web）でブラウザの中で分離し、キー・コードを推定して、ボーカルの 3 度・5 度上（下）のハモリ（ピッチシフトした声とガイド音）を付ける Web アプリ。ボーカル・伴奏・ハモリの声・ガイド音の 4 本をミュート・ソロ・フェーダーでミックスでき、コードは編集でき、キーを ±12 半音変えられ、各パートとミックスは MP3 で保存できる。公開 URL: https://ktkwmr.com/vocalharmonymaker/ （日本語: /vocalharmonymaker/ja/）
構成・開発・デプロイの詳細は README.md を参照。

Band Stem Mixer（ktkwmr/BandStemMixer）のハモリ機能を独立させたアプリ（2026-11-25 に Band Stem Mixer のファイルをコピーして作成。§2-19）。分離は Karaoke Trainer（ktkwmr/KaraokeTrainer）のもの。どちらも同じ作者。

## 共通ベースライン
- 独自機能以外の共通項目は ktkwmr/webapp-baseline（非公開）の WEBAPP_BASELINE.md に従う。
  セッションに無ければ add_repo（read。更新するときは push）で追加して読む。
- 各項目の状態は docs/baseline-status.md に記録する。
- どのアプリにも当てはまる新しい作業・設定・落とし穴が出てきたら、作業の最後に
  ベースラインへの追記案を出す（ユーザーが了承したらベースラインのリポジトリに PR）。

## このアプリの値
- スラッグ: `vocalharmonymaker` / ドメイン: `ktkwmr.com` / 言語: en（既定）+ ja（`/ja/`）
- 運営者: ktkwmr / 問い合わせ: GitHub Issues
- Cloudflare Web Analytics token: `5c53079cb9a64d819d1ca53e8533ca63`（ほかのアプリと同じサイト）
- ホスティング: Cloudflare Workers 静的アセット。Worker `vocalharmonymaker` に Route `ktkwmr.com/vocalharmonymaker*` だけ（ベースライン §0 の A）。
  ドメイン直下（トップページ、`robots.txt`、ルートの `sitemap.xml`、ルートの 404）は `ktkwmr/ktkwmr.com`（Worker `ktkwmr-home`）。このアプリの sitemap は `/vocalharmonymaker/sitemap.xml`。

## ルール
- 手で編集するのはアプリ本体 `public/vocalharmonymaker/index.html`・`separator.js`・`dsp.js`・`harmony.js`・`keyshift.js`・`mixer.js`・`encoder.js`・`sw.js` と `scripts/`。生成ファイル（`ja/index.html`、情報ページ `<slug>/` とその `ja/`、`sitemap.xml`）は編集せず、`node scripts/build-ja.mjs` と `node scripts/build-pages.mjs` で作り直す（`--check` で確認）。
- 画面の文言は `index.html` の `I18N`（en / ja）に書き、要素には `data-i18n` / `data-i18n-html` / `data-i18n-attr` を付ける。JS で作る文言は `t()`。子要素を持つ要素に `data-i18n` は付けない（`build-ja.mjs` が止まる）。`intro.body`・`help.body`・`model.del.body` のモデルの大きさ（about 75 MB／約 75 MB）は `MODEL_MB` と、`file.hint` の曲の長さ（up to 12 min／12 分まで）は `MAX_SEC` と同じにする（`scripts/pages/app.mjs` が確かめる）。
- **将来は広告を入れる予定（ユーザーの方針、2026-11-25）。そのため商用利用できるライセンスだけを使う。** Spleeter（コードと学習済みモデルが MIT）、sherpa-onnx（Apache-2.0）、ONNX Runtime Web（MIT）、lamejs（LGPL-3.0、改変せず CDN から別ファイルとして読む）。HTDemucs（重みは Meta が科学研究目的に限って提供）、Open-Unmix UMX-L（非商用）、RoFormer 系（CC-BY-NC-SA）などは使わない。新しいライブラリ・モデルを足すときは、重みのライセンスもコードと別に確かめる（ベースライン §7-8）。広告を入れるときはベースライン §15 に従い、プライバシーの説明（`scripts/pages/privacy.mjs`、アプリ内の `privacy.body`、README）を同じ PR で直す。
- **分離は Karaoke Trainer（ktkwmr/KaraokeTrainer）からのコピー**: `dsp.js`（そのまま）、`separator.js`（旋律の線と拍の推定を外したもの）、`scripts/fetch-model.mjs`、`scripts/test/make-fake-model.py`。値は Karaoke Trainer の CLAUDE.md のとおり（44.1 kHz、FFT 4096、hop 1024、入力は 1536 ビン＝16 kHz まで、512 フレームずつ、それより上は伴奏へ）。片方で直した不具合はもう片方にも移す案を出す。
- **モデルは自サイトで配信する**（外部 CDN 直リンクにしない）。`scripts/fetch-model.mjs` がビルド（`wrangler.jsonc` の `build.command`）のとき sherpa-onnx のリリースから取得し、周波数の軸を自由な次元にして、25 MiB 以下に分けて `public/vocalharmonymaker/models/spleeter-2stems-v2/` に置く（`manifest.json` に部品・大きさ・SHA-256。Git には入れない）。`separator.js` が部品をつないで Cache Storage `vocalharmonymaker-model-v2` に保存し、`sw.js` はモデルをキャッシュしない（`KEEP` で残す）。モデルを変えたらフォルダを `-v3` にし、`MODEL_DIR`・`MODEL_CACHE`（`index.html`・`separator.js`）、`sw.js` の `KEEP`、`fetch-model.mjs` を同じ PR で直す。ONNX Runtime のバージョンは `separator.js` の `ORT_BASE` と `sw.js` の `ORT`。
- **分離ボタンはない**（2026-11-26、ユーザーの希望）。ファイルを選ぶと `chooseFile()` が読み込んで、そのまま `run()` で分離を始める（Wi-Fi でないときの確認で「やめておく」を選んだら `net.later.note` を出し、曲を選び直してもらう）。開けるのは音声ファイルと動画（`accept` に `video/*`・`.mp4`・`.mov`・`.mkv` など。Karaoke Trainer と同じく `decodeAudioData` で音声を読む）。
- 再生は ▶／❚❚ の 1 つのボタン（アイコンだけ、`aria-label`・`title` を切り替え）と ■（`stopBtn`、`stopToStart()` で止めて最初に戻る）。キーボードは Space で再生／一時停止、Home で停止（ベースライン §9-15）。
- パートは `index.html` の `PARTS`（`vocals` idx 0・`accompaniment` idx 1、`separator.js` の出力の順）と `HARM`（`harmony` idx 2・`guide` idx 3）。キーボードの 1〜4 でミュート。
- **ハモリ・キーチェンジ・ミキサー・MP3 は Band Stem Mixer（ktkwmr/BandStemMixer）からのコピー**（`harmony.js`・`keyshift.js`・`mixer.js`・`encoder.js`、`index.html` のハモリ・コード編集・ピアノロール・ミキサーの部分）。片方で直した不具合はもう片方にも移す案を出す。違いは `harmony.js` の入力だけ：4 パートではなく `accompaniment`（伴奏）を受け取り、拍とテンポは伴奏＋ボーカルから、コードは伴奏のクロマを 2 通り（`chroma(acc, 40, 95)` を Band Stem Mixer の「その他」、`chroma(acc, 28, 64)` を「ベース」）として読む。
- ハモリ（`harmony.js`、ワーカー）は AI モデルもライブラリも使わない自前の JavaScript：拍とテンポ（`detectBeats()`、Loop Trainer（ktkwmr/LoopTrainer）から）、拍ごとのマス（`makeGrid()`、拍が見つからないときは 0.5 秒ごと）、クロマと長三和音・短三和音の照合と HMM（Viterbi）でコード、Krumhansl のプロファイルと主和音の長さでキー、YIN で旋律、キーの中の 3 度か 5 度上（下）をコードとぶつかるときはコードの音に寄せて選ぶ。ハモリの声は TD-PSOLA と音程補正（`correction()`、画面では「強」に固定）、ガイド音は合成音。どちらもモノラルで 3・4 本目。コード編集（`parseChord()`・`readChordText()`、Demo Track Maker と同じ読み方）、「ハモリを再生成」はページのコードと旋律を使い回す、コードを編集・パートを変えるとボタンが黒（`renderHarm()`）、分離が終わると続けてハモリを作る（`makeHarmony()`）、分離前はミキサーをグレーアウトして架空の曲（`DEMO`）のハモリを見せる（`setGhost()`）。細かい規則は Band Stem Mixer の CLAUDE.md のハモリの項と同じ。
- キーチェンジは `keyshift.js`（パートごとに 1 つ並行。ボーカル FFT 2048、伴奏 4096（ベースの低音のため））。伴奏にはドラムも入るので一緒に動く。ページは分離したままのパート（`orig`）とハモリ・コードを原曲のキーで持ち、`semis` は音・コード名・表示にだけかける。ハモリの声とガイド音はキーを変えるたびに `harmony.js` で作り直す。
- `harmony.js`・`separator.js`・`dsp.js` を変えたら、`scripts/test/quality.mjs`（`scripts/guide-song.mjs` の曲：Am F C G・BPM 120）で、分離したパートからのコード・BPM・旋律が、本当のパートからのものと同じになることを確かめる（2026-11-25 に本物のモデルで、コード 16 小節すべて一致・BPM 120・旋律の 99% が正しい半音・ボーカルの SDR 11.8 dB）。`keyshift.js` を変えたら、テスト曲を ±n 半音ずらしてコードと旋律がちょうど n ずれることを確かめる。
- ミキサーの設定は `localStorage` の `vocalharmonymaker-state`（各パートの音量・ミュート、全体の音量。`v: 2`。ガイド音は最初ミュート（`freshState()`））。ソロ・分離したパート・ハモリは保存しない。分離の設定は端末ごとに順に試す（`MODES`・`LADDER`。PC は full → cpu、スマホとメモリ 4 GB 以下は gpu → cpu → cpu1）。タブごと落ちたら `vocalharmonymaker-running` の記録から次に開いたときに `vocalharmonymaker-crashed` に覚えて、その設定を 30 日飛ばす。曲の長さは 12 分まで（`MAX_SEC`、スマホ・タブレットは `MAX_SEC_LOW_MEM` 8 分）。
- 大きなダウンロードの前の確認は `connectionRisk()`・`askNetwork()`（ベースライン §9-13）。モデルがキャッシュ済みなら出さない。ダウンロード量は `MODEL_MB`（`manifest.json` が読めたら実際の大きさ）と `ENGINE_MB`。
- 利用状況の計測（Cloudflare Zaraz → GA4、同意バナーで同意した人だけ。ベースライン §17）: `usage-events.js`（ベースラインの雛形のコピー。タップ `vhm_tap`・設定の変更 `vhm_change`・滞在時間 `vhm_engaged`）と、主な機能の `track()`（`index.html` の `chooseFile()`・`run()`・`attempt()`（Karaoke Trainer の `kt_open`・`kt_separate` と同じ）・`rebuild()`・`applyChordText()`・`saveMp3()`）。ファイル名・曲の音・旋律・コード（見つけたものも入力したものも）は送らない（種類・長さ・数・設定・結果だけ）。イベントを足したら `docs/analytics.md` の表と GA4 のカスタム定義、送る内容を変えたらプライバシーの説明も直す。
- ページはクロスオリジン分離（`public/_headers` の COOP same-origin、COEP **credentialless**。ベースライン §6-6）。外部から読むファイルは CORS で。外部ホストを足したら `_headers` の CSP と、プライバシーの説明（`scripts/pages/privacy.mjs`、アプリ内の `privacy.body`、README）を同じ PR で直す。マイク・カメラは使わない。
- 保存は MP3 だけ（192 kbps）。`encoder.js` が lamejs（`@breezystack/lamejs`、LGPL-3.0）を改変せず CDN から読む。バージョンは `encoder.js` の `LAME_URL` と `sw.js` の `CDN`。
- 記事は `scripts/pages/<slug>.mjs`（`guide`・`harmony`・`chords-and-key`・`how-it-works`・`faq`）。画面写真は `scripts/pages/shots.mjs` の `img()`。アプリと共通の値は書き写さず `scripts/pages/app.mjs` がアプリのファイルから読む。記事を足したら `build-pages.mjs` の `PAGES` と `index.html` の `intro.body` のガイド一覧（英日）にも足す。見た目を変えたら `node scripts/render-guide-images.mjs` で撮り直す（架空の曲 `scripts/guide-song.mjs`、`separator.js` を仮の処理に差し替えるのでモデル不要）。
- 動作確認は `scripts/test/`（README の「開発」）。`e2e.mjs` はアプリを通しで（分離・ハモリ・再生・MP3・キー・パートの変更・再読み込み・日本語ページ）、`quality.mjs` は分離とハモリの品質。CDN のファイルは npm のパッケージを `context.route` で返す（ベースライン §12-11）。Claude の環境から sherpa-onnx のリリース（GitHub）には届いた（2026-11-25）ので、本物のモデルで確かめられる。届かないときは偽モデル（`make-fake-model.py`）。実機（iPhone など）・本番・Cloudflare の管理画面は確かめられないので「未確認」と書き、ユーザーに確認手順を伝える。
- URL・YouTube からの取り込みは作らない（著作権への配慮）。
- トップページ（https://ktkwmr.com/）のアプリ一覧に載せたら、アプリ名・説明・アイコン・記事を変えたときに `ktkwmr/ktkwmr.com` の `scripts/pages/home.mjs` を直す PR を別に出す（ベースライン §2-16）。
- 記事を追加・変更したら、PR のプレビューで人間が内容を確認してからマージする（ベースライン §10-7、`docs/article-review.md`）。
- 作業はブランチ → PR → Cloudflare のプレビュービルド確認 → squash マージ。
