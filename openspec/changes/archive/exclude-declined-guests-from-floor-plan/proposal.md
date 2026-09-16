# Proposal: Exclude Declined Guests from Floor Plan Seating and Headcounts

**Change ID:** `exclude-declined-guests-from-floor-plan`  
**Created:** 2026-09-16  
**Status:** Proposed  

## Problem

When a guest declines an invitation (`RSVP_NO`) or is marked as Declined in the Guest Dashboard, the **Floor Plan continues to display and count them as seated guests**:
1. **Persistent Table Seat Occupancy**:
   Table seats previously assigned to that guest retain `seat.assignedGuestId` and `seat.assignedGuestName`.
   The canvas table node (`FloorPlanTableNode.tsx`) renders the seat as green/occupied, displaying the declined guest's initials and tooltip.
2. **Distorted Seating Statistics**:
   `calculateSeatingStats` counts every seat with an `assignedGuestId` as seated, even if the guest has declined. As a result, `seatedCount` exceeds `totalConfirmed` or causes `unassignedCount` to miscalculate.
3. **Seating Manifest Inclusion**:
   In `SeatingManifestModal.tsx` (`generateTableSeatingManifest`), the "By Table" tab lists the declined guest occupying the seat.
4. **No Auto-Unseat on Status Change or Deletion**:
   When an invitee status changes to `RSVP_NO` in `updateInvitee`, when a dependent is unchecked/excluded, or when a guest is removed in `removeInvitee`, `floorPlan.tables` is not updated to clear their seat assignments.

## Proposed Solution

Ensure that declined guests (`RSVP_NO`) never occupy physical seats or distort seating metrics:

1. **Auto-Unseat in Store Mutations (`src/state/sigilStore.ts`)**:
   - In `updateInvitee`: If an invitee's status changes to `RSVP_NO`, automatically clear any seats assigned to that invitee ID or any of their dependent IDs.
   - In `removeInvitee`: Automatically clear any seats assigned to the deleted invitee or their dependents.
   - In `loadDesign`: Sanitize loaded table seats against the current confirmed attendees list so stale/declined occupants from past sessions are purged.
2. **Defensive Validation in Seating Utilities (`src/utils/floorPlanUtils.ts`)**:
   - `calculateSeatingStats`: Only count a seat in `assignedAttendeeIds` if `seat.assignedGuestId` belongs to a confirmed attendee in `confirmedAttendees`.
   - `generateTableSeatingManifest`: Only mark a seat as `isOccupied: true` if `seat.assignedGuestId` is present in `confirmedAttendees`.
3. **Canvas & Table Node Validation (`src/components/floorplan/FloorPlanTableNode.tsx`)**:
   - Verify seat occupancy against confirmed attendees (or ensure sanitized tables are passed down) so unconfirmed or declined occupants do not render as occupied chairs.
4. **Seat Assignment Modal (`src/components/floorplan/SeatAssignmentModal.tsx`)**:
   - If the current seat occupant is not a confirmed attendee, do not display them as an active occupant.

## Files to Create & Modify

| Action | Path | Purpose |
|---|---|---|
| **MODIFY** | `src/state/sigilStore.ts` | Automatically clear seat assignments when guests decline (`RSVP_NO`) or are removed, and sanitize on `loadDesign`. |
| **MODIFY** | `src/utils/floorPlanUtils.ts` | Update `calculateSeatingStats` and `generateTableSeatingManifest` to only count confirmed attendees. |
| **MODIFY** | `src/components/floorplan/FloorPlanTableNode.tsx` | Ensure table seat occupancy reflects confirmed attendees. |
| **MODIFY** | `src/components/floorplan/SeatAssignmentModal.tsx` | Validate current occupant against confirmed attendees. |
| **MODIFY** | `src/utils/floorPlanUtils.test.ts` | Add test cases verifying declined guests are excluded from seating stats and manifests. |
| **MODIFY** | `src/components/floorplan/FloorPlanView.test.tsx` | Add component test verifying declined guests do not occupy seats on the floor plan canvas. |

## Scope Constraints

- **In Scope**:
  - Automatically unseating guests when they decline or are removed.
  - Ensuring seating counts (`seatedCount`, `unassignedCount`) ignore declined guests.
  - Ensuring the Floor Plan canvas and Seating Manifest never show declined guests on seats.
- **Out of Scope**:
  - Changing invitation delivery status (`PENDING`, `SENT`, `OPENED`) logic.
  - Changing database schema.
