// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Paper Luminance Guardrails
// utils/luminanceGuards.ts
//
// Derives which ink colours and wax colours are permissible for a given
// paper texture. These rules are encoded as a CSS-variable token system so
// the values can be consumed by both JS logic AND CSS custom properties.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  InkColor,
  PaperLuminance,
  PaperTexture,
} from '../types/sigil.types';

// ── Luminance Map ─────────────────────────────────────────────────────────────

/** Classify each paper texture by its light/medium/dark luminance tier. */
export const PAPER_LUMINANCE_MAP: Record<PaperTexture, PaperLuminance> = {
  'parchment':   'LIGHT',
  'linen':       'LIGHT',
  'cotton-rag':  'LIGHT',
  'vellum':      'MEDIUM',
};

// ── Ink Allow-Lists per Luminance ─────────────────────────────────────────────

/** CSS variable names for ink colours, resolved against tokens.css */
export const INK_COLORS_BY_LUMINANCE: Record<PaperLuminance, InkColor[]> = {
  LIGHT:  ['DARK_INK', 'SEPIA_INK', 'METALLIC_GOLD'],
  MEDIUM: ['DARK_INK', 'SEPIA_INK', 'METALLIC_GOLD', 'METALLIC_SILVER'],
  DARK:   ['LIGHT_INK', 'METALLIC_GOLD', 'METALLIC_SILVER'],
};

/** Map InkColor enum values to CSS custom property references */
export const INK_COLOR_TO_CSS_VAR: Record<InkColor, string> = {
  DARK_INK:         'var(--ink-on-light)',
  LIGHT_INK:        'var(--ink-on-dark)',
  SEPIA_INK:        'var(--color-sepia-800)',
  METALLIC_GOLD:    'var(--color-gold-burnish)',
  METALLIC_SILVER:  'var(--color-silver)',
};

/** Human-readable label for the inspector UI */
export const INK_COLOR_LABELS: Record<InkColor, string> = {
  DARK_INK:         'Dark Ink',
  LIGHT_INK:        'Ivory Ink',
  SEPIA_INK:        'Sepia',
  METALLIC_GOLD:    'Burnished Gold',
  METALLIC_SILVER:  'Sterling Silver',
};

// ── Wax Allow-Lists per Luminance ─────────────────────────────────────────────

export interface WaxOption {
  id: string;
  label: string;
  cssVar: string;
  lightCssVar: string;
  sheenCssVar: string;
}

export const ALL_WAX_OPTIONS: WaxOption[] = [
  {
    id: 'crimson',
    label: 'Crimson',
    cssVar: 'var(--wax-crimson)',
    lightCssVar: 'var(--wax-crimson-light)',
    sheenCssVar: 'var(--wax-crimson-sheen)',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    cssVar: 'var(--wax-midnight)',
    lightCssVar: 'var(--wax-midnight-light)',
    sheenCssVar: 'var(--wax-midnight-sheen)',
  },
  {
    id: 'forest',
    label: 'Forest',
    cssVar: 'var(--wax-forest)',
    lightCssVar: 'var(--wax-forest-light)',
    sheenCssVar: 'var(--wax-forest-sheen)',
  },
  {
    id: 'ivory',
    label: 'Ivory',
    cssVar: 'var(--wax-ivory)',
    lightCssVar: 'var(--wax-ivory-light)',
    sheenCssVar: 'var(--wax-ivory-sheen)',
  },
  {
    id: 'obsidian',
    label: 'Obsidian',
    cssVar: 'var(--wax-obsidian)',
    lightCssVar: 'var(--wax-obsidian-light)',
    sheenCssVar: 'var(--wax-obsidian-sheen)',
  },
  {
    id: 'amethyst',
    label: 'Amethyst',
    cssVar: 'var(--wax-amethyst)',
    lightCssVar: 'var(--wax-amethyst-light)',
    sheenCssVar: 'var(--wax-amethyst-sheen)',
  },
];

const WAX_BY_LUMINANCE: Record<PaperLuminance, string[]> = {
  LIGHT:  ['crimson', 'midnight', 'forest', 'amethyst', 'obsidian'],
  MEDIUM: ['crimson', 'midnight', 'forest', 'ivory', 'amethyst', 'obsidian'],
  DARK:   ['ivory', 'amethyst'],
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns the luminance tier for a paper texture.
 * Defaults to LIGHT for safety (fail-safe toward readable contrast).
 */
export function getPaperLuminance(texture: PaperTexture): PaperLuminance {
  return PAPER_LUMINANCE_MAP[texture] ?? 'LIGHT';
}

/**
 * Returns the list of ink colours permitted for a given paper luminance.
 * Used to populate the Inspector ink-colour picker.
 */
export function getAllowedInkColors(luminance: PaperLuminance): InkColor[] {
  return INK_COLORS_BY_LUMINANCE[luminance] ?? INK_COLORS_BY_LUMINANCE.LIGHT;
}

/**
 * Returns the list of wax options permitted for a given paper luminance.
 * This enforces elegant contrast between wax seal and paper.
 */
export function getAllowedWaxOptions(luminance: PaperLuminance): WaxOption[] {
  const allowed = WAX_BY_LUMINANCE[luminance] ?? WAX_BY_LUMINANCE.LIGHT;
  return ALL_WAX_OPTIONS.filter((opt) => allowed.includes(opt.id));
}

/**
 * Checks whether a chosen ink colour is valid for the current paper luminance.
 * Used to guard against invalid design states (e.g. light ink on light paper).
 */
export function isInkColorAllowed(
  color: InkColor,
  luminance: PaperLuminance,
): boolean {
  return getAllowedInkColors(luminance).includes(color);
}

/**
 * Checks whether a wax option id is valid for the current paper luminance.
 */
export function isWaxAllowed(waxId: string, luminance: PaperLuminance): boolean {
  return getAllowedWaxOptions(luminance).some((opt) => opt.id === waxId);
}

/**
 * Returns a safe fallback ink colour for a paper luminance —
 * used when the current ink colour becomes invalid after a paper swap.
 */
export function getDefaultInkColor(luminance: PaperLuminance): InkColor {
  return INK_COLORS_BY_LUMINANCE[luminance][0];
}

/**
 * Returns the CSS background-color value for a paper texture.
 */
export const PAPER_CSS_VAR: Record<PaperTexture, string> = {
  'parchment':  'var(--paper-parchment)',
  'linen':      'var(--paper-linen)',
  'cotton-rag': 'var(--paper-cotton-rag)',
  'vellum':     'var(--paper-vellum)',
};
