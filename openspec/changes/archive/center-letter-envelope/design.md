# Design — Center Letter Envelope

## Architectural Decisions

### Decision 1: Conditional Flex Alignment
**Choice**: Use `justifyContent` conditional styling on `.recipient-scroll-container` inside `CreatorCanvas.tsx`.
**Why**:
- This is a highly declarative approach that leverages the existing `envelopePhase` state.
- When the invitation is closed or animating (`envelopePhase !== 'COMPLETED'`), the scroll container centers its contents vertically.
- When the invitation is fully open (`envelopePhase === 'COMPLETED'`), the scroll container reverts to `flex-start` (top alignment), allowing the guest to scroll down to view details (itinerary, RSVP form).

---

## Risks & Mitigations

### Risk 1: Sudden Layout Shifts / Jumps
- **Risk**: Changing the flex alignment from `center` to `flex-start` when the phase changes to `COMPLETED` could cause the screen content to jump.
- **Mitigation**: The full-viewport scaled letter copy (`.envelope-letter-viewport-overlay`) is positioned using `position: fixed` and sits on a higher z-index (9999). It completely covers the background elements during the scaling and complete phases, rendering any background flex alignment changes invisible to the user.
