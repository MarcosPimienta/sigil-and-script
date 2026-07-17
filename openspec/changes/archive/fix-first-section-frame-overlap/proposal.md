# Proposal — Fix First Section Frame Overlap

## Problem
In the open invitation view (both creator preview and recipient view), the decorative double border frame is applied to the entire screen-wide viewport overlay container (`.envelope-letter-viewport-overlay`). Since the container is scrollable, as the user scrolls down, the fixed bottom border line of the frame scrolls up and cuts across the details sections (like the itinerary timeline), causing an ugly layout overlap.

## Proposed Solution
1. **Move Frame to First Section**: Move the double border frame from the overall viewport overlay container onto the first section (`.envelope-letter-header`) which wraps the main invitation text.
2. **Transition Support**: Apply relative positioning to the header, and implement the transition of `::after` on `.envelope-letter-header` so it animates smoothly when scaling up.
3. **Prevent Overlaps**: Since the double border is bound only to the header card, supplementary details sections (like the itinerary) sitting below the header will scroll naturally below the frame, with zero overlap.

---

## Files to Modify

| File | Change |
|---|---|
| `src/styles/creator.css` | Adjust the double border `::after` pseudo-element definitions and add relative positioning/height rules to `.envelope-letter-header`. |

---

## Scope Constraints

- **In-Scope**:
  - Restyling the viewport overlay double border frame to only wrap the first section (header).
  - Guaranteeing the transition animates smoothly when scaling up from the pocket envelope state.
- **Out-of-Scope**:
  - Changing the procedural borders on the creator canvas sheet (`InvitationStage`).
