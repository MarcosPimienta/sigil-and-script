## 1. Relocate Border Frame styles
- [x] 1.1 Update [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) to move the viewport overlay's double border `::after` pseudo-element styling to `.envelope-letter-header::after`.
- [x] 1.2 Add `position: relative` and `height: 100%` (for centering) styling overrides for `.envelope-letter-header` under the appropriate state classes.

## 2. Verification
- [x] 2.1 Run tests with `npm run test` to verify no compilation or layout test regressions.
- [x] 2.2 Run `npm run build` to confirm compilation.
