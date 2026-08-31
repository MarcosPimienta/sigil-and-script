# Specification: Guest Hierarchy Tree View

## Feature: Guest Hierarchy Tree View
Allows event hosts to view their entire guest roster in a visual and copyable hierarchical tree representation showing primary guests and their dependents.

### Scenario: Viewing guests in hierarchical tree mode
- **GIVEN** a guest roster containing primary guests with and without dependents
- **WHEN** the host switches the dashboard view toggle to "Tree View"
- **THEN** the dashboard renders the `GuestHierarchyTreeView` component
- **AND** each primary guest is displayed as a root branch node
- **AND** all dependents under that guest are displayed indented beneath the primary guest.

### Scenario: Copying the tree view as plain text
- **GIVEN** the host is viewing the guest hierarchy tree
- **WHEN** the host clicks "Copy as Text"
- **THEN** the formatted plain-text hierarchy string is copied to the clipboard
- **AND** temporary feedback confirmation ("Copied!") is shown.

### Scenario: Empty roster
- **GIVEN** an empty guest roster with 0 invitees
- **WHEN** viewing the tree view
- **THEN** an empty state message is shown instructing the host to add guests.
