## 1. Update Invitation Design Types and Store Defaults
- [x] 1.1 Add optional `sealSize: number` to `InvitationDesign` in [sigil.types.ts](file:///home/fenix3819/sigil-and-script/src/types/sigil.types.ts#L115).
- [x] 1.2 Initialize `sealSize` to `75` in the default store state inside [sigilStore.ts](file:///home/fenix3819/sigil-and-script/src/state/sigilStore.ts#L68).

## 2. Prune Custom Image Assets from LeftPanel and Add Sizing Slider
- [x] 2.1 Update [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx#L164) to remove the upload slots for `headerImage`, `frameImage`, `paperImage`, and `closedEnvelopeImage`.
- [x] 2.2 Add the Seal Size range slider in [LeftPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/LeftPanel.tsx#L216) below the sticker image upload slot, bound to `sealSize`.

## 3. Remove Render Logic for Pruned Assets
- [x] 3.1 Modify [InvitationStage.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/InvitationStage.tsx#L283) to remove layout styles and tags for `headerImage`, `frameImage`, and `paperImage`.
- [x] 3.2 Update [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx#L54) to remove background-image styling for `paperImage`.

## 4. Implement Dynamic Wax Seal Sizing
- [x] 4.1 Update [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx#L116) to inject `--seal-scale` inline CSS variable based on `design.sealSize`.
- [x] 4.2 Update [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css#L934) to apply the variable scale to `.envelope-seal` and its `:hover` state.

## 5. Verification
- [x] 5.1 Run unit tests with `npm run test` to verify no regressions.
- [x] 5.2 Run `npm run build` to confirm compiling.
