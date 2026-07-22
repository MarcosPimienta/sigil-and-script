# Implementation Tasks

- [x] 1. Type & State Updates
  - [x] 1.1 Add `registryImageScale?: number;` to `InvitationDesign` interface in `src/types/sigil.types.ts`
  - [x] 1.2 Update `DEFAULT_DESIGN` in `src/state/sigilStore.ts` with `registryImageScale: 100`

- [x] 2. Component Updates
  - [x] 2.1 Update `GiftsRegistryPanel.tsx` to read `registryImageScale`, apply flexbox centering and scale calculation on `img`
  - [x] 2.2 Add slider for `registryImageScale` in `LeftPanel.tsx` under `Custom Artwork` section
  - [x] 2.3 Add slider for `registryImageScale` in `SectionEditor.tsx` under `Mesa de Regalos` section

- [x] 3. Verification & Testing
  - [x] 3.1 Create unit test in `src/components/creator/GiftsRegistryPanel.test.tsx` verifying centering & scaling
  - [x] 3.2 Run test suite `npm run test` and TypeScript check `npm run build` to confirm zero errors
