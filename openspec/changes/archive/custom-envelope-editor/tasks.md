# Tasks — Custom Envelope Editor

## 1. Types and Store Setup
- [x] 1.1 Add `envelopeCoverClosedImage?: string;` and `envelopeCoverOpenedImage?: string;` to `InvitationDesign` in [src/types/sigil.types.ts](file:///home/fenix3819/sigil-and-script/src/types/sigil.types.ts).
- [x] 1.2 Include both fields in `imageFields` list inside `saveDesignToServer` in [src/state/sigilStore.ts](file:///home/fenix3819/sigil-and-script/src/state/sigilStore.ts).

## 2. Localization & Upload Utilities
- [x] 2.1 Register `envelopeCoverClosedImage` and `envelopeCoverOpenedImage` in `TRANSPARENT_FIELDS` in [src/components/creator/uploadHelpers.ts](file:///home/fenix3819/sigil-and-script/src/components/creator/uploadHelpers.ts).
- [x] 2.2 Add localized strings (EN & ES) for `styleEnvelopeClosedCover`, `styleEnvelopeClosedCoverHint`, `styleEnvelopeOpenedCover`, and `styleEnvelopeOpenedCoverHint` in [src/components/creator/panel/panelStrings.ts](file:///home/fenix3819/sigil-and-script/src/components/creator/panel/panelStrings.ts).

## 3. Editor UI Controls
- [x] 3.1 In [src/components/creator/panel/StyleTab.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/panel/StyleTab.tsx), add two `ImageUploadSlot` components inside the `styleEnvelopeGroup` for:
  - Closed envelope cover (`envelopeCoverClosedImage`)
  - Opened envelope cover (`envelopeCoverOpenedImage`)
- [x] 3.2 Ensure `onClear` triggers `updateDesign({ envelopeCoverClosedImage: undefined })` and `updateDesign({ envelopeCoverOpenedImage: undefined })`.

## 4. Envelope Rendering
- [x] 4.1 In [src/components/creator/EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx), dynamically resolve the closed envelope image:
  `src={design.envelopeCoverClosedImage || design.closedEnvelopeImage || '/ClosedEnvelope00.png'}`.
- [x] 4.2 In [src/components/creator/EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx), dynamically resolve the opened envelope image:
  `src={design.envelopeCoverOpenedImage || '/OpenedEnvelope00.png'}`.

## 5. Sharing & Metadata
- [x] 5.1 In [server/src/controllers/inviteController.ts](file:///home/fenix3819/sigil-and-script/server/src/controllers/inviteController.ts), update `getClosedEnvelopeImageUrl` to check `data.envelopeCoverClosedImage` first.
- [x] 5.2 In [api/invite.js](file:///home/fenix3819/sigil-and-script/api/invite.js), check `data.envelopeCoverClosedImage` when building OG cards.

## 6. Verification & Automated Tests
- [x] 6.1 Update or add unit tests in [src/components/creator/EnvelopeWrapper.test.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.test.tsx) to verify custom closed/opened envelope images render with fallback.
- [x] 6.2 Run test suite (`npm test`) and typecheck to verify no regressions.
