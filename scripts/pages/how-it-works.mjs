// Article: how the app makes a harmony from a song: separating the vocals (Spleeter 2stems), the chords, the
// melody, choosing the harmony notes, and shifting the voice. Facts about Spleeter are from its README and paper
// (Hennequin, Khlif, Voituret, Moussallam, JOSS 2020); see docs/article-review.md.
import { MODEL_MB, SPLIT_SEC, TOP_KHZ } from "./app.mjs";

export default {
  slug: "how-it-works",
  en: {
    title: "How a Harmony Is Made from a Song's Vocals: AI Separation, Chords, and Pitch Shifting",
    heading: "How the harmony is made from the vocals",
    nav: "How it works",
    description:
      "How Vocal Harmony Maker turns a song into a harmony part: separating the vocals with the AI model Spleeter, finding the beats and chords, following the melody, choosing harmony notes that fit the key and the chord, and moving the singer's voice to them.",
    body: () => `
<p class="lead">Vocal Harmony Maker turns a mixed song into a second voice in five steps. Only the first uses AI; the others are classic signal-processing methods running in your browser. Knowing what each step does helps you understand when the result is good and when it needs your help.</p>

<nav class="toc" aria-label="Contents"><b>Contents</b><ol>
  <li><a href="#separate">1. Separating the vocals (AI)</a></li>
  <li><a href="#chords">2. Beats, tempo, and chords</a></li>
  <li><a href="#melody">3. Following the melody</a></li>
  <li><a href="#notes">4. Choosing the harmony notes</a></li>
  <li><a href="#voice">5. Moving the voice to the harmony</a></li>
  <li><a href="#browser">Running it all in your browser</a></li>
  <li><a href="#limits">Why it is not perfect</a></li>
</ol></nav>

<h2 id="separate">1. Separating the vocals (AI)</h2>
<p>Once a song is mixed, the voice and the instruments are added together into one waveform (two, in stereo), and there is no switch that takes them apart again. Older tricks, such as removing what sits in the center of a stereo mix, also removed the bass and the kick drum and left the reverb of the voice behind. An AI separation model instead <b>estimates</b> what the voice alone must have sounded like.</p>
<p>The app uses <b>Spleeter</b>, a separation tool released by the music streaming service Deezer in 2019, in its two-part version (<b>2stems</b>: vocals and accompaniment). How it works, briefly:</p>
<ul>
  <li>The sound is turned into a <b>spectrogram</b>: how strong each frequency is at each moment.</li>
  <li>For each part, a neural network of the <b>U-Net</b> type (a 12-layer convolutional network: 6 layers that condense the picture and 6 that expand it again) looks at the spectrogram of the mix and estimates a <b>soft mask</b>: for every frequency at every moment, how much of the sound belongs to that part. Deezer trained it on its own internal collections of songs whose separate recordings were available, by comparing the masked mix with the real parts many times over.</li>
  <li>The app compares the estimates of the two parts, so every frequency at every moment is shared between the vocals and the accompaniment, applies the shares to the mix, and turns the result back into sound.</li>
</ul>
<p>Spleeter's code and trained models are released under the MIT License, so they can be used in any kind of project. The app uses the version converted to the ONNX format by the open-source speech toolkit sherpa-onnx (Apache License 2.0), and serves it from this site.</p>
<p>The app only needs the vocals, so the two-part model is enough: it is light (about ${MODEL_MB} MB) and fast, which matters when it runs on a phone.</p>

<h2 id="chords">2. Beats, tempo, and chords</h2>
<p>A harmony note has to fit the chord at that moment, so the app first finds the chords, from the separated accompaniment, where the voice no longer gets in the way:</p>
<ul>
  <li><b>Beats and tempo</b> – the moments where new sounds start, the interval between them that repeats most (autocorrelation), and the chain of beats that fits both best (dynamic programming, after D. Ellis, 2007). This gives the BPM and one cell per beat.</li>
  <li><b>Chords</b> – for each beat, the strength of each of the 12 notes (a “chroma”) in the accompaniment, compared with the 24 major and minor chords; the low notes, where the bass plays, help find the root. A hidden Markov model keeps the chords from changing on every beat without reason.</li>
  <li><b>Key</b> – the chroma of the whole song compared with the major and minor key profiles of Krumhansl and Kessler, together with how long each possible tonic chord lasts.</li>
</ul>

<h2 id="melody">3. Following the melody</h2>
<p>The pitch of the separated vocals is measured about 40 times a second with the <b>YIN</b> method (de Cheveigné and Kawahara, 2002), which finds how often the waveform repeats itself. The pitch line is then cut into notes where it moves to another semitone; very short notes, such as the slide into a note, are joined to their neighbour.</p>

<h2 id="notes">4. Choosing the harmony notes</h2>
<p>For each melody note, the app takes the note a 3rd (or a 5th) above or below <b>in the key of the song</b>, so the interval is sometimes major and sometimes minor, as a singer would sing it. If that note would clash with the chord at that moment, it moves to the nearest chord tone. Notes closer together than a moment are joined into phrases, so the harmony moves smoothly instead of stopping and starting. See <a href="../harmony/#which">upper or lower, 3rd or 5th</a> for what each part sounds like.</p>

<h2 id="voice">5. Moving the voice to the harmony</h2>
<ul>
  <li><b>TD-PSOLA</b> (time-domain pitch-synchronous overlap-add) cuts the vocals into pieces one cycle of the voice long and lays them down closer together (higher) or further apart (lower). The length does not change, and the voice keeps its words and much of its character.</li>
  <li><b>Pitch correction</b>, like Auto-Tune, then pulls each note onto the exact harmony note: without it, the harmony would copy every slip of the lead singer's pitch.</li>
  <li>The <b>guide tone</b> is a plain synthesized tone on the same notes, steady and exact.</li>
</ul>
<p>A key change uses another method, a <b>phase vocoder</b>, which stretches each part in time by the pitch ratio and plays it back at the original length.</p>

<h2 id="browser">Running it all in your browser</h2>
<ul>
  <li>The browser downloads the model (about ${MODEL_MB} MB) once and keeps it. <b>ONNX Runtime Web</b> runs it, on the graphics chip (GPU) through WebGPU when the browser supports it, otherwise on the processor (CPU).</li>
  <li>The song is processed about ${SPLIT_SEC} seconds at a time, so the memory needed stays small even for a long song. Frequencies up to about ${TOP_KHZ} kHz go through the model (Spleeter's own 16 kHz setting); the very top of the spectrum, where there is mostly cymbal shimmer and air, is kept in the accompaniment.</li>
  <li>The chords, the melody, the harmony, and the key change are plain JavaScript in background threads (Web Workers), so the page stays responsive.</li>
</ul>
<p>Your song is never uploaded. Once everything is made, the four parts play together in sync, and the mixer only changes their volumes.</p>

<h2 id="limits">Why it is not perfect</h2>
<ul>
  <li><b>Separation leaks.</b> Sounds that share frequencies and timing with the voice — a guitar doubling the melody, backing vocals, reverb — can stay in the vocals, and are then moved with the harmony voice.</li>
  <li><b>Chords are estimated</b> as major and minor only; 7ths, tensions, and quick changes can be missed. You can type the right chord.</li>
  <li><b>One key for the whole song</b>: a song that changes key partway is treated as one key.</li>
  <li><b>Backing vocals</b> in the vocal part can confuse the melody: the app follows one line.</li>
</ul>
<p>See <a href="../chords-and-key/#limits">what to expect from the chords</a> and <a href="../harmony/#limits">from the harmony</a>.</p>
`,
  },
  ja: {
    title: "曲のボーカルからハモリを作る仕組み：AI による分離・コード推定・ピッチシフト",
    heading: "ボーカルからハモリを作る仕組み",
    nav: "仕組み",
    description:
      "Vocal Harmony Maker が曲からハモリのパートを作るまで。AI モデル Spleeter によるボーカルの分離、拍とコードの推定、旋律の追跡、キーとコードに合うハモリの音の選び方、歌っている人の声の音程を変える方法。",
    body: () => `
<p class="lead">Vocal Harmony Maker は、ミックスされた曲から 5 つの段階でもう一つの声を作ります。AI を使うのは最初の段階だけで、残りは昔からある信号処理の方法をブラウザの中で動かしています。それぞれが何をしているかを知ると、うまくいく場合と、手を貸したほうがよい場合が分かります。</p>

<nav class="toc" aria-label="目次"><b>目次</b><ol>
  <li><a href="#separate">1. ボーカルを分離する（AI）</a></li>
  <li><a href="#chords">2. 拍・テンポ・コード</a></li>
  <li><a href="#melody">3. 旋律を追う</a></li>
  <li><a href="#notes">4. ハモリの音を選ぶ</a></li>
  <li><a href="#voice">5. 声をハモリの音に動かす</a></li>
  <li><a href="#browser">すべてをブラウザの中で動かす</a></li>
  <li><a href="#limits">完全ではない理由</a></li>
</ol></nav>

<h2 id="separate">1. ボーカルを分離する（AI）</h2>
<p>曲は一度ミックスされると、声と楽器が足し合わされて 1 つの波形（ステレオなら 2 つ）になり、元に戻すスイッチはありません。ステレオの真ん中にある音を消すといった昔の方法では、ベースやバスドラムも消え、声の残響は残りました。AI の分離モデルは、声だけならどう聞こえたはずかを<b>推定</b>します。</p>
<p>このアプリは、音楽配信サービスの Deezer が 2019 年に公開した分離ツール <b>Spleeter</b> の 2 パート版（<b>2stems</b>：ボーカルと伴奏）を使っています。仕組みは次のとおりです。</p>
<ul>
  <li>音を<b>スペクトログラム</b>（各瞬間にどの周波数がどれだけ強いか）に変えます。</li>
  <li>パートごとに、<b>U-Net</b> という形のニューラルネットワーク（絵を縮める 6 層と広げ直す 6 層の、12 層の畳み込みネットワーク）が、ミックスのスペクトログラムから<b>ソフトマスク</b>（各瞬間・各周波数の音のうち、そのパートの分がどれだけか）を推定します。Deezer が、パートごとの録音がある社内の曲のデータで、マスクを掛けたミックスと本物のパートを比べることを何度も繰り返して学習させたものです。</li>
  <li>アプリは 2 つのパートの推定を比べて、各瞬間・各周波数の音をボーカルと伴奏に分け合い、ミックスに掛けて音に戻します。</li>
</ul>
<p>Spleeter のコードと学習済みモデルは MIT ライセンスで公開されていて、用途を問わず使えます。このアプリは、オープンソースの音声ツールキット sherpa-onnx（Apache License 2.0）が ONNX 形式に変換したものを、このサイトから配信しています。</p>
<p>このアプリに必要なのはボーカルだけなので、2 パートのモデルで足ります。軽く（約 ${MODEL_MB} MB）速いので、スマホで動かすときにも助かります。</p>

<h2 id="chords">2. 拍・テンポ・コード</h2>
<p>ハモリの音はその瞬間のコードに合っている必要があるので、まずコードを推定します。声がじゃまをしない、分離した伴奏を使います。</p>
<ul>
  <li><b>拍とテンポ</b> – 新しい音が鳴り始める位置と、その間隔でいちばん繰り返されるもの（自己相関）を調べ、両方にいちばん合う拍の並びを決めます（動的計画法。D. Ellis、2007 年の方法）。これで BPM と、1 拍ごとのマスが決まります。</li>
  <li><b>コード</b> – 拍ごとに、伴奏で 12 の音それぞれがどれだけ鳴っているか（クロマ）を調べ、24 のメジャー・マイナーのコードと比べます。ベースが鳴る低い音域は、根音を見つける手がかりにします。隠れマルコフモデルで、理由なく 1 拍ごとにコードが変わらないようにします。</li>
  <li><b>キー</b> – 曲全体のクロマを Krumhansl と Kessler の長調・短調のプロファイルと比べ、主和音になりうるコードがどれだけ長く鳴っているかも合わせて決めます。</li>
</ul>

<h2 id="melody">3. 旋律を追う</h2>
<p>分離したボーカルの音程を、1 秒に約 40 回、<b>YIN</b> という方法（de Cheveigné・Kawahara、2002 年）で測ります。波形が何秒ごとに繰り返しているかを調べる方法です。音程の線は、別の半音に移ったところで音符に区切ります。音に入るときのしゃくりのような、とても短い音符は隣の音符にまとめます。</p>

<h2 id="notes">4. ハモリの音を選ぶ</h2>
<p>旋律の音符ごとに、<b>曲のキーの中で</b> 3 度（または 5 度）上か下の音を取ります。そのため音程は長 3 度のときも短 3 度のときもあり、人がハモるときと同じになります。その音がその瞬間のコードとぶつかるときは、いちばん近いコードの音に移します。間の短い音符どうしは 1 つのフレーズにつなぐので、ハモリが途切れずになめらかに動きます。パートごとの聞こえ方は<a href="../harmony/#which">上ハモか下ハモか、3 度か 5 度か</a>をご覧ください。</p>

<h2 id="voice">5. 声をハモリの音に動かす</h2>
<ul>
  <li><b>TD-PSOLA</b>（時間領域のピッチ同期波形重畳加算）で、ボーカルを声の 1 周期ずつの断片に切り、間隔を詰めて（高く）または広げて（低く）並べ直します。長さは変わらず、歌詞と声の感じがかなり残ります。</li>
  <li>続けて<b>音程補正</b>（Auto-Tune のような処理）で、各音を正確なハモリの音に寄せます。これがないと、主旋律の歌い手の音程のずれまでハモリがまねてしまいます。</li>
  <li><b>ガイド音</b>は同じ音を単純な合成音で鳴らすもので、安定して正確です。</li>
</ul>
<p>キーの変更には別の方法の<b>フェーズボコーダー</b>を使い、各パートを音程の比率だけ時間方向に伸ばして、元の長さで再生し直します。</p>

<h2 id="browser">すべてをブラウザの中で動かす</h2>
<ul>
  <li>ブラウザがモデル（約 ${MODEL_MB} MB）を一度だけダウンロードして保存します。モデルは <b>ONNX Runtime Web</b> が動かします。ブラウザが WebGPU に対応していればグラフィックスのチップ（GPU）、そうでなければプロセッサー（CPU）で動きます。</li>
  <li>曲は約 ${SPLIT_SEC} 秒ずつ処理するので、長い曲でも必要なメモリは小さく済みます。モデルに通すのは約 ${TOP_KHZ} kHz までの周波数（Spleeter 本家の 16 kHz の設定）で、それより上（主にシンバルの響きや空気感）は伴奏に残します。</li>
  <li>コード・旋律・ハモリ・キーの変更は、裏で動くスレッド（Web Worker）の JavaScript で計算するので、処理中も画面は止まりません。</li>
</ul>
<p>曲はアップロードしません。すべてできあがると 4 つのパートをそろえて再生し、ミキサーは音量だけを変えます。</p>

<h2 id="limits">完全ではない理由</h2>
<ul>
  <li><b>分離では音が混ざります。</b>主旋律をなぞるギター、コーラス、残響など、声と周波数やタイミングが重なる音はボーカルに残り、ハモリの声と一緒に動きます。</li>
  <li><b>コードは推定です。</b>推定するのはメジャー・マイナーだけで、7th・テンション・速いコードチェンジは外れることがあります。正しいコードを入力できます。</li>
  <li><b>キーは曲全体で 1 つ</b>として扱うので、途中で転調する曲はずれることがあります。</li>
  <li><b>ボーカルにコーラスが入っている</b>と、旋律の追跡が迷うことがあります。アプリが追うのは 1 本の線です。</li>
</ul>
<p><a href="../chords-and-key/#limits">コードの仕上がり</a>と<a href="../harmony/#limits">ハモリの仕上がり</a>もご覧ください。</p>
`,
  },
};
