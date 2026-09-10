# Proposal: Select and Move Seats Around the Table

**Change ID:** `move-seats-around-table`
**Created:** 2026-09-10
**Status:** Awaiting approval

## Problem

In the current Floor Plan & Seating system (`appMode: 'FLOOR_PLAN'`), seats on tables (`round`, `square`, and `rectangular`) are strictly positioned using fixed, equidistant mathematical layouts.

This causes three main friction points for event hosts:
1. **No Custom Seat Spacing**: Real-world table arrangements often require non-uniform spacing—for example, leaving an opening at the head of the table for the newlyweds or guest of honor, grouping close family members together on one side, or keeping one side clear for presentation or stage sightlines.
2. **Inflexible Geometry**: While tables can be moved and rotated, individual seats cannot be repositioned along the table edge.
3. **Rigid Peripheral Layouts**: Hosts have to create separate small tables or leave seats empty rather than simply sliding seats along the table's perimeter to match the physical banquet setup.

Hosts need the ability to click and drag individual seats along the perimeter of any table (round, square, or rectangular) to customize their placement, while preserving single-click guest assignment and seamless persistence.

## Proposed Solution

Introduce interactive **perimeter seat dragging and custom positioning**:

### 1. Perimeter Drag & Slide Interaction
- **Smooth Perimeter Sliding**:
  - **Round Tables**: Seats slide smoothly along the circular perimeter at any radial angle ($0^\circ \le \theta < 360^\circ$).
  - **Square & Rectangular Tables**: As the pointer moves around the table center, a ray-boundary projection smoothly moves the seat along the top, right, bottom, and left perimeter edges.
- **Click vs. Drag Differentiation**:
  - A click without substantial movement ($< 5\text{px}$ threshold) opens the existing `SeatAssignmentModal`.
  - Moving beyond the threshold initiates a drag, giving real-time visual feedback of the seat sliding around the table perimeter.
  - Releasing the pointer commits the new position to state and persistence.

### 2. Data Model & Geometry Extension
- Extend `FloorPlanSeat` in `src/types/sigil.types.ts` with an optional `angle?: number` (degrees $[0, 360)$ relative to table center).
- Update layout utilities in `src/utils/floorPlanUtils.ts`:
  - For round tables: calculate seat coordinates $(x, y)$ using the custom `angle` if present, falling back to default equal spacing.
  - For square/rectangular tables: calculate seat coordinates $(x, y)$ by projecting the `angle` from center onto the perimeter bounding rectangle, falling back to default edge distribution.
  - Introduce `getSeatPerimeterCoordinate(table, seatNumber, angle)` helper.

### 3. State Management & Actions
- Add `moveFloorPlanSeat(tableId: string, seatNumber: number, angle: number)` to `SigilStore`.
- Add `resetFloorPlanTableSeats(tableId: string)` to `SigilStore` allowing hosts to quickly reset seats back to uniform equal spacing.
- Add a "Reset Spacing" button (or context option) on the table action toolbar.

### 4. Zero-Migration Persistence
- Custom seat angles are stored directly on `FloorPlanSeat.angle`.
- Saved automatically in `design.floorPlan` via existing backend API with zero schema migrations.

## Files to Create & Modify

| File | Action | Purpose |
|---|---|---|
| `src/types/sigil.types.ts` | Modify | Add `angle?: number` to `FloorPlanSeat`. |
| `src/utils/floorPlanUtils.ts` | Modify | Add ray-perimeter projection for rectangular/square tables; update `getTableLayout` to respect custom seat angles when defined; add `resetTableSeatAngles` helper. |
| `src/utils/floorPlanUtils.test.ts` | Modify | Unit test suite for custom angle seat positioning, ray-box boundary projection, and angle calculation. |
| `src/state/sigilStore.ts` | Modify | Implement `moveFloorPlanSeat` and `resetFloorPlanTableSeats` store actions. |
| `src/state/floorPlanActions.test.ts` | Modify | Unit tests verifying `moveFloorPlanSeat` and `resetFloorPlanTableSeats` actions. |
| `src/components/floorplan/FloorPlanTableNode.tsx` | Modify | Add pointer drag handling on `.fp-seat-node` with click-vs-drag threshold, live preview during drag, screen-to-table angle calculation taking rotation/zoom into account, and reset layout button. |
| `src/styles/floorPlan.css` | Modify | Add styles for dragging seat state (`.fp-seat-node--dragging`, grabbing cursor, shadow/highlight ring). |
| `src/components/floorplan/FloorPlanView.test.tsx` | Modify | Component tests verifying seat dragging commits angle change and click opens assignment modal. |

## Scope Constraints

### Explicitly In-Scope:
- Interactive pointer drag on seat nodes along the table perimeter for `round`, `square`, and `rectangular` tables.
- Distinguishing click (< 5px) to open `SeatAssignmentModal` vs drag (≥ 5px) to move seat.
- Calculating seat positions based on angle around table center, accounting for table rotation and canvas zoom.
- Resetting seat distribution back to uniform spacing.
- Unit and component tests verifying geometry, store actions, and interaction.
- Automatic persistence via `InvitationDesign.floorPlan`.

### Out-of-Scope (Future Enhancements):
- Detaching seats completely from the table (floating seats in room space).
- Multi-seat lasso selection (moving multiple seats in fixed angular offsets at once).
- Collision prevention / min-distance constraints between overlapping seats (visual overlap is permitted or hosts manually space them).
