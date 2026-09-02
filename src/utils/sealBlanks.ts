// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Wax Blank Registry
// Each blank is a pair of PNGs (albedo + height) plus a floor descriptor.
// Adding a blank = drop two PNGs in src/assets/seals/<id>/ and add an entry.
// Asset contract: src/assets/seals/README.md
// ─────────────────────────────────────────────────────────────────────────────

import { decodeBlank, type BlankBuffers } from './reliefShader';
import roundAlbedo from '../assets/seals/round/albedo.png';
import roundHeight from '../assets/seals/round/height.png';

export interface SealBlank {
  id: string;
  name: string;
  albedo: string;
  height: string;
  /** Pressed-floor circle as fractions of the image size. */
  floor: { cx: number; cy: number; r: number };
}

export const SEAL_BLANKS: SealBlank[] = [
  {
    id: 'round',
    name: 'Classic Round',
    albedo: roundAlbedo,
    height: roundHeight,
    floor: { cx: 0.5, cy: 0.5, r: 0.27 },
  },
];

export function getSealBlank(id: string): SealBlank {
  return SEAL_BLANKS.find((b) => b.id === id) ?? SEAL_BLANKS[0];
}

const cache = new Map<string, Promise<BlankBuffers>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load blank asset: ${src}`));
    img.src = src;
  });
}

function rasterize(img: HTMLImageElement): ImageData {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, c.width, c.height);
}

/** Decodes (and caches) a blank's PNGs into shader buffers. */
export function loadBlank(id: string): Promise<BlankBuffers> {
  const blank = getSealBlank(id);
  let p = cache.get(blank.id);
  if (!p) {
    p = Promise.all([loadImage(blank.albedo), loadImage(blank.height)]).then(([a, h]) =>
      decodeBlank(rasterize(a), rasterize(h)),
    );
    cache.set(blank.id, p);
  }
  return p;
}
