# ベースラインの実施状況（Vocal Harmony Maker）

基準: WEBAPP_BASELINE.md（最終更新 2026-11-25 版）
状態: ✅ 実装済み / ⚠️ 一部 / ❌ 未実装 / 👤 待ち（人間の作業） / — 対象外
最終更新: 2026-11-25（初版。Band Stem Mixer のコピーから作成、分離は Karaoke Trainer のもの）

## 0. 変数

| 変数 | 値 |
|---|---|
| アプリ名 | Vocal Harmony Maker |
| スラッグ | `vocalharmonymaker` |
| ドメイン | `ktkwmr.com`（§0 の A: 別 Worker + Route `ktkwmr.com/vocalharmonymaker*`） |
| リポジトリ | `ktkwmr/VocalHarmonyMaker` |
| 運営者・問い合わせ | ktkwmr / GitHub Issues |
| 言語 | en（既定）+ ja（`/ja/`） |
| Web Analytics token | ほかのアプリと同じ |
| 初回の Artifact（§12-12） | https://claude.ai/artifact/CscsWFnjMxQLA7RkthXpzf （AI の分離の代わりに架空のデモ曲を返す。コード・ハモリ・キー・ミキサー・MP3 は本物） |

## 項目

| # | 項目 | 状態 | メモ |
|---|---|---|---|
| 1-4 | Claude の GitHub App | ✅ | このセッションで push できた |
| 1-8 | Cloudflare の GitHub App | 👤 | 「Only select repositories」なら VocalHarmonyMaker を追加 |
| 2-1 | wrangler.jsonc | ✅ | `routes`・`workers_dev: false`・`preview_urls: true`・`previews: {}`、`build.command` の先頭で `fetch-model.mjs` |
| 2-2 | `/` の転送 | — | ドメイン直下は `ktkwmr/ktkwmr.com` |
| 2-3 | 404.html | ✅ | |
| 2-4〜2-10 | .gitignore・LF・`--check`・README・LICENSE・CLAUDE.md・バージョンなし | ✅ | `.gitignore` に `public/vocalharmonymaker/models/` |
| 2-11 | Cloudflare に接続 | 👤 | Project name は `vocalharmonymaker`、Production branch は `main` |
| 2-13 | 自動デプロイの確認 | 👤 | |
| 2-14 | 2 つ目以降のアプリの Worker 設定 | ✅ | sitemap は `/vocalharmonymaker/sitemap.xml`。最初の PR ではプレビュー URL がオフ → Domains の Preview をオン |
| 2-16 | トップページへの追加 | 👤 | `ktkwmr/ktkwmr.com` への PR は、このセッションにそのリポジトリが無いので未作成。公開後に別のセッションで（`APPS`・`ICON`・`PREVIEW`、`robots.txt` の `Sitemap:` 行） |
| 2-18・2-19 | 最初の push は `main`・既存アプリのコピー | ✅ | `main` の最初のコミットは Band Stem Mixer（46a34da）のファイルそのまま、次に `wrangler.jsonc` の `name`・`routes` だけ直した（Cloudflare に接続する前に） |
| 2-20 | 大きなファイル | ✅ | モデルは Git に入れずビルドで取得・20 MiB ごとに分割（Karaoke Trainer と同じ `fetch-model.mjs`） |
| 3-1〜3-5 | manifest・アイコン・meta・sw.js・SW 登録 | ✅ | アイコンは新しく（2 本の音符の列＝旋律とハモリ） |
| 3-6 | `file://` の注意 | ✅ | README |
| 3-7 | インストールの案内 | ❌ | 任意 |
| 3-8 | アイコンの生成 | ✅ | `scripts/render-icons.mjs`（Playwright は `createRequire` で読む） |
| 3-9 | COEP とワーカーのスクリプト | ✅ | `sw.js` の `withWorkerHeaders`。E2E で SW が制御する 2 回目の訪問と日本語ページの分離を確認 |
| 3-10 | CDN のオフライン対応 | ✅ | ONNX Runtime Web 1.30.0 の 6 ファイルと lamejs。モデルは `vocalharmonymaker-model-v2`（`KEEP`） |
| 4-1〜4-3 | I18N・言語の決め方・日本語ページの生成 | ✅ | |
| 4-4 | 日本語の検索用タイトル・説明 | 👤 | `scripts/build-ja.mjs` 冒頭の案を確認 |
| 4-7 | `<base>` と URL | ✅ | E2E で `/ja/` の分離とハモリを確認 |
| 5-1〜5-8 | title・canonical・hreflang・OGP・og-image・JSON-LD・h1・説明 | ✅ | og-image はピアノロールとフェーダー |
| 5-10 | sitemap はアプリごと | ✅ | |
| 5-11 | スマホでスクロールを止めない | ✅ | Band Stem Mixer と同じ |
| 6-1〜6-4 | セキュリティヘッダー・CSP | ✅ | Hugging Face を外した。E2E でコンソールエラー 0 件、外部への想定外の通信 0 件 |
| 6-6 | COOP / COEP | ✅ | COEP は `credentialless`（Band Stem Mixer の `require-corp` から変更） |
| 7-1〜7-3 | プライバシー（アプリ内・ポリシー）・運営者情報 | ✅ | 外部送信は Cloudflare・Web Analytics・jsDelivr。モデルは自サイト |
| 7-7 | ポリシーの外部リンクの確認 | 👤 | |
| 7-8 | AI モデルの重みのライセンス | ✅ | Spleeter はコードと学習済みモデルが MIT（JOSS の論文に明記）、ONNX 変換は sherpa-onnx（Apache-2.0）。広告を入れられる |
| 8-1〜8-3 | THIRD_PARTY_LICENSES・Actions・About | ✅ | Spleeter・sherpa-onnx は Karaoke Trainer から手書きの項を移した |
| 8-4 | CDN のバージョン固定・遅延読み込み | ✅ | |
| 9-1〜9-2 | 設定メニュー・使い方 | ✅ | |
| 9-3 | 状態の保存 | ✅ | ソロは保存しない |
| 9-4・9-5 | スマホ対応・`accept` | ✅ | |
| 9-7 | 保存 | ✅ | |
| 9-8・9-10・9-11 | アクセシビリティ・ボタンの反応・ダイアログ | ✅ | Band Stem Mixer と同じ |
| 9-9 | 自動テスト | ⚠️ | `scripts/test/e2e.mjs`・`quality.mjs`（手で動かす。CI には入れていない） |
| 9-12 | iOS 26 のステータスバーのにじみ | ⚠️ | Band Stem Mixer と同じ作り。iPhone 実機では未確認 |
| 9-13 | 大きなダウンロードの前の通信の確認 | ✅ | モデルが保存済みなら案内の行（`modelBox`）を隠す |
| 9-14〜9-16 | フッター・再生コントロール・自動スクロール | ✅ | Band Stem Mixer と同じ |
| 9-18 | 関連アプリへのリンク | ✅ | メイン機能の下の `<nav class="related">` に 2 つ（定義は webapp-baseline の `related-apps.json`、文言は `I18N` の `rel.*`） |
| 10-1〜10-5 | 記事 | ✅ | 5 本（`guide`・`harmony`・`chords-and-key`・`how-it-works`・`faq`） |
| 10-7 | 記事の人間確認 | 👤 | `docs/article-review.md`。PR のプレビューで確認してからマージ |
| 10-8 | 再生成できる画面写真と値 | ✅ | |
| 10-9 | 一般知識の校閲 | ✅ | `docs/article-review.md` の表 |
| 11-1〜11-3 | Web Analytics | ✅ | |
| 11-4 | beacon の本番確認 | 👤 | |
| 17 | Zaraz + GA4（同意したときだけ） | ⚠️ | 2026-11-28 に実装（`docs/analytics.md`）。本番での確認・Configuration Rule の削除（17-13）・GA4 のカスタム定義の登録は 👤 待ち |
| 12-1・12-2 | Actions | ✅ | |
| 12-12 | Artifact で見せる | ✅ | 上の URL |
| 12-13 | 人間がやる動作確認の方法 | ✅ | PR 本文 |
| 12-14 | 大きな AI モデルの確かめ方 | ✅ | この環境から本物のモデル（sherpa-onnx の GitHub リリース）を取得できたので、本物で E2E と品質の確認をした |
| 13・14 | 公開時・公開後 | 👤 | |
| 15 | 広告（AdSense） | ❌ | 将来入れる予定（ユーザーの方針）。モデル・ライブラリは商用利用できるものだけ。入れるときは §15 とプライバシーの書き換え |

## 未確認（この環境から届かないもの）

- iPhone・Android の実機（メモリ・速度・画面ロック・ファイル選択・AudioWorklet）。
- WebGPU での分離（この環境の Chromium は CPU で動いた）。
- 本番（Cloudflare のビルドでのモデルの取得、`_headers` の適用、Web Analytics）。
