// Questions and answers. The answers are HTML; build-pages.mjs also puts a plain-text
// copy in the FAQPage structured data. id: an anchor other pages link to (e.g. ../faq/#rights).
import { MODEL_MB, MAX_MIN, MAX_MIN_LOW_MEM, KBPS } from "./app.mjs";

const EN = [
  { q: "Is Vocal Harmony Maker free?", a: "Yes. It is free, with no sign-up and no account." },
  {
    q: "Is my song uploaded?",
    a: 'No. The song is read, separated, analyzed, and played only in your browser. Nothing about it is sent anywhere. See the <a href="../privacy/">privacy policy</a>.',
  },
  {
    q: "What does it make?",
    a: "From the song you choose, four parts with their own faders: the vocals and the backing (separated with AI), and a harmony part as two parts — the singer's voice moved to the harmony notes, and a plain guide tone on the same notes. It also shows the tempo (BPM), a chord on every beat, the melody, and the harmony notes.",
  },
  {
    q: "Which harmony parts can it make?",
    a: 'A 3rd above (the most common), a 3rd below, a 5th above, or a 5th below the melody. The notes are chosen in the key of the song and moved to a chord tone where they would clash, so a “3rd” is sometimes a 4th. See <a href="../harmony/#which">upper or lower, 3rd or 5th</a>.',
  },
  {
    q: "Can it make two harmonies at once (three-part harmony)?",
    a: "One at a time. To get two, make one part (for example a 3rd above) and save “Harmony (voice)” as MP3, then choose another part (a 3rd below), remake the harmony, and save it too. Layer the files in a recording app.",
  },
  {
    q: "Which files can I open?",
    a: `Any audio format your browser can play: MP3, WAV, M4A (AAC), FLAC, Ogg, and others, and videos such as MP4, MOV, and WebM (the app uses their sound). Songs up to ${MAX_MIN} minutes (${MAX_MIN_LOW_MEM} minutes on phones and tablets).`,
  },
  {
    q: "Can I use songs from Apple Music, Spotify, or YouTube?",
    a: "No. Music from streaming services is protected and cannot be opened in other apps. Use audio files you have, such as your own recordings or songs you bought as files.",
  },
  {
    q: "Can I use a recording of my own singing?",
    a: "Yes, and it works well: with a voice alone (or a voice and a guitar), separation is easy, and the harmony is made from your own voice. A steady tempo and clear chords help the chords come out right.",
  },
  {
    q: "How long does it take?",
    a: "On a recent computer, usually less than the length of the song; faster with a browser that supports WebGPU. Phones and tablets take longer. The harmony then takes a few more seconds.",
  },
  {
    q: "Why is there a large download?",
    a: `The AI model (about ${MODEL_MB} MB) runs on your device, so the browser has to download it once. It is kept, so the next time there is no download. On mobile data the app asks first. ⚙ → “Delete the AI model” frees the space.`,
  },
  {
    q: "The page reloaded, or separation stopped partway.",
    a: "The device ran out of memory. Close other tabs and apps and try again: the app uses a lighter setting next time. If it keeps stopping, try a shorter song or use a computer.",
  },
  {
    q: "The harmony voice sounds strange in places.",
    a: 'It is the separated vocals moved to other notes, so anything that stayed in the vocals (a guitar doubling the melody, backing vocals, reverb) moves too, and large moves make a voice sound a little different. The guide tone has exact, clean notes. See <a href="../how-it-works/#limits">why it is not perfect</a>.',
  },
  {
    q: "A harmony note sounds wrong.",
    a: 'Usually the chord at that beat was estimated wrong. Tap the beat in the chord row, type the right chord, and press “Remake the harmony”. See <a href="../chords-and-key/#edit">editing the chords</a>.',
  },
  {
    q: "Is it the harmony of the original record?",
    a: "No. The app writes its own harmony from the melody, the key, and the chords. If the record has a harmony part, learn that one by ear; the app's harmony is a starting point and a practice tool.",
  },
  {
    q: "Can I change the key?",
    a: 'Yes, up to 12 semitones up or down, without changing the tempo. The vocals, the backing, the chord names, and the harmony all follow. See <a href="../chords-and-key/#key">changing the key</a>.',
  },
  {
    q: "Is the harmony saved?",
    a: `Not in the app: the parts, the chords, and the harmony are gone when you reload or choose another song. Save the ones you want as MP3 files (${KBPS} kbps) with the ↓ buttons or “Save this mix (MP3)”. The mixer settings (faders, mute, master volume) are remembered.`,
  },
  {
    id: "rights",
    q: "Which songs can I use, and can I publish what I made?",
    a: "Use your own recordings, or songs whose rights you have. For your own practice at home, using a song you bought is usually fine; publishing or sharing a separated or harmonized version of someone else's song usually needs the permission of the rights holders.",
  },
  {
    q: "Can I use it offline?",
    a: "After your first separation, the app, the AI model, and the separation engine are kept on your device, so it opens and works without a connection. You can also add it to your home screen.",
  },
];

