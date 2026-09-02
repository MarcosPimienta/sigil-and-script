import { describe, it, expect } from 'vitest';
import {
  alphaToHeight,
  boxBlur,
  circularMask,
  composeHeight,
  computeNormals,
  shade,
  lightVector,
  bevelDepthToRelief,
  decodeBlank,
  hexToRgb01,
  MATERIALS,
  LIGHT_PRESETS,
  DEFAULT_AO_STRENGTH,
  DEFAULT_NORMAL_STRENGTH,
  type BlankBuffers,
  type RenderParams,
} from './reliefShader';

const W = 16;
const H = 16;

function flatBlank(height = 0.5, albedo = 0.5): BlankBuffers {
  const n = W * H;
  return {
    width: W,
    height: H,
    albedo: new Float32Array(n).fill(albedo),
    heightMap: new Float32Array(n).fill(height),
    alpha: new Float32Array(n).fill(1),
  };
}

function ones(): Float32Array {
  return new Float32Array(W * H).fill(1);
}

function baseParams(over: Partial<RenderParams> = {}): RenderParams {
  return {
    blank: flatBlank(),
    sigilHeight: null,
    floorMask: ones(),
    reliefGain: 0.5,
    normalStrength: DEFAULT_NORMAL_STRENGTH,
    waxColor: [0.6, 0.1, 0.1],
    light: LIGHT_PRESETS.TOP_LEFT,
    material: MATERIALS.MATTE,
    aoStrength: DEFAULT_AO_STRENGTH,
    ...over,
  };
}

/** Left half of the image raised (a vertical step edge). */
function stepSigil(): Float32Array {
  const s = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W / 2; x++) s[y * W + x] = 1;
  return s;
}

function mean(a: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i];
  return s / a.length;
}

describe('reliefShader — normals', () => {
  it('a flat height field yields (0,0,1) normals everywhere and uniform shading', () => {
    const flat = new Float32Array(W * H).fill(0.5);
    const n = computeNormals(flat, W, H, 3);
    for (let i = 0; i < W * H; i++) {
      expect(n[i * 3]).toBeCloseTo(0, 6);
      expect(n[i * 3 + 1]).toBeCloseTo(0, 6);
      expect(n[i * 3 + 2]).toBeCloseTo(1, 6);
    }
    const img = shade(baseParams());
    const first = [img.data[0], img.data[1], img.data[2]];
    for (let i = 1; i < W * H; i++) {
      expect(img.data[i * 4]).toBe(first[0]);
      expect(img.data[i * 4 + 1]).toBe(first[1]);
      expect(img.data[i * 4 + 2]).toBe(first[2]);
    }
  });

  it('normals are unit length', () => {
    const h = boxBlur(stepSigil(), W, H, 2);
    const n = computeNormals(h, W, H, 4);
    for (let i = 0; i < W * H; i++) {
      const len = Math.hypot(n[i * 3], n[i * 3 + 1], n[i * 3 + 2]);
      expect(len).toBeCloseTo(1, 5);
    }
  });
});

describe('reliefShader — lighting direction', () => {
  it('a step edge lit from the left is brighter on its left-facing slope; from the right it flips', () => {
    // Raise the left half; the slope at x = W/2 faces right (+x).
    const sigil = boxBlur(stepSigil(), W, H, 1, 1);
    const edgeIdx = (H / 2) * W + W / 2; // just right of the step: slope faces +x
    const leftOfEdge = (H / 2) * W + W / 2 - 1; // slope faces +x as well after blur

    const fromRight = shade(baseParams({ sigilHeight: sigil, light: { azimuthDeg: 0, elevationDeg: 30 } }));
    const fromLeft = shade(baseParams({ sigilHeight: sigil, light: { azimuthDeg: 180, elevationDeg: 30 } }));

    const lumAt = (img: { data: Uint8ClampedArray }, i: number) =>
      img.data[i * 4] + img.data[i * 4 + 1] + img.data[i * 4 + 2];

    // The slope faces +x, so light from the right (azimuth 0) hits it harder.
    expect(lumAt(fromRight, edgeIdx)).toBeGreaterThan(lumAt(fromLeft, edgeIdx));
    expect(lumAt(fromRight, leftOfEdge)).toBeGreaterThan(lumAt(fromLeft, leftOfEdge));
  });

  it('lightVector points toward the light and is unit length', () => {
    const v = lightVector({ azimuthDeg: 90, elevationDeg: 0 });
    expect(v[0]).toBeCloseTo(0, 6);
    expect(v[1]).toBeCloseTo(-1, 6); // top of the image
    expect(v[2]).toBeCloseTo(0, 6);
    const v2 = lightVector(LIGHT_PRESETS.TOP_LEFT);
    expect(Math.hypot(...v2)).toBeCloseTo(1, 6);
    expect(v2[0]).toBeLessThan(0);
    expect(v2[1]).toBeLessThan(0);
  });
});

