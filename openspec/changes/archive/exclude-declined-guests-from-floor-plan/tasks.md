# Implementation Tasks: Exclude Declined Guests from Floor Plan

**Change ID:** `exclude-declined-guests-from-floor-plan`

- [x] 1. **Update Seating Utilities Defensive Validation**
  - [x] 1.1 Update `calculateSeatingStats` in `src/utils/floorPlanUtils.ts` to only count seats occupied by confirmed attendees.
  - [x] 1.2 Update `generateTableSeatingManifest` in `src/utils/floorPlanUtils.ts` to only mark seats as occupied if the occupant is in `confirmedAttendees`.
  - [x] 1.3 Add unit tests in `src/utils/floorPlanUtils.test.ts` for stats and manifest when tables contain declined/unconfirmed guest seats.

- [x] 2. **Auto-Vacate Seats on Guest Roster Mutations**
  - [x] 2.1 Update `updateInvitee` in `src/state/sigilStore.ts` to clear table seats when an invitee status changes to `RSVP_NO`.
  - [x] 2.2 Update `removeInvitee` in `src/state/sigilStore.ts` to clear table seats when an invitee is deleted.
  - [x] 2.3 Add unit tests in `src/state/floorPlanActions.test.ts` to verify auto-vacate on `updateInvitee` and `removeInvitee`.

- [x] 3. **Sanitize Table Rendering and Seat Assignment in Floor Plan View**
  - [x] 3.1 Update `FloorPlanView.tsx` to sanitize table seats against `confirmedAttendees` so declined guests render as vacant seats.
  - [x] 3.2 Update `SeatAssignmentModal.tsx` so an unconfirmed/declined occupant is not rendered as the active occupant.
  - [x] 3.3 Add component test in `src/components/floorplan/FloorPlanView.test.tsx` verifying declined guests do not appear on table seats.

- [x] 4. **Verification & Regression Testing**
  - [x] 4.1 Run `npm run test` to ensure all tests pass.
  - [x] 4.2 Run `npm run build` to verify type checking and bundle success.
