# Proposal: Guest Hierarchy Tree View

## Problem
In the event dashboard, hosts and planners need a direct visual breakdown of primary guests and their associated dependents in an indented hierarchical list format. The current table view presents guests in tabular format where dependents are nested inside expand/collapse sub-rows across multiple columns. Hosts need a focused, read-only hierarchical tree view that clearly shows the family/party structure at a glance:
```text
|
|_ Guest 00
         |_ Dependent
         |_ Dependent
|
|_ Guest 01
```

## Proposed Solution
1. Introduce a view mode switcher (`[ ▦ Table View | 🌳 Tree View ]`) in `DashboardView`.
2. Create a dedicated `GuestHierarchyTreeView` component that renders primary guests and nested dependents using hierarchical branching lines and indentation.
3. Keep the display focused purely on guest and dependent names with clear tree structure and elegant typography matching the Sigil studio aesthetics.
4. Provide a quick "Copy as Text" button to allow hosts to copy the ASCII/plain text hierarchy to their clipboard for external notes, planners, or messaging.

## Files to Create & Modify

| File Path | Purpose |
| --- | --- |
| `src/components/dashboard/GuestHierarchyTreeView.tsx` | New component rendering hierarchical tree list of primary guests and dependents |
| `src/components/dashboard/GuestHierarchyTreeView.test.tsx` | Unit tests for tree rendering and dependent nesting |
| `src/components/dashboard/DashboardView.tsx` | Add view toggle (`table` vs `tree`) and render `GuestHierarchyTreeView` |
| `src/styles/dashboard.css` | Add styling and tree branch connector guides for the hierarchy layout |

## Scope Constraints
- **In-Scope**: Purely read-only tree presentation of guests and their dependents, view mode toggle in Dashboard, copy-to-clipboard ASCII helper, styling, and automated tests.
- **Out-of-Scope**: Mutating guest data from within the tree view (data mutations remain in the table view and creation forms) or modifying backend schemas.
