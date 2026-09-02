// Dev-only: renders the shader output to /tmp/seal-preview.png for visual checks.
// node --experimental-strip-types scripts/preview-seal.ts [color] [finish] [mode] [depth] [light]
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';
import {
  shade, decodeBlank, boxBlur, circularMask, bevelDepthToRelief, hexToRgb01,
  MATERIALS, LIGHT_PRESETS, DEFAULT_AO_STRENGTH, DEFAULT_NORMAL_STRENGTH,
} from '../src/utils/reliefShader.ts';

// Minimal PNG decoder (8-bit RGBA / RGB / gray, non-interlaced, filters 0-4)
function decodePng(buf: Buffer) {
  let p = 8; const idat: Buffer[] = []; let w = 0, h = 0, ct = 0;
  while (p < buf.length) {
    const len = buf.readUInt32BE(p); const type = buf.toString('ascii', p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; }
    if (type === 'IDAT') idat.push(data);
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : 1;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * bpp; const out = new Uint8Array(w * h * 4); const prev = new Uint8Array(stride); const cur = new Uint8Array(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)]; const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0; let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c; const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (bpp === 4) { out[o] = cur[x * 4]; out[o + 1] = cur[x * 4 + 1]; out[o + 2] = cur[x * 4 + 2]; out[o + 3] = cur[x * 4 + 3]; }
      else if (bpp === 3) { out[o] = cur[x * 3]; out[o + 1] = cur[x * 3 + 1]; out[o + 2] = cur[x * 3 + 2]; out[o + 3] = 255; }
      else { out[o] = out[o + 1] = out[o + 2] = cur[x]; out[o + 3] = 255; }
    }
    prev.set(cur);
  }
  return { width: w, height: h, data: out };
}
const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
function crc32(b: Uint8Array) { let c = 0xffffffff; for (const v of b) c = CRC[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(t: string, d: Uint8Array) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const tb = Buffer.from(t); const cb = Buffer.alloc(4); cb.writeUInt32BE(crc32(Buffer.concat([tb, d]))); return Buffer.concat([l, tb, d, cb]); }
function encodePng(w: number, h: number, rgba: Uint8Array) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const [color = '#991b1b', finish = 'MATTE', mode = 'EMBOSS', depthS = '5', lightId = 'TOP_LEFT', sigilPath = ''] = process.argv.slice(2);
const albedo = decodePng(readFileSync('src/assets/seals/round/albedo.png'));
const heightImg = decodePng(readFileSync('src/assets/seals/round/height.png'));
const blank = decodeBlank(albedo, heightImg);
const W = blank.width, H = blank.height;
const floorR = 0.27 * W;
const floorMask = circularMask(W, H, W / 2, H / 2, floorR - 4, 8);

// Test sigil: either a PNG's alpha, or a synthetic ring + cross monogram.
const sigil = new Float32Array(W * H);
if (sigilPath) {
  const s = decodePng(readFileSync(sigilPath));
  // fit into floor at 0.9 * diameter, nearest-neighbour
  const target = floorR * 2 * 0.9; const scale = Math.max(s.width, s.height) / target;
  const ox = W / 2 - (s.width / scale) / 2, oy = H / 2 - (s.height / scale) / 2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const sx = Math.floor((x - ox) * scale), sy = Math.floor((y - oy) * scale);
    if (sx >= 0 && sy >= 0 && sx < s.width && sy < s.height) sigil[y * W + x] = s.data[(sy * s.width + sx) * 4 + 3] / 255;
  }
} else {
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - W / 2, y - H / 2);
    const ring = d > floorR * 0.72 && d < floorR * 0.82;
    const ring2 = d > floorR * 0.58 && d < floorR * 0.62;
    const bar = Math.abs(x - W / 2) < 10 && Math.abs(y - H / 2) < floorR * 0.45;
    const bar2 = Math.abs(y - H / 2) < 10 && Math.abs(x - W / 2) < floorR * 0.45;
    const dots = [[0.35, 0.35], [-0.35, 0.35], [0.35, -0.35], [-0.35, -0.35]].some(([a, b]) => Math.hypot(x - W / 2 - a * floorR, y - H / 2 - b * floorR) < 14);
    sigil[y * W + x] = ring || ring2 || bar || bar2 || dots ? 1 : 0;
  }
}
const depth = Number(depthS);
const { blurRadius, reliefGain } = bevelDepthToRelief(depth, mode as 'EMBOSS' | 'DEBOSS');
const sigilBlur = boxBlur(sigil, W, H, blurRadius, 2);
const t0 = performance.now();
const img = shade({
  blank, sigilHeight: sigilBlur, floorMask, reliefGain, normalStrength: DEFAULT_NORMAL_STRENGTH,
  waxColor: hexToRgb01(color), light: LIGHT_PRESETS[lightId as keyof typeof LIGHT_PRESETS], material: MATERIALS[finish as 'MATTE' | 'METALLIC'], aoStrength: DEFAULT_AO_STRENGTH,
});
console.log(`shade() took ${(performance.now() - t0).toFixed(1)} ms`);
// Composite over parchment-ish background for viewing
const out = new Uint8Array(W * H * 4);
for (let i = 0; i < W * H; i++) { const a = img.data[i * 4 + 3] / 255; const bg = [222, 205, 170]; for (let c = 0; c < 3; c++) out[i * 4 + c] = img.data[i * 4 + c] * a + bg[c] * (1 - a); out[i * 4 + 3] = 255; }
const outPath = process.env.OUT ?? '/tmp/seal-preview.png';
writeFileSync(outPath, encodePng(W, H, out));
console.log('wrote', outPath);
