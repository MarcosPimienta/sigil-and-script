# Implementation Tasks: Align Family Guest Attendance and Headcount Calculations

**Change ID:** `align-family-guest-attendance-counts`

## 1. Statistics & Reserved Seats Unification
- [x] 1.1 In `src/components/dashboard/DashboardStats.tsx`, update `getGuestCount` and `getAttendingGuestCount` in `computeStats` to always count `1 + dependents`.
- [x] 1.2 In `src/components/creator/CreatorCanvas.tsx`, update `reservedSeats` to calculate `1 + depsCount` consistently.

## 2. Unit Tests & Verification
- [x] 2.1 Update `src/components/dashboard/DashboardStats.test.ts` expectations for family guest headcount calculations.
- [x] 2.2 Run unit test suite `npm test` to verify zero regressions across all components.
- [x] 2.3 Verify client production build `npm run build` succeeds without errors.
