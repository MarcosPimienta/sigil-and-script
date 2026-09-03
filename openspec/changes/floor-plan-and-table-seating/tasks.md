# Tasks: Floor Plan & Table Seating Distribution

## 1. Types & Data Structures
- [x] 1.1 Add `'FLOOR_PLAN'` to `AppMode` in `src/types/sigil.types.ts`.
- [x] 1.2 Define `TableShape` (`'round' | 'square' | 'rectangular'`) in `src/types/sigil.types.ts`.
- [x] 1.3 Define `FloorPlanSeat`, `FloorPlanTable`, and `FloorPlanConfig` interfaces in `src/types/sigil.types.ts`.
- [x] 1.4 Add `floorPlan?: FloorPlanConfig` to `InvitationDesign` in `src/types/sigil.types.ts`.

## 2. Geometry & Attendee Resolution Utilities
- [x] 2.1 Create `src/utils/floorPlanUtils.ts` with `getConfirmedAttendees(invitees)` to extract confirmed primaries (`RSVP_YES`) and checked dependents (`included: true`).
- [x] 2.2 Implement polar coordinate calculation for `round` tables in `floorPlanUtils.ts`.
- [x] 2.3 Implement perimeter edge coordinate calculation for `square` tables in `floorPlanUtils.ts`.
- [x] 2.4 Implement perimeter coordinate calculation for `rectangular` tables in `floorPlanUtils.ts`.
- [x] 2.5 Implement `calculateSeatingStats(floorPlan, confirmedAttendees)` to return total capacity, seated count, and unassigned count.
- [x] 2.6 Create unit tests in `src/utils/floorPlanUtils.test.ts` covering geometry calculations, confirmed attendee extraction, and seating stats.

## 3. State Management & Store Actions
- [x] 3.1 Define floor plan action signatures in `SigilStore` interface (`addFloorPlanTable`, `updateFloorPlanTable`, `removeFloorPlanTable`, `moveFloorPlanTable`, `assignFloorPlanSeat`, `unassignFloorPlanSeat`).
- [x] 3.2 Implement `addFloorPlanTable` in `src/state/sigilStore.ts` with default dimensions and seat nodes.
- [x] 3.3 Implement `updateFloorPlanTable` (name, shape, seat count adjustments with safety for occupied seats).
- [x] 3.4 Implement `removeFloorPlanTable` and `moveFloorPlanTable` with grid snapping.
- [x] 3.5 Implement `assignFloorPlanSeat` ensuring the single-seat invariant (unseating the guest from any other seat).
- [x] 3.6 Implement `unassignFloorPlanSeat`.
- [x] 3.7 Add unit tests in `src/state/floorPlanActions.test.ts` verifying all store actions and single-seat invariants.

## 4. UI Components
- [x] 4.1 Create `src/styles/floorPlan.css` with parchment blueprint styling, grid background, table geometry styles, and seat avatars.
- [x] 4.2 Implement `FloorPlanTableNode.tsx` rendering round, square, and rectangular tables with perimeter seat nodes and draggable interaction.
- [x] 4.3 Implement `SeatAssignmentModal.tsx` for searching and assigning unseated confirmed guests or vacating seats.
- [x] 4.4 Implement `AddTableModal.tsx` for defining new table name, shape, and seat count.
- [x] 4.5 Implement `UnassignedGuestsDrawer.tsx` listing confirmed attendees who still need a seat with search/filtering.
- [x] 4.6 Implement `FloorPlanCanvas.tsx` hosting the 2D grid surface with zoom controls and table nodes.
- [x] 4.7 Implement `FloorPlanView.tsx` integrating the top metrics header, canvas, modals, and unassigned guest sidebar.

## 5. Navigation & Integration
- [x] 5.1 Update `src/App.tsx` to render `<Toolbar />` and `<FloorPlanView />` when `appMode === 'FLOOR_PLAN'`.
- [x] 5.2 Update `src/components/creator/Toolbar.tsx` to add "Floor Plan" navigation button alongside Studio and Dashboard.
- [x] 5.3 Update `src/components/events/EventsHubView.tsx` to add a "Floor Plan" button on each event card.
- [x] 5.4 Update `src/components/dashboard/DashboardView.tsx` to add a "🗺️ Floor Plan" shortcut button.

## 6. Verification & End-to-End Testing
- [x] 6.1 Create component tests for `FloorPlanView.test.tsx` verifying table addition, seat rendering, and guest assignment.
- [x] 6.2 Run full unit test suites (`npm test` and `npm --prefix server run test`) to ensure zero regressions across the codebase.
- [x] 6.3 Verify persistence: ensure `floorPlan` is correctly saved to the backend with `saveCurrentDesign()` and reloaded with `loadDesign()`.
