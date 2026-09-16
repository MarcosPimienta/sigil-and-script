# Proposal: Treat Family Guests as Household Containers for Headcount Calculations

**Change ID:** `family-guest-household-headcount`  
**Created:** 2026-09-16  
**Status:** Proposed  

## Problem

When a host adds a family of 2 in the guest management interface (`AddInviteeForm.tsx` in Family mode), the form prompts for:
1. **Family name** (e.g., *"Familia Gómez"*)
2. **Family Members / Household Dependents** (e.g., Member #1: *"Carlos"*, Member #2: *"Ana"*)

When saved, the Dashboard (`DashboardStats.tsx`) displays **3 Pending** (and **3 Guests**) instead of 2.

### Root Cause
In `DashboardStats.tsx`, `getGuestCount(i)` computes headcount using the formula `1 + (i.dependents?.length || 0)`.
For a family record:
- The family title string (`"Familia Gómez"`) is counted as `+1` primary guest.
- The two registered family members are counted as `+2` dependents.
- Total = $1 + 2 = 3$ pending guests.

Furthermore:
- In `FloorPlanView` (`floorPlanUtils.ts`), 3 physical seats are generated (one for `"Familia Gómez"`, one for `"Carlos"`, and one for `"Ana"`), placing an empty "family title" chair at the table.
- In `CreatorCanvas.tsx`, `reservedSeats` calculates `1 + depsCount = 3` seats for the invitation card.

## Proposed Solution

Treat `guestType === 'FAMILY'` as a household container whose named dependents represent the actual attendees:

1. **Dashboard Statistics (`src/components/dashboard/DashboardStats.tsx`)**:
   - For `guestType === 'FAMILY'`:
     - Total / Pending / Category headcount: returns `dependents.length > 0 ? dependents.length : 1`.
     - Attending count: returns `includedDependentsCount > 0 ? includedDependentsCount : (dependents.length > 0 ? 0 : 1)`.
   - For `guestType === 'INDIVIDUAL'`:
     - Preserves `1 + dependents.length` (primary guest + additional dependents).

2. **Floor Plan & Seating Chart (`src/utils/floorPlanUtils.ts`)**:
   - For `guestType === 'FAMILY'` with dependents:
     - Seats each confirmed family member from `dependents`.
     - Omits the abstract family title string from physical seat allocation.
   - For `guestType === 'INDIVIDUAL'` or family records with 0 dependents:
     - Seats the primary record and any included dependents.

3. **Tree View (`src/components/dashboard/GuestHierarchyTreeView.tsx`)**:
   - Calculates `totalCount` taking `guestType === 'FAMILY'` into account so tree totals match Dashboard stats.

4. **Creator & Recipient Canvas (`src/components/creator/CreatorCanvas.tsx`)**:
   - Sets `reservedSeats` for family invitations to `depsCount > 0 ? depsCount : 1`.

## Files to Create & Modify

| Action | Path | Purpose |
|---|---|---|
| **MODIFY** | `src/components/dashboard/DashboardStats.tsx` | Update `getGuestCount` and `getAttendingGuestCount` to treat families with dependents as containers. |
| **MODIFY** | `src/utils/floorPlanUtils.ts` | Update `getConfirmedAttendees` to seat family members rather than family title strings. |
| **MODIFY** | `src/components/dashboard/GuestHierarchyTreeView.tsx` | Align tree view headcount calculation with household container logic. |
| **MODIFY** | `src/components/creator/CreatorCanvas.tsx` | Set `reservedSeats` to count family members without double-counting family title. |
| **MODIFY** | `src/components/dashboard/DashboardStats.test.ts` | Update and add test cases for family headcount and pending counts. |
| **MODIFY** | `src/utils/floorPlanUtils.test.ts` | Update unit tests to verify seating allocation for family parties. |
| **MODIFY** | `src/components/dashboard/GuestHierarchyTreeView.test.tsx` | Update unit tests for family tree view counts. |

## Scope Constraints

- **In Scope**:
  - Headcount calculations for total, pending, opened, sent, attending, and declined across Dashboard, Floor Plan, Tree View, and Canvas.
  - Ensuring consistent counts across all components.
- **Out of Scope**:
  - Changing the database schema (Prisma already stores `guestType` and `dependents`).
  - Changing invitation title formatting (`formatGuestTitleName`), which continues to display *"Familia Gómez"*.
