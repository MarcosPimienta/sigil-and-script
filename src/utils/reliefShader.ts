// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Relief Shader
// Height-map → normal-map → directional lighting, on plain Float32Array
// buffers. No DOM dependencies: every function here is unit-testable in Node.
//
// Pipeline (see openspec/changes/physically-shaded-wax-seal/design.md):
//   H      = H_base + floorMask · gain · H_sigil
//   N      = normalize(-dH/dx · s, -dH/dy · s, 1)
//   light  = ambient + kd · max(0, N·L) + ks · max(0, N·Hv)^p
//   ao     = clamp(1 - a · (blur(H) - H), aoFloor, 1)
//   rgb    = waxColor · light · ao · albedo / 0.5   (+ white specular)
//   alpha  = blank alpha
// ─────────────────────────────────────────────────────────────────────────────

/** Minimal image-like shape so the module works with ImageData or a plain object. */
export interface RgbaImageLike {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array | number[];
}

export interface BlankBuffers {
  width: number;
  height: number;
  /** Neutral-gray albedo, 0..1 (mean ≈ 0.5). */
  albedo: Float32Array;
  /** Height field, 0..1 (rim ≈ 1, floor ≈ 0.45, outside = 0). */
  heightMap: Float32Array;
  /** Coverage mask, 0..1. */
  alpha: Float32Array;
}

export interface LightParams {
  /** 0° = light from the right, 90° = from the top (screen-space, y up). */
  azimuthDeg: number;
  /** Elevation above the surface plane; 90° = straight down. */
  elevationDeg: number;
}

export interface MaterialParams {
  ambient: number;
  kd: number;
  ks: number;
  shininess: number;
}

export interface RenderParams {
  blank: BlankBuffers;
  /** Blurred / inverted sigil height, same size as blank, or null for a plain blank. */
  sigilHeight: Float32Array | null;
  /** 0..1 soft disc confining the sigil to the pressed floor. */
  floorMask: Float32Array;
  reliefGain: number;
  normalStrength: number;
  /** Linear RGB, 0..1. */
  waxColor: [number, number, number];
  light: LightParams;
  material: MaterialParams;
  aoStrength: number;
}

export type ReliefMode = 'EMBOSS' | 'DEBOSS';
export type LightPresetId = 'TOP_LEFT' | 'TOP' | 'TOP_RIGHT';

// ── Constants ──────────────────────────────────────────────────────────────────

export const MATERIALS: Record<'MATTE' | 'METALLIC', MaterialParams> = {
  MATTE: { ambient: 0.22, kd: 1.0, ks: 0.12, shininess: 8 },
  METALLIC: { ambient: 0.2, kd: 0.85, ks: 0.55, shininess: 48 },
};

export const LIGHT_PRESETS: Record<LightPresetId, LightParams> = {
  TOP_LEFT: { azimuthDeg: 135, elevationDeg: 55 },
  TOP: { azimuthDeg: 90, elevationDeg: 55 },
  TOP_RIGHT: { azimuthDeg: 45, elevationDeg: 55 },
};

/** Default AO darkening amount (multiplied by blur(H) − H). */
export const DEFAULT_AO_STRENGTH = 3.5;
/** Lowest AO factor — keeps recessed floors readable. */
export const AO_FLOOR = 0.6;
/** Default Sobel-to-normal scale. */
export const DEFAULT_NORMAL_STRENGTH = 6.0;

/**
 * Maps the host-facing "Bevel & Emboss Depth" slider (1..10) to the two
 * physical quantities it controls. `blurRadius` is in pixels at 512px and is
 * scaled by the caller for other sizes.
 */
export function bevelDepthToRelief(
  bevelDepth: number,
  mode: ReliefMode = 'EMBOSS',
): { blurRadius: number; reliefGain: number } {
  const d = Math.min(10, Math.max(1, bevelDepth));
  const gain = 0.35 + d * 0.05;
  return {
    blurRadius: 1 + d * 0.6,
    reliefGain: mode === 'DEBOSS' ? -gain : gain,
  };
}

