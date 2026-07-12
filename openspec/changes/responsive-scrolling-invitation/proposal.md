# Proposal — Responsive Scrolling Invitation

## Problem
The current recipient preview renders a static single card next to the RSVP form on desktop. This design does not align with the premium responsive single-page scroll layout presented in the reference screens, which features:
1. An integrated opening cover (envelope/seal).
2. Scrolling sections (Countdown Timer, Detailed Timeline Itinerary, Dress Code with color circles, Gift Registry list, and a bottom Assist Confirmation).

## Proposed Solution
1. **Responsive Scroll Sheet**: Re-orchestrate the recipient view as a single scrolling sheet. Once the envelope opens, the container unrolls/scrolls downward showing stacked custom panels.
2. **Configurable Sections**: Expand the host control panel (`LeftPanel.tsx`) with editor cards to adjust:
   - Countdown Target date/time.
   - Itinerary Timeline records (custom events, times, names, links).
   - Dress Code (custom text labels and a theme color palette).
   - Gift Registry (registry message text and action link button).

---

## Files to Create

| File | Purpose |
|---|---|
| `src/components/creator/CountdownTimer.tsx` | Visual widget ticking down days, hours, and minutes dynamically. |
| `src/components/creator/ItineraryTimeline.tsx` | Timeline cards showing itineraries with location buttons. |
| `src/components/creator/DressCodePanel.tsx` | Displays dress code descriptors and wedding color circles. |
| `src/components/creator/GiftsRegistryPanel.tsx` | Gift list details and registry buttons. |

## Files to Modify

| File | Change |
|---|---|
| `src/types/sigil.types.ts` | Extend design specifications with itinerary arrays, countdown target, and color palette schemas. |
| `src/state/sigilStore.ts` | Add actions to update color palettes, add/remove itinerary timeline items, and save registry details. |
| `src/components/creator/LeftPanel.tsx` | Mount editor forms letting Event Hosts toggle and modify these sections. |
| `src/components/creator/CreatorCanvas.tsx` | Adapt the recipient viewport layout to center and flow the single scrollable sheet. |
