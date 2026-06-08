## Context

The wax seal's 3D appearance is produced by a radial SVG gradient using three color values: `color` (base), `colorLight` (highlight at ~35% cx/30% cy), and `colorSheen` (shadow at the outer edge). Currently these three values are always CSS custom property tokens (e.g. `var(--wax-crimson)`) sourced from the 6 preset swatches.

A free-form color picker must supply all three values from a single user input. Since arbitrary picked colors have no corresponding CSS variables, the derived values will be inline hex/hsl strings. `WaxSealConfig.color/colorLight/colorSheen` are already typed as `string`, so no type system changes are needed.

The `UPDATE_WAX_SEAL` action and `updateWaxSeal()` convenience function already handle partial updates, making the state layer a no-op.

## Goals / Non-Goals

**Goals:**
- Let designers pick any hex color and have the seal update in real time
- Auto-derive a visually coherent 3-tone palette from a single hex input
- Show an inline low-contrast warning (non-blocking) when the picked color is too light/dark relative to the paper
- Keep the existing preset swatches and luminance guardrail logic untouched

**Non-Goals:**
- Saving custom colors to a "favorites" palette (future)
- Allowing independent control over `colorLight`/`colorSheen` offsets (advanced use case, future)
- Server-side persistence of custom colors

## Decisions

### Decision 1: Derive 3 tones via HSL arithmetic, not a color library

**Chosen**: Implement `deriveWaxTones(hex: string)` as pure HSL math in `src/utils/waxColorDeriver.ts` — parse hex → HSL, add/subtract fixed lightness offsets, return hex strings.

**Alternative considered**: Use a color manipulation library (e.g. `chroma-js`, `tinycolor2`).

**Rationale**: No new dependency needed. The derivation is simple (±lightness offset on HSL). A pure function with no imports is easier to test, tree-shakes to zero overhead, and avoids adding a runtime dependency for ~20 lines of math.

**Offsets chosen** (from visual testing against the existing preset gradients):
- `colorLight`: lightness + 18pp, clamped to [lightness+5, 96]
- `colorSheen`: lightness − 12pp, clamped to [3, lightness−5]
- Saturation is preserved; hue is unchanged.

---

### Decision 2: `WaxColorPicker` is a controlled component that calls `updateWaxSeal` directly

**Chosen**: `WaxColorPicker` receives the current `waxSeal.color` as its `value` prop (falling back to `#6b1b28` if the active value is a CSS variable), and on `onChange` calls `deriveWaxTones` then dispatches `updateWaxSeal`. No intermediate local state for the color.

**Alternative considered**: Keep the picker value in local state and only commit on blur.

**Rationale**: Live preview is a core UX requirement. The `onChange` event on `<input type="color">` fires continuously as the user drags the color wheel, making real-time updates straightforward. The reducer is fast enough for this frequency.

**CSS variable fallback**: When the active `waxSeal.color` is `var(--wax-crimson)` (a CSS variable, not a hex), the picker input needs a hex seed. We resolve preset → hex via a static lookup table in `WaxColorPicker` (same `swatch` hex values already in `WAX_OPTIONS` in `LeftPanel`). If no preset matches, we default to `#6b1b28` (crimson hex).

---

### Decision 3: Contrast check uses relative luminance comparison, not a full WCAG ratio

**Chosen**: Compute approximate relative luminance of picked color and current paper background (using the paper's CSS variable resolved to a known hex via a static lookup in `luminanceGuards.ts`), then flag if the absolute luminance difference is < 0.15.

**Alternative considered**: Full WCAG 2.1 contrast ratio (≥ 1.5:1 threshold).

**Rationale**: WCAG contrast ratios are designed for text readability, not decorative objects. A simpler luminance delta check is sufficient for the "seal nearly invisible on paper" warning. The threshold (0.15) was chosen to catch near-white seal on light paper without triggering on legitimately subtle pairings (e.g. ivory seal on vellum).

---

### Decision 4: `WaxColorPicker` lives in `src/components/creator/`, not `src/components/shared/`

**Rationale**: This component is creator-mode only (inspector panel), directly coupled to `useSigil()` context, and has no current re-use candidate. It belongs in `creator/` until a concrete second use case emerges.

## Risks / Trade-offs

- **`<input type="color">` UI varies by OS/browser** → The native picker appearance differs across platforms. This is acceptable — we rely on the browser's color picker rather than building a custom one, which avoids accessibility and maintenance burden. Risk: low.

- **Preset swatch active state** — When a custom color is active, `activeWaxId` in `LeftPanel` returns `undefined` (no preset match). This means no swatch is highlighted. The picker itself serves as the active indicator. Risk: minor UX confusion if the user doesn't notice the picker has changed. Mitigation: the picker always shows the current color as its value.

- **CSS variable vs. hex round-trip** — Switching from a preset (CSS variable) to a custom color (hex) and back is lossy in one direction: after picking a custom hex close to crimson, clicking the crimson preset re-applies the CSS variable correctly. The reverse (custom hex ≈ preset) does not auto-snap to the preset. Acceptable — the user explicitly chose the preset.

## Open Questions

- Should the custom picker value be persisted in `InvitationDesign` so it survives a page reload? Currently nothing persists (no localStorage / no backend). Out of scope for this change.
- Should there be a "reset to preset" affordance that clears a custom color? Deferred to a future "clear custom color" story.
