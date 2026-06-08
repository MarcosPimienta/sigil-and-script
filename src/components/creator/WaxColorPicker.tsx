import { useCallback, useMemo, type ChangeEvent } from 'react';
import type { PaperLuminance } from '../../types/sigil.types';
import { useSigil } from '../../context/SigilContext';
import { deriveWaxTones } from '../../utils/waxColorDeriver';

// ── CSS variable → hex swatch lookup (matches WAX_OPTIONS in LeftPanel) ───────

const CSS_VAR_TO_HEX: Record<string, string> = {
  'var(--wax-crimson)':   '#6b1b28',
  'var(--wax-forest)':    '#183e2b',
  'var(--wax-midnight)':  '#1a2540',
  'var(--wax-amethyst)':  '#3d1e5c',
  'var(--wax-obsidian)':  '#1a1e26',
  'var(--wax-ivory)':     '#d4c89a',
};

const DEFAULT_HEX = '#6b1b28';

// ── Paper luminance → approximate HSL lightness (0–100) ──────────────────────

const PAPER_LIGHTNESS: Record<PaperLuminance, number> = {
  LIGHT:  87,
  MEDIUM: 78,
  DARK:   12,
};

const LOW_CONTRAST_THRESHOLD = 15; // lightness delta below which we warn

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexToLightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2) * 100;
}

/** Resolve current waxSeal.color to a #rrggbb hex for the input value. */
function resolveToHex(color: string): string {
  if (color.startsWith('#')) return color;
  return CSS_VAR_TO_HEX[color] ?? DEFAULT_HEX;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface WaxColorPickerProps {
  value: string;
  paperLuminance: PaperLuminance;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WaxColorPicker({ value, paperLuminance }: WaxColorPickerProps) {
  const { updateWaxSeal } = useSigil();

  const displayHex = resolveToHex(value);

  const showWarning = useMemo(() => {
    const pickedL = hexToLightness(displayHex);
    const paperL  = PAPER_LIGHTNESS[paperLuminance];
    return Math.abs(pickedL - paperL) < LOW_CONTRAST_THRESHOLD;
  }, [displayHex, paperLuminance]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value;
      const tones = deriveWaxTones(hex);
      updateWaxSeal(tones);
    },
    [updateWaxSeal],
  );

  return (
    <div className="lp-color-picker-row">
      <label className="lp-field-label" htmlFor="wax-custom-color">
        Custom color
      </label>
      <input
        id="wax-custom-color"
        className="lp-color-picker-input"
        type="color"
        value={displayHex}
        onChange={handleChange}
        aria-label="Custom wax color"
        title="Pick a custom wax seal color"
      />
      {showWarning && (
        <p className="lp-color-picker-warning" role="alert">
          Low contrast — seal may not be visible on this paper.
        </p>
      )}
    </div>
  );
}
