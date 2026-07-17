# Proposal — Use Custom Church Icon

## Problem
The church icon we added to the itinerary timeline needs to be replaced with a specific design provided by the user. Additionally, this custom SVG icon must be saved as a static asset in the public assets directory for future reuse and reference.

## Proposed Solution
1. **Save SVG Asset**: Save the custom-designed SVG representation of the church to [church.svg](file:///home/fenix3819/sigil-and-script/public/icons/church.svg).
2. **Update Timeline Component**: Replace the inline SVG component (`ChurchIcon`) in [ItineraryTimeline.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/ItineraryTimeline.tsx) with the new custom SVG code.

---

## Files to Modify

| File | Change |
|---|---|
| `public/icons/church.svg` | [NEW] Create the church SVG file with the user-provided design. |
| `src/components/creator/ItineraryTimeline.tsx` | Replace the old inline `ChurchIcon` SVG markup with the new design. |

---

## Scope Constraints

- **In-Scope**:
  - Writing the new SVG file to `public/icons/church.svg`.
  - Updating the inline SVG paths in `ItineraryTimeline.tsx` to match the custom church design.
- **Out-of-Scope**:
  - Changing the timeline logic itself (the conditional match on "Ceremonia Religiosa" remains unchanged).
