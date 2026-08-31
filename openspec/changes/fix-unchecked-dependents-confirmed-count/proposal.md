# Proposal: Fix Unchecked Dependents in Confirmed Guest Counts

## Problem
When a guest or host confirms an invitation (`RSVP_YES`) but unchecks one or more dependents (`included: false`), `DashboardStats` and `GuestHierarchyTreeView` incorrectly count and display those unchecked dependents as confirmed attendees. This leads to inaccurate headcount reports for catering and venue seating.

## Proposed Solution
1. In `DashboardStats.tsx` (`computeStats`), update the `attending` count logic so that for `RSVP_YES` entries, only dependents with `included === true` (or `included !== false`) are counted as attending.
2. In `GuestHierarchyTreeView.tsx`:
   - When filtering by `RSVP_YES` (Confirmed), only render and count dependents that have `included: true`.
   - Update `formatGuestHierarchyText` to support status-aware dependent filtering so plain-text exports of confirmed attendees only include checked dependents.
3. Update unit tests in `DashboardStats.test.ts` and `GuestHierarchyTreeView.test.tsx` to verify accurate headcount when dependents are partially checked/unchecked.

## Files to Create & Modify

| File Path | Purpose |
| --- | --- |
| `src/components/dashboard/DashboardStats.tsx` | Fix `computeStats` to only count `included: true` dependents in `attending` total |
| `src/components/dashboard/DashboardStats.test.ts` | Add unit tests for partial dependent attendance |
| `src/components/dashboard/GuestHierarchyTreeView.tsx` | Filter out unchecked dependents when viewing or copying `RSVP_YES` confirmed tree |
| `src/components/dashboard/GuestHierarchyTreeView.test.tsx` | Add unit tests for unchecked dependents in confirmed tree view |

## Scope Constraints
- **In-Scope**: Accurate headcount calculation in dashboard statistics and hierarchy tree view for partially attending parties.
- **Out-of-Scope**: Changing database schema or unconfirmed invitation states.
