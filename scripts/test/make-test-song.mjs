// Test audio made up for the tests (no copyrighted material): the song of scripts/guide-song.mjs (Am F C G at
// 120 BPM, a melody in A minor from bar 5), 32 s, as a stereo 16-bit WAV.
//   song.wav  the whole song (what the app opens)
// Usage: node scripts/test/make-test-song.mjs <out dir> [seconds]
import { writeFileSync } from "node:fs";
import { SR, makeParts, mixParts } from "../guide-song.mjs";
const out = process.argv[2] || ".";
const sec = Number(process.argv[3]) || 32;
const [L, R] = mixParts(makeParts(SR * sec));
const n = L.length, b = Buffer.alloc(44 + n * 4);
b.write("RIFF", 0); b.writeUInt32LE(36 + n * 4, 4); b.write("WAVE", 8); b.write("fmt ", 12);
b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(SR, 24);
b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 4, 40);
const s16 = (x) => Math.round(Math.max(-1, Math.min(1, x)) * 32767);
for (let i = 0; i < n; i++) { b.writeInt16LE(s16(L[i]), 44 + i * 4); b.writeInt16LE(s16(R[i]), 46 + i * 4); }
writeFileSync(out + "/song.wav", b);
console.log("wrote " + out + "/song.wav (" + sec + " s)");
