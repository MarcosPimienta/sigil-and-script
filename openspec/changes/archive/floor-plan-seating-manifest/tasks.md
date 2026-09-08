# Implementation Tasks: Floor Plan Seating Manifest

**Change ID:** `floor-plan-seating-manifest`

## 1. Data Types & Manifest Utilities
- [x] 1.1 Define manifest interfaces (`TableManifestItem`, `GuestDirectoryItem`, `ManifestSeat`) in `src/utils/floorPlanUtils.ts`.
- [x] 1.2 Implement `generateTableSeatingManifest(tables, confirmedAttendees)` with accurate occupancy counts and empty seat mapping.
- [x] 1.3 Implement `generateGuestSeatingDirectory(tables, confirmedAttendees)` sorting alphabetically and linking table & seat info.
- [x] 1.4 Implement `exportSeatingManifestCSV(tables, confirmedAttendees, eventTitle)` with RFC 4180 escaping and download trigger.
- [x] 1.5 Implement `formatSeatingManifestPlainText(tables, confirmedAttendees)` for clipboard copying.
- [x] 1.6 Add unit tests in `src/utils/floorPlanUtils.test.ts` verifying manifest calculations, sorting, and CSV formatting.

## 2. Seating Manifest Modal Component
- [x] 2.1 Create `src/components/floorplan/SeatingManifestModal.tsx` with modal container, header, search bar, and action buttons.
- [x] 2.2 Implement "By Table" tab rendering table cards with occupancy bars, seat badges, and empty slots.
- [x] 2.3 Implement "By Guest" tab rendering alphabetical guest table with fast table/seat lookup.
- [x] 2.4 Wire search filter to filter tables and guests reactively.
- [x] 2.5 Wire CSV export, clipboard copy with toast feedback, and print trigger.

## 3. Floor Plan Integration & Styling
- [x] 3.1 In `src/components/floorplan/FloorPlanView.tsx`, add `📜 Seating Manifest` trigger button to header action bar.
- [x] 3.2 Mount `SeatingManifestModal` and wire open/close state.
- [x] 3.3 Add manifest styling in `src/styles/floorPlan.css` (modal layout, tab switcher, search input, table cards, guest directory table, badges).
- [x] 3.4 Add `@media print` styles for clean, page-break-safe physical paper printing.

## 4. Verification & Testing
- [x] 4.1 Run unit test suite `npm test` to verify zero regressions.
- [x] 4.2 Verify client build `npm run build` succeeds without TypeScript or bundling errors.
- [x] 4.3 Verify interactive behavior (search filtering, view switching, CSV download, print view, clipboard copy).
