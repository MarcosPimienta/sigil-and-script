# Tasks: Filter Guest Hierarchy Tree by Status

- [x] 1. Add status filter logic and UI to `GuestHierarchyTreeView`
  - [x] 1.1 Add `statusFilter` state (`'ALL' | InvitationStatus`) and filter pills UI
  - [x] 1.2 Filter invitees based on selected status and update counts/copy text
  - [x] 1.3 Add empty state when no guests match the selected filter
- [x] 2. Update styles in `dashboard.css`
  - [x] 2.1 Style filter pills group, active state, and filter header layout
- [x] 3. Testing & Verification
  - [x] 3.1 Update unit tests in `GuestHierarchyTreeView.test.tsx` for status filtering
  - [x] 3.2 Run test suite to verify no regressions
