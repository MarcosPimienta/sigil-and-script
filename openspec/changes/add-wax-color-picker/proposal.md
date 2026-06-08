## Why

The wax seal color panel currently offers 6 fixed preset swatches. Designers who need a brand-specific color or a hue not in the preset palette have no way to customize further, which limits the personalization depth of the invitation studio.

## What Changes

- **New**: A color picker control (`<input type="color">`) added below the existing preset swatches in the "Wax Seal Color" section of `LeftPanel`
- **New**: A pure utility function `deriveWaxTones(hex)` that auto-computes the 3-tone gradient set (`color`, `colorLight`, `colorSheen`) from a single picked hex
- **New**: A `WaxColorPicker` component encapsulating the picker input, live preview swatch, and contrast warning
- **Modified**: `LeftPanel` active-swatch logic extended to handle the "no preset matches" state when a custom color is active
- No new state fields; no new reducer actions — existing `UPDATE_WAX_SEAL` handles color updates

## Capabilities

### New Capabilities
- `wax-color-picker`: Free-form color selection for the wax seal that auto-derives the 3-tone wax gradient and shows a low-contrast warning when the picked color is too close in luminance to the current paper

### Modified Capabilities
_(none — no existing spec-level behavior changes)_

## Impact

- **Files created**: `src/utils/waxColorDeriver.ts`, `src/utils/waxColorDeriver.test.ts`, `src/components/creator/WaxColorPicker.tsx`
- **Files modified**: `src/components/creator/LeftPanel.tsx`
- **No type changes** — `WaxSealConfig.color / colorLight / colorSheen` already accept any CSS color string
- **No new dependencies** — uses native `<input type="color">` and standard Math/HSL arithmetic
- **No breaking changes**