const JA = [
  { q: "無料ですか？", a: "はい。無料で、登録やアカウントは不要です。" },
  {
    q: "曲はアップロードされますか？",
    a: 'いいえ。曲の読み込み・分離・解析・再生はブラウザの中だけで行い、曲に関する情報はどこにも送りません。<a href="../privacy/">プライバシーポリシー</a>をご覧ください。',
  },
  {
    q: "何ができあがりますか？",
    a: "選んだ曲から、フェーダー付きの 4 つのパートができます。AI で分離したボーカルと伴奏、そしてハモリのパートが 2 つ（ボーカルの音程をハモリの音に変えた声と、同じ音を単純な音で鳴らすガイド音）です。テンポ（BPM）・拍ごとのコード・旋律・ハモリの音も表示します。",
  },
  {
    q: "どんなハモリを作れますか？",
    a: '主旋律の 3 度上（いちばんよくあるもの）、3 度下、5 度上、5 度下です。音は曲のキーの中で選び、コードとぶつかるときはコードの音に移すので、「3 度」が 4 度になることもあります。<a href="../harmony/#which">上ハモか下ハモか、3 度か 5 度か</a>をご覧ください。',
  },
  {
    q: "ハモリを 2 つ同時に（3 声で）作れますか？",
    a: "一度に作るのは 1 つです。2 つ欲しいときは、1 つ目（たとえば 3 度上）を作って「ハモリ（声）」を MP3 で保存し、パートを変えて（3 度下）ハモリを再生成して、それも保存します。録音アプリでファイルを重ねてください。",
  },
  {
    q: "どんなファイルを開けますか？",
    a: `MP3・WAV・M4A（AAC）・FLAC・Ogg など、ブラウザで再生できる形式と、MP4・MOV・WebM などの動画（音声を使います）です。曲の長さは ${MAX_MIN} 分まで（スマホ・タブレットでは ${MAX_MIN_LOW_MEM} 分まで）。`,
  },
  {
    q: "Apple Music・Spotify・YouTube の曲は使えますか？",
    a: "使えません。配信サービスの曲は保護されていて、ほかのアプリで開けません。自分の録音や、ファイルで購入した曲など、手元にある音声ファイルを使ってください。",
  },
  {
    q: "自分の歌を録音したものでも使えますか？",
    a: "はい、向いています。声だけ（または声とギターだけ）なら分離がしやすく、自分の声からハモリができます。テンポが一定で、コードがはっきりしているほど、コードが正しく出ます。",
  },
  {
    q: "どのくらい時間がかかりますか？",
    a: "最近のパソコンなら、たいてい曲の長さより短い時間で終わります。WebGPU に対応したブラウザではさらに速くなります。スマホ・タブレットではもっとかかります。そのあとハモリを作るのに数秒かかります。",
  },
  {
    q: "なぜ大きなダウンロードがあるのですか？",
    a: `AI モデル（約 ${MODEL_MB} MB）を端末の中で動かすため、一度だけブラウザにダウンロードします。保存するので、次からはダウンロードしません。モバイルデータ通信のときは先に確認します。⚙ →「AI モデルを削除」で容量を空けられます。`,
  },
  {
    q: "ページが読み込み直された・分離が途中で止まりました。",
    a: "端末のメモリが足りなくなっています。ほかのタブやアプリを閉じてもう一度お試しください。次はより軽い設定で分離します。何度も止まるときは、短い曲にするか、パソコンでお試しください。",
  },
  {
    q: "ハモリの声がところどころ変に聞こえます。",
    a: 'ハモリの声は、分離したボーカルを別の音に動かしたものです。ボーカルに残った音（主旋律をなぞるギター、コーラス、残響）も一緒に動き、大きく動かすと声の感じも少し変わります。正確できれいな音はガイド音で確かめてください。<a href="../how-it-works/#limits">完全ではない理由</a>もご覧ください。',
  },
  {
    q: "ハモリの音が外れて聞こえます。",
    a: 'たいていは、その拍のコードの推定が違っています。上の段（コード）でその拍をタップし、正しいコードを入力して「ハモリを再生成」を押してください。<a href="../chords-and-key/#edit">コードの編集</a>をご覧ください。',
  },
  {
    q: "原曲のハモリと同じですか？",
    a: "いいえ。アプリが旋律・キー・コードから独自にハモリを作ります。原曲にハモリのパートがあるなら、それは耳で覚えてください。アプリのハモリは、練習のきっかけと練習用の素材です。",
  },
  {
    q: "キーを変えられますか？",
    a: 'はい。テンポを変えずに、上下 12 半音まで変えられます。ボーカル・伴奏・コード名・ハモリがすべて一緒に変わります。<a href="../chords-and-key/#key">キーを変える</a>をご覧ください。',
  },
  {
    q: "ハモリは保存されますか？",
    a: `アプリには残りません。ページを読み込み直したり別の曲を選んだりすると、パート・コード・ハモリは消えます。残したいものは ↓ ボタンか「このミックスを保存（MP3）」で MP3（${KBPS} kbps）に保存してください。ミキサーの設定（フェーダー・ミュート・全体の音量）は残ります。`,
  },
  {
    id: "rights",
    q: "どんな曲を使えますか？ 作ったものを公開してもいいですか？",
    a: "自分の録音か、権利を持っている曲を使ってください。購入した曲を自宅で自分の練習に使うのは、ふつう問題ありません。他人の曲を分離したものやハモリを付けたものを公開・共有するには、ふつう権利者の許可が必要です。",
  },
  {
    q: "オフラインで使えますか？",
    a: "一度分離すると、アプリ・AI モデル・分離のプログラムが端末に保存されるので、通信がなくても開いて使えます。ホーム画面に追加することもできます。",
  },
];

