// How to use the app. Screenshots: node scripts/render-guide-images.mjs
import { MODEL_MB, ENGINE_MB, MAX_MIN, MAX_MIN_LOW_MEM, FADER_MAX, KBPS } from "./app.mjs";
import { img } from "./shots.mjs";

const FIRST_MB = MODEL_MB + ENGINE_MB.cpu;

export default {
  slug: "guide",
  en: {
    title: "How to Use Vocal Harmony Maker: Add a Harmony to a Song's Vocals",
    heading: "How to use Vocal Harmony Maker",
    nav: "How to use (guide)",
    description:
      "Step-by-step guide to Vocal Harmony Maker: choose a song, separate the vocals with AI in your browser, get a harmony part in the singer's own voice and a guide tone, mix and practice, fix the chords, change the key, and save MP3 files.",
    body: () => `
<p class="lead">Vocal Harmony Maker separates the vocals of a song with AI, finds the chords, and adds a harmony part — the singer's own voice moved to the harmony notes, and a plain guide tone to sing along to. This guide walks through every part of the screen.</p>

<nav class="toc" aria-label="Contents"><b>Contents</b><ol>
  <li><a href="#quick">Start in three steps</a></li>
  <li><a href="#song">Choosing a song and separating it</a></li>
  <li><a href="#first">The first time: downloading the AI model</a></li>
  <li><a href="#harmony">The harmony and the chords</a></li>
  <li><a href="#mixer">The mixer</a></li>
  <li><a href="#save">Saving MP3 files</a></li>
  <li><a href="#phone">On a phone or tablet</a></li>
  <li><a href="#keys">Keyboard shortcuts</a></li>
  <li><a href="#data">What is kept on your device</a></li>
</ol></nav>

<h2 id="quick">Start in three steps</h2>
<ol>
  <li><b>Choose a song.</b> Tap “Choose a song file” and pick an audio file (MP3, WAV, M4A, FLAC…) or a video (MP4, MOV…), or drop it on the box.</li>
  <li><b>Wait.</b> Separation starts by itself. When the bar is full, the harmony follows a few seconds later. Keep the screen open.</li>
  <li><b>Press ▶.</b> You hear the song with a harmony a 3rd above the melody. Choose another part (3rd or 5th, above or below) next to “Remake the harmony”.</li>
</ol>

<h2 id="song">Choosing a song and separating it</h2>
<figure class="shot">
  ${img("en", "song", `The song panel while separating: the box to choose a file, the chosen file practice-song.wav (1:00, stereo), the progress bar at 16% with about 30 seconds left and a Cancel button, a note that the AI model of about ${MODEL_MB} MB is downloaded the first time, and the line Separating with: GPU (WebGPU). Numbers 1 to 4 mark them.`)}
  <figcaption>The numbers match the list below. Tap the image to enlarge it.</figcaption>
</figure>
<ol>
  <li><b>Choose a song file</b> – Any format your browser can play: MP3, WAV, M4A (AAC), FLAC, Ogg, and others, and videos such as MP4 and MOV (their sound is used). Songs up to ${MAX_MIN} minutes (${MAX_MIN_LOW_MEM} minutes on phones and tablets, which have less memory). The file is read in your browser and never uploaded. <b>Separation starts as soon as you choose the file</b>; there is no button to press. To separate another song, choose another file.</li>
  <li><b>The song</b> – The file name, the length, and whether it is stereo or mono.</li>
  <li><b>Progress</b> – How far the separation is (in %) and about how long is left, with Cancel. The song is split into the vocals and the backing (everything else); then the chords and the harmony are made.</li>
  <li><b>How it runs</b> – On the <b>GPU (WebGPU)</b> when the browser supports it, otherwise on the CPU. Above it, whether the AI model is already saved on this device.</li>
</ol>
<p>On a recent computer it usually takes well under the length of the song; on a phone, longer.</p>
<div class="note"><p>Keep the screen open until it finishes. On a phone, separation stops when the screen turns off or you switch to another app. If it stops with a memory error, the app tries again with settings that use less memory.</p></div>

<h2 id="first">The first time: downloading the AI model</h2>
<p>The first time you separate a song, the browser downloads the AI model (about ${MODEL_MB} MB, from this site) and the separation engine (about ${ENGINE_MB.cpu} MB, or ${ENGINE_MB.gpu} MB with the GPU). They are kept on your device, so the next time there is no download and the song panel says “The AI model is saved on this device”.</p>
<figure class="shot phone">
  ${img("en", "network", `On a phone, a dialog asks: Are you on Wi-Fi? This browser does not tell the app whether you are on Wi-Fi or mobile data. Download: about ${FIRST_MB} MB, only the first time. Buttons: Not now, and Download and separate.`, { half: true })}
  <figcaption>On a phone or tablet, the app asks before the first download.</figcaption>
</figure>
<p>Because the download is large (about ${FIRST_MB} MB in all), the app asks first when you seem to be on mobile data or have Data Saver on, and on phones and tablets whose browser does not say what kind of connection it has (such as iPhone and iPad). Choose “Not now” and connect to Wi-Fi if you are not on Wi-Fi, then choose the song again.</p>
<p>To free the space, open ⚙ → “Delete the AI model”. It is downloaded again the next time you separate a song.</p>

<h2 id="harmony">The harmony and the chords</h2>
<figure class="shot">
  ${img("en", "harmony", "The mixer after making a harmony: the key control, the Remake the harmony button and the part (Upper, 3rd above), BPM 120, a scrolling view of the chords, the vocal melody, and the harmony notes, and the four parts: Vocals, Backing, Harmony (voice), and Harmony guide tone. Numbers 1 to 7 mark them.")}
  <figcaption>The chords and the harmony, made right after separating. The numbers match the list below. The song is a made-up one.</figcaption>
</figure>
<ol>
  <li><b>Key</b> – − and + move the whole song (the vocals, the backing, and the harmony) by a semitone, up to an octave either way. The tempo stays the same.</li>
  <li><b>Remake the harmony</b> – Right after separating, the app finds the tempo, the chord on every beat, and the vocal melody, and makes a harmony part (the one chosen in 3; a 3rd above at first). Press this after you change the part or the chords; it turns black when the harmony no longer matches them. If the harmony could not be made, it says “Find chords &amp; make harmony”: press it to try again.</li>
  <li><b>The harmony part</b> – a 3rd or a 5th, above or below the melody.</li>
  <li><b>BPM</b> – the tempo found in the song.</li>
  <li><b>The view</b> – chord names on top (tap a beat there to change the chord), the vocal melody as a grey line, and the harmony notes as black bars. Drag it sideways to look ahead; tap it to jump there.</li>
  <li><b>Harmony (voice)</b> – the vocals moved to the harmony notes, pitch-corrected so they stay on them.</li>
  <li><b>Harmony guide tone</b> – the same notes as a plain tone. It starts muted; press its M to hear it.</li>
</ol>
<p>The chords and the harmony are worked out in your browser, with no AI model. For practice ideas and how the notes are chosen, see <a href="../harmony/">practicing harmonies</a>; to fix a chord, see <a href="../chords-and-key/">chords and key change</a>.</p>

<h2 id="mixer">The mixer</h2>
<figure class="shot">
  ${img("en", "mixer", "The mixer while playing: the pause and stop buttons and the position, four rows for Vocals (at 80%), Backing, Harmony (voice) (muted), and Harmony guide tone, each with a level meter, M and S buttons, a fader, and a save button, and under them the Master fader, Reset mixer, and Save this mix (MP3). Numbers 1 to 11 mark the controls.")}
  <figcaption>Set up to practice singing the harmony: the harmony voice is muted (M), the guide tone is on, and the vocals are turned down to 80%.</figcaption>
</figure>
<ol>
  <li><b>▶ Play / ❚❚ Pause</b> – Shows ❚❚ while it plays. Press it to pause; the next play starts from where it paused.</li>
  <li><b>■ Stop</b> – Stops and goes back to the start of the song.</li>
  <li><b>Position</b> – Drag to move through the song.</li>
  <li><b>The part and its level</b> – The bar under the name moves with the sound of that part.</li>
  <li><b>M (mute)</b> – Silences that part. Here the harmony voice is muted, to sing the harmony yourself.</li>
  <li><b>S (solo)</b> – Plays only the parts whose S is on. You can solo more than one part, for example the vocals and the harmony voice together. While any S is on, M is ignored.</li>
  <li><b>Fader</b> – The volume of the part, from 0% to ${FADER_MAX}%.</li>
  <li><b>↓ (save the part)</b> – Saves that part alone as an MP3 file.</li>
  <li><b>Master</b> – The volume of the whole mix.</li>
  <li><b>Reset mixer</b> – Puts every part back to 100% and unmuted (the harmony guide tone back to muted).</li>
  <li><b>Save this mix (MP3)</b> – Saves what you hear now as one MP3 file.</li>
</ol>
<p>The faders, M, and the master volume are remembered for next time; S is not, so you never start in solo by mistake.</p>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">You want to</th><th scope="col">Set the mixer like this</th></tr></thead>
    <tbody>
      <tr><th scope="row">Hear the song with the harmony</th><td data-label="Mixer:">Vocals, Backing, and Harmony (voice) on; the guide tone muted (the way it starts)</td></tr>
      <tr><th scope="row">Learn the harmony</th><td data-label="Mixer:">Solo the guide tone, or the guide tone and the vocals</td></tr>
      <tr><th scope="row">Sing the harmony yourself</th><td data-label="Mixer:">Harmony (voice) muted; the guide tone on at first, then lower</td></tr>
      <tr><th scope="row">Sing the melody against the harmony</th><td data-label="Mixer:">Vocals muted; Backing and Harmony (voice) on</td></tr>
    </tbody>
  </table>
</div>

<h2 id="save">Saving MP3 files</h2>
<ul>
  <li><b>Each part</b> – The ↓ button on each row saves that part, as it was made (the fader and M do not change it). For example, “Harmony (voice)” alone, to layer it in your own recording.</li>
  <li><b>Your mix</b> – “Save this mix (MP3)” saves what you hear now: the faders, M, S, and the master volume.</li>
  <li>The files are ${KBPS} kbps MP3 (44.1 kHz stereo), named after the song, for example <code>practice-song - Harmony (voice).mp3</code>. When the key is changed, the name says so: <code>practice-song - Mix (key +2).mp3</code>.</li>
  <li>The separated parts, the chords, and the harmony are not kept in the app. When you reload the page or choose another song, they are gone: save the files you want to keep, or separate the song again.</li>
</ul>
<p>Saved MP3 files play on any device. You can make the harmony on a computer and practice with the files on your phone.</p>

<h2 id="phone">On a phone or tablet</h2>
<figure class="shot phone">
  ${img("en", "phone", "Vocal Harmony Maker on a phone: the play button and the position, the key control, the Remake the harmony button, BPM 120 and the chords and notes, and the parts, each with M, S, save, and a fader below the name.", { half: true })}
  <figcaption>On a narrow screen, each part's fader is under its name.</figcaption>
</figure>
<p>Everything works the same on a phone. Separation needs memory, though: phones and tablets take longer and take songs up to ${MAX_MIN_LOW_MEM} minutes.</p>
<div class="note"><p>If separation stops partway on a phone and the page reloads, the device ran out of memory. The app remembers the setting that stopped and uses a lighter one next time. If it keeps stopping, make the harmony on a computer and play the saved MP3 files on the phone.</p></div>

<h2 id="keys">Keyboard shortcuts</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">Key</th><th scope="col">Action</th></tr></thead>
    <tbody>
      <tr><th scope="row"><code>Space</code></th><td>Play / pause</td></tr>
      <tr><th scope="row"><code>Home</code></th><td>Stop and go back to the start</td></tr>
      <tr><th scope="row"><code>1</code>–<code>4</code></th><td>Mute or unmute the vocals, the backing, the harmony voice, and the guide tone</td></tr>
      <tr><th scope="row"><code>←</code> <code>→</code></th><td>5 seconds back / forward</td></tr>
    </tbody>
  </table>
</div>

<h2 id="data">What is kept on your device</h2>
<ul>
  <li>The AI model and the separation engine (so they are downloaded once).</li>
  <li>The mixer settings: each part's fader and mute, and the master volume.</li>
  <li>The app itself, so it opens without a connection. You can add it to your home screen.</li>
</ul>
<p>Your song, the separated parts, the chords, and the harmony are not saved and are never uploaded. See the <a href="../privacy/">privacy policy</a>.</p>
`,
  },
  ja: {
    title: "Vocal Harmony Maker の使い方：曲のボーカルにハモリを付ける",
    heading: "Vocal Harmony Maker の使い方",
    nav: "使い方（ガイド）",
    description:
      "Vocal Harmony Maker の使い方を順に説明します。曲を選び、AI でボーカルをブラウザの中で分離し、歌っている人の声のままのハモリとガイド音を作って、ミックス・練習する方法、コードの修正、キーの変更、MP3 の保存まで。",
    body: () => `
<p class="lead">Vocal Harmony Maker は、AI で曲のボーカルを分離し、コードを推定して、ハモリのパートを付けるアプリです。ハモリは、ボーカルの音程をハモリの音に変えた<b>歌っている人の声</b>と、一緒に歌うための<b>ガイド音</b>の 2 つで鳴ります。このガイドでは画面の各部分を順に説明します。</p>

<nav class="toc" aria-label="目次"><b>目次</b><ol>
  <li><a href="#quick">3 ステップで始める</a></li>
  <li><a href="#song">曲を選んで分離する</a></li>
  <li><a href="#first">初回：AI モデルのダウンロード</a></li>
  <li><a href="#harmony">ハモリとコード</a></li>
  <li><a href="#mixer">ミキサー</a></li>
  <li><a href="#save">MP3 で保存する</a></li>
  <li><a href="#phone">スマホ・タブレットで使う</a></li>
  <li><a href="#keys">キーボード操作</a></li>
  <li><a href="#data">端末に保存されるもの</a></li>
</ol></nav>

<h2 id="quick">3 ステップで始める</h2>
<ol>
  <li><b>曲を選びます。</b>「曲のファイルを選ぶ」をタップして音声ファイル（MP3・WAV・M4A・FLAC など）か動画（MP4・MOV など）を選ぶか、枠にドロップします。</li>
  <li><b>待ちます。</b>分離が自動で始まります。バーがいっぱいになると、数秒後にハモリもできます。画面は開いたままにしてください。</li>
  <li><b>▶ を押します。</b>主旋律の 3 度上のハモリが付いた曲が流れます。ほかのパート（3 度・5 度の上か下）は「ハモリを再生成」の横で選べます。</li>
</ol>

<h2 id="song">曲を選んで分離する</h2>
<figure class="shot">
  ${img("ja", "song", `分離の途中の曲の欄。ファイルを選ぶ枠、選んだファイル 練習曲.wav（1:00・ステレオ）、16% で残り約 30 秒の進み具合のバーとキャンセルボタン、初回は約 ${MODEL_MB} MB の AI モデルをダウンロードするという案内、「分離に使っている設定：GPU（WebGPU）」。1〜4 の番号付き。`)}
  <figcaption>番号は下の説明に対応しています。画像はタップで拡大できます。</figcaption>
</figure>
<ol>
  <li><b>曲のファイルを選ぶ</b> – MP3・WAV・M4A（AAC）・FLAC・Ogg など、ブラウザで再生できる形式と、MP4・MOV などの動画（音声を使います）に対応しています。曲の長さは ${MAX_MIN} 分まで（メモリの少ないスマホ・タブレットでは ${MAX_MIN_LOW_MEM} 分まで）。ファイルはブラウザの中で読み込み、アップロードしません。<b>ファイルを選ぶとすぐに分離が始まります</b>（押すボタンはありません）。別の曲にするときは、別のファイルを選びます。</li>
  <li><b>曲</b> – ファイル名、長さ、ステレオかモノラルか。</li>
  <li><b>進み具合</b> – 分離の進み具合（%）と残り時間の目安、キャンセル。曲をボーカルと伴奏（それ以外のすべて）に分け、続けてコードとハモリを作ります。</li>
  <li><b>分離のしかた</b> – ブラウザが対応していれば <b>GPU（WebGPU）</b>、そうでなければ CPU で処理します。その上に、AI モデルがこの端末に保存済みかどうかが出ます。</li>
</ol>
<p>最近のパソコンなら、たいてい曲の長さよりかなり短い時間で終わります。スマホではもっとかかります。</p>
<div class="note"><p>終わるまで画面を開いたままにしてください。スマホでは、画面が消えたりほかのアプリに切り替えたりすると分離が止まります。メモリ不足で止まったときは、メモリを節約する設定で自動的にやり直します。</p></div>

<h2 id="first">初回：AI モデルのダウンロード</h2>
<p>初めて分離するときは、ブラウザが AI モデル（約 ${MODEL_MB} MB。このサイトから）と分離のプログラム（約 ${ENGINE_MB.cpu} MB、GPU を使うときは約 ${ENGINE_MB.gpu} MB）をダウンロードします。どちらも端末に保存するので、次からはダウンロードせず、曲の欄に「AI モデルはこの端末に保存済みです」と出ます。</p>
<figure class="shot phone">
  ${img("ja", "network", `スマホで出る確認のダイアログ。「Wi-Fi に接続していますか？」このブラウザでは、Wi-Fi とモバイルデータ通信のどちらに接続しているかを確かめられません。ダウンロード：約 ${FIRST_MB} MB（初回だけ）。ボタンは「やめておく」と「ダウンロードして分離する」。`, { half: true })}
  <figcaption>スマホ・タブレットでは、初回のダウンロードの前に確認します。</figcaption>
</figure>
<p>ダウンロードは合わせて約 ${FIRST_MB} MB と大きいので、モバイルデータ通信やデータセーバーのとき、また接続の種類が分からないスマホ・タブレット（iPhone・iPad など）では、先に確認します。Wi-Fi でなければ「やめておく」を選んで Wi-Fi に接続し、曲を選び直してください。</p>
<p>容量を空けたいときは ⚙ →「AI モデルを削除」を選びます。次に分離するときに、もう一度ダウンロードします。</p>

<h2 id="harmony">ハモリとコード</h2>
<figure class="shot">
  ${img("ja", "harmony", "ハモリを作ったあとのミキサー。キーの − と ＋、「ハモリを再生成」ボタンとパート（上ハモ（3 度上））、BPM 120、コード・ボーカルの旋律・ハモリの音が流れる表示、ボーカル・伴奏・ハモリ（声）・ハモリのガイド音の 4 つのパート。1〜7 の番号付き。")}
  <figcaption>分離のあとに続けて作るコードとハモリ。番号は下の説明に対応しています。曲は架空のものです。</figcaption>
</figure>
<ol>
  <li><b>キー</b> – − と ＋ で曲全体（ボーカル・伴奏・ハモリ）を半音ずつ、上下それぞれ 1 オクターブまで動かします。テンポは変わりません。</li>
  <li><b>ハモリを再生成</b> – 分離が終わると続けて、テンポ・拍ごとのコード・ボーカルの旋律を推定し、ハモリのパート（3 で選んだもの。最初は 3 度上）を作ります。パートやコードを変えたら押してください。ハモリと合わなくなるとボタンが黒くなります。ハモリを作れなかったときは「コード推定＆ハモリ生成」と出るので、押してやり直します。</li>
  <li><b>ハモリのパート</b> – 主旋律の 3 度か 5 度の、上か下。</li>
  <li><b>BPM</b> – 曲から推定したテンポ。</li>
  <li><b>表示</b> – 上の段にコード名（拍をタップするとコードを変えられます）、灰色の線がボーカルの旋律、黒い帯がハモリの音です。横にドラッグすると先を見られ、タップするとその位置に移ります。</li>
  <li><b>ハモリ（声）</b> – ボーカルの音程をハモリの音に変えたもの。音程補正で、ハモリの音からずれないようにしています。</li>
  <li><b>ハモリのガイド音</b> – 同じ音を単純な音で鳴らします。最初はミュートなので、M を押して聞きます。</li>
</ol>
<p>コードとハモリは、AI モデルを使わずにブラウザの中で計算しています。練習のしかたやハモリの音の選び方は<a href="../harmony/">ハモリの練習</a>、コードの直し方は<a href="../chords-and-key/">コード表示とキー変更</a>をご覧ください。</p>

<h2 id="mixer">ミキサー</h2>
<figure class="shot">
  ${img("ja", "mixer", "再生中のミキサー。一時停止と停止のボタンと再生位置、ボーカル（80%）・伴奏・ハモリ（声）（ミュート）・ハモリのガイド音の 4 行と、それぞれのレベルメーター・M と S のボタン・フェーダー・保存ボタン、その下に全体の音量・「ミキサーを元に戻す」・「このミックスを保存（MP3）」。1〜11 の番号付き。")}
  <figcaption>ハモリを自分で歌う練習の設定です。ハモリ（声）をミュート（M）し、ガイド音を鳴らし、ボーカルを 80% に下げています。</figcaption>
</figure>
<ol>
  <li><b>▶ 再生／❚❚ 一時停止</b> – 再生中は ❚❚ になります。押すと一時停止し、次の再生は止めた位置から始まります。</li>
  <li><b>■ 停止</b> – 止めて、曲の最初に戻ります。</li>
  <li><b>再生位置</b> – ドラッグして曲の中を移動します。</li>
  <li><b>パートとレベル</b> – 名前の下のバーが、そのパートの音に合わせて動きます。</li>
  <li><b>M（ミュート）</b> – そのパートを消します。ここでは自分でハモるために、ハモリ（声）をミュートしています。</li>
  <li><b>S（ソロ）</b> – S を押したパートだけを鳴らします。ボーカルとハモリ（声）のように、2 つ以上をソロにもできます。S を押しているパートがある間は、M は無視されます。</li>
  <li><b>フェーダー</b> – そのパートの音量（0〜${FADER_MAX}%）。</li>
  <li><b>↓（パートを保存）</b> – そのパートだけを MP3 で保存します。</li>
  <li><b>全体</b> – ミックス全体の音量。</li>
  <li><b>ミキサーを元に戻す</b> – すべてのパートを 100%・ミュートなしに戻します（ハモリのガイド音はミュートに戻ります）。</li>
  <li><b>このミックスを保存（MP3）</b> – いま聞こえている音を 1 つの MP3 で保存します。</li>
</ol>
<p>フェーダー・M・全体の音量は次回も残ります。S は残らないので、ソロのまま始まって戸惑うことはありません。</p>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">やりたいこと</th><th scope="col">ミキサーの設定</th></tr></thead>
    <tbody>
      <tr><th scope="row">ハモリ付きの曲を聞く</th><td data-label="設定：">ボーカル・伴奏・ハモリ（声）を鳴らし、ガイド音はミュート（最初の状態）</td></tr>
      <tr><th scope="row">ハモリを覚える</th><td data-label="設定：">ガイド音だけ、またはガイド音とボーカルをソロ</td></tr>
      <tr><th scope="row">自分でハモる</th><td data-label="設定：">ハモリ（声）をミュート。最初はガイド音を鳴らし、だんだん下げる</td></tr>
      <tr><th scope="row">ハモリに対して主旋律を歌う</th><td data-label="設定：">ボーカルをミュートし、伴奏とハモリ（声）を鳴らす</td></tr>
    </tbody>
  </table>
</div>

<h2 id="save">MP3 で保存する</h2>
<ul>
  <li><b>各パート</b> – 各行の ↓ ボタンで、そのパートを作ったままの状態で保存します（フェーダーや M は反映しません）。たとえば「ハモリ（声）」だけを保存して、自分の録音に重ねられます。</li>
  <li><b>自分のミックス</b> – 「このミックスを保存（MP3）」で、いま聞こえている状態（フェーダー・M・S・全体の音量）のまま保存します。</li>
  <li>ファイルは ${KBPS} kbps の MP3（44.1 kHz・ステレオ）で、名前は曲の名前から付けます（例：<code>練習曲 - ハモリ（声）.mp3</code>）。キーを変えているときは名前にキーが入ります（例：<code>練習曲 - ミックス（キー +2）.mp3</code>）。</li>
  <li>分離したパート・コード・ハモリはアプリに残りません。ページを読み込み直したり別の曲を選んだりすると消えるので、残したいものは保存するか、もう一度分離してください。</li>
</ul>
<p>保存した MP3 はどの端末でも再生できます。パソコンでハモリを作って、スマホでファイルを使って練習することもできます。</p>

<h2 id="phone">スマホ・タブレットで使う</h2>
<figure class="shot phone">
  ${img("ja", "phone", "スマホで開いた Vocal Harmony Maker。再生ボタンと再生位置、キー、「ハモリを再生成」ボタン、BPM 120 とコード・音符の表示、名前の下に M・S・保存・フェーダーが並ぶ各パート。", { half: true })}
  <figcaption>幅の狭い画面では、フェーダーがパートの名前の下に並びます。</figcaption>
</figure>
<p>スマホでも同じように使えます。ただし分離にはメモリが必要なので、スマホ・タブレットでは時間がかかり、曲は ${MAX_MIN_LOW_MEM} 分までです。</p>
<div class="note"><p>スマホで分離が途中で止まってページが読み込み直されたときは、メモリが足りなくなっています。アプリは止まった設定を覚えて、次はより軽い設定で分離します。何度も止まるときは、パソコンでハモリを作り、保存した MP3 をスマホで再生してください。</p></div>

<h2 id="keys">キーボード操作</h2>
<div class="table-wrap">
  <table class="text stack">
    <thead><tr><th scope="col">キー</th><th scope="col">操作</th></tr></thead>
    <tbody>
      <tr><th scope="row"><code>Space</code></th><td>再生／一時停止</td></tr>
      <tr><th scope="row"><code>Home</code></th><td>停止して最初に戻る</td></tr>
      <tr><th scope="row"><code>1</code>〜<code>4</code></th><td>ボーカル・伴奏・ハモリ（声）・ガイド音のミュートを切り替え</td></tr>
      <tr><th scope="row"><code>←</code> <code>→</code></th><td>5 秒戻る／進む</td></tr>
    </tbody>
  </table>
</div>

<h2 id="data">端末に保存されるもの</h2>
<ul>
  <li>AI モデルと分離のプログラム（ダウンロードを 1 回で済ませるため）。</li>
  <li>ミキサーの設定：各パートのフェーダーとミュート、全体の音量。</li>
  <li>アプリ本体（通信なしでも開けるように）。ホーム画面に追加することもできます。</li>
</ul>
<p>曲・分離したパート・コード・ハモリは保存せず、アップロードもしません。<a href="../privacy/">プライバシーポリシー</a>をご覧ください。</p>
`,
  },
};