// ── Height extraction ─────────────────────────────────────────────────────────

/**
 * Converts an RGBA raster into a 0..1 height field using its alpha channel.
 * If the alpha channel is fully opaque (JPEG, flattened PNG) the height falls
 * back to inverted luminance (dark = raised) so photos and scans still work.
 * Returns the buffer and which channel was used.
 */
export function alphaToHeight(img: RgbaImageLike): { height: Float32Array; source: 'alpha' | 'luminance' } {
  const n = img.width * img.height;
  const out = new Float32Array(n);
  const d = img.data;
  let minA = 255;
  for (let i = 0; i < n; i++) {
    const a = d[i * 4 + 3];
    if (a < minA) minA = a;
  }
  if (minA < 250) {
    for (let i = 0; i < n; i++) out[i] = d[i * 4 + 3] / 255;
    return { height: out, source: 'alpha' };
  }
  for (let i = 0; i < n; i++) {
    const r = d[i * 4];
    const g = d[i * 4 + 1];
    const b = d[i * 4 + 2];
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    out[i] = 1 - lum;
  }
  return { height: out, source: 'luminance' };
}

// ── Blur ──────────────────────────────────────────────────────────────────────

/**
 * Separable box blur with edge clamping. `passes` ≥ 2 approximates a Gaussian.
 * Radius 0 returns a copy of the input.
 */
export function boxBlur(src: Float32Array, w: number, h: number, radius: number, passes = 2): Float32Array {
  const r = Math.max(0, Math.round(radius));
  const cur = new Float32Array(src);
  if (r === 0) return cur;
  const tmp = new Float32Array(src.length);
  const win = 2 * r + 1;

  for (let p = 0; p < passes; p++) {
    // Horizontal
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let acc = 0;
      for (let k = -r; k <= r; k++) acc += cur[row + clampIdx(k, w)];
      for (let x = 0; x < w; x++) {
        tmp[row + x] = acc / win;
        const outIdx = clampIdx(x - r, w);
        const inIdx = clampIdx(x + r + 1, w);
        acc += cur[row + inIdx] - cur[row + outIdx];
      }
    }
    // Vertical
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let k = -r; k <= r; k++) acc += tmp[clampIdx(k, h) * w + x];
      for (let y = 0; y < h; y++) {
        cur[y * w + x] = acc / win;
        const outIdx = clampIdx(y - r, h);
        const inIdx = clampIdx(y + r + 1, h);
        acc += tmp[inIdx * w + x] - tmp[outIdx * w + x];
      }
    }
    // cur now holds the blurred result; tmp is reused as scratch next pass
  }
  return cur;
}

function clampIdx(i: number, n: number): number {
  return i < 0 ? 0 : i >= n ? n - 1 : i;
}

// ── Masks & composition ───────────────────────────────────────────────────────

/** Soft-edged disc, 1 inside radius `r`, fading to 0 over `feather` pixels. */
export function circularMask(w: number, h: number, cx: number, cy: number, r: number, feather: number): Float32Array {
  const out = new Float32Array(w * h);
  const f = Math.max(0.0001, feather);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let v = (r - dist) / f + 0.5;
      v = v < 0 ? 0 : v > 1 ? 1 : v;
      out[y * w + x] = v;
    }
  }
  return out;
}

/**
 * H = base + floorMask · gain · sigil, clamped to 0..1.
 * EMBOSS uses a positive gain (covered pixels rise above the floor);
 * DEBOSS uses a negative gain (covered pixels sink below it). Uncovered floor
 * is untouched in both modes, so no ring appears at the floor-mask edge.
 */
export function composeHeight(
  base: Float32Array,
  sigil: Float32Array | null,
  floorMask: Float32Array,
  gain: number,
): Float32Array {
  const out = new Float32Array(base.length);
  if (!sigil) {
    out.set(base);
    return out;
  }
  for (let i = 0; i < base.length; i++) {
    const v = base[i] + floorMask[i] * gain * sigil[i];
    out[i] = v < 0 ? 0 : v > 1 ? 1 : v;
  }
  return out;
}

