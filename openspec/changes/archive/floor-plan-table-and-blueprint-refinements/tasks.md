# Tasks: Floor Plan Table Manipulation & Blueprint Image Editing

## 1. Types & Schema
- [x] 1.1 Add `brightness`, `contrast`, `invert`, and `rotation` to `FloorPlanReferenceLayer` in `src/types/sigil.types.ts`.
- [x] 1.2 Verify `rotation?: number` in `FloorPlanTable` in `src/types/sigil.types.ts`.

## 2. State Management & Store Actions
- [x] 2.1 Add `removeFloorPlanSeat: (tableId: string, seatNumber: number) => void` to `SigilStore` interface in `src/state/sigilStore.ts`.
- [x] 2.2 Implement `removeFloorPlanSeat` in `src/state/sigilStore.ts`, handling occupied seat unassignment and renumbering.
- [x] 2.3 Verify `updateFloorPlanTable` properly handles table `rotation` and capacity reduction.
- [x] 2.4 Create unit tests in `src/state/floorPlanTableAndBlueprintActions.test.ts` for seat removal, rotation, and blueprint image adjustments.

## 3. UI: Table Seat Removal & Rotation
- [x] 3.1 Update `src/components/floorplan/FloorPlanTableNode.tsx`:
  - Add rotation button (`🔄`) in the table actions menu cycling orientation by 45°.
  - Add inline seat decrement (`−`) and increment (`+`) stepper buttons on the table surface.
  - Apply CSS rotation to table layout and counter-rotation to seat avatars and tooltips.
- [x] 3.2 Update `src/components/floorplan/SeatAssignmentModal.tsx`:
  - Add "Remove Seat from Table" button with confirmation when occupied.
  - Connect to `removeFloorPlanSeat` store action.

## 4. UI: Blueprint Image Adjustments
- [x] 4.1 Update `src/components/floorplan/FloorPlanReferenceControls.tsx`:
  - Add Image Adjustments section:
    - Brightness slider (0.4 – 2.0).
    - Contrast slider (0.4 – 2.5).
    - Invert Colors toggle switch (Dark CAD mode).
    - 90° clockwise blueprint rotation button.
    - Reset Filters button.
- [x] 4.2 Update `src/components/floorplan/FloorPlanCanvas.tsx`:
  - Apply CSS `filter` (brightness, contrast, invert) to the blueprint image.
  - Apply blueprint `rotation` inside the canvas transform.

## 5. Styling & Visual Feedback
- [x] 5.1 Add CSS rules in `src/styles/floorPlan.css` for table rotation transforms, counter-rotated seat text, inline seat steppers, and blueprint adjustment controls.

## 6. Verification & End-to-End Testing
- [x] 6.1 Add component tests in `src/components/floorplan/FloorPlanView.test.tsx` verifying seat removal, table rotation, and blueprint filters.
- [x] 6.2 Run full test suite (`npm test` and `npm run build`) to ensure zero regressions.
