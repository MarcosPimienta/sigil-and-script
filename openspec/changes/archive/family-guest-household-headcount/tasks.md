# Implementation Tasks: Treat Family Guests as Household Containers

**Change ID:** `family-guest-household-headcount`

- [x] 1. **Update Dashboard Headcount Statistics**
  - [x] 1.1 Update `getGuestCount` in `src/components/dashboard/DashboardStats.tsx` to return `depsCount > 0 ? depsCount : 1` for `guestType === 'FAMILY'`.
  - [x] 1.2 Update `getAttendingGuestCount` in `src/components/dashboard/DashboardStats.tsx` to return attending dependents for family entries.
  - [x] 1.3 Update `src/components/dashboard/DashboardStats.test.ts` to assert that adding a family of 2 yields 2 pending and 2 total guests.

- [x] 2. **Update Floor Plan & Seating Allocation**
  - [x] 2.1 Update `getConfirmedAttendees` in `src/utils/floorPlanUtils.ts` so family entries with dependents seat their members instead of adding an extra seat for the family title string.
  - [x] 2.2 Update `src/utils/floorPlanUtils.test.ts` to verify seating list matches family members count without ghost seats.

- [x] 3. **Update Tree View and Canvas Seat Calculations**
  - [x] 3.1 Update `totalCount` calculation in `src/components/dashboard/GuestHierarchyTreeView.tsx` to handle `guestType === 'FAMILY'`.
  - [x] 3.2 Update `reservedSeats` calculation in `src/components/creator/CreatorCanvas.tsx` to use `depsCount > 0 ? depsCount : 1` for family invitations.
  - [x] 3.3 Update `src/components/dashboard/GuestHierarchyTreeView.test.tsx` to verify total count for family entries.

- [x] 4. **Verification & Regression Testing**
  - [x] 4.1 Run `npm run test` to verify all client test suites pass.
  - [x] 4.2 Run `npm run build` to ensure typecheck and bundle succeed cleanly.
