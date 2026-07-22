# Implementation Tasks

- [x] 1. SVG Recoloring Engine
  - [x] 1.1 Update `SvgColorImage.tsx`: implement `recolorSvg` parsing base64, data URLs, and remote SVG text

- [x] 2. View Color Binding
  - [x] 2.1 Update `EnvelopeWrapper.tsx`: pass `var(--paper-parchment, #f4ecd8)` to `SvgColorImage` in closed envelope header

- [x] 3. Verification & Testing
  - [x] 3.1 Update unit tests in `EnvelopeWrapper.test.tsx`
  - [x] 3.2 Run test suite `npm run test` and `npm run build` to confirm zero errors
