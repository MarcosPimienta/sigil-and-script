# Tasks: Guest Hierarchy Tree View

- [x] 1. Create `GuestHierarchyTreeView` component
  - [x] 1.1 Implement hierarchical guest tree rendering with primary guests and nested dependents
  - [x] 1.2 Add "Copy as Text" button with clipboard feedback
  - [x] 1.3 Add empty state when roster is empty
- [x] 2. Update styles in `dashboard.css`
  - [x] 2.1 Add tree container, branch lines, and node indentation styles
  - [x] 2.2 Add view mode toggle button styles
- [x] 3. Integrate into `DashboardView`
  - [x] 3.1 Add `viewMode` state toggle (`table` vs `tree`)
  - [x] 3.2 Conditionally render table or `GuestHierarchyTreeView`
- [x] 4. Testing & Verification
  - [x] 4.1 Write unit tests in `GuestHierarchyTreeView.test.tsx`
  - [x] 4.2 Verify existing dashboard and reducer tests pass
