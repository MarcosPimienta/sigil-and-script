# Proposal — Center Letter Envelope

## Problem
In the recipient invitation view, the closed envelope cover and its slide/open transition phases are positioned too high up on the screen (using default top alignment). The user wants the envelope to be vertically and horizontally centered on the viewport when it is closed and during its opening transition phases.

## Proposed Solution
1. **Vertical Centering in Flex Container**: In [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx), apply `justifyContent: 'center'` inline style on `.recipient-scroll-container` when in recipient mode and before the envelope transition is completed.
2. **Smooth Transitions**: Ensure that once the envelope transition completes and the full parchment invitation scales up, the scroll container reverts to `justifyContent: 'flex-start'` so the invitation details sections can scroll naturally from the top.

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/creator/CreatorCanvas.tsx` | Conditionally apply `justifyContent: 'center'` style to the recipient scroll container based on `isRecipient` and `envelopePhase !== 'COMPLETED'`. |

---

## Scope Constraints

- **In-Scope**:
  - Centering the envelope cover vertically and horizontally on the viewport in recipient view.
- **Out-of-Scope**:
  - Modifying the envelope animation timeline or phase durations.
  - Centering the host editor canvas view elements.