describe('reliefShader — boxBlur', () => {
  it('radius 0 is identity and returns a copy', () => {
    const src = stepSigil();
    const out = boxBlur(src, W, H, 0);
    expect(out).not.toBe(src);
    expect(Array.from(out)).toEqual(Array.from(src));
  });

  it('preserves the mean and reduces the maximum gradient', () => {
    const src = stepSigil();
    const out = boxBlur(src, W, H, 2);
    expect(mean(out)).toBeCloseTo(mean(src), 3);
    const maxGrad = (a: Float32Array) => {
      let m = 0;
      for (let y = 0; y < H; y++) for (let x = 1; x < W; x++) m = Math.max(m, Math.abs(a[y * W + x] - a[y * W + x - 1]));
      return m;
    };
    expect(maxGrad(out)).toBeLessThan(maxGrad(src));
    expect(maxGrad(src)).toBe(1);
  });
});

describe('reliefShader — composeHeight & masks', () => {
  it('emboss raises covered pixels, deboss lowers them, uncovered floor is untouched', () => {
    const base = new Float32Array(W * H).fill(0.5);
    const sigil = stepSigil();
    const mask = ones();
    const covered = 0;
    const uncovered = W - 1;

    const emboss = composeHeight(base, sigil, mask, bevelDepthToRelief(5, 'EMBOSS').reliefGain);
    const deboss = composeHeight(base, sigil, mask, bevelDepthToRelief(5, 'DEBOSS').reliefGain);

    expect(emboss[covered]).toBeGreaterThan(0.5);
    expect(deboss[covered]).toBeLessThan(0.5);
    expect(emboss[uncovered]).toBeCloseTo(0.5, 6);
    expect(deboss[uncovered]).toBeCloseTo(0.5, 6);
  });

  it('contribution outside the floor mask is zero', () => {
    const base = new Float32Array(W * H).fill(0.5);
    const sigil = ones();
    const mask = circularMask(W, H, W / 2, H / 2, 3, 1);
    const out = composeHeight(base, sigil, mask, 0.5);
    expect(out[0]).toBeCloseTo(0.5, 6); // corner, outside the disc
    expect(out[(H / 2) * W + W / 2]).toBeGreaterThan(0.9); // centre, inside
  });

  it('a null sigil returns the base unchanged', () => {
    const base = new Float32Array(W * H).fill(0.42);
    const out = composeHeight(base, null, ones(), 1);
    expect(Array.from(out)).toEqual(Array.from(base));
  });

  it('circularMask is 1 at the centre, 0 far away, and feathers in between', () => {
    const m = circularMask(W, H, 8, 8, 4, 2);
    expect(m[8 * W + 8]).toBe(1);
    expect(m[0]).toBe(0);
    const ring = m[8 * W + 12]; // exactly on the radius → ~0.5
    expect(ring).toBeGreaterThan(0.2);
    expect(ring).toBeLessThan(0.8);
  });
});

