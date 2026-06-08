import { describe, it, expect } from 'vitest';
import { deriveWaxTones } from './waxColorDeriver';

// Helper: parse a #rrggbb hex string to HSL
function hexToHslValues(hex: string): { h: number; s: number; l: number } {
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function isValidHex(value: string): boolean {
  return /^#[0-9a-f]{6}$/.test(value);
}

describe('deriveWaxTones', () => {
  describe('output format', () => {
    it('returns valid #rrggbb hex strings for all three values', () => {
      const result = deriveWaxTones('#6b1b28');
      expect(isValidHex(result.color)).toBe(true);
      expect(isValidHex(result.colorLight)).toBe(true);
      expect(isValidHex(result.colorSheen)).toBe(true);
    });

    it('preserves the base color as-is in result.color', () => {
      const result = deriveWaxTones('#6b1b28');
      expect(result.color).toBe('#6b1b28');
    });
  });

  describe('mid-hue color (crimson-like #6b1b28)', () => {
    it('colorLight has higher lightness than the base', () => {
      const base = hexToHslValues('#6b1b28');
      const light = hexToHslValues(deriveWaxTones('#6b1b28').colorLight);
      expect(light.l).toBeGreaterThan(base.l);
    });

    it('colorSheen has lower lightness than the base', () => {
      const base = hexToHslValues('#6b1b28');
      const sheen = hexToHslValues(deriveWaxTones('#6b1b28').colorSheen);
      expect(sheen.l).toBeLessThan(base.l);
    });

    it('colorLight lightness is approximately base + 18pp', () => {
      const base = hexToHslValues('#6b1b28');
      const light = hexToHslValues(deriveWaxTones('#6b1b28').colorLight);
      expect(light.l).toBeGreaterThanOrEqual(base.l + 15);
      expect(light.l).toBeLessThanOrEqual(base.l + 21);
    });

    it('colorSheen lightness is approximately base - 12pp', () => {
      const base = hexToHslValues('#6b1b28');
      const sheen = hexToHslValues(deriveWaxTones('#6b1b28').colorSheen);
      expect(sheen.l).toBeGreaterThanOrEqual(base.l - 15);
      expect(sheen.l).toBeLessThanOrEqual(base.l - 9);
    });

    it('preserves hue across all three tones', () => {
      const result = deriveWaxTones('#6b1b28');
      const base = hexToHslValues(result.color);
      const light = hexToHslValues(result.colorLight);
      const sheen = hexToHslValues(result.colorSheen);
      // Allow ±5° rounding tolerance
      expect(Math.abs(light.h - base.h)).toBeLessThanOrEqual(5);
      expect(Math.abs(sheen.h - base.h)).toBeLessThanOrEqual(5);
    });
  });

  describe('near-white clamping (#f0f0f0, L ≈ 94%)', () => {
    it('colorLight is clamped to at most 96% lightness', () => {
      const light = hexToHslValues(deriveWaxTones('#f0f0f0').colorLight);
      expect(light.l).toBeLessThanOrEqual(96);
    });

    it('colorSheen is still darker than the base', () => {
      const base = hexToHslValues('#f0f0f0');
      const sheen = hexToHslValues(deriveWaxTones('#f0f0f0').colorSheen);
      expect(sheen.l).toBeLessThan(base.l);
    });
  });

  describe('near-black clamping (#0d0d0d, L ≈ 5%)', () => {
    it('colorSheen is clamped to at least 3% lightness', () => {
      const sheen = hexToHslValues(deriveWaxTones('#0d0d0d').colorSheen);
      expect(sheen.l).toBeGreaterThanOrEqual(3);
    });

    it('colorLight is still lighter than the base', () => {
      const base = hexToHslValues('#0d0d0d');
      const light = hexToHslValues(deriveWaxTones('#0d0d0d').colorLight);
      expect(light.l).toBeGreaterThan(base.l);
    });
  });

  describe('pure white (#ffffff)', () => {
    it('does not throw', () => {
      expect(() => deriveWaxTones('#ffffff')).not.toThrow();
    });

    it('returns valid hex strings', () => {
      const result = deriveWaxTones('#ffffff');
      expect(isValidHex(result.color)).toBe(true);
      expect(isValidHex(result.colorLight)).toBe(true);
      expect(isValidHex(result.colorSheen)).toBe(true);
    });
  });

  describe('pure black (#000000)', () => {
    it('does not throw', () => {
      expect(() => deriveWaxTones('#000000')).not.toThrow();
    });

    it('returns valid hex strings', () => {
      const result = deriveWaxTones('#000000');
      expect(isValidHex(result.color)).toBe(true);
      expect(isValidHex(result.colorLight)).toBe(true);
      expect(isValidHex(result.colorSheen)).toBe(true);
    });

    it('colorSheen is clamped to minimum 3% lightness', () => {
      const sheen = hexToHslValues(deriveWaxTones('#000000').colorSheen);
      expect(sheen.l).toBeGreaterThanOrEqual(3);
    });
  });
});