// ── Normals ───────────────────────────────────────────────────────────────────

/**
 * 3×3 Sobel gradient → unit normal per pixel, interleaved xyz.
 * y axis follows image rows (down), so a surface rising toward the top of the
 * image gets a negative ny.
 */
export function computeNormals(hField: Float32Array, w: number, h: number, strength: number): Float32Array {
  const out = new Float32Array(w * h * 3);
  for (let y = 0; y < h; y++) {
    const yu = (y > 0 ? y - 1 : 0) * w;
    const yc = y * w;
    const yd = (y < h - 1 ? y + 1 : h - 1) * w;
    for (let x = 0; x < w; x++) {
      const xl = x > 0 ? x - 1 : 0;
      const xr = x < w - 1 ? x + 1 : w - 1;
      const tl = hField[yu + xl], t = hField[yu + x], tr = hField[yu + xr];
      const l = hField[yc + xl], r = hField[yc + xr];
      const bl = hField[yd + xl], b = hField[yd + x], br = hField[yd + xr];
      const dx = (tr + 2 * r + br - (tl + 2 * l + bl)) * 0.125;
      const dy = (bl + 2 * b + br - (tl + 2 * t + tr)) * 0.125;
      const nx = -dx * strength;
      const ny = -dy * strength;
      const inv = 1 / Math.sqrt(nx * nx + ny * ny + 1);
      const o = (yc + x) * 3;
      out[o] = nx * inv; out[o + 1] = ny * inv; out[o + 2] = inv;
    }
  }
  return out;
}

/** Light direction vector (toward the light) in the same space as the normals. */
export function lightVector(light: LightParams): [number, number, number] {
  const az = (light.azimuthDeg * Math.PI) / 180;
  const el = (light.elevationDeg * Math.PI) / 180;
  const cosEl = Math.cos(el);
  // Screen space: +x right, +y down. Azimuth 90° = top → ny negative.
  return [Math.cos(az) * cosEl, -Math.sin(az) * cosEl, Math.sin(el)];
}

// ── Shading ───────────────────────────────────────────────────────────────────

/**
 * Full pipeline. Returns a plain RGBA object (not a DOM ImageData) so it can
 * run anywhere; wrap it with `new ImageData(result.data, w, h)` in the browser.
 */
export interface ReliefGeometry {
  /** Composed height field. */
  H: Float32Array;
  /** Wide blur of H used for ambient occlusion. */
  Hblur: Float32Array;
}

/**
 * Composes the height field and its AO blur. This only depends on the blank,
 * the sigil and the relief gain, so callers can cache it across colour, light
 * and finish changes (the expensive half of a redraw).
 */
export function prepareGeometry(
  blank: BlankBuffers,
  sigilHeight: Float32Array | null,
  floorMask: Float32Array,
  reliefGain: number,
): ReliefGeometry {
  const { width: w, height: h, heightMap } = blank;
  const H = composeHeight(heightMap, sigilHeight, floorMask, reliefGain);
  const Hblur = boxBlur(H, w, h, Math.max(2, Math.round(w / 64)), 1);
  return { H, Hblur };
}

