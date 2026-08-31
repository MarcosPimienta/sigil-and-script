# Specification: Filter Guest Hierarchy Tree by Status

## Feature: Status Filtering in Guest Hierarchy Tree View
Allows event hosts to filter the hierarchical guest tree view by invitation/RSVP status to isolate confirmed attendees, pending invitations, or declined responses.

### Scenario: Filtering by status
- **GIVEN** a guest roster with guests having different statuses (`RSVP_YES`, `PENDING`, `OPENED`, etc.)
- **WHEN** the host selects the "Confirmed" (`RSVP_YES`) filter pill
- **THEN** only primary guests with status `RSVP_YES` and their dependents are displayed in the tree view
- **AND** the count indicator displays the filtered count relative to the total count.

### Scenario: Copying filtered tree hierarchy
- **GIVEN** the tree view is filtered by status (e.g. `RSVP_YES`)
- **WHEN** the host clicks "Copy as Text"
- **THEN** only the matching filtered guests and dependents are serialized and copied to the clipboard.

### Scenario: No matches for selected status filter
- **GIVEN** a guest roster with 0 guests in `RSVP_NO` status
- **WHEN** the host selects the "Declined" (`RSVP_NO`) filter pill
- **THEN** an empty state is displayed indicating that no guests match that status
- **AND** a button to clear the filter back to "All" is provided.
