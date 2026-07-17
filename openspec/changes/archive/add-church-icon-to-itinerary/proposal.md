# Proposal — Add Church Icon to Itinerary

## Problem
In the invitation design, under the itinerary section, the first event is "Ceremonia Religiosa" (Religious Ceremony). The user wants to add a church icon directly below this specific itinerary item's title in the timeline to emphasize its religious nature and align with high-end invitation aesthetics.

## Proposed Solution
1. **Design a Church SVG Icon**: Create a simple, clean, and elegant vector outline of a church with a steeple, a cross, walls, a rose window, and an arched entryway.
2. **Conditional Rendering in Timeline**: In [ItineraryTimeline.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/ItineraryTimeline.tsx), check if the current itinerary item is a "Ceremonia Religiosa" (case-insensitive and containing both words or matching the title). If so, render the custom `ChurchIcon` right below the item's title and above its location details.
3. **Styling Integration**: Ensure the SVG matches the style of the timeline component, with white strokes, a transparent background, and appropriate margins/scaling to look premium and centered.

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/creator/ItineraryTimeline.tsx` | Define the `ChurchIcon` component and render it conditionally under the item title for "Ceremonia Religiosa". |

---

## Scope Constraints

- **In-Scope**:
  - Designing a highly polished SVG representation of a church.
  - Adding logic in the rendering loop of `ItineraryTimeline` to detect "Ceremonia Religiosa" items and insert the icon.
- **Out-of-Scope**:
  - Adding icons to other itinerary items like "Recepción" (unless requested later).
  - Storing icon mappings or custom image uploads for itinerary items in the database.
