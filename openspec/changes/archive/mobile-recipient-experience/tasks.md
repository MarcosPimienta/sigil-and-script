# Implementation Tasks: Mobile Recipient Experience & Fluid Envelope

**Change ID:** `mobile-recipient-experience`
**Created:** 2026-09-14
**Status:** Awaiting approval

## Tasks

- [x] **1. Viewport & Safe-Area Foundation**
  - [x] 1.1 Update `index.html` viewport meta tag to include `viewport-fit=cover`.
  - [x] 1.2 Define `--safe-top`, `--safe-bottom`, `--safe-left`, `--safe-right` in `src/styles/tokens.css`.
  - [x] 1.3 Update `src/components/shared/AudioToggle.tsx` position with safe-area bottom and right offsets.

- [x] **2. Fluid Envelope Geometry & Mobile Animations**
  - [x] 2.1 Update `.envelope-wrapper` and `.envelope-container` in `src/styles/creator.css` to use `width: min(calc(100vw - 32px), 460px)` and `aspect-ratio: 460 / 360`.
  - [x] 2.2 Refine envelope flap polygons and borders to scale proportionally without clipping.
  - [x] 2.3 Adjust `.phase-slideout .envelope-letter` translateY animation to use viewport-relative calculation.
  - [x] 2.4 Add `:active` touch feedback styling to `.envelope-seal` and `.wax-seal-btn`.
  - [x] 2.5 In `src/components/creator/EnvelopeWrapper.tsx`, add `navigator.vibrate` haptic feedback on wax seal crack.

- [x] **3. Recipient RSVP Card Ergonomics & Decoupling**
  - [x] 3.1 In `src/components/creator/RecipientRsvpPanel.tsx`, remove `<aside className="left-panel">` and replace with `.recipient-rsvp-card`.
  - [x] 3.2 Create `.recipient-rsvp-card` styles in `src/styles/creator.css` with fluid 100% width (up to 440px) and centered padding.
  - [x] 3.3 Expand attendance choice buttons ("Yes, gladly" / "No, regrettably") with minimum 44px touch height and clear touch feedback.
  - [x] 3.4 Expand dependent family checkboxes with minimum 44px touch targets and padding.
  - [x] 3.5 Ensure submit button and input fields provide full-width thumb-friendly styling.

- [x] **4. Responsive Section Stack Polishing**
  - [x] 4.1 Update `src/components/creator/CountdownTimer.tsx` gap and padding to fit 320px–375px screens without number wrapping.
  - [x] 4.2 In `src/components/creator/CreatorCanvas.tsx`, update `.recipient-scroll-container` to include safe area bottom padding.
  - [x] 4.3 Verify `ItineraryTimeline`, `DressCodePanel`, and `GiftsRegistryPanel` scale smoothly on 360px viewport widths.

- [x] **5. Verification & Testing**
  - [x] 5.1 Run test suite (`npm run test`) to verify no regressions in existing tests.
  - [x] 5.2 Build project (`npm run build`) to ensure type safety and bundling pass.
  - [x] 5.3 Verify recipient opening animation, wax seal haptic integration, and RSVP form in mobile viewport emulation (375px, 390px, 414px).
