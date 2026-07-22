# Proposal: Count and Display Dependents Breakdown Across Dashboard and Roster

## Problem
While total guest counts include dependents, hosts want to clearly see the explicit count of dependents broken down separately across the dashboard stats and guest roster header (e.g. `X Guests (Y Dependents)`).

## Proposed Solution
1. **`DashboardStats.tsx`**: Update `computeStats` to compute `dependents` count separately, and update the statistics ribbon to display: `{total} Guests ({dependents} Dependents) · {attending} Attending...`.
2. **`GuestRosterPanel.tsx`**: Update the section header to display total guest headcount with explicit primary guest and dependent breakdown: `Guests ({totalGuestsCount}) ({primaryCount} primary, {dependentsCount} dependents)`.
3. **Unit Testing**: Update `DashboardStats.test.ts` to assert the `dependents` field in `computeStats`.

## Files to Modify
| File | Action | Purpose |
| --- | --- | --- |
| `src/components/dashboard/DashboardStats.tsx` | Modify | Add `dependents` count field to `computeStats` and display in ribbon |
| `src/components/creator/GuestRosterPanel.tsx` | Modify | Display explicit primary vs dependent breakdown in section header |
| `src/components/dashboard/DashboardStats.test.ts` | Modify | Assert `dependents` count in `computeStats` unit tests |

## Scope Constraints
- In Scope: Displaying explicit dependent counts in dashboard stats ribbon and roster panel heading.
- Out of Scope: Altering guest database schema.
