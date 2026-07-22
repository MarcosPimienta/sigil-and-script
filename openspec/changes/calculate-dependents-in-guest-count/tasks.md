# Implementation Tasks

- [x] 1. Code Updates
  - [x] 1.1 Update `CreatorCanvas.tsx`: calculate `"Hemos reservado (X) cupos"` including `dependents`
  - [x] 1.2 Update `DashboardStats.tsx`: update `computeStats` to sum `1 + dependents.length` for all category totals
  - [x] 1.3 Update `GuestRosterPanel.tsx`: display total headcount including dependents in section header

- [x] 2. Verification & Testing
  - [x] 2.1 Update unit tests in `DashboardStats.test.ts`
  - [x] 2.2 Run test suite `npm run test` and `npm run build` to confirm zero errors
