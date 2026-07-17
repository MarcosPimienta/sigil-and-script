# Design — Fix First Section Frame Overlap

## Architectural Decisions

### Decision 1: Relocating the Pseudo-Element
**Choice**: Apply the double border to `.envelope-letter-header::after` instead of `.envelope-letter-viewport-overlay::after`.
**Why**:
- Keeps the layout simple and relies entirely on declarative CSS.
- Automatically ensures the double border scales and scrolls alongside the invitation text card.
- Isolates supplementary blocks (like the itinerary timeline) from the double border styling.

---

## Risks & Mitigations

### Risk 1: Broken pocket transition
- **Risk**: In the pocket envelope view (`state-centering`), the letter is small. If the header component doesn't fill the parent height, the border might shrink or distort.
- **Mitigation**: Add `height: 100%` and `box-sizing: border-box` to `.envelope-letter-header` when the parent has the `.state-centering` class, ensuring the border perfectly matches the small card envelope dimensions.
