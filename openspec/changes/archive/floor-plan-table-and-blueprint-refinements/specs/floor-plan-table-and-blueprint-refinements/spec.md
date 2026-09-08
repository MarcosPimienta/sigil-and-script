# Delta Spec: Floor Plan Table Manipulation & Blueprint Image Editing

**Spec ID:** `floor-plan-table-and-blueprint-refinements`
**Capability:** HOST tenant → Table Seats, Table Rotation & Blueprint Editing

## ADDED Requirements

### Requirement: Table Seat Removal and Capacity Stepping

Hosts SHALL be able to remove individual seats or decrease table capacity without recreating the table.

#### Scenario: Removing an Unoccupied Seat from Seat Modal
- **WHEN** a host clicks on an empty seat and clicks "Remove Seat from Table"
- **THEN** that seat is removed, the remaining seats are renumbered consecutively ($1 \dots N - 1$), and the table capacity is reduced by 1.

#### Scenario: Removing an Occupied Seat from Seat Modal
- **WHEN** a host clicks on an occupied seat and confirms "Remove Seat from Table"
- **THEN** the assigned attendee is unseated back to the unassigned guest pool, the seat is removed, and seating statistics immediately update.

#### Scenario: Minimum Table Capacity Limit
- **WHEN** a table has 2 seats (minimum capacity)
- **THEN** the seat decrement button is disabled and seat removal is blocked to preserve valid table geometry.

---

### Requirement: Table Orientation and Rotation

Hosts SHALL be able to rotate tables in 45-degree increments while preserving upright legibility for all guest labels.

#### Scenario: Cycling Table Rotation
- **WHEN** the host clicks the rotate button on a table node
- **THEN** the table's orientation rotates by 45 degrees clockwise (`(currentRotation + 45) % 360`) and persists in `table.rotation`.

#### Scenario: Upright Guest Initials and Tooltips
- **WHEN** a table is rotated at any non-zero angle (e.g., 45°, 90°, 135°, 180°)
- **THEN** the table surface and perimeter seats rotate with the angle, while individual seat avatar initials and hover tooltips counter-rotate so text remains horizontally upright and readable.

---

### Requirement: Blueprint Image Editing and Color Inversion

Hosts SHALL be able to adjust visual filters and orientation of the uploaded reference blueprint.

#### Scenario: Inverting Blueprint Colors (CAD Dark Mode)
- **WHEN** the host toggles "Invert Colors" in the blueprint controls
- **THEN** the blueprint layer applies CSS `invert(1)` so dark background drawings with white lines invert to light backgrounds.

#### Scenario: Adjusting Brightness and Contrast
- **WHEN** the host changes the brightness or contrast slider
- **THEN** the blueprint layer updates its CSS `filter` in real-time between 0.4× and 2.5×.

#### Scenario: Rotating the Blueprint Image
- **WHEN** the host clicks "Rotate Blueprint (90°)"
- **THEN** the reference blueprint rotates 90 degrees clockwise (`(currentRotation + 90) % 360`) relative to the canvas.

#### Scenario: Resetting Image Adjustments
- **WHEN** the host clicks "Reset Filters"
- **THEN** brightness is reset to 1.0, contrast to 1.0, invert to false, and blueprint rotation to 0.
