# Tasks: Select and Move Seats Around the Table

## 1. Types & Data Structures
- [x] 1.1 Add optional `angle?: number` to `FloorPlanSeat` in `src/types/sigil.types.ts`.
- [x] 1.2 Add `moveFloorPlanSeat` and `resetFloorPlanTableSeats` action signatures to `SigilStore` in `src/state/sigilStore.ts`.

## 2. Geometry & Layout Calculation
- [x] 2.1 Implement ray-perimeter projection helper in `src/utils/floorPlanUtils.ts` for rectangular and square bounding boxes.
- [x] 2.2 Update `calculateRoundTableLayout` in `src/utils/floorPlanUtils.ts` to accept optional custom seat angles.
- [x] 2.3 Update `calculateSquareTableLayout` and `calculateRectangularTableLayout` in `src/utils/floorPlanUtils.ts` to accept optional custom seat angles.
- [x] 2.4 Update `getTableLayout` to accept existing `FloorPlanSeat[]` or custom angles map.
- [x] 2.5 Add unit tests in `src/utils/floorPlanUtils.test.ts` covering custom angle seat coordinates and ray-perimeter projection for all 3 shapes.

## 3. State Management & Store Actions
- [x] 3.1 Implement `moveFloorPlanSeat(tableId, seatNumber, angle)` in `src/state/sigilStore.ts` to update `angle` on the target seat.
- [x] 3.2 Implement `resetFloorPlanTableSeats(tableId)` in `src/state/sigilStore.ts` to clear custom angles and restore default spacing.
- [x] 3.3 Add unit tests in `src/state/floorPlanActions.test.ts` verifying seat movement, angle persistence, and layout resetting.

## 4. UI Interaction & Component Updates
- [x] 4.1 Update `FloorPlanTableNode.tsx` with seat pointer handlers: track movement, apply 5px threshold to distinguish click from drag, and calculate angle relative to table center taking rotation and zoom into account.
- [x] 4.2 Add live preview state during seat dragging so the seat slides smoothly in real time.
- [x] 4.3 Add a "Reset Spacing" button (e.g. 📐 or ⟳) in the table actions toolbar in `FloorPlanTableNode.tsx` to restore uniform layout.
- [x] 4.4 Add styling in `src/styles/floorPlan.css` for `.fp-seat-node--dragging` (active grab cursor, elevation shadow, highlight ring).

## 5. Verification & Testing
- [x] 5.1 Run unit test suites (`npm test`) to ensure zero regressions across all existing components and utilities.
- [x] 5.2 Add component test in `FloorPlanView.test.tsx` verifying seat dragging updates position and short click opens modal.
- [x] 5.3 Verify that changes persist correctly via `saveCurrentDesign`.
