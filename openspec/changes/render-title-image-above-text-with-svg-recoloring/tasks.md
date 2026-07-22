# Implementation Tasks

- [x] 1. SvgColorImage Component
  - [x] 1.1 Create `src/components/common/SvgColorImage.tsx` handling SVG path font-color painting via `mask-image`

- [x] 2. Component Updates
  - [x] 2.1 Update `EnvelopeWrapper.tsx`: render `headerImage` above `{hostNames}` in both closed view header (`#ffffff`) and unfolded letter view (`#111111`)
  - [x] 2.2 Update `InvitationStage.tsx`: render `headerImage` above `tb-headline` block colored by text ink token (`var(--color-sepia-800)`)

- [x] 3. Verification & Testing
  - [x] 3.1 Update unit tests in `EnvelopeWrapper.test.tsx` and `InvitationStage.test.tsx`
  - [x] 3.2 Run test suite `npm run test` and `npm run build` to confirm zero errors
