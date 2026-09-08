# Proposal: Floor Plan Table Manipulation & Blueprint Image Editing

**Change ID:** `floor-plan-table-and-blueprint-refinements`
**Created:** 2026-09-07
**Status:** Awaiting approval

## Problem

After deploying the interactive floor plan and reference blueprint layer, hosts encounter three key operational limitations when arranging real-world banquet layouts:

1. **Inflexible Seat Counts**:
   - Once a table is created, hosts cannot decrease its seat capacity or remove an individual seat without deleting the entire table and recreating it.
   - If a table was created with 10 seats but the venue only fits 8 chairs, the host is stuck with unused empty slots cluttering the seating metrics.
2. **Fixed Table Orientation (No Rotation)**:
   - Head tables, buffet setups, and rectangular banquet tables often need to run at angles (e.g. 45° or 90° perpendicular) to align with venue walls or stage arrangements.
   - While `FloorPlanTable.rotation` exists in the type definitions, table nodes currently cannot be rotated from the UI and lack visual CSS rotation.
3. **Unadjusted Blueprint Scans**:
   - Blueprint and architectural files uploaded by hosts come in varied qualities: inverted CAD drawings (white lines on black backgrounds), faint pencil sketches, or portrait scans of landscape ballrooms.
   - Hosts cannot invert colors, enhance contrast/brightness, or rotate the blueprint image to match their canvas workspace.

## Proposed Solution

Implement a comprehensive suite of spatial manipulation and blueprint editing tools:

### 1. Dynamic Table Seat Removal & Capacity Stepping
- **Individual Seat Removal**:
  - In `SeatAssignmentModal.tsx`, add a `"🗑️ Remove Seat from Table"` action button.
  - Safely unseats any assigned guest (returning them to the unassigned attendee pool) and decrements table capacity by 1 (down to minimum of 2 seats).
- **Inline Table Seat Stepper**:
  - On `FloorPlanTableNode.tsx`, add a quick seat stepper (`−` and `+`) or capacity edit control.
  - Automatically re-computes perimeter seat geometry and preserves remaining assigned guests.

### 2. Table Rotation with Upright Guest Labels
- **Rotation Controls**:
  - Add a rotation button (`🔄`) to the action menu of `FloorPlanTableNode.tsx` to cycle table orientation in 45° increments (0° → 45° → 90° → 135° ...).
- **Upright Text Invariant**:
  - The table surface and seat positions rotate together via CSS transform `rotate(${rotation}deg)`.
  - Individual seat avatar badges and hover tooltips counter-rotate by `-rotation` so guest names and initials remain legible and upright regardless of table angle.

### 3. Blueprint Image Editing Controls
- Extend `FloorPlanReferenceLayer` with image enhancement properties:
  - `brightness?: number` (0.4 to 2.0, default 1.0)
  - `contrast?: number` (0.4 to 2.5, default 1.0)
  - `saturate?: number` (0.0 to 2.0, default 1.0)
  - `invert?: boolean` (default false)
  - `rotation?: number` (0, 90, 180, 270, default 0)
- In `FloorPlanReferenceControls.tsx`:
  - Add an **Image Adjustments** section with:
    - Invert Colors toggle (`🌓 Invert Colors (Dark CAD mode)`).
    - Brightness and Contrast sliders.
    - Blueprint 90° clockwise rotation button (`↻ Rotate Blueprint`).
    - "Reset Filters" button.
- In `FloorPlanCanvas.tsx`:
  - Render blueprint with CSS `filter` and orientation `transform` in 1:1 sync with the canvas.

## Files to Create & Modify

| Action | Path | Purpose |
|---|---|---|
| **MODIFY** | `src/types/sigil.types.ts` | Add image filter and rotation properties to `FloorPlanReferenceLayer`. |
| **MODIFY** | `src/state/sigilStore.ts` | Add `removeFloorPlanSeat` action, support rotation in `updateFloorPlanTable`, and update reference layer filters. |
| **MODIFY** | `src/components/floorplan/FloorPlanTableNode.tsx` | Add rotation button, inline seat stepper (`−`/`+`), apply rotation transform, and counter-rotate seat labels. |
| **MODIFY** | `src/components/floorplan/SeatAssignmentModal.tsx` | Add "Remove Seat from Table" action with safety confirmation if occupied. |
| **MODIFY** | `src/components/floorplan/FloorPlanReferenceControls.tsx` | Add image adjustment controls: Invert, Brightness, Contrast, and Blueprint Rotate. |
| **MODIFY** | `src/components/floorplan/FloorPlanCanvas.tsx` | Apply CSS filters and rotation transforms to the reference blueprint layer. |
| **MODIFY** | `src/styles/floorPlan.css` | Add styling for table rotation, counter-rotation, seat steppers, and blueprint adjustment controls. |
| **NEW** | `src/state/floorPlanTableAndBlueprintActions.test.ts` | Unit tests for seat removal, table rotation, and blueprint image adjustments. |
| **MODIFY** | `src/components/floorplan/FloorPlanView.test.tsx` | Component tests for table rotation, seat removal, and blueprint filters. |

## Scope Constraints

### In-Scope
- Removing a seat from a table via seat modal or inline stepper, unseating occupants safely.
- Rotating tables in 45° increments with upright guest initials/labels.
- Inverting blueprint colors, adjusting brightness/contrast, and rotating blueprint by 90°.
- Persisting all new parameters through `saveCurrentDesign()` and `loadDesign()`.

### Out-of-Scope
- Manual freehand polygon wall drawing (handled by reference blueprint overlay).
- Arbitrary irregular polygon table shapes.
