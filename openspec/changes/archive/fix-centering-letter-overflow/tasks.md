## 1. Apply Overflow Boundaries
- [x] 1.1 Update [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) to add `overflow: hidden` to `.envelope-couple-photo` and `.envelope-letter-viewport-overlay.state-centering`.

## 2. Restrict Upscaled Font Styles
- [x] 2.1 Update [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) to prefix upscaled styles (lines 1674-1721) with `.envelope-letter-viewport-overlay:not(.state-centering)` instead of `.envelope-letter-viewport-overlay`.

## 3. Verification
- [x] 3.1 Run tests with `npm run test` to verify no compilation or test regressions.
- [x] 3.2 Run `npm run build` to confirm compilation.
