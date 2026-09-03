// ─────────────────────────────────────────────────────────────────────────────
// Font catalogue for per-section typography.
// Only families actually loaded by src/styles/tokens.css (plus system stacks)
// are offered, so a chosen font can never silently fall back.
// ─────────────────────────────────────────────────────────────────────────────

import type { SectionFonts } from '../types/sigil.types';

export interface FontChoice {
  /** The CSS font-family stack stored on the section. */
  value: string;
  /** What the host sees in the picker. */
  label: string;
  /** Rough visual family, shown as a hint in the picker. */
  note: string;
}

/** Defaults the invitation has always used — the value of "sin cambios". */
export const DEFAULT_HEADING_FONT = "'Pinyon Script', cursive";
export const DEFAULT_BODY_FONT = "'Cormorant Garamond', serif";

export const FONT_CHOICES: FontChoice[] = [
  { value: "'Cormorant Garamond', serif", label: 'Cormorant Garamond', note: 'Serif clásica' },
  { value: "'Pinyon Script', cursive", label: 'Pinyon Script', note: 'Caligráfica' },
  { value: "'Cinzel Decorative', serif", label: 'Cinzel Decorative', note: 'Romana decorativa' },
  { value: "'Playfair Display', serif", label: 'Playfair Display', note: 'Serif alto contraste' },
  { value: "'IM Fell English', serif", label: 'IM Fell English', note: 'Imprenta antigua' },
  { value: "'Spectral', serif", label: 'Spectral', note: 'Serif legible' },
  { value: "'GFS Didot', serif", label: 'GFS Didot', note: 'Didona' },
  { value: "Georgia, 'Times New Roman', serif", label: 'Georgia', note: 'Sistema · serif' },
  { value: "'Helvetica Neue', Arial, sans-serif", label: 'Helvética / Arial', note: 'Sistema · sans' },
];

export function isKnownFont(value: string | undefined): boolean {
  return !!value && FONT_CHOICES.some((f) => f.value === value);
}

/** CSS custom properties consumed by every section renderer. */
export const HEADING_FONT_VAR = '--sec-heading-font';
export const BODY_FONT_VAR = '--sec-body-font';

/**
 * Style object for a section wrapper. Unset fonts simply omit the variable so
 * each renderer's own fallback (its historical font) applies unchanged.
 */
export function sectionFontVars(fonts?: SectionFonts): React.CSSProperties {
  const style: Record<string, string> = {};
  if (fonts?.heading) style[HEADING_FONT_VAR] = fonts.heading;
  if (fonts?.body) style[BODY_FONT_VAR] = fonts.body;
  return style as React.CSSProperties;
}
