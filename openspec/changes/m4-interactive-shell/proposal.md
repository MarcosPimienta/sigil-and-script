# Proposal — Milestone M4: Multi-Phase Envelope Animations & Ambient Audio Triggers

## Problem
The current recipient view mounts the invitation directly. This lacks premium physical animations (such as folding envelopes or custom seal breakage mechanics) and ambient sound design, which are crucial for creating high-end, wow-factor web invitations.

## Proposed Solution
Develop an **Interactive Shell** wrapping the invitation stage:
1. **Multi-Phase Envelope Animations**: Add a 3D HTML/CSS envelope component. On load, the envelope is closed. Clicking the wax seal breaks the seal, unfolds the envelope flap, and slides out the card.
2. **Ambient Audio Engine**: Play custom background atmosphere music upon envelope opening, complying with modern browser user-gesture autoplay requirements.
3. **Interactive Audio Toggle**: Render a floating control panel allowing guests to toggle sound effects and ambient volume at any time.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/components/creator/EnvelopeWrapper.tsx` | Animates the physical envelope foldings, wax seal breaking, and card slide-out transition. |
| `src/utils/audioEngine.ts` | HTML5 Web Audio synthesis/playback controller for ambient loops and click cues. |
| `src/components/shared/AudioToggle.tsx` | Floating micro-animated speaker icon showing active sound waves and toggle status. |

## Files to Modify

| File | Change |
|---|---|
| `src/App.tsx` | Nest the recipient card stage inside the interactive `EnvelopeWrapper`. |
| `src/styles/creator.css` | Define 3D transformation matrices, clipping shapes, and custom keyframes for the wrapper. |

---

## Scope Constraints

- **In-Scope**:
  - CSS 3D/clip-path envelope visual unfolding phases.
  - Interactive wax seal click trigger.
  - Sound synthesis or audio asset playback on user gesture.
  - Interactive volume control widgets.

- **Out-of-Scope**:
  - Full-screen video backgrounds (reserved for future phases).