export function shade(
  params: RenderParams,
  geometry?: ReliefGeometry,
): { width: number; height: number; data: Uint8ClampedArray<ArrayBuffer> } {
  const { blank, floorMask, sigilHeight, reliefGain, normalStrength, waxColor, light, material, aoStrength } = params;
  const { width: w, height: h, albedo, alpha } = blank;
  const n = w * h;

  const { H, Hblur } = geometry ?? prepareGeometry(blank, sigilHeight, floorMask, reliefGain);

  const [lx, ly, lz] = lightVector(light);
  // Half vector between light and view (0,0,1)
  let hx = lx, hy = ly, hz = lz + 1;
  const hl = Math.sqrt(hx * hx + hy * hy + hz * hz);
  hx /= hl; hy /= hl; hz /= hl;

  const lum = 0.2126 * waxColor[0] + 0.7152 * waxColor[1] + 0.0722 * waxColor[2];
  const ksScaled = material.ks * (1 - lum * 0.5);

  // Specular below this N·H contributes < 0.2 % — skip the pow() for speed.
  const shin = material.shininess;
  const specCutoff = Math.exp(Math.log(0.002) / shin);
  const ambient = material.ambient;
  const kd = material.kd;
  const wr = waxColor[0] * 2 * 255, wg = waxColor[1] * 2 * 255, wb = waxColor[2] * 2 * 255; // ×2 folds the /0.5 albedo normalisation

  const out = new Uint8ClampedArray(new ArrayBuffer(n * 4));
  const s8 = normalStrength * 0.125;
  for (let y = 0; y < h; y++) {
    const yu = (y > 0 ? y - 1 : 0) * w;
    const yc = y * w;
    const yd = (y < h - 1 ? y + 1 : h - 1) * w;
    for (let x = 0; x < w; x++) {
      const i = yc + x;
      const a = alpha[i];
      if (a <= 0.002) continue; // fully transparent → leave zeros

      // Inline Sobel normal (same maths as computeNormals, without the buffer)
      const xl = x > 0 ? x - 1 : 0;
      const xr = x < w - 1 ? x + 1 : w - 1;
      const tl = H[yu + xl], t = H[yu + x], tr = H[yu + xr];
      const l = H[yc + xl], r = H[yc + xr];
      const bl = H[yd + xl], b = H[yd + x], br = H[yd + xr];
      const gx = -(tr + 2 * r + br - (tl + 2 * l + bl)) * s8;
      const gy = -(bl + 2 * b + br - (tl + 2 * t + tr)) * s8;
      const inv = 1 / Math.sqrt(gx * gx + gy * gy + 1);
      const nx = gx * inv, ny = gy * inv, nz = inv;
      let ndl = nx * lx + ny * ly + nz * lz;
      if (ndl < 0) ndl = 0;
      const ndh = nx * hx + ny * hy + nz * hz;
      const spec = ndh > specCutoff ? ksScaled * Math.pow(ndh, shin) * 255 : 0;

      let ao = 1 - aoStrength * (Hblur[i] - H[i]);
      ao = ao < AO_FLOOR ? AO_FLOOR : ao > 1 ? 1 : ao;

      const lit = (ambient + kd * ndl) * ao * albedo[i];

      const o = i * 4;
      out[o] = wr * lit + spec;
      out[o + 1] = wg * lit + spec;
      out[o + 2] = wb * lit + spec;
      out[o + 3] = a * 255;
    }
  }
  return { width: w, height: h, data: out };
}

// ── Colour helpers ────────────────────────────────────────────────────────────

/** `#rrggbb` → linear-ish RGB triple in 0..1 (sRGB values used directly; fine for tinting). */
export function hexToRgb01(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [0.6, 0.1, 0.1];
  const v = parseInt(m[1], 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

/**
 * Decodes an RGBA raster of a blank's albedo + height PNGs into BlankBuffers.
 * Albedo alpha doubles as the coverage mask. Height is read from the red
 * channel of the height image.
 */
export function decodeBlank(albedoImg: RgbaImageLike, heightImg: RgbaImageLike): BlankBuffers {
  if (albedoImg.width !== heightImg.width || albedoImg.height !== heightImg.height) {
    throw new Error('Blank albedo and height images must have identical dimensions');
  }
  const w = albedoImg.width;
  const h = albedoImg.height;
  const n = w * h;
  const albedo = new Float32Array(n);
  const heightMap = new Float32Array(n);
  const alpha = new Float32Array(n);
  const ad = albedoImg.data;
  const hd = heightImg.data;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const lum = (0.2126 * ad[o] + 0.7152 * ad[o + 1] + 0.0722 * ad[o + 2]) / 255;
    albedo[i] = lum;
    alpha[i] = ad[o + 3] / 255;
    heightMap[i] = hd[o] / 255;
  }
  return { width: w, height: h, albedo, heightMap, alpha };
}
