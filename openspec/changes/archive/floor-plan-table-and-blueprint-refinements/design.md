# Design: Floor Plan Table Manipulation & Blueprint Image Editing

**Change ID:** `floor-plan-table-and-blueprint-refinements`

## Architectural Decisions

### 1. Removing Seats from Tables & Store State Invariant
- **Context**: A table consists of an array of `FloorPlanSeat` items ($1 \dots N$). Removing a seat can occur either by reducing total capacity via `seatsCount - 1` or by clicking a specific seat in `SeatAssignmentModal`.
- **Decision**:
  - Implement a dedicated store action `removeFloorPlanSeat(tableId: string, seatNumber: number)` in `src/state/sigilStore.ts`:
    1. If the target seat is occupied (`assignedGuestId`), clear its assignment.
    2. Filter out the target seat.
    3. Renumber the remaining seats consecutively ($1 \dots N - 1$).
    4. Set `seatsCount = Math.max(2, seats.length)`.
  - Also support quick inline `-` / `+` capacity adjustments on `FloorPlanTableNode` by reusing `updateFloorPlanTable(tableId, { seatsCount: table.seatsCount - 1 })`.
  - **Single-Seat & Metrics Invariant**: When a seat is removed, any guest assigned to it is safely returned to `unassignedAttendees`, immediately reflected in the top metrics banner (`Unseated: X`).

### 2. Table Rotation Architecture & Upright Counter-Rotation
- **Context**: Rotating tables must affect both the central table surface (round, square, rectangular) and perimeter seats without distorting guest label readability.
- **Decision**:
  - Store rotation as an integer angle in degrees (`rotation?: number`, default `0`).
  - Apply `transform: rotate(${rotation}deg)` on the table surface and seat coordinate container using `transform-origin: center center`.
  - Apply an inverse counter-rotation `transform: rotate(-${rotation}deg)` on individual `.fp-seat-node span` (initials) and `.fp-seat-tooltip` elements.
  - Cycle rotation on click: `(currentRotation + 45) % 360`.
- **Trade-offs**: 45° snapping provides the perfect balance between architectural flexibility (diagonal and perpendicular hall layouts) and neat alignment without chaotic fractional angles.

### 3. Blueprint Image Filters & Orientation
- **Context**: Venue blueprints frequently have dark backgrounds (CAD dark mode), low contrast (faint architectural sketches), or flipped orientations (portrait scans of landscape rooms).
- **Decision**:
  - Extend `FloorPlanReferenceLayer`:
    ```typescript
    export interface FloorPlanReferenceLayer {
      url: string;
      opacity: number;
      scale: number;
      x: number;
      y: number;
      visible: boolean;
      locked?: boolean;
      fileName?: string;
      brightness?: number; // default: 1.0
      contrast?: number;   // default: 1.0
      invert?: boolean;    // default: false
      rotation?: number;   // 0, 90, 180, 270 (default: 0)
    }
    ```
  - In `FloorPlanCanvas.tsx`:
    - Combine CSS transform: `translate(${x}px, ${y}px) rotate(${rotation || 0}deg) scale(${scale})` with `transform-origin: 0 0`.
    - Combine CSS filter: `filter: brightness(${brightness || 1}) contrast(${contrast || 1}) ${invert ? 'invert(1)' : ''}`.
  - In `FloorPlanReferenceControls.tsx`:
    - Add a collapsible or dedicated **Image Adjustments** section with live sliders and toggle switches.
    - Add a 1-click `↺ Reset Filters` button restoring brightness, contrast, invert, and blueprint rotation to defaults.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Removing an occupied seat accidentally leaves a guest in limbo | The reducer explicitly unassigns the guest ID and marks them unseated so they immediately reappear in `unassignedAttendees` list. |
| Table rotation causing bounding-box clipping | Use `transform-origin: center center` inside `.fp-table-wrapper` and ensure outer drag container accommodates rotation. |
| Blueprint rotation offsetting the origin point | When blueprint rotation changes, `transform-origin: 0 0` or center alignment ensures smooth predictable pivoting without jumping off-canvas. |
| Excessively high contrast/brightness washing out images | Constrain slider ranges: brightness (0.4 – 2.0), contrast (0.4 – 2.5), with clear default reset buttons. |
