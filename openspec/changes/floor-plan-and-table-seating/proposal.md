# Proposal: Floor Plan & Table Seating Distribution

**Change ID:** `floor-plan-and-table-seating`
**Created:** 2026-09-03
**Status:** Awaiting approval

## Problem

In Sigil & Script, hosts can design invitations in the Creator Studio and manage RSVPs and attendees in the Guest Dashboard. However, there is no tool to arrange tables or organize seating for receptions, banquets, and gatherings:

1. **No Spatial Table Organization**: Hosts cannot visualize their reception space or define table arrangements (round banquet tables, square tables, or rectangular family/head tables).
2. **Disconnected Seating Logistics**: Even when guests confirm their attendance via RSVP (`RSVP_YES` primaries and checked dependents), hosts currently have to resort to external spreadsheets or manual paper notes to assign seats and tables.
3. **No Capacity Tracking**: Hosts cannot readily verify if they have enough seats for their confirmed guest count or see who has not yet been assigned to a table.

Hosts need an intuitive, dedicated **Floor Plan** tool outside of invitation design where they can configure tables, place them on a 2D floor map, and assign confirmed guests seat-by-seat.

## Proposed Solution

Introduce a dedicated **Floor Plan** view (`appMode: 'FLOOR_PLAN'`) with an interactive 2D map, table configurator, and guest seating manager:

### 1. Navigation & Access Points
- **Top-Level Mode (`appMode: 'FLOOR_PLAN'`)**:
  - Accessible directly from the main `Toolbar` alongside `Studio` and `Dashboard`.
  - Action button on each event card in `EventsHubView` (e.g. `[Edit Design] [Guests] [Floor Plan]`).
  - Quick-switch button in `DashboardView` header (`🗺️ Floor Plan`).
- Clean separation from invitation creation: does not clutter the card canvas while remaining tied to the active event.

### 2. Table Configuration & Geometry
- **Table Shapes**:
  - `round` (circular table with radial perimeter seats).
  - `square` (square table with seats evenly distributed across the 4 edges).
  - `rectangular` (long table with seats along sides and ends).
- **Customizable Capacity**:
  - Number of seats configurable from 2 up to 20 seats per table.
  - Table name / label (e.g. "Table 1", "Mesa de Honor", "Kids Table").
- **Interactive Positioning**:
  - Tables placed on a 2D blueprint grid map with draggable positioning and grid alignment.
  - Optional rotation (e.g. 0°, 45°, 90°) for rectangular and square tables.

### 3. Confirmed Guest Assignment
- **Attendee Resolution**:
  - Pulls confirmed attendees from `guestRoster.invitees`:
    - Primary invitees with `status === 'RSVP_YES'`.
    - Confirmed dependents where `dependent.included === true` (or `isDependentIncluded(d)`).
- **Seat Interactions**:
  - Visual status for each seat: vacant (dashed outline with seat number) vs. occupied (filled badge with guest initials and tooltip).
  - Clicking an individual seat opens a modal/popover allowing the host to:
    - Select and assign an unseated confirmed guest from a searchable dropdown/list.
    - View current occupant details.
    - Unseat or swap guest assignments.
- **Seating Sidebar & Statistics**:
  - Summary metrics banner: Total Confirmed Guests, Total Table Seats, Occupied Seats, and Unassigned Count.
  - Drawer / list of unassigned confirmed guests for rapid tracking.

### 4. Zero-Migration Persistence
- The floor plan state (`FloorPlanConfig`) is stored directly on `InvitationDesign.floorPlan`.
- Because `InvitationCanvas.designData` serializes the full design JSON into PostgreSQL, table layouts and seating assignments are automatically saved and loaded through the existing `/canvas` API endpoints with zero schema migrations.

## Files to Create & Modify

| File | Action | Purpose |
|---|---|---|
| `src/types/sigil.types.ts` | Modify | Add `'FLOOR_PLAN'` to `AppMode`; define `TableShape`, `FloorPlanSeat`, `FloorPlanTable`, `FloorPlanConfig`; add `floorPlan?: FloorPlanConfig` to `InvitationDesign`. |
| `src/utils/floorPlanUtils.ts` (+ test) | Create | Helper utilities for polar/perimeter seat coordinates calculation, confirmed guest attendee resolution (`getConfirmedAttendees`), and seating metrics calculation. |
| `src/state/sigilStore.ts` (+ test) | Modify | Floor plan store actions: `addFloorPlanTable`, `updateFloorPlanTable`, `removeFloorPlanTable`, `moveFloorPlanTable`, `assignFloorPlanSeat`, `unassignFloorPlanSeat`, `clearFloorPlanSeat`. |
| `src/components/floorplan/FloorPlanView.tsx` | Create | Top-level floor plan workspace with top controls bar, seating stats, canvas viewport, and unassigned guest sidebar. |
| `src/components/floorplan/FloorPlanCanvas.tsx` | Create | Interactive 2D map viewport rendering the floor grid, draggable tables, and seat nodes. |
| `src/components/floorplan/FloorPlanTableNode.tsx` | Create | Visual renderer for a single table (`round`, `square`, `rectangular`) with properly positioned perimeter seats and table label. |
| `src/components/floorplan/SeatAssignmentModal.tsx` | Create | Popover/dialog triggered on clicking a seat to assign an unseated confirmed guest or unseat an occupant. |
| `src/components/floorplan/AddTableModal.tsx` | Create | Dialog to configure new table: name, shape (`round`, `square`, `rectangular`), and number of seats ($2 - 20$). |
| `src/components/floorplan/UnassignedGuestsDrawer.tsx` | Create | Collapsible sidebar listing confirmed guests who haven't been assigned a seat. |
| `src/styles/floorPlan.css` | Create | Styling for floor plan canvas, table shapes, seat avatars, modals, and parchment grid aesthetics. |
| `src/App.tsx` | Modify | Route `appMode === 'FLOOR_PLAN'` to render `<Toolbar />` + `<FloorPlanView />`. |
| `src/components/creator/Toolbar.tsx` | Modify | Add `Floor Plan` navigation tab alongside `Studio` and `Dashboard`. |
| `src/components/events/EventsHubView.tsx` | Modify | Add "Floor Plan" action button to event cards. |
| `src/components/dashboard/DashboardView.tsx` | Modify | Add "Floor Plan" quick button in header actions. |

## Scope Constraints

### Explicitly In-Scope:
- `AppMode: 'FLOOR_PLAN'` navigation integration.
- Table configuration: `round`, `square`, and `rectangular` shapes with customizable seat counts (2–20).
- Drag-and-drop table positioning on a 2D floor grid.
- Seat-level click interaction to assign, swap, and unseat confirmed guests.
- Resolution of confirmed primary guests (`RSVP_YES`) and attending dependents (`included: true`).
- Real-time seating metrics (confirmed attendees vs. total seats vs. unassigned count).
- Full persistence within `InvitationDesign.floorPlan` via existing backend save/load endpoints.

### Out-of-Scope (Future Enhancements):
- Export to high-resolution PDF or printable seating chart poster.
- Structural room obstacles (dance floors, stages, DJ booths, columns, bar counters).
- Automatic algorithmic seating (e.g. AI-based family clustering).
