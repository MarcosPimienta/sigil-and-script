// Lightness offsets for the 3-tone wax gradient.
// Chosen to match the visual depth of the existing preset tokens.
const LIGHT_OFFSET = 18;  // colorLight  = base L + 18pp
const SHEEN_OFFSET = 12;  // colorSheen  = base L − 12pp

interface HslColor {
  h: number; // 0–360
  s: number; // 0–100
  l: number; // 0–100
}

function hexToHsl(hex: string): HslColor {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;

  let r: number, g: number, b: number;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }

  const toHexByte = (n: number) =>
    Math.round((n + m) * 255).toString(16).padStart(2, '0');

  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}


export interface WaxTones {
  color: string;
  colorLight: string;
  colorSheen: string;
}

/**
 * Derives a 3-tone wax gradient palette from a single hex color.
 * Preserves hue and saturation; shifts lightness for highlight and shadow tones.
 */
export function deriveWaxTones(hex: string): WaxTones {
  const { h, s, l } = hexToHsl(hex);

  const lightL = Math.min(l + LIGHT_OFFSET, 96);
  const sheenL = Math.max(l - SHEEN_OFFSET, 3);

  return {
    color:      hex,
    colorLight: hslToHex(h, s, lightL),
    colorSheen: hslToHex(h, s, sheenL),
  };
}
