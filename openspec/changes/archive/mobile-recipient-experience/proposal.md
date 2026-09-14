# Proposal: Mobile Recipient Experience & Fluid Envelope

**Change ID:** `mobile-recipient-experience`
**Created:** 2026-09-14
**Status:** Awaiting approval

## Problem

In digital invitation platforms like Sigil & Script, over **85–95% of guests open their invitations on mobile devices** via messaging apps (WhatsApp, iMessage, SMS) or QR codes. While the desktop experience is ornate and functional, the guest/recipient experience (`appMode: 'RECIPIENT'`) currently suffers from critical desktop-first constraints:

1. **Fixed Envelope Geometry & Overflow**:
   - The CSS class `.envelope-container` is locked to a fixed `width: 460px; height: 360px;`.
   - On standard smartphone screens (e.g. iPhone SE at 375px width, Android phones at 360px, or iPhone 14/15 at 390px), the envelope overflows the viewport width, causing unintentional horizontal scrolling, clipped envelope flaps, and off-center wax seals.
2. **Brittle Animation Transforms**:
   - The opening animation phase (`.phase-slideout .envelope-letter`) uses a hardcoded pixel translation (`transform: translateY(-290px) scale(1.05);`).
   - On short mobile displays or mobile browsers with dynamic navigation chrome (Safari URL bar / toolbar), `-290px` pushes the letter beyond the visible screen top or into browser header clipping.
3. **Missing Safe-Area & Viewport Handling**:
   - `index.html` specifies `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` without `viewport-fit=cover`.
   - As a result, bezel-less and notched devices (iPhone X through 16, modern Android flagships) do not allocate safe area padding, causing floating controls like the `AudioToggle` button and bottom scroll container content to collide with the home indicator bar.
4. **Accidental Sidebar Class Leaks in RSVP**:
   - The recipient RSVP component (`RecipientRsvpPanel.tsx`) wraps itself in `<aside className="left-panel">`, causing it to inherit `.left-panel`'s desktop styles (`width: 340px; flex-shrink: 0; border-right: 1px solid ...; z-index: var(--z-inspector);`). This forces an awkward fixed 340px box rather than a fluid, centered card layout.
5. **Touch & Ergonomic Gaps**:
   - Wax seals rely on desktop mouse hover effects. On mobile touchscreens, there is no tactile press feedback or haptic response.
   - Attendance buttons and dependent checkboxes lack standard minimum touch targets (44×44px per Apple HIG / WCAG 2.5.5), making thumb selection clumsy on mobile.
   - Countdown timer boxes and date numerals can wrap awkwardly on narrow viewports (< 360px).

## Proposed Solution

Deliver a fluid, mobile-first recipient invitation experience optimized for all phone screen sizes down to 320px, featuring tactile touch interactions and safe-area support:

### 1. Fluid Responsive Envelope
- **Aspect-Ratio & Dynamic Width**:
  - Replace fixed `460px` envelope width with `width: min(calc(100vw - 32px), 460px);`.
  - Use modern CSS `aspect-ratio: 460 / 360;` with `height: auto;` so flap geometry and proportions remain pixel-perfect at any viewport width.
- **Proportional Seal & Flap Scaling**:
  - Ensure the wax seal, monogram stamp, and envelope flaps scale smoothly without clipping or overflowing.
  - Scale typography on the unopened envelope subtitle and guest name smoothly using CSS `clamp()`.

### 2. Viewport-Relative Cinematic Opening Animation
- **Percentage-Based Slide**:
  - Transition the letter sliding animation from rigid `-290px` to viewport-safe translation (`translateY(-50%)` or `clamp(-260px, -45vh, -180px)`), keeping the sliding letter perfectly in-frame on both tall and compact phone screens.
- **Adaptive Centering & Scaling**:
  - During `LETTER_CENTERING` and `LETTER_SCALING`, guarantee the card scales to fill the viewport width while respecting margins (`width: min(calc(100vw - 24px), 440px)`).

