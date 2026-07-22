# Implementation Tasks

- [x] 1. Types & State Updates
  - [x] 1.1 Add `openedEnvelopeImageScale?: number;` to `InvitationDesign` in `src/types/sigil.types.ts`
  - [x] 1.2 Add `openedEnvelopeImageScale: 100` to `DEFAULT_DESIGN` in `src/state/sigilStore.ts`

- [x] 2. Component Updates
  - [x] 2.1 Update `SectionEditor.tsx`: rename label to `Título del Evento`, add `ImageUploadSlot` for `openedEnvelopeImage` & scale slider
  - [x] 2.2 Update `LeftPanel.tsx`: update label for `upload-opened-envelope` and add scale slider
  - [x] 2.3 Update `EnvelopeWrapper.tsx`: apply `openedEnvelopeImageScale` dynamic dimensions on `openedEnvelopeImage`

- [x] 3. Verification & Testing
  - [x] 3.1 Update unit tests in `EnvelopeWrapper.test.tsx` to verify title image scale rendering
  - [x] 3.2 Run test suite `npm run test` and `npm run build` to confirm clean build with zero errors