const list = (items) => `<dl class="faq">\n${items.map((x) => `  <dt${x.id ? ` id="${x.id}"` : ""}>${x.q}</dt>\n  <dd>${x.a}</dd>`).join("\n")}\n</dl>`;

export default {
  slug: "faq",
  faq: true,
  en: {
    title: "Vocal Harmony Maker FAQ",
    heading: "Frequently asked questions",
    nav: "FAQ",
    description:
      "Answers to common questions about Vocal Harmony Maker: privacy, what it makes, which harmony parts, supported files, how long it takes, the AI model download, wrong notes, key change, saving MP3 files, which songs you can use, and offline use.",
    faq: EN,
    body: () => `<p class="lead">Short answers to common questions. For step-by-step instructions, see the <a href="../guide/">guide</a>.</p>\n${list(EN)}`,
  },
  ja: {
    title: "よくある質問（FAQ）",
    heading: "よくある質問",
    nav: "よくある質問",
    description:
      "Vocal Harmony Maker についてのよくある質問。プライバシー、できあがるもの、作れるハモリ、開けるファイル、かかる時間、AI モデルのダウンロード、外れた音、キーの変更、MP3 の保存、使える曲、オフライン。",
    faq: JA,
    body: () => `<p class="lead">よくある質問への短い回答です。詳しい手順は<a href="../guide/">使い方ガイド</a>をご覧ください。</p>\n${list(JA)}`,
  },
};
