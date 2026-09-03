import { describe, it, expect } from 'vitest';
import { FONT_CHOICES, sectionFontVars, isKnownFont, DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT } from './fonts';

describe('fonts', () => {
  it('offers only distinct, non-empty families with labels', () => {
    const values = FONT_CHOICES.map((f) => f.value);
    expect(new Set(values).size).toBe(values.length);
    for (const choice of FONT_CHOICES) {
      expect(choice.label).toBeTruthy();
      expect(choice.note).toBeTruthy();
      expect(choice.value).toMatch(/\w/);
    }
  });

  it('includes the historical defaults so they can be re-selected', () => {
    expect(isKnownFont(DEFAULT_BODY_FONT)).toBe(true);
    expect(isKnownFont(DEFAULT_HEADING_FONT)).toBe(true);
    expect(isKnownFont('Comic Sans MS')).toBe(false);
    expect(isKnownFont(undefined)).toBe(false);
  });

  it('emits a CSS variable only for fonts that are set', () => {
    expect(sectionFontVars(undefined)).toEqual({});
    expect(sectionFontVars({})).toEqual({});
    expect(sectionFontVars({ body: 'Georgia, serif' })).toEqual({ '--sec-body-font': 'Georgia, serif' });
    expect(sectionFontVars({ heading: 'X', body: 'Y' })).toEqual({
      '--sec-heading-font': 'X',
      '--sec-body-font': 'Y',
    });
  });
});
