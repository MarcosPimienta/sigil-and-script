# Proposal — Fix Rising Letter Clipping

## Problem
When the invitation letter slides up (rises) out of the envelope pocket during the opening transition, its top section (containing the host names "Oscar & Rocio") is cut off and clipped. This happens because the letter rises beyond the top boundary (`-150px`) of the `.envelope-pocket-clipper` container, which has `overflow: hidden`.

## Proposed Solution
1. **Extend Clipper Top Boundary**: Update the top inset value of `.envelope-pocket-clipper` in [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) from `-150px` to `-250px` to give the rising letter card sufficient vertical headroom to display its top section fully without any clipping.

---

## Files to Modify

| File | Change |
|---|---|
| `src/styles/creator.css` | Increase the top inset of `.envelope-pocket-clipper` to `-250px`. |

---

## Scope Constraints

- **In-Scope**:
  - Adjusting the pocket clipper inset values to prevent the letter card from being cut off at the top.
- **Out-of-Scope**:
  - Adjusting the letter card's dimensions or text sizes.
  - Modifying the bottom pocket boundary (to ensure bottom clipping remains intact).
