# Proposal — Cinematic Flip and Scale Animation

## Problem
The user wants to refine the envelope opening transition sequence:
1. When the letter slides up (rises) out of the pocket envelope, it should display the event logo image (or a stylized couple initials monogram fallback).
2. When the letter reaches the top, it should perform a 3D flip to show the invitation details/text, and simultaneously move down to the center and scale/expand to full-screen.

## Proposed Solution
1. **Logo Front Face**: Update the small pocket letter `.envelope-couple-photo` in [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx) to render the Event Logo Image (or a high-quality initials monogram).
2. **3D Flip Card Layout**: Introduce a conditional 3D flip card layout within `.envelope-letter-header` during the `LETTER_CENTERING` phase.
3. **Unified Keyframe Animation**:
   - Update `@keyframes letter-move-down` in [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) to animate translation, scale expansion (to full screen), and a 180-degree `rotateY` flip over `0.8s`.
   - Update `transform-style: preserve-3d` and `perspective` rules on `.envelope-letter-viewport-overlay.state-centering`.
4. **Coordinate Timings**: Update the `LETTER_CENTERING` phase timeout in [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx) from `600ms` to `800ms` to sync with the new animation.

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/creator/EnvelopeWrapper.tsx` | Render logo face for pocket letter, implement conditional 3D flip layout, and increase timeout to 800ms. |
| `src/styles/creator.css` | Animate layout, translation, and rotation in `@keyframes letter-move-down`, extend animation duration to `0.8s`, and enable 3D perspective. |

---

## Scope Constraints

- **In-Scope**:
  - Implementation of the event logo/monogram front-side projection.
  - Adding 3D rotation (rotateY) and scaling down/up inside the unified centering keyframe transition.
- **Out-of-Scope**:
  - Modifying other static page views or the RSVP logic.
