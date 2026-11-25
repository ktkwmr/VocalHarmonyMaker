// Signal processing shared by the workers: an FFT, and the STFT / mask / inverse STFT around the
// Spleeter 2stems model (separator.js).
//
// The Spleeter steps follow sherpa-onnx (Apache-2.0), offline-source-separation-spleeter-impl.h, with the
// STFT of kaldi-native-fbank (Apache-2.0) as configured there:
//   44.1 kHz, n_fft 4096, hop 1024, periodic Hann window, center = false
//   model input: the magnitude of the low bins, float32 [2 (channels), splits, 512 (frames), bins]
//   model output (vocals.onnx / accompaniment.onnx): an estimated magnitude of the same shape
//   mask = est² / (vocals² + accompaniment² + 1e-10) (+ 1e-10 / 2 on top), multiplied with the complex STFT
//   inverse STFT: overlap-add of window × frame, divided by the summed squared window
// Differences from sherpa-onnx, on purpose:
//   - The song is processed one split (512 frames, about 11.9 s) at a time, so memory stays small on a
//     phone. Each split is independent in the model, so the result is the same.
//   - 3072 zeros are put before the song, so its first samples are covered by 4 frames like every other
//     sample (sherpa-onnx's first and last 3072 samples are covered by fewer frames).
//   - 1536 bins (up to 16 kHz) go through the model, not 1024 (11 kHz): Spleeter's own 2stems-16kHz
//     configuration, which runs the same trained weights on a wider input (the network has no fixed size along
//     the frequency axis; scripts/fetch-model.mjs frees that axis in the ONNX files). With 1024 bins the "s"
//     sounds and breath of the singer above 11 kHz stayed in the accompaniment as a scratchy noise.
//   - Bins above that (16 kHz and up) are not passed through the model. sherpa-onnx sets their mask to 0
//     for both stems, so cymbals and air disappear from the accompaniment; here they go to the
//     accompaniment (mask 1) and not to the vocals (mask 0).
//   - Left and right go through one complex FFT (left = real part, right = imaginary part).

export function makeFft(n) {
  const bits = Math.round(Math.log2(n));
  const rev = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    let r = 0;
    for (let b = 0, x = i; b < bits; b++, x >>= 1) r = (r << 1) | (x & 1);
    rev[i] = r;
  }
  const cos = new Float64Array(n / 2), sin = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) { cos[i] = Math.cos((2 * Math.PI * i) / n); sin[i] = Math.sin((2 * Math.PI * i) / n); }
  // Forward transform in place (e^-i). The inverse: conjugate, transform, conjugate, divide by n.
  return function (re, im) {
    for (let i = 0; i < n; i++) {
      const j = rev[i];
      if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let size = 2; size <= n; size <<= 1) {
      const half = size >> 1, step = n / size;
      for (let i = 0; i < n; i += size) {
        for (let j = i, k = 0; j < i + half; j++, k += step) {
          const l = j + half;
          const tr = re[l] * cos[k] + im[l] * sin[k];
          const ti = im[l] * cos[k] - re[l] * sin[k];
          re[l] = re[j] - tr; im[l] = im[j] - ti;
          re[j] += tr; im[j] += ti;
        }
      }
    }
  };
}

// bins: 1536 (16 kHz), Spleeter's 2stems-16kHz (a multiple of 64, as the 6 down-sampling layers of the network need)
export const SPLEETER = { rate: 44100, nFft: 4096, hop: 1024, bins: 1536, frames: 512 };
const PAD = SPLEETER.nFft - SPLEETER.hop; // 3072 zeros before the song

// Number of 512-frame splits for a song of n samples
export function splitCount(n) {
  const frames = Math.floor((n - 1 + PAD) / SPLEETER.hop) + 1;
  return Math.max(1, Math.ceil(frames / SPLEETER.frames));
}

