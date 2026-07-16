# Tasks — Cinematic Envelope Animation Fix

## 1. Type Definitions & State Integration
- [x] 1.1 Update `EnvelopeWrapperProps` onPhaseChange interface to support `'LETTER_CENTERING'` in [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx).
- [x] 1.2 Update the local `phase` state type definition in `EnvelopeWrapper.tsx`.
- [x] 1.3 Update the `envelopePhase` state type definition in [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx).

## 2. Animation Timeline
- [x] 2.1 Update `handleSealClick` sequence inside `EnvelopeWrapper.tsx` to include `LETTER_CENTERING` stage:
  - `LETTER_SLIDING` (1000ms) -> `LETTER_CENTERING` (600ms) -> `LETTER_SCALING` (800ms) -> `COMPLETED` (header slides up & details fade-in).
- [x] 2.2 Update `isViewportOverlayVisible` helper to be true during `LETTER_CENTERING`, `LETTER_SCALING`, and `FADING_OUT`.
- [x] 2.3 Pass class `state-centering` to the viewport overlay when the phase is `LETTER_CENTERING`.

## 3. Styles & Transitions
- [x] 3.1 Synchronize base styles between `.envelope-couple-photo` and `.envelope-letter-viewport-overlay` in [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) (aligning padding, border-radius, border, and shadows).
- [x] 3.2 Add `.state-centering` class and the `@keyframes letter-move-down` animation in `creator.css`.
- [x] 3.3 Ensure the transition parameters for `.state-scaled` and `.state-fade-out` are properly declared.

## 4. Verification & Testing
- [x] 4.1 Run unit tests with `npm test` and check for any regressions.
- [x] 4.2 Validate the animation visually in the browser via local server dev build.
