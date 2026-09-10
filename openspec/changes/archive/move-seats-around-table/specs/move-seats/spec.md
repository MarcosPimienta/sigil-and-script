# Delta Spec: Select and Move Seats Around the Table

**Spec ID:** `move-seats`
**Capability:** HOST tenant → Floor Plan & Seating Management

## ADDED Requirements

### Requirement: Custom Seat Positioning Along Table Perimeter

Hosts SHALL be able to click and drag individual seats to slide them smoothly along the perimeter of round, square, and rectangular tables.

#### Scenario: Dragging a Seat on a Round Table
- **WHEN** a host presses and drags a seat node on a `round` table past the 5px threshold
- **THEN** the seat node smoothly follows the angular position of the pointer along the circular circumference of the table.

#### Scenario: Dragging a Seat on a Square or Rectangular Table
- **WHEN** a host presses and drags a seat node on a `square` or `rectangular` table past the 5px threshold
- **THEN** the seat node smoothly follows the perimeter edges (top, right, bottom, left) based on the ray from the table center to the pointer.

#### Scenario: Committing Seat Movement
- **WHEN** the host releases the pointer after dragging a seat
- **THEN** the new `angle` is committed to the seat in `FloorPlanSeat`, and the position is preserved.

---

### Requirement: Click vs. Drag Differentiation

The system SHALL differentiate between a quick click on a seat and a drag interaction.

#### Scenario: Clicking to Assign a Guest
- **WHEN** a host clicks on a seat node and moves the pointer by less than 5px
- **THEN** the `SeatAssignmentModal` opens to assign or unseat a guest, and the seat's position is unchanged.

#### Scenario: Dragging to Reposition
- **WHEN** a host presses a seat node and moves the pointer by 5px or more
- **THEN** the seat enters dragging mode, no modal is opened on pointer release, and the seat's position is updated.

---

### Requirement: Resetting Table Seat Spacing

Hosts SHALL be able to reset the seats on any table back to their default uniform mathematical spacing.

#### Scenario: Reset Spacing Action
- **WHEN** the host clicks the "Reset Spacing" action on a table's action menu
- **THEN** all custom angles on that table's seats are cleared, and the seats return to equidistant spacing around the table.
