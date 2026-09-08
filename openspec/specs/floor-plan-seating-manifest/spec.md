# Specification: Floor Plan Seating Manifest & Guest Directory

**Spec ID:** `floor-plan-seating-manifest`
**Capability:** HOST tenant → Floor Plan Seating Manifest & Guest Association

## Requirements

### Requirement: Table Seating Manifest View (Banquet / Catering)

Hosts SHALL be able to view an organized manifest of all tables, displaying capacity, occupancy ratio, and a list of all seated guests and empty chairs.

#### Scenario: Viewing Table Seating Cards
- **WHEN** the host opens the Seating Manifest modal and selects the "By Table" tab
- **THEN** each table is displayed as a card showing its name, shape, total seats, count of seated guests, count of empty seats, and an ordered list of seat slots with assigned guest names.

#### Scenario: Distinguishing Primary Guests and Dependents
- **WHEN** a seated attendee is an included dependent or plus-one
- **THEN** the manifest entry displays a badge indicating they are a dependent and displays the primary invitee's name.

#### Scenario: Identifying Empty Seats
- **WHEN** a table has unassigned seats
- **THEN** those slots are explicitly marked as "Empty Seat" to facilitate banquet meal and seating adjustments.

---

### Requirement: Alphabetical Guest Seating Directory (Concierge / Usher)

Hosts SHALL be able to view an alphabetical directory of all confirmed attendees cross-referencing their assigned table and seat.

#### Scenario: Alphabetical A–Z Guest Lookup
- **WHEN** the host selects the "By Guest" tab
- **THEN** all confirmed attendees (`RSVP_YES` primaries and included dependents) are listed in alphabetical order by name with their assigned table name and seat number.

#### Scenario: Flagging Unassigned Guests
- **WHEN** a confirmed attendee has not been assigned to any table
- **THEN** their record displays an "Unassigned" status badge.

---

### Requirement: Real-Time Search Filtering

Hosts SHALL be able to filter tables and guests dynamically using a search input.

#### Scenario: Filtering by Guest Name
- **WHEN** the host types a guest's name into the search bar
- **THEN** the list filters in real time to show matching guests or tables containing matching guests.

#### Scenario: Filtering by Table Name
- **WHEN** the host types a table name (e.g. "Table 3") into the search bar
- **THEN** only tables matching the query are displayed in the "By Table" view.

---

### Requirement: Seating Manifest Export and Sharing

Hosts SHALL be able to export the manifest as a CSV spreadsheet, print a physical paper chart, or copy formatted text to the clipboard.

#### Scenario: Exporting CSV Spreadsheet
- **WHEN** the host clicks "Export CSV"
- **THEN** a file named `seating-manifest.csv` is downloaded with columns: `Table Name`, `Seat Number`, `Guest Name`, `Guest Type`, `Primary Contact`, `Seat Status`.

#### Scenario: Printing Seating Chart
- **WHEN** the host clicks "Print Chart"
- **THEN** `window.print()` is invoked with print-specific styles that hide user interface chrome (buttons, search inputs, modals) and render high-contrast, page-break-safe tables.

#### Scenario: Copying Plain Text Summary
- **WHEN** the host clicks "Copy Text"
- **THEN** a formatted plain-text summary of tables and their seated guests is copied to the system clipboard, accompanied by a confirmation toast.
