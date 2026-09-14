# Technical Design: Mobile Recipient Experience & Fluid Envelope

**Change ID:** `mobile-recipient-experience`
**Created:** 2026-09-14
**Status:** Awaiting approval

## 1. Architectural Decisions

### A. Fluid Aspect-Ratio vs. Fixed Dimension Geometry
- **Decision**: Replace fixed pixel widths/heights on `.envelope-container` and `.envelope-wrapper` with:
  ```css
  .envelope-container {
    width: min(calc(100vw - 32px), 460px);
    height: auto;
    aspect-ratio: 460 / 360;
    max-width: 460px;
  }
  ```
- **Rationale**:
  - The envelope has geometric flaps that meet precisely at the center where the wax seal sits. Using fixed width causes overflow on phones (< 460px), while using simple `width: 100%` without maintaining the 460:360 ratio distorts the diagonal clipping angles (`polygon(...)`).
  - By anchoring the container to `aspect-ratio: 460 / 360`, the diagonal angles and center intersection points remain strictly mathematical across all viewport sizes, from 320px up to full desktop.
- **Trade-off**: Requires modern CSS `aspect-ratio`, which is supported in 98%+ of mobile browsers (iOS Safari 15+, Chrome 88+, Firefox 89+).

### B. Viewport-Relative Sliding Animation
- **Decision**: Replace `transform: translateY(-290px)` with a responsive translation:
  ```css
  .phase-slideout .envelope-letter {
    transform: translateY(min(-240px, -55%)) scale(1.04);
  }
  ```
- **Rationale**: On smaller phone screens (e.g. 667px screen height like iPhone SE, or Android devices with visible system navigation), `-290px` can translate the top half of the letter off the screen or under the browser address bar. A percentage-based or clamped offset keeps the top of the letter in the visible center of the screen during the slide phase before viewport scaling commences.

### C. Physical Haptic Feedback via Vibration API
- **Decision**: In `handleSealClick` within `EnvelopeWrapper.tsx`, invoke:
  ```ts
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([25, 40, 30]);
    } catch {
      // Ignore if device or permissions policy rejects vibration
    }
  }
  ```
- **Rationale**:
  - Cracking a wax seal is a multi-sensory moment. The app already triggers custom crunch audio (`audioEngine.playCrack()`). Adding a crisp 3-pulse vibration simulates the physical fracture of the wax in the user's palm.
  - Wrapped in a feature detection try/catch so it executes silently as a progressive enhancement on Android/PWA browsers without throwing errors on iOS Safari (which ignores `navigator.vibrate` without failing).

### D. Safe Area Inset Management
- **Decision**: Configure `tokens.css` with safe area CSS variables:
  ```css
  :root {
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-left: env(safe-area-inset-left, 0px);
    --safe-right: env(safe-area-inset-right, 0px);
  }
  ```
  And anchor the floating `AudioToggle` and `.recipient-scroll-container` with these offsets.
- **Rationale**: Prevents interactive floating controls from being covered by the iOS Home Indicator bar or Android 3-button system navigation.

### E. Decoupling Recipient RSVP from Studio LeftPanel
- **Decision**: In `RecipientRsvpPanel.tsx`, eliminate the usage of `<aside className="left-panel">` and `.lp-inner`. Introduce a dedicated component style:
  ```css
  .recipient-rsvp-card {
    width: 100%;
    max-width: 440px;
    margin: 0 auto;
    background: var(--rsvp-card-bg, rgba(255, 255, 255, 0.03));
    border-radius: var(--radius-lg, 16px);
    padding: var(--space-6, 1.5rem);
    box-sizing: border-box;
  }
  ```
- **Rationale**: `.left-panel` was originally engineered as the 340px host sidebar for the desktop studio. Reusing it inside the recipient scroll flow inadvertently injected fixed widths (`width: 340px !important`), fixed border-rights, and unnecessary z-indexes into the public guest view.

---

## 2. Touch Target & Accessibility Guidelines

Per Apple Human Interface Guidelines and WCAG 2.5.5:
1. **Attendance Choice Buttons**:
   - Minimum target height: 48px.
   - Distinct visual state for selected vs unselected choices.
2. **Dependent Family Checkboxes**:
   - Minimum target area: 44×44px hit region for each dependent row.
   - Checkbox visual size: 20×20px with custom high-contrast accent.
3. **Submit Button**:
   - Full width (`width: 100%`), 48px height, clear `:active` press indentation.

---

## 3. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Desktop envelope appearance changes unexpectedly | The fluid rule uses `min(calc(100vw - 32px), 460px)` with `max-width: 460px`, ensuring desktops with screens >= 500px retain the exact 460px desktop rendering. |
| Mobile Safari audio autoplay blocking | Autoplay restrictions are already mitigated by triggering `audioEngine.setMute(false)` directly inside the wax seal `handleSealClick` user gesture handler. |
| iOS doesn't support `navigator.vibrate` | Safe guarded with `if ('vibrate' in navigator)` and `try/catch`. It functions purely as progressive enhancement for supporting platforms without affecting iOS. |
| Inset clipping on older mobile browsers without CSS `env()` | Fallback values are always specified: `var(--safe-bottom, 0px)`. |