// left, right: Float32Array (44.1 kHz). Returns an object that runs the song split by split:
//   input(s)  → Float32Array [2, 1, 512, bins]: the magnitudes of split s (the model's input)
//   output(s, vocals, accompaniment, outV, outA) → applies the masks from the two model outputs
//     ([2, 1, 512, bins] each) and writes the finished samples into outV / outA ([Int16Array L, R])
// input(s) must be followed by output(s) before input(s + 1).
export function createSpleeter(left, right) {
  const { nFft: N, hop: H, bins: F, frames: T } = SPLEETER;
  const n = left.length;
  const B = N / 2 + 1;
  const fft = makeFft(N);
  const win = new Float64Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N);
  // Sum of the squared windows of the 4 frames that cover a sample (1.5 for a periodic Hann window at hop N / 4)
  const sumSq = new Float64Array(H);
  for (let i = 0; i < H; i++) { let s = 0; for (let k = 0; k < N / H; k++) s += win[i + k * H] * win[i + k * H]; sumSq[i] = s; }

  const re = new Float64Array(N), im = new Float64Array(N);
  // The complex spectra of the split's frames (left and right), kept for the masks
  const specL = { re: new Float32Array(T * B), im: new Float32Array(T * B) };
  const specR = { re: new Float32Array(T * B), im: new Float32Array(T * B) };
  const mag = new Float32Array(2 * T * F);
  // Overlap-add buffers (padded positions [base, base + T·H + N)) for vocals / accompaniment, left / right
  const OLA = T * H + N;
  const ola = [0, 1, 2, 3].map(() => new Float64Array(OLA));

  const sample = (x, j) => (j >= 0 && j < n ? x[j] : 0);

  function input(s) {
    const f0 = s * T;
    for (let t = 0; t < T; t++) {
      const start = (f0 + t) * H - PAD; // position in the song of the frame's first sample
      for (let i = 0; i < N; i++) {
        re[i] = sample(left, start + i) * win[i];
        im[i] = sample(right, start + i) * win[i];
      }
      fft(re, im);
      const o = t * B;
      for (let k = 0; k < B; k++) {
        const nk = (N - k) & (N - 1);
        const lr = (re[k] + re[nk]) / 2, li = (im[k] - im[nk]) / 2;
        const rr = (im[k] + im[nk]) / 2, ri = (re[nk] - re[k]) / 2;
        specL.re[o + k] = lr; specL.im[o + k] = li;
        specR.re[o + k] = rr; specR.im[o + k] = ri;
        if (k < F) {
          mag[t * F + k] = Math.sqrt(lr * lr + li * li);
          mag[T * F + t * F + k] = Math.sqrt(rr * rr + ri * ri);
        }
      }
    }
    return mag;
  }

  const toInt16 = (x) => {
    const v = x < -1 ? -1 : x > 1 ? 1 : x;
    return v < 0 ? Math.round(v * 32768) : Math.round(v * 32767);
  };

  function output(s, vocals, accompaniment, outV, outA) {
    const f0 = s * T;
    for (let t = 0; t < T; t++) {
      // Masked spectra: Z = Y_left + i·Y_right, so one inverse FFT gives both channels
      // (vocals first, then the accompaniment)
      for (let stem = 0; stem < 2; stem++) {
        re.fill(0); im.fill(0);
        const o = t * B;
        for (let k = 0; k < B; k++) {
          let mL, mR;
          if (k < F) {
            const iL = t * F + k, iR = T * F + t * F + k;
            const vL = vocals[iL], aL = accompaniment[iL], vR = vocals[iR], aR = accompaniment[iR];
            const sL = vL * vL + aL * aL + 1e-10, sR = vR * vR + aR * aR + 1e-10;
            mL = ((stem === 0 ? vL * vL : aL * aL) + 5e-11) / sL;
            mR = ((stem === 0 ? vR * vR : aR * aR) + 5e-11) / sR;
          } else {
            mL = mR = stem === 0 ? 0 : 1;
          }
          const ylr = specL.re[o + k] * mL, yli = k === 0 || k === N / 2 ? 0 : specL.im[o + k] * mL;
          const yrr = specR.re[o + k] * mR, yri = k === 0 || k === N / 2 ? 0 : specR.im[o + k] * mR;
          // Conjugated Z for the inverse transform through the forward FFT
          re[k] = ylr - yri; im[k] = -(yli + yrr);
          if (k !== 0 && k !== N / 2) { re[N - k] = ylr + yri; im[N - k] = yli - yrr; }
        }
        fft(re, im);
        const bufL = ola[stem * 2], bufR = ola[stem * 2 + 1];
        const at = t * H;
        for (let i = 0; i < N; i++) {
          bufL[at + i] += (re[i] / N) * win[i];
          bufR[at + i] -= (im[i] / N) * win[i];
        }
      }
    }
    // Padded positions before (f0 + T)·H are final: write them out (song position = padded − PAD)
    const base = f0 * H;
    for (let stem = 0; stem < 2; stem++) {
      const out = stem === 0 ? outV : outA;
      for (let c = 0; c < 2; c++) {
        const buf = ola[stem * 2 + c], dst = out[c];
        for (let i = 0; i < T * H; i++) {
          const j = base + i - PAD;
          if (j >= 0 && j < n) {
            // Every song sample is covered by 4 frames, so the squared windows add up to sumSq (1.5)
            dst[j] = toInt16(buf[i] / sumSq[(base + i) % H]);
          }
        }
        // Keep the part that the next split's first frames add to
        buf.copyWithin(0, T * H, OLA);
        buf.fill(0, OLA - T * H);
      }
    }
  }

  return { splits: splitCount(n), input, output };
}
