# Proposal: Align Family Guest Attendance and Headcount Calculations

**Change ID:** `align-family-guest-attendance-counts`
**Created:** 2026-09-08
**Status:** Awaiting approval

## Problem

A discrepancy exists between the attendee counts shown in different parts of the application for the exact same roster:
- The **Dashboard Header** (`DashboardStats.tsx`) displays **129 Attending**.
- The **Floor Plan** (`FloorPlanView.tsx`), **Seating Manifest** (`SeatingManifestModal.tsx`), and **Tree View** (`GuestHierarchyTreeView.tsx`) display **130 Confirmed Guests**.

### Root Cause
In `DashboardStats.tsx` (`computeStats`) and `CreatorCanvas.tsx`, entries with `guestType === 'FAMILY'` assume the primary invitee row name is merely an abstract household title (e.g., *"Familia Gómez"*), and thus deduct the primary person from the attending count whenever dependents exist (`includedDeps > 0 ? includedDeps : 1`).

However:
1. When hosts create a family party using the primary contact's real name (e.g., *"Marcos Pimienta"* with dependent *"Diana Patricia de Pimienta"*), `DashboardStats` completely omits the primary contact from the attending headcount, calculating only 1 attendee instead of 2.
2. In contrast, `floorPlanUtils.ts` (`getConfirmedAttendees`) and `GuestHierarchyTreeView.tsx` allocate a seat and count for every confirmed primary invitee plus each confirmed dependent (calculating 2 attendees).
3. If the Floor Plan were to adopt the `DashboardStats` formula, the primary contact would be removed from the seating chart entirely, leaving them without a seat at their own event.

## Proposed Solution

Unify the guest attendance and seat calculation logic across the application so that **every confirmed invitation row represents the primary guest (+1) and each confirmed dependent (+1)**, regardless of whether `guestType` is set to `'INDIVIDUAL'` or `'FAMILY'`:

1. **Dashboard Statistics (`src/components/dashboard/DashboardStats.tsx`)**:
   - Update `getGuestCount(i)`: Return `1 + (i.dependents?.length || 0)`.
   - Update `getAttendingGuestCount(i)`: Return `1 + includedDependentsCount`.
   - Every confirmed invitation counts the primary contact plus all attending dependents.
2. **Creator / Recipient Canvas (`src/components/creator/CreatorCanvas.tsx`)**:
   - Update `reservedSeats`: Return `1 + depsCount` consistently so both individual and family invitations allocate passes for the primary guest and all dependents.
3. **Unit Tests (`src/components/dashboard/DashboardStats.test.ts`)**:
   - Update test expectations to verify that family entries consistently count primary + dependents, maintaining 100% agreement with the Floor Plan and Tree View.

## Files to Create & Modify

| Action | Path | Purpose |
|---|---|---|
| **MODIFY** | `src/components/dashboard/DashboardStats.tsx` | Unify `getGuestCount` and `getAttendingGuestCount` to count primary + dependents. |
| **MODIFY** | `src/components/creator/CreatorCanvas.tsx` | Unify `reservedSeats` calculation to count primary + dependents. |
| **MODIFY** | `src/components/dashboard/DashboardStats.test.ts` | Update tests for unified headcount calculation. |

## Scope Constraints

- **In Scope**:
  - Unifying headcount and attending count formulas across `DashboardStats`, `CreatorCanvas`, `floorPlanUtils`, and `GuestHierarchyTreeView`.
  - Ensuring the Dashboard, Floor Plan, and Seating Manifest report matching numbers.
- **Out of Scope**:
  - Modifying invitation phrasing (`formatGuestTitleName`), which continues to use `guestType: 'FAMILY'` to format family titles (e.g. *"Familia Marcos Pimienta"*).
  - Changing database schemas or API contracts.
