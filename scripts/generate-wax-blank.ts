// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Wax Blank Generator
// Renders the first-pass procedural wax blank used by the relief shader:
//   src/assets/seals/<id>/albedo.png  (neutral gray + grain, alpha = coverage)
//   src/assets/seals/<id>/height.png  (grayscale height: rim ≈ 1, floor ≈ 0.45)
//
// Run:  node --experimental-strip-types scripts/generate-wax-blank.ts [id] [seed]
// Dependency-free (PNG encoder uses node:zlib). Not part of the app bundle.
// Asset contract: see src/assets/seals/README.md
// ─────────────────────────────────────────────────────────────────────────────

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SIZE = 512;
const FLOOR_HEIGHT = 0.45;
const FLOOR_RADIUS_FRAC = 0.27; // must match sealBlanks.ts floor.r

// ── Deterministic PRNG & noise ────────────────────────────────────────────────

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeValueNoise(rand: () => number, gridSize: number) {
  const g = new Float32Array(gridSize * gridSize);
  for (let i = 0; i < g.length; i++) g[i] = rand();
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = smooth(x - xi), fy = smooth(y - yi);
    const at = (ix: number, iy: number) => g[((iy % gridSize) + gridSize) % gridSize * gridSize + (((ix % gridSize) + gridSize) % gridSize)];
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  };
}

function fbm(noise: (x: number, y: number) => number, x: number, y: number, octaves: number) {
  let v = 0, amp = 0.5, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    v += noise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return v / norm;
}

// ── Shape ─────────────────────────────────────────────────────────────────────

interface Lobe { angle: number; amp: number; sigma: number; }

function buildShape(seed: number) {
  const rand = mulberry32(seed);
  const lobeCount = 4 + Math.floor(rand() * 3); // 4..6
  const lobes: Lobe[] = [];
  for (let i = 0; i < lobeCount; i++) {
    lobes.push({
      angle: (i / lobeCount) * Math.PI * 2 + (rand() - 0.5) * 0.8,
      amp: 18 + rand() * 26,          // px of extra radius
      sigma: 0.16 + rand() * 0.16,     // radians
    });
  }
  const wobbleA = [rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2];
  return { lobes, wobbleA, rand };
}

function angDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/** Separable box blur (2 passes), edge-clamped. */
function blur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const clampI = (i: number, n: number) => (i < 0 ? 0 : i >= n ? n - 1 : i);
  const cur = new Float32Array(src);
  const tmp = new Float32Array(src.length);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let k = -r; k <= r; k++) acc += cur[y * w + clampI(x + k, w)];
      tmp[y * w + x] = acc / (2 * r + 1);
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let k = -r; k <= r; k++) acc += tmp[clampI(y + k, h) * w + x];
      cur[y * w + x] = acc / (2 * r + 1);
    }
  }
  return cur;
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// ── Render ────────────────────────────────────────────────────────────────────

