# Implementation Tasks

- [x] 1. Type & Store Updates
  - [x] 1.1 Add `headerImageScale?: number;` to `InvitationDesign` in `src/types/sigil.types.ts`
  - [x] 1.2 Add `headerImageScale: 100` to `DEFAULT_DESIGN` in `src/state/sigilStore.ts`

- [x] 2. Component Updates
  - [x] 2.1 Update `LeftPanel.tsx`: label `upload-opened-envelope` as `Logo del Evento / Monograma (Envelope Logo)` with `openedEnvelopeImageScale` slider
  - [x] 2.2 Update `SectionEditor.tsx`: bind title image slot to `headerImage` and scale slider to `headerImageScale`
  - [x] 2.3 Update `InvitationStage.tsx`: render `headerImage` centered on stage scaled by `headerImageScale`

- [x] 3. Verification & Testing
  - [x] 3.1 Create test in `InvitationStage.test.tsx` verifying `headerImage` rendering and scaling
  - [x] 3.2 Run test suite `npm run test` and `npm run build` to confirm zero errors
