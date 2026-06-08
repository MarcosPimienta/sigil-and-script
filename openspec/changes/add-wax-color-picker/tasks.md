## 0. Setup: Create Feature Branch (MANDATORY — FIRST STEP)

- [ ] 0.1 Create feature branch `feature/add-wax-color-picker` from `master`
- [ ] 0.2 Verify branch creation: `git branch --show-current`

## 1. Utility — TDD: Write failing tests first

- [ ] 1.1 Create `src/utils/waxColorDeriver.test.ts` with failing tests for `deriveWaxTones`:
  - mid-hue hex → correct `color`, `colorLight`, `colorSheen` with ±offset
  - near-white input → `colorLight` clamped to ≤ 96% lightness
  - near-black input → `colorSheen` clamped to ≥ 3% lightness
  - pure white (`#ffffff`) and pure black (`#000000`) edge cases
  - output values are valid CSS hex strings (`#rrggbb`)
- [ ] 1.2 Confirm tests fail (red phase)

## 2. Utility — Implementation

- [ ] 2.1 Create `src/utils/waxColorDeriver.ts`:
  - Export `deriveWaxTones(hex: string): { color: string; colorLight: string; colorSheen: string }`
  - Implement `hexToHsl` and `hslToHex` helpers (pure math, no DOM)
  - Apply lightness offsets: `colorLight` = L + 18pp (clamped), `colorSheen` = L − 12pp (clamped)
  - Preserve hue and saturation
- [ ] 2.2 Run tests — all must pass (green phase)
- [ ] 2.3 Run `npm run build` to confirm no TypeScript errors

## 3. Component — `WaxColorPicker`

- [ ] 3.1 Create `src/components/creator/WaxColorPicker.tsx`:
  - Props: `value: string` (current `waxSeal.color`), `paperLuminance: PaperLuminance`
  - Derive display hex from `value` (CSS variable → hex lookup table for the 6 presets; default `#6b1b28`)
  - On `onChange`: call `deriveWaxTones`, call `updateWaxSeal({ color, colorLight, colorSheen })`
  - Compute contrast warning: if absolute HSL-lightness delta between picked color and paper background is < 0.15 (using static paper-luminance → approximate-lightness map), show warning text
  - Render: `<label>` + `<input type="color">` + optional warning paragraph
  - All accessibility: `aria-label="Custom wax color"`, `id` + `htmlFor` linkage

## 4. Component — Wire into `LeftPanel`

- [ ] 4.1 Import `WaxColorPicker` in `src/components/creator/LeftPanel.tsx`
- [ ] 4.2 Render `<WaxColorPicker value={waxSeal.color} paperLuminance={design.paperLuminance} />` immediately below the `.lp-swatch-row` div in the "Wax Seal Color" section
- [ ] 4.3 Update `activeWaxId` logic: change the fallback from `'crimson'` to `null | undefined` so no swatch shows as active when a custom color is in use
  - Active swatch should only highlight when `WAX_OPTIONS.find(o => o.color === waxSeal.color)` returns a match

## 5. Styling

- [ ] 5.1 Add CSS for the picker row and warning to `src/styles/creator.css`:
  - `.lp-color-picker-row` — flex row with label and input
  - `.lp-color-picker-input` — size ~28×28px, rounded, cursor pointer, no default browser padding
  - `.lp-color-picker-warning` — small italic text using `var(--ui-text-secondary)` or a warm amber token; `font-size: var(--text-xs)`
- [ ] 5.2 Confirm no raw hex or pixel values outside design tokens

## 6. Verification

- [ ] 6.1 Run `npm run build` — must pass with zero TypeScript errors
- [ ] 6.2 Run `npm run lint` — must pass with no ESLint errors
- [ ] 6.3 Run all unit tests — `waxColorDeriver.test.ts` must pass
- [ ] 6.4 Manual E2E check via `npm run dev`:
  - [ ] Pick a custom color → wax seal updates live on canvas
  - [ ] Switch to a preset → preset swatch highlights, custom picker reflects preset hex
  - [ ] Pick near-white on parchment paper → warning message appears
  - [ ] Pick a dark color on parchment paper → no warning
  - [ ] Change paper texture while warning is active → warning disappears if contrast is now sufficient
  - [ ] Tab to picker input → receives visible focus ring
  - [ ] Inspect `aria-label` with browser DevTools a11y panel

## 7. Documentation Update (MANDATORY)

- [ ] 7.1 Update `docs/data-model.md` if any interface changes were made (expected: none for this change)
- [ ] 7.2 Confirm `docs/frontend-standards.md` covers the `WaxColorPicker` pattern (no update expected)
