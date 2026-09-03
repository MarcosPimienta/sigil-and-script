# Design: Floor Plan & Table Seating Distribution

**Change ID:** `floor-plan-and-table-seating`

## Architectural Decisions

### 1. Dedicated Top-Level Mode (`appMode: 'FLOOR_PLAN'`)
- **Context**: Floor planning and seating chart arrangement require substantial visual canvas area to accommodate multi-table layouts, zoom/pan navigation, and an unassigned guest drawer.
- **Decision**: Introduce `'FLOOR_PLAN'` to `AppMode` in `src/types/sigil.types.ts`. Like `DASHBOARD`, it renders within `App.tsx` alongside the standard `<Toolbar />`.
- **Alternatives Considered**:
  - *Tab within `DashboardView`*: Dashboard already contains large tables, CSV ingestion buttons, and header stats. Nesting a 2D interactive canvas inside the dashboard creates competing scroll containers and a cramped user experience.
  - *Modal over Creator Canvas*: Too constrained for arranging 10+ banquet tables.
- **Trade-offs**: Requires updating `Toolbar.tsx`, `App.tsx`, and `EventsHubView.tsx`, but provides the cleanest user experience and keeps concerns properly separated.

### 2. Zero-Migration Persistence in `InvitationDesign.floorPlan`
- **Context**: Tables and seat assignments are specific to an event canvas.
- **Decision**: Store the seating model directly as an optional `floorPlan?: FloorPlanConfig` field on `InvitationDesign`.
- **Reasoning**:
  - `InvitationCanvas.designData` in PostgreSQL stores the complete JSON representation of `InvitationDesign`.
  - When a host clicks "Save Layout" (or auto-saves batch changes), `floorPlan` is serialized and sent to `/canvas` automatically.
  - No database migration or Prisma client regeneration is required.
  - Legacy invitations without a floor plan gracefully default to `{ tables: [] }`.

### 3. Confirmed Attendee Resolution & Single-Seat Invariant
- **Context**: An event roster contains primary invitees and dependent guests with various RSVP statuses (`PENDING`, `SENT`, `OPENED`, `RSVP_YES`, `RSVP_NO`).
- **Decision**:
  - Pure utility function `getConfirmedAttendees(guestRoster.invitees)` resolves:
    1. Primary invitees with `status === 'RSVP_YES'`.
    2. Dependents within confirmed invitees where `dependent.included === true` (or `isDependentIncluded(d)`).
  - Each individual attendee is assigned a unique attendee ID:
    - Primary guest: `attendeeId = invitee.id`
    - Dependent: `attendeeId = dependent.id` (with reference to `primaryInviteeId = invitee.id`).
  - **Single-Seat Invariant**: When an attendee is assigned to a seat, any previous seat occupied by that same attendee across all tables is automatically cleared first. This prevents accidentally duplicating a guest across multiple tables.

### 4. Mathematical Geometry for Table Shapes
- **Context**: Tables must support 3 distinct shapes (`round`, `square`, `rectangular`) with dynamic seat counts ($2 - 20$).
- **Decision**:
  - **Round Tables**:
    - Central circle with radius $R$ proportional to seat count.
    - Seat centers placed using polar coordinates:
      $$\theta_i = \frac{2\pi \cdot i}{N} - \frac{\pi}{2}$$
      $$x_i = cx + (R + \text{seatOffset}) \cdot \cos(\theta_i)$$
      $$y_i = cy + (R + \text{seatOffset}) \cdot \sin(\theta_i)$$
  - **Square Tables**:
    - Central square. Seats are distributed as evenly as possible across the 4 perimeter edges (top, right, bottom, left).
  - **Rectangular Tables**:
    - Central rounded rectangle with width scaling with seat count.
    - Seats distributed along the top and bottom edges, with head/foot seats on left and right for larger tables.
  - **Seats**:
    - Rendered as interactive circular nodes ($36\text{px}$ diameter) around the table perimeter, showing seat number or guest avatar/initials.

### 5. Drag-and-Drop Interaction Model
- **Context**: Hosts need to easily reposition tables within the room canvas.
- **Decision**:
  - Use native pointer events (`pointerdown`, `pointermove`, `pointerup`) with `setPointerCapture` on table nodes.
  - Snap table $(x, y)$ positions to a subtle grid (e.g. $20\text{px}$) to keep banquet layouts aligned and neat.
  - Bounded within canvas boundaries ($0 \le x \le \text{canvasWidth}$, $0 \le y \le \text{canvasHeight}$).

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Guest changes RSVP or is removed after being seated** | A seat references a guest ID that is no longer attending or deleted. | When rendering seats, cross-reference `assignedGuestId` against current confirmed attendees. If the guest is no longer confirmed, flag the seat as `(Unavailable / RSVP Changed)` with an unseat button so the host can reassign it. |
| **Resizing table capacity downwards** | A host reduces a 10-seat table to 6 seats when seats 7–10 are occupied. | Warn the host before truncating seats, and unseat any occupants on removed seat indices back to the unassigned pool. |
| **Large floor plan canvas overflow** | Small screens or mobile devices may struggle to view large multi-table layouts. | Provide intuitive zoom-in / zoom-out / reset-zoom controls and CSS overflow scrolling on the canvas container. |
| **Legacy Canvas Deserialization** | Existing designs loaded from the database do not have a `floorPlan` property. | `floorPlan` is optional. Store actions and UI default to `{ tables: [] }` when `floorPlan` is missing. |
