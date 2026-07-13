# Proposal — Remove Assets and Scale Wax Seal

## Problem
1. **Unwanted Custom Upload Controls**: The user wants to simplify the creator sidebar by removing the custom upload options for:
   - Header Image (`headerImage`)
   - Frame Border (`frameImage`)
   - Paper Pattern (`paperImage`)
   - Envelope Decoration (Closed) (`closedEnvelopeImage`)
2. **Fixed Wax Seal Size**: The wax seal (either the default red wax button or a custom uploaded sticker PNG image) has a fixed sizing template and cannot be resized by the creator to fit different custom graphics or design needs.

## Proposed Solution
1. **Sidebar Cleanup**: Remove the custom upload slots for the four specified assets from [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx).
2. **Renderer Cleanup**: Remove code references, background images, and conditional image tags for `headerImage`, `frameImage`, and `paperImage` inside [InvitationStage.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/InvitationStage.tsx) and [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx). This restores standard procedural border styles and textures as the only design options.
3. **Seal Sizing Parameter**: Declare a new optional `sealSize?: number;` field in `InvitationDesign` in [sigil.types.ts](file:///home/fenix3819/sigil-and-script/src/types/sigil.types.ts) and initialize it to `75` in the default design in [sigilStore.ts](file:///home/fenix3819/sigil-and-script/src/state/sigilStore.ts).
4. **Sizing Slider**: Add a slider input in [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx) with a range of `40` to `150` (pixels) to update `design.sealSize`.
5. **Scale Transformation**:
   - Apply a dynamic scale factor inline as a CSS custom property `--seal-scale` on the `.envelope-seal` wrapper in [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx).
   - Update [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) to apply `scale(var(--seal-scale))` for both standard and hover states, allowing smooth proportional scaling of the seal button and any custom stickers.

---

## Files to Modify

| File | Change |
|---|---|
| `src/types/sigil.types.ts` | Add `sealSize` option to the `InvitationDesign` interface. |
| `src/state/sigilStore.ts` | Add `sealSize` initialization in `DEFAULT_DESIGN`. |
| `src/components/creator/LeftPanel.tsx` | Remove the 4 upload slots and add the Seal Size slider. |
| `src/components/creator/InvitationStage.tsx` | Clean up rendering for `headerImage`, `frameImage`, and `paperImage`. |
| `src/components/creator/CreatorCanvas.tsx` | Remove background image binding of `paperImage`. |
| `src/components/creator/EnvelopeWrapper.tsx` | Bind the inline CSS variable `--seal-scale` to the seal wrapper. |
| `src/styles/creator.css` | Apply the scale CSS custom property to the `.envelope-seal` selector and its hover state. |

---

## Scope Constraints

- **In-Scope**:
  - Hiding the 4 upload panels from the editor sidebar and cleaning up their render scripts.
  - Creating a slider UI component for seal sizing.
  - Adjusting CSS transformations in the envelope cover viewport to support custom scale rendering.
- **Out-of-Scope**:
  - Resizing other canvas components via sliders (e.g. countdown text or itinerary titles).
  - Removing database attributes (to avoid migration requirements, we just leave them optional in types).
