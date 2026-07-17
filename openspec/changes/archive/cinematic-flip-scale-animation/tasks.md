## 1. Implement Card Faces in EnvelopeWrapper
- [x] 1.1 Render Event Logo (or monogram fallback) for the pocket letter `.envelope-couple-photo` in [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx).
- [x] 1.2 Implement the double-faced 3D flip card wrapper for the `LETTER_CENTERING` phase in [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx).
- [x] 1.3 Sync phase timers (increase `LETTER_CENTERING` timeout to `800ms`) in [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx).

## 2. Refine CSS Keyframe Animations
- [x] 2.1 Update `.envelope-letter-viewport-overlay.state-centering` and `@keyframes letter-move-down` in [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) to support 3D transforms, rotation, layout scale growth, and z-index.

## 3. Verification
- [x] 3.1 Run tests with `npm run test` to verify no regressions.
- [x] 3.2 Run `npm run build` to confirm compilation.
