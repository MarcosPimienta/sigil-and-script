# Tasks: Floor Plan Reference Blueprint Layer

## 1. Types & Schema
- [x] 1.1 Define `FloorPlanReferenceLayer` in `src/types/sigil.types.ts` with `url`, `opacity`, `scale`, `x`, `y`, `visible`, `locked`, and optional `fileName`.
- [x] 1.2 Add `referenceLayer?: FloorPlanReferenceLayer` to `FloorPlanConfig` in `src/types/sigil.types.ts`.

## 2. State Management & Store Actions
- [x] 2.1 Add action signatures in `SigilStore` interface (`setFloorPlanReferenceLayer`, `updateFloorPlanReferenceLayer`, `clearFloorPlanReferenceLayer`).
- [x] 2.2 Implement `setFloorPlanReferenceLayer`, `updateFloorPlanReferenceLayer`, and `clearFloorPlanReferenceLayer` in `src/state/sigilStore.ts`.
- [x] 2.3 Create unit tests in `src/state/floorPlanReferenceActions.test.ts` covering setting, updating (opacity, scale, offsets, visibility), and clearing the reference layer.

## 3. UI Components & Canvas Integration
- [x] 3.1 Create `src/components/floorplan/FloorPlanReferenceControls.tsx` for blueprint upload, opacity slider, scale slider, visibility toggle, lock toggle, and reposition/reset controls.
- [x] 3.2 Update `src/components/floorplan/FloorPlanCanvas.tsx` to render the reference layer inside `.floorplan-canvas-viewport` with transformation and drag-reposition handlers when unlocked.
- [x] 3.3 Update `src/components/floorplan/FloorPlanView.tsx` to mount the blueprint reference toggle button and controls panel.

## 4. Styling & Visual Feedback
- [x] 4.1 Add CSS rules in `src/styles/floorPlan.css` for `.floorplan-reference-layer`, `.fp-reference-controls-panel`, sliders, reposition drag border, and active state indicators.
- [x] 4.2 Ensure responsive positioning and clean z-index hierarchy (`reference-layer`: 1, `canvas-grid`: 0, `tables`: 10, `zoom-bar`: 20, `reference-controls`: 20).

## 5. Verification & End-to-End Testing
- [x] 5.1 Add component tests in `src/components/floorplan/FloorPlanView.test.tsx` verifying blueprint upload trigger, visibility toggle, and opacity/scale controls.
- [x] 5.2 Run full test suite (`npm test`) to ensure zero regressions across floor plan and invitation studio suites.
- [x] 5.3 Verify persistence: test that `referenceLayer` survives design save and reload cycles.
