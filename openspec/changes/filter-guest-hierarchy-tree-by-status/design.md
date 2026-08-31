# Design: Filter Guest Hierarchy Tree by Status

## Architectural Decisions

### 1. Local Filter State in `GuestHierarchyTreeView`
- **Decision**: Keep status filter state (`statusFilter: 'ALL' | InvitationStatus`) inside `GuestHierarchyTreeView`.
- **Reasoning**: Keeps the tree component self-contained and avoids polluting the global Sigil context or table sorting/filtering state.

### 2. Filter Controls UI
- **Decision**: Render a status pill selector in the header bar of the tree view alongside the copy button and total counts:
  - `All`
  - `✅ Confirmed` (`RSVP_YES`)
  - `⏳ Pending` (`PENDING`)
  - `📬 Opened` (`OPENED`)
  - `📤 Sent` (`SENT`)
  - `❌ Declined` (`RSVP_NO`)
- **Reasoning**: Quick 1-click access to common views (like confirmed attendees for catering or pending for follow-up).

### 3. Synchronization with Copy Utility
- **Decision**: Pass the filtered invitee array to `formatGuestHierarchyText` when copying to clipboard.
- **Reasoning**: Ensures what the user sees in the tree is exactly what is exported/copied.

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Zero matching guests for a chosen status | Render a specific empty message like `"No guests found with status: Confirmed"` and provide a quick button to reset to "All" |
| Filter pill wrapping on mobile screens | Use flex-wrap and responsive pill badge styling consistent with `dashboard.css` |
