# Proposal: Include Dependents in Guest Count Calculations

## Problem
Currently, guest counts across the application (such as total guests in `DashboardStats`, `GuestRosterPanel`, and the reserved pass count message `"Hemos reservado (X) cupos"`) count only primary invitation records or rely exclusively on `additionalGuests`. When an invitation includes dependents (family members / plus-ones), they are omitted from the total guest count.

## Proposed Solution
1. **Guest Pass Reservation Message**: Calculate total reserved passes as `1 + Math.max(additionalGuests.length, dependents.length)` so dependents are counted towards total allocated seats (`"Hemos reservado (X) cupos para ti"`).
2. **Dashboard Statistics (`DashboardStats.tsx`)**: Update `computeStats` to sum `1 + (invitee.dependents?.length || 0)` for total guests, attending guests, declined guests, opened, sent, and pending counts.
3. **Guest Roster Section Heading (`GuestRosterPanel.tsx`)**: Update section header to display total guest headcount: `Guests ({totalGuestsCount})` where `totalGuestsCount` sums primary guests and their dependents.

## Files to Modify
| File | Action | Purpose |
| --- | --- | --- |
| `src/components/creator/CreatorCanvas.tsx` | Modify | Count dependents in `"Hemos reservado (X) cupos"` calculation |
| `src/components/dashboard/DashboardStats.tsx` | Modify | Include dependents in `computeStats` breakdown totals |
| `src/components/creator/GuestRosterPanel.tsx` | Modify | Display total guest count including dependents in section header |
| `src/components/dashboard/DashboardStats.test.ts` | Modify | Update unit tests to verify dependents are included in stats |

## Scope Constraints
- In Scope: Guest count calculations in preview reservation strings, dashboard stats, and guest roster panel.
- Out of Scope: Altering RSVP database schema or authentication routes.