function render(seed: number) {
  const { lobes, wobbleA, rand } = buildShape(seed);
  const grainNoise = makeValueNoise(rand, 64);
  const surfNoise = makeValueNoise(rand, 32);

  const cx = SIZE / 2, cy = SIZE / 2;
  const R0 = SIZE * 0.39; // base radius ≈ 200px
  const n = SIZE * SIZE;
  const height = new Float32Array(n);
  const albedo = new Float32Array(n);
  const alpha = new Float32Array(n);
  const tField = new Float32Array(n);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const dist = Math.hypot(dx, dy);
      const th = Math.atan2(dy, dx);

      // Edge radius as a function of angle: low-frequency wobble + drip lobes.
      const wobble =
        Math.sin(th * 3 + wobbleA[0]) * 0.025 +
        Math.sin(th * 5 + wobbleA[1]) * 0.018 +
        Math.sin(th * 8 + wobbleA[2]) * 0.01;
      let lobeSum = 0, lobeStrength = 0;
      for (const L of lobes) {
        const d = angDiff(th, L.angle) / L.sigma;
        const g = Math.exp(-d * d);
        lobeSum += L.amp * g;
        lobeStrength = Math.max(lobeStrength, g);
      }
      const Rtheta = R0 * (1 + wobble) + lobeSum;
      const t = dist / Rtheta; // 0 centre → 1 edge

      // Rim geometry in normalised radius. Lobes flatten & widen the rim
      // (squeezed-out wax is thinner than the pressed ring).
      const rimPeakT = 0.845;
      const rimHeight = 1 - 0.32 * lobeStrength;

      let h: number;
      if (t >= 1) {
        h = 0;
      } else {
        // Normalised floor edge relative to this angle's radius
        const fe = (FLOOR_RADIUS_FRAC * SIZE) / Rtheta; // floor radius in t units
        const wallEnd = fe + 0.10;                        // inner wall (~20px)
        const crestStart = Math.max(wallEnd, rimPeakT - 0.05);
        if (t < fe) {
          h = FLOOR_HEIGHT;
        } else if (t < wallEnd) {
          h = FLOOR_HEIGHT + (rimHeight - 0.06 - FLOOR_HEIGHT) * smoothstep(fe, wallEnd, t);
        } else if (t < crestStart) {
          h = rimHeight - 0.06 + 0.06 * smoothstep(wallEnd, crestStart, t);
        } else if (t < rimPeakT + 0.03) {
          // rounded crest
          const u = (t - rimPeakT) / 0.03;
          h = rimHeight - 0.04 * u * u;
        } else {
          // outer fall-off: quarter-ellipse profile → soft rounded edge
          const u = (t - (rimPeakT + 0.03)) / (1 - (rimPeakT + 0.03));
          h = (rimHeight - 0.04) * Math.sqrt(Math.max(0, 1 - u * u));
        }
      }

      // Coverage with ~1.5px antialiasing at the edge
      const edgePx = (1 - t) * Rtheta;
      const a = t >= 1 ? 0 : Math.min(1, Math.max(0, edgePx / 1.5));

      const i = y * SIZE + x;
      height[i] = h;
      alpha[i] = a;
      tField[i] = t;
    }
  }

  // Soften profile transitions (removes ridge lines at piecewise joins)
  const smoothed = blur(height, SIZE, SIZE, 3);

  // Surface unevenness (large-scale) + fine grain (small-scale), albedo grain
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = y * SIZE + x;
      const sx = x / SIZE, sy = y / SIZE;
      const t = tField[i];
      const uneven = (fbm(surfNoise, sx * 6, sy * 6, 3) - 0.5) * 0.06;
      const grain = (fbm(grainNoise, sx * 40, sy * 40, 4) - 0.5) * 0.02;
      let h = smoothed[i];
      if (alpha[i] > 0) h = Math.min(1, Math.max(0.02, h + uneven * (t < 0.8 ? 0.5 : 1) + grain));
      height[i] = alpha[i] > 0 ? h : 0;

      const albGrain = (fbm(grainNoise, sx * 55 + 3.1, sy * 55 + 7.7, 4) - 0.5) * 0.08;
      albedo[i] = Math.min(1, Math.max(0, 0.5 + albGrain));
    }
  }
  return { height, albedo, alpha };
}

// ── PNG encoder ───────────────────────────────────────────────────────────────

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Uint8Array) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width: number, height: number, rgba: Uint8Array) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.subarray(y * width * 4, (y + 1) * width * 4).forEach((v, i) => {
      raw[y * (width * 4 + 1) + 1 + i] = v;
    });
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const id = process.argv[2] ?? 'round';
const seed = Number(process.argv[3] ?? 7);
const { height, albedo, alpha } = render(seed);

const n = SIZE * SIZE;
const albedoRgba = new Uint8Array(n * 4);
const heightRgba = new Uint8Array(n * 4);
for (let i = 0; i < n; i++) {
  const g = Math.round(albedo[i] * 255);
  albedoRgba[i * 4] = g; albedoRgba[i * 4 + 1] = g; albedoRgba[i * 4 + 2] = g;
  albedoRgba[i * 4 + 3] = Math.round(alpha[i] * 255);
  const hv = Math.round(height[i] * 255);
  heightRgba[i * 4] = hv; heightRgba[i * 4 + 1] = hv; heightRgba[i * 4 + 2] = hv;
  heightRgba[i * 4 + 3] = 255;
}

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'src', 'assets', 'seals', id);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'albedo.png'), encodePng(SIZE, SIZE, albedoRgba));
writeFileSync(join(outDir, 'height.png'), encodePng(SIZE, SIZE, heightRgba));
console.log(`Wrote ${outDir}/albedo.png and height.png (seed ${seed})`);
