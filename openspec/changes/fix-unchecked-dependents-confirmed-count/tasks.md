# Tasks: Fix Unchecked Dependents in Confirmed Guest Counts

- [x] 1. Update `computeStats` in `DashboardStats.tsx`
  - [x] 1.1 Only count `included !== false` dependents toward `attending` count for `RSVP_YES` guests
  - [x] 1.2 Update unit tests in `DashboardStats.test.ts`
- [x] 2. Update `GuestHierarchyTreeView.tsx`
  - [x] 2.1 Filter out unchecked dependents when viewing or copying `RSVP_YES` confirmed tree
  - [x] 2.2 Update filtered headcount in summary banner
  - [x] 2.3 Update unit tests in `GuestHierarchyTreeView.test.tsx`
- [x] 3. Verification & Regression Testing
  - [x] 3.1 Run vitest test suite
  - [x] 3.2 Verify build passes
