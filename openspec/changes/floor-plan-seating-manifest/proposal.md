# Proposal: Floor Plan Seating Manifest & Guest Directory

**Change ID:** `floor-plan-seating-manifest`
**Created:** 2026-09-07
**Status:** Awaiting approval

## Problem

While hosts can design floor plans and assign guests to individual table seats in the interactive canvas, there is currently no centralized, exportable, or searchable view that associates people per table.

This creates critical operational friction during event execution:
1. **Banquet & Catering Operations Lack Table Roster**:
   - Venue captains, caterers, and waitstaff require a clean, table-by-table manifest showing who is sitting at each table, total occupancy per table, and available empty chairs.
2. **Door Ushers & Concierge Lack Alphabetical Guest Directory**:
   - When guests arrive at the reception, greeters need an alphabetical A–Z lookup by guest name to quickly tell guests which table (and seat number) they have been assigned to, without panning around a visual 2D canvas.
3. **No Export or Physical Printout**:
   - Hosts cannot download a `.csv` spreadsheet to share with wedding coordinators or print a physical seating chart to take to the venue.
4. **No Real-Time Search**:
   - Finding whether an individual guest is seated, or which table they belong to, currently requires opening individual tables one by one.

## Proposed Solution

Implement a comprehensive **Seating Manifest & Guest Directory** tool built into the Floor Plan view:

### 1. Data Processing Utilities (`src/utils/floorPlanUtils.ts`)
- `generateTableSeatingManifest(floorPlan, confirmedAttendees)`:
  - Generates structured table records containing table name, shape, capacity, occupied count, empty seat count, and an ordered list of seats with guest details (`name`, `isDependent`, `primaryInviteeName`).
- `generateGuestSeatingDirectory(floorPlan, confirmedAttendees)`:
  - Compiles an alphabetical directory of all confirmed attendees, cross-referencing their assigned table name and seat number (or marking them as `Unassigned`).
- `exportSeatingManifestCSV(tables, attendees, eventTitle)`:
  - Serializes the manifest into RFC 4180-compliant CSV format with columns: `Table Name`, `Seat Number`, `Guest Name`, `Guest Type`, `Primary Contact`, `Seat Status`.
  - Triggers browser download of `seating-manifest.csv`.
- `copySeatingManifestToClipboard(manifest)`:
  - Formats a clean plain-text summary suitable for pasting into messaging apps or emails.

### 2. Seating Manifest Modal (`src/components/floorplan/SeatingManifestModal.tsx`)
- **Dual-Mode View Switcher**:
  - **By Table (Banquet / Catering View)**: Table cards showing occupancy progress, seat numbers, guest names, plus-one/dependent tags, and empty seat indicators.
  - **By Guest (Concierge / Usher View)**: A–Z searchable table with instant lookup by guest name, status badge, and assigned table/seat.
- **Search & Filter**:
  - Live search bar that filters tables or guests instantly as the user types.
- **Summary Header**:
  - Shows total confirmed attendees, seated count, unseated count, and total tables.
- **Action Toolbar**:
  - `📥 Export CSV` button for spreadsheet generation.
  - `🖨️ Print Manifest` button with dedicated `@media print` CSS.
  - `📋 Copy Text` button with instant toast confirmation.

### 3. Header Action Integration (`src/components/floorplan/FloorPlanView.tsx`)
- Add a new `📜 Seating Manifest` action button to the Floor Plan header toolbar alongside the existing blueprint and table controls.

### 4. Print-Ready Styles (`src/styles/floorPlan.css`)
- Provide dedicated print styling that strips modals, backgrounds, and toolbars to generate clean, legible, multi-column printouts for clipboards and venue stands.

## Files to Create & Modify

| Action | Path | Purpose |
|---|---|---|
| **MODIFY** | `src/utils/floorPlanUtils.ts` | Add manifest data resolution, alphabetical directory generation, and CSV export utilities. |
| **NEW** | `src/components/floorplan/SeatingManifestModal.tsx` | Dual-view modal with search, table cards, guest directory table, and export actions. |
| **MODIFY** | `src/components/floorplan/FloorPlanView.tsx` | Add `📜 Seating Manifest` button and mount the manifest modal. |
| **MODIFY** | `src/styles/floorPlan.css` | Add manifest modal styling, search box, card layouts, table badges, and `@media print` rules. |
| **MODIFY** | `src/utils/floorPlanUtils.test.ts` | Unit tests for manifest grouping, alphabetical directory, and CSV generation. |

## Scope Constraints

- **In Scope**:
  - Associating all confirmed attendees with their assigned tables and seats.
  - Dual viewing modes: By Table and By Guest (Alphabetical).
  - Search filtering by guest name or table name.
  - CSV file export and plain-text clipboard copying.
  - High-contrast `@media print` layout for physical paper printing.
- **Out of Scope**:
  - Drag-and-drop reassignment inside the manifest modal (seating edits remain in `SeatAssignmentModal` on the canvas).
  - Multi-event seating schemes (each event has one floor plan config).
