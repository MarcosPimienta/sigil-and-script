# Proposal: Filter Guest Hierarchy Tree by Status

## Problem
In the event dashboard's Tree View, all guests in the roster are currently rendered regardless of their invitation/RSVP status (`PENDING`, `SENT`, `OPENED`, `RSVP_YES`, `RSVP_NO`). When preparing final catering counts, seating lists, or following up on unanswered invitations, hosts need to filter the tree view by status (e.g. view only confirmed attending guests or only pending guests) and copy just that filtered tree.

## Proposed Solution
1. Add a status filter selector / pill buttons to `GuestHierarchyTreeView` (`ALL`, `RSVP_YES`, `PENDING`, `OPENED`, `SENT`, `RSVP_NO`).
2. Dynamically filter the displayed primary guests based on the active status selection.
3. Update the tree counter and summary to reflect the filtered count and total count.
4. Ensure the **"📋 Copy as Text"** action serializes only the filtered subset of guests.
5. Display an informative empty state when no guests match the active status filter (e.g., *"No guests with status 'Confirmed' found"*).

## Files to Create & Modify

| File Path | Purpose |
| --- | --- |
| `src/components/dashboard/GuestHierarchyTreeView.tsx` | Add status filter state, filter controls, dynamic list filtering, and updated text serializer |
| `src/components/dashboard/GuestHierarchyTreeView.test.tsx` | Unit tests for status filtering, copy filtered list, and filtered empty state |
| `src/styles/dashboard.css` | Add styling for tree status filter pills and counts |

## Scope Constraints
- **In-Scope**: Status filtering in Tree View, filtered plain-text copy helper, filter pill UI, empty filter state, and automated tests.
- **Out-of-Scope**: Altering global roster data or modifying table view filters.
