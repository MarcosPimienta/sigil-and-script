# Proposal: Render Toast Glass Icon Below Reception Title in Itinerary

## Problem
In the itinerary timeline component (`ItineraryTimeline.tsx`), the church icon is rendered below ceremony items, but reception items (`Recepción` / `Fiesta`) do not currently render an icon below their titles.

## Proposed Solution
1. Import `SvgColorImage` in `ItineraryTimeline.tsx`.
2. Render `/icons/toast-glass.svg` colored in crisp white (`#ffffff`) directly below itinerary items matching `Recepción`, `Recepcion`, `Fiesta`, or `Brindis`.

## Files to Modify
| File | Action | Purpose |
| --- | --- | --- |
| `src/components/creator/ItineraryTimeline.tsx` | Modify | Render `toast-glass.svg` icon below Reception itinerary titles |

## Scope Constraints
- In Scope: Displaying `toast-glass.svg` below Reception itinerary titles in white font color.
- Out of Scope: Altering other timeline items or styling.
