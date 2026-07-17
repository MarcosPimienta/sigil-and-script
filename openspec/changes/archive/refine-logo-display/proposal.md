# Proposal — Refine Logo Display

## Problem
1. When an event logo image is uploaded, it is currently rendered as a medallion above the countdown timer in both host and recipient views, which the user wants removed.
2. In the opening slide-out card view, the uploaded event logo is clipped/cropped into a circle with z-index borders, whereas the user wants the uploaded image to display in its original aspect ratio (filling out the space) without circular cropping.

## Proposed Solution
1. **Remove Standalone Medallions**: Remove the "Event Logo Medallion" components from [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx) in both the Host Editor and Recipient/Guest views.
2. **Remove Circular Cropping on Uploaded Logo**: Update `renderLogoFace` in [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx) so that if `openedEnvelopeImage` exists, it renders as a clean image with `maxWidth: 220px` and `maxHeight: 280px` (preserving original aspect ratio and details), while keeping the circular monogram placeholder only as a fallback.

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/creator/CreatorCanvas.tsx` | Remove Event Logo Medallion render blocks (in both Recipient and Host views). |
| `src/components/creator/EnvelopeWrapper.tsx` | Adjust style of the uploaded event logo image to display at full size without circular clipping. |

---

## Scope Constraints

- **In-Scope**:
  - Removing standalone logo medallions from above the countdown timer.
  - Making the card-front logo image display without cropping.
- **Out-of-Scope**:
  - Modifying the monogram fallback design.
  - Modifying user logo upload handlers.