### 3. Tactile Feedback & Touch Affordances
- **Physical Haptic Feedback**:
  - Leverage the Web Vibration API (`navigator.vibrate?.([30, 20, 50])`) when the guest taps the wax seal to crack it, delivering a tactile simulation of breaking physical wax on supported devices.
- **Touch Active States**:
  - Add explicit `:active` press effects (`transform: scale(0.96)`) and pulse animations to the wax seal to encourage intuitive tapping.

### 4. Safe Area Insets & Floating Audio Toggle
- **Viewport Meta Upgrade**:
  - Update `index.html` to `viewport-fit=cover`.
- **CSS Safe-Area Tokens**:
  - Expose `--safe-top`, `--safe-bottom`, `--safe-left`, `--safe-right` in `tokens.css`.
- **Protected Floating Controls**:
  - Anchor the floating `AudioToggle` button using `bottom: calc(24px + var(--safe-bottom, 0px))` and `right: calc(24px + var(--safe-right, 0px))` so it never overlaps the iOS home bar or bottom system navigation.
  - Add bottom padding to `.recipient-scroll-container` (`padding-bottom: calc(2.5rem + var(--safe-bottom, 0px))`).

### 5. Decoupled, Ergonomic RSVP Card
- **CSS Class Decoupling**:
  - Replace `<aside className="left-panel">` in `RecipientRsvpPanel.tsx` with `<div className="recipient-rsvp-card">`.
  - Provide a fluid, centered card structure (`width: 100%; max-width: 440px;`).
- **Touch Target Ergonomics**:
  - Expand attendance choice buttons ("Yes, gladly" / "No, regrettably") into large thumb-friendly touch targets with clear selected states.
  - Increase dependent checkbox hit areas to minimum 44px height for effortless toggling on mobile screens.

### 6. Section Stack Mobile Polishing
- Adjust `CountdownTimer.tsx`, `ItineraryTimeline.tsx`, and `GiftsRegistryPanel.tsx` padding and gap metrics to fit gracefully on narrow mobile displays (320px–375px) without horizontal clipping.

---

## Files to Create & Modify

| File | Status | Purpose |
|---|---|---|
| `index.html` | Modify | Add `viewport-fit=cover` to meta viewport for iPhone safe areas. |
| `src/styles/tokens.css` | Modify | Define `--safe-top`, `--safe-bottom`, `--safe-left`, `--safe-right` and mobile break tokens. |
| `src/styles/creator.css` | Modify | Implement fluid envelope sizing (`aspect-ratio`), responsive flap geometry, viewport-relative slide transforms, `:active` wax seal states, and `.recipient-rsvp-card` styles. |
| `src/components/creator/EnvelopeWrapper.tsx` | Modify | Add `navigator.vibrate` haptic feedback on wax seal crack and ensure touch event responsiveness. |
| `src/components/creator/RecipientRsvpPanel.tsx` | Modify | Decouple from `.left-panel`, expand touch targets for buttons and dependent checkboxes, add active press states. |
| `src/components/shared/AudioToggle.tsx` | Modify | Anchor floating position using `var(--safe-bottom)` and `var(--safe-right)`. |
| `src/components/creator/CountdownTimer.tsx` | Modify | Use responsive clamp gaps/padding to ensure 4 countdown units never wrap or clip on narrow screens. |

---

## Scope Constraints

### Explicitly In-Scope
- Guest/Recipient invitation screen (`appMode: 'RECIPIENT'`).
- Fluid envelope presentation and opening animation on all screen widths from 320px to 4K desktop.
- Touch interactions, haptics, and tap targets on wax seals and RSVP forms.
- Safe area inset handling for notch and home-indicator devices.
- Responsive scaling for recipient sections (countdown, itinerary, dress code, gifts, RSVP).

### Explicitly Out-of-Scope (Deferred to Later Phases)
- Host Creator Studio sidebar/canvas mobile split view (Phase 4).
- Host Mobile Navigation bar & Toolbar redesign (Phase 2).
- Guest Dashboard mobile card transformation (Phase 3).
- Floor Plan 2D canvas mobile gestures & companion list (Phase 5).
