## 1. Remove Standalone Logo Medallions
- [x] 1.1 Remove the medallion render block in the Recipient View of [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx).
- [x] 1.2 Remove the medallion render block in the Host View of [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx).

## 2. Refine Card-Front Logo Layout
- [x] 2.1 Update `renderLogoFace` in [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx) to remove circular cropping, z-index padding, and borders, and adjust dimensions.

## 3. Verification
- [x] 3.1 Run tests with `npm run test` to verify no regressions.
- [x] 3.2 Run `npm run build` to confirm compilation.
