# Proposal — Fix Centering Letter Overflow

## Problem
During the invitation's opening transition, when the envelope letter slides out and centers on the screen (the `LETTER_CENTERING` phase), the text inside the letter wraps and overflows outside the card, rendering directly on the dark screen background. This happens because:
1. The giant, upscaled font-size styling (`4.2rem` for title, etc.) is applied to `.envelope-letter-viewport-overlay` universally, including during the `.state-centering` phase when the card is still small (260px wide by 340px tall).
2. The small letter card containers (`.envelope-couple-photo` and `.envelope-letter-viewport-overlay.state-centering`) lack `overflow: hidden` boundaries.

## Proposed Solution
1. **Restrict Upscaled Font Sizes**: Update the upscaled text selectors in [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) to target `.envelope-letter-viewport-overlay:not(.state-centering)` so that the small text styling is preserved while the card is small, and only scales up once the card scales up.
2. **Apply Overflow Boundaries**: Add `overflow: hidden` to `.envelope-couple-photo` and `.envelope-letter-viewport-overlay.state-centering` in [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) to prevent any content overflow during the small-card phases.

---

## Files to Modify

| File | Change |
|---|---|
| `src/styles/creator.css` | Restrict upscaled font styles using `:not(.state-centering)` and add `overflow: hidden` to the small card layouts. |

---

## Scope Constraints

- **In-Scope**:
  - Fixing layout/text overflow during the centering and sliding pocket phases of the animation.
- **Out-of-Scope**:
  - Changing the actual text block data or font sizes for the upscaled state.
