# Design: Select and Move Seats Around the Table

**Change ID:** `move-seats-around-table`

## Architectural Decisions

### 1. Unified Angular Parameterization (`FloorPlanSeat.angle`)
- **Context**: A table can have different shapes (`round`, `square`, `rectangular`). Storing separate Cartesian $(x, y)$ coordinates per seat would make resizing the table, rotating it, or changing its dimensions break seat alignment or detach seats from edges.
- **Decision**: Represent custom seat positions using an angular coordinate:
  `angle?: number` (degrees $[0, 360)$ where $0^\circ$ corresponds to the top / 12 o'clock relative to the unrotated table).
- **Why Angular?**:
  - For **round** tables: Polar angle directly maps to $(cx + R \sin\theta, cy - R \cos\theta)$.
  - For **square** and **rectangular** tables: A ray cast from the table center at angle $\theta$ has a unique intersection point with the table's perimeter boundary.
  - Scale invariance: If the table dimensions change or the table rotates, the seat stays correctly pinned to the table edge at the desired relative orientation.
  - Default compatibility: When `angle === undefined`, the seat effortlessly falls back to the default uniform mathematical distribution.

### 2. Ray-Perimeter Projection Algorithm for Square & Rectangular Tables
- **Context**: For square and rectangular tables, the perimeter consists of 4 edges offset from the table surface by `SEAT_MARGIN = 26px`.
- **Formulation**:
  Given table half-width $hw = \frac{\text{tableWidth}}{2} + \text{SEAT\_MARGIN}$ and half-height $hh = \frac{\text{tableHeight}}{2} + \text{SEAT\_MARGIN}$, with center $(cx, cy)$:
  For an angle $\theta$ (measured in radians, where $\theta = 0$ is top, clockwise):
  Let directional unit vector be:
  $$dx = \sin(\theta), \quad dy = -\cos(\theta)$$
  To find the ray intersection with the bounding box $[-hw, hw] \times [-hh, hh]$:
  $$s_x = \begin{cases} \left|\frac{hw}{dx}\right| & dx \ne 0 \\ \infty & dx = 0 \end{cases}$$
  $$s_y = \begin{cases} \left|\frac{hh}{dy}\right| & dy \ne 0 \\ \infty & dy = 0 \end{cases}$$
  $$s = \min(s_x, s_y)$$
  The resulting seat center coordinates are:
  $$x = \text{round}(cx + s \cdot dx)$$
  $$y = \text{round}(cy + s \cdot dy)$$
- **Benefits**:
  - Seamless, continuous projection around all 4 edges and corners.
  - As the user drags the pointer around the table, the seat slides smoothly along the edges.

### 3. Screen-to-Table Coordinate Transformation
- **Context**: The canvas supports zoom ($0.6 \times$ to $1.6 \times$), and the table container can be rotated by arbitrary degrees ($0^\circ, 45^\circ, 90^\circ, \dots$).
- **Decision**:
  Using `innerRef.current.getBoundingClientRect()`:
  1. $\text{screenCenterX} = \text{rect.left} + \frac{\text{rect.width}}{2}$
  2. $\text{screenCenterY} = \text{rect.top} + \frac{\text{rect.height}}{2}$
  3. $\text{screenAngle} = \operatorname{atan2}(e.\text{clientY} - \text{screenCenterY}, e.\text{clientX} - \text{screenCenterX})$
  4. Adjust for table rotation:
     $$\text{localAngleRad} = \text{screenAngle} - \frac{\text{table.rotation} \cdot \pi}{180} + \frac{\pi}{2}$$
     $$\text{angleDeg} = ((\text{localAngleRad} \cdot \frac{180}{\pi}) \pmod{360} + 360) \pmod{360}$$
- **Advantages**:
  - Works identically regardless of zoom level, viewport scroll, or table rotation.
  - No complex CSS matrix inversion needed.

### 4. Click vs. Drag Differentiation
- **Context**: Clicking a seat currently opens the `SeatAssignmentModal`. Dragging a seat must not accidentally open the modal, and clicking to assign a guest must not reposition the seat.
- **Decision**:
  - On `pointerdown`: Record initial $(startX, startY)$ and seat number. Set pointer capture.
  - On `pointermove`: Compute Euclidean distance $\Delta = \sqrt{(x - startX)^2 + (y - startY)^2}$.
    - If $\Delta > 5\text{px}$: Set `isDraggingSeat = true` and update live angle preview.
  - On `pointerup`:
    - Release pointer capture.
    - If `isDraggingSeat` is true: Commit `moveFloorPlanSeat(table.id, seatNumber, currentAngle)`.
    - If `isDraggingSeat` is false: Invoke `onSeatClick(table, seatNumber)` to open `SeatAssignmentModal`.

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Accidental seat displacement when clicking to assign guests** | Host wants to open assignment modal but slightly jitters mouse, causing seat to move. | Strict 5px movement threshold before drag mode engages. Clicks within 5px trigger modal with zero angle modification. |
| **Seat overlaps if two seats are dragged to the same angle** | Two seats stacked directly on top of each other could make selecting the bottom seat difficult. | Higher z-index on hover/drag, tooltip displaying occupant name, and a "Reset Spacing" action button on table to restore clean equal spacing at any time. |
| **Backward compatibility with existing floor plans** | Tables created previously lack `angle` on `FloorPlanSeat`. | `angle` is purely optional (`angle?: number`). If `angle === undefined`, existing automatic equidistant layout calculations are preserved 100%. |
| **Canvas zoom distortion** | Pointer coordinates might feel sluggish or accelerated when canvas is zoomed in or out. | Center-relative angle calculation is scale-invariant: $\operatorname{atan2}(\Delta y, \Delta x)$ is independent of uniform scale factors. |
