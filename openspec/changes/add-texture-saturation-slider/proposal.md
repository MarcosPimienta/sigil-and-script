# Proposal: Add Texture Background Saturation Slider

## Problem
Hosts can adjust the brightness and contrast of background textures (`paperBrightness`, `paperContrast`), but currently lack a saturation control to adjust color intensity/desaturation of custom paper textures.

## Proposed Solution
1. **Type & Store Update**:
   - Add `paperSaturate?: number` to `InvitationDesign` in `src/types/sigil.types.ts`.
   - Set default `paperSaturate: 1.0` in `DEFAULT_DESIGN` in `src/state/sigilStore.ts`.
2. **Left Panel Controls**:
   - Add a range slider for `Saturación de Textura (Saturation)` (`paperSaturate`, range `0.0` to `3.0`, step `0.05`) under `Textura de Fondo`.
3. **CSS Filter Integration**:
   - Update CSS `filter` on paper texture containers across `InvitationStage.tsx` and `EnvelopeWrapper.tsx` to include `saturate(${design.paperSaturate ?? 1.0})`.

## Files to Modify
| File | Action | Purpose |
| --- | --- | --- |
| `src/types/sigil.types.ts` | Modify | Add `paperSaturate` property |
| `src/state/sigilStore.ts` | Modify | Set default `paperSaturate: 1.0` in `DEFAULT_DESIGN` |
| `src/components/creator/LeftPanel.tsx` | Modify | Add `Saturación de Textura` range slider control |
| `src/components/creator/InvitationStage.tsx` | Modify | Apply `saturate(...)` in paper texture filter |
| `src/components/creator/EnvelopeWrapper.tsx` | Modify | Apply `saturate(...)` in paper texture filters |

## Scope Constraints
- In Scope: `paperSaturate` slider, type definition, store default, and CSS filter updating.
- Out of Scope: Non-texture image filtering.
