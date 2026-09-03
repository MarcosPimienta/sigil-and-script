# Delta Spec: Floor Plan & Table Seating Distribution

**Spec ID:** `floor-plan`
**Capability:** HOST tenant → Floor Plan & Seating Management

## ADDED Requirements

### Requirement: Top-Level Floor Plan Navigation

The application SHALL support a dedicated `FLOOR_PLAN` mode accessible outside of the invitation editing studio.

#### Scenario: Navigating from Toolbar
- **WHEN** a signed-in host clicks the "Floor Plan" button in the top navigation toolbar
- **THEN** `appMode` changes to `'FLOOR_PLAN'` and the application displays the Floor Plan workspace (`FloorPlanView`) while keeping the global `<Toolbar />` accessible.

#### Scenario: Navigating from Events Hub
- **WHEN** a host clicks "Floor Plan" on an event card in the Events Hub
- **THEN** the application loads the selected event's design and roster and navigates to `'FLOOR_PLAN'` mode.

#### Scenario: Navigating from Guest Dashboard
- **WHEN** a host clicks the "Floor Plan" shortcut in the Guest Dashboard header
- **THEN** the application switches from `'DASHBOARD'` to `'FLOOR_PLAN'` mode.

---

### Requirement: Table Configuration and Shapes

Hosts SHALL be able to define tables with custom names, shapes, and seat counts.

#### Scenario: Supported Table Shapes
- **WHEN** configuring a new or existing table
- **THEN** the system supports three shapes: `round`, `square`, and `rectangular`.

#### Scenario: Seat Count Range
- **WHEN** setting the number of seats for a table
- **THEN** the seat count must be between 2 and 20 seats inclusive.

#### Scenario: Table Creation
- **WHEN** the host submits the "Add Table" form with a name, shape, and seat count
- **THEN** a new `FloorPlanTable` is added with numbered seat slots ($1 \dots N$) and placed onto the floor plan canvas.

---

### Requirement: Geometry Calculation for Tables

Each table shape SHALL position its seat nodes cleanly around its perimeter.

#### Scenario: Round Table Seats
- **WHEN** a `round` table is rendered
- **THEN** its $N$ seat nodes are distributed radially at equal angles around the circumference of the central circle.

#### Scenario: Square Table Seats
- **WHEN** a `square` table is rendered
- **THEN** its $N$ seats are distributed along the four perimeter edges (top, right, bottom, left).

#### Scenario: Rectangular Table Seats
- **WHEN** a `rectangular` table is rendered
- **THEN** seats are aligned symmetrically along the long side edges with head and foot seats for larger capacities.

---

### Requirement: Interactive Map & Table Positioning

Hosts SHALL be able to spatially position tables across a 2D floor grid.

#### Scenario: Dragging Tables
- **WHEN** a host drags a table across the floor plan canvas
- **THEN** its $(x, y)$ coordinates update with smooth pointer interaction and snap to a 20px alignment grid.

#### Scenario: Table Deletion
- **WHEN** a host chooses to delete a table
- **THEN** the table is removed from the floor plan, and any assigned guests seated at that table are automatically returned to the unassigned confirmed pool.

---

### Requirement: Confirmed Guest Resolution

The seating system SHALL only allow seating confirmed attendees.

#### Scenario: Extracting Confirmed Primary Guests
- **WHEN** resolving assignable guests from the event roster
- **THEN** all primary invitees with `status === 'RSVP_YES'` are included in the confirmed attendee list.

#### Scenario: Extracting Confirmed Dependents
- **WHEN** resolving assignable guests from the event roster
- **THEN** dependents belonging to confirmed invitees whose `included` property is `true` (or `isDependentIncluded(d)`) are included as individual assignable attendees.

#### Scenario: Excluding Unconfirmed or Declined Guests
- **WHEN** an invitee has status `PENDING`, `SENT`, `OPENED`, or `RSVP_NO`
- **THEN** neither the invitee nor their dependents appear in the unassigned confirmed guest list.

---

### Requirement: Seat Assignment and Single-Seat Invariant

Hosts SHALL be able to assign, unseat, and reassign confirmed guests to seats.

#### Scenario: Assigning a Confirmed Guest to an Empty Seat
- **WHEN** a host clicks an empty seat and selects a confirmed guest
- **THEN** the seat records the guest's ID and name, the seat changes to occupied styling, and the guest is removed from the unassigned list.

#### Scenario: Enforcing Single-Seat Invariant
- **WHEN** a host assigns a guest who is already assigned to another table or seat
- **THEN** the guest's previous seat is automatically vacated before being assigned to the new seat, preventing duplicate seating.

#### Scenario: Unseating a Guest
- **WHEN** a host clicks an occupied seat and selects "Unseat Guest"
- **THEN** the seat returns to vacant status and the guest reappears in the unassigned confirmed guests list.

#### Scenario: Guest RSVP Changes to Declined
- **WHEN** a previously seated guest has their RSVP updated to `RSVP_NO` in the roster
- **THEN** the seat displays a warning indicator allowing the host to vacate or reassign the seat.

---

### Requirement: Persistence in Event Design

Floor plan configuration SHALL persist across browser sessions and backend synchronization.

#### Scenario: Saving to Database
- **WHEN** the host clicks "Save Layout" in the toolbar or auto-save triggers
- **THEN** the `floorPlan` object inside `InvitationDesign` is serialized into `InvitationCanvas.designData` via `POST /canvas`.

#### Scenario: Loading from Database
- **WHEN** an existing event is loaded via `loadDesign(id)`
- **THEN** the saved `floorPlan` configuration, table positions, and seat assignments are restored.