describe('reliefShader — shade output', () => {
  it('output alpha equals blank alpha (no bleed outside the wax)', () => {
    const blank = flatBlank();
    blank.alpha[0] = 0;
    blank.alpha[1] = 0.5;
    const img = shade(baseParams({ blank }));
    expect(img.data[3]).toBe(0);
    expect(img.data[0]).toBe(0);
    expect(img.data[1 * 4 + 3]).toBe(128);
    expect(img.data[5 * 4 + 3]).toBe(255);
  });

  it('METALLIC produces a higher peak than MATTE for the same geometry', () => {
    const sigil = boxBlur(circularMask(W, H, 8, 8, 4, 1), W, H, 1);
    const peak = (img: { data: Uint8ClampedArray }) => {
      let m = 0;
      for (let i = 0; i < W * H; i++) m = Math.max(m, img.data[i * 4] + img.data[i * 4 + 1] + img.data[i * 4 + 2]);
      return m;
    };
    const matte = shade(baseParams({ sigilHeight: sigil, material: MATERIALS.MATTE }));
    const metal = shade(baseParams({ sigilHeight: sigil, material: MATERIALS.METALLIC }));
    expect(peak(metal)).toBeGreaterThan(peak(matte));
  });

  it('very dark wax still shows relief (max ≠ min)', () => {
    const sigil = boxBlur(stepSigil(), W, H, 1, 1);
    const img = shade(baseParams({ sigilHeight: sigil, waxColor: hexToRgb01('#18181b') }));
    let mn = 999, mx = 0;
    for (let i = 0; i < W * H; i++) {
      const l = img.data[i * 4] + img.data[i * 4 + 1] + img.data[i * 4 + 2];
      mn = Math.min(mn, l);
      mx = Math.max(mx, l);
    }
    expect(mx - mn).toBeGreaterThan(10);
  });
});

describe('reliefShader — helpers', () => {
  it('alphaToHeight uses alpha when present and inverted luminance otherwise', () => {
    const withAlpha = { width: 2, height: 1, data: [255, 255, 255, 0, 255, 255, 255, 255] };
    const a = alphaToHeight(withAlpha);
    expect(a.source).toBe('alpha');
    expect(a.height[0]).toBe(0);
    expect(a.height[1]).toBe(1);

    const opaque = { width: 2, height: 1, data: [0, 0, 0, 255, 255, 255, 255, 255] };
    const b = alphaToHeight(opaque);
    expect(b.source).toBe('luminance');
    expect(b.height[0]).toBeCloseTo(1, 6);
    expect(b.height[1]).toBeCloseTo(0, 6);
  });

  it('bevelDepthToRelief grows blur and gain with depth and flips sign for deboss', () => {
    const lo = bevelDepthToRelief(1);
    const hi = bevelDepthToRelief(10);
    expect(hi.blurRadius).toBeGreaterThan(lo.blurRadius);
    expect(hi.reliefGain).toBeGreaterThan(lo.reliefGain);
    expect(bevelDepthToRelief(5, 'DEBOSS').reliefGain).toBe(-bevelDepthToRelief(5, 'EMBOSS').reliefGain);
  });

  it('hexToRgb01 parses hex and falls back on garbage', () => {
    expect(hexToRgb01('#ff0000')).toEqual([1, 0, 0]);
    expect(hexToRgb01('00ff00')[1]).toBe(1);
    expect(hexToRgb01('nope')).toEqual([0.6, 0.1, 0.1]);
  });

  it('decodeBlank reads albedo luminance, alpha and red-channel height', () => {
    const albedo = { width: 1, height: 1, data: [128, 128, 128, 255] };
    const height = { width: 1, height: 1, data: [64, 0, 0, 255] };
    const b = decodeBlank(albedo, height);
    expect(b.albedo[0]).toBeCloseTo(128 / 255, 5);
    expect(b.alpha[0]).toBe(1);
    expect(b.heightMap[0]).toBeCloseTo(64 / 255, 5);
    expect(() => decodeBlank(albedo, { width: 2, height: 1, data: [] })).toThrow();
  });
});
