# Proposal — Cinematic Envelope Animation Fix

## Problem
Currently, the invitation transition snaps abruptly from the pocket position to the viewport scaling center, lacking a premium, continuous transition.

Specifically:
- During the `LETTER_SLIDING` phase, the invitation card slides up but stays inside the pocket clipper (`overflow: hidden`).
- When transitioning to `LETTER_SCALING`, the pocket letter is hidden, and the viewport overlay pops up at the center of the viewport. This results in a sudden jump.

We want a smoother cinematic transition:
1. The invitation slides up from the pocket.
2. It then moves down to the center of the viewport and in front of the envelope (no longer clipped).
3. It then scales up to cover the entire viewport.

## Proposed Solution
1. Add a new phase: `LETTER_CENTERING` between `LETTER_SLIDING` and `LETTER_SCALING`.
2. Render the viewport overlay during `LETTER_CENTERING` with a class `state-centering`.
3. In CSS, style `.state-centering` to run a 1000ms keyframe animation (`letter-move-down`) that starts at the slid-up position (`translate(-50%, -80%)` relative to the screen center) and animates down to the viewport center (`translate(-50%, -50%)`).
4. Ensure all layout, padding, font sizes, and borders match perfectly between the pocket letter and the viewport overlay to prevent any flicker.

## Files to Create & Modify

| File | Change |
| --- | --- |
| [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx) | Modify `EnvelopeWrapperProps` onPhaseChange phase list, state phase list, time transition logic, and rendering classes. |
| [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx) | Modify the `envelopePhase` state definition type to include `'LETTER_CENTERING'`. |
| [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) | Modify `.envelope-letter-viewport-overlay` styles to align with the pocket card, add `.state-centering` class and the `@keyframes letter-move-down` animation. |

## Scope Constraints
- **In-Scope**:
  - Updating the animation phase pipeline.
  - Adding the centering step and styling the viewport overlay's transitions.
  - Maintaining styling consistency during transitions to prevent flickers.
- **Out-of-Scope**:
  - Modifying the underlying data models or editor panels.
