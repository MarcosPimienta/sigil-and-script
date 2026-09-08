# Proposal: Floor Plan Reference Blueprint Layer

**Change ID:** `floor-plan-reference-layer`
**Created:** 2026-09-07
**Status:** Awaiting approval

## Problem

When event hosts, wedding coordinators, and banquet planners arrange seating charts in Sigil & Script's Floor Plan workspace, they typically work from an official venue blueprint, architectural CAD export, or banquet hall floor plan sketch. 

Currently:
1. **No Spatial Grounding**: Tables are positioned on an abstract dot-grid with no visual relationship to the real venue's architectural walls, entryways, dance floors, stages, or columns.
2. **Double-Handling Logistics**: Hosts must cross-reference external PDF/image blueprints in a separate window or on physical printouts while dragging tables in Sigil & Script.
3. **No Reference Traceability**: There is no way to upload, calibrate, or overlay a blueprint directly on the 2D floor plan surface.

Hosts need the ability to upload a reference blueprint layer behind the table grid, with intuitive controls for opacity, scale, alignment, visibility, and locking, persisted seamlessly with their event design.

## Proposed Solution

Introduce a **Floor Plan Reference Blueprint Layer** that integrates directly with the 2D canvas and state management:

### 1. Reference Blueprint Upload & Storage
- Add an intuitive upload trigger in the Floor Plan workspace (header and canvas controls).
- Accept standard blueprint/image formats (`image/png`, `image/jpeg`, `image/webp`, `image/svg+xml`) up to 8MB.
- Upload to backend media storage via `apiFetch('/upload/media')` into bucket `'event-assets'`, with automatic local data URL fallback for offline resilience.
- Provide responsive upload progress states and error handling.

### 2. Canvas Reference Layer Rendering
- Render the reference image directly within `.floorplan-canvas-viewport` behind tables (`z-index: 1`).
- Ensure the reference image automatically transforms with canvas zoom operations in 1:1 synchronization with table nodes.
- Maintain transparent interaction: when locked or viewing tables, pointer events pass through to canvas panning and table manipulation.

### 3. Layer Controls Toolbar & Inspector Popover
- Provide a dedicated **"📐 Blueprint Reference"** toolbar in `FloorPlanView` and `FloorPlanCanvas`:
  - **Visibility Toggle (Show/Hide)**: Quickly hide or reveal the blueprint without deleting it.
  - **Opacity Slider**: Smoothly adjust opacity from 5% to 100% (default: 45%) so grid dots, table outlines, and guest names remain legible over complex drawings.
  - **Scale Slider**: Scale the blueprint between 20% and 300% (with a 100% reset button) to match the dimensions of the venue to the canvas grid.
  - **Reposition & Alignment Mode**: Allow users to drag-align or offset the blueprint $(x, y)$ coordinates to align venue walls with the canvas grid.
  - **Lock/Unlock**: Lock coordinates to prevent accidental movement while arranging tables.
  - **Replace & Delete**: One-click actions to upload a revised drawing or remove the layer entirely.

### 4. Zero-Migration Persistence
- Add `referenceLayer?: FloorPlanReferenceLayer` to `FloorPlanConfig` in `src/types/sigil.types.ts`.
- Persist configuration seamlessly inside `InvitationDesign.floorPlan` via existing `/canvas` APIs without requiring database schema changes.

## Files to Create & Modify

| Action | Path | Purpose |
|---|---|---|
| **MODIFY** | `src/types/sigil.types.ts` | Define `FloorPlanReferenceLayer` interface and add `referenceLayer?` to `FloorPlanConfig`. |
| **MODIFY** | `src/state/sigilStore.ts` | Add actions: `setFloorPlanReferenceLayer`, `updateFloorPlanReferenceLayer`, `clearFloorPlanReferenceLayer`. |
| **NEW** | `src/components/floorplan/FloorPlanReferenceControls.tsx` | UI toolbar/popover with upload button, sliders (opacity, scale), lock, visibility, and reposition toggles. |
| **MODIFY** | `src/components/floorplan/FloorPlanCanvas.tsx` | Render reference image layer under tables and handle reposition drag when unlocked. |
| **MODIFY** | `src/components/floorplan/FloorPlanView.tsx` | Mount reference controls in header/canvas and connect store actions. |
| **MODIFY** | `src/styles/floorPlan.css` | Add styling for the reference layer, alignment handles, and control toolbar popover. |
| **NEW** | `src/state/floorPlanReferenceActions.test.ts` | Unit tests for store reference layer actions and immutability. |
| **MODIFY** | `src/components/floorplan/FloorPlanView.test.tsx` | Component tests for uploading, adjusting opacity/scale, and toggling visibility. |

## Scope Constraints

### In-Scope
- Uploading raster and SVG floor plan references (`png`, `jpeg`, `webp`, `svg`).
- Real-time opacity, scale, and $(x, y)$ position adjustments.
- Show/hide visibility toggle and drag-lock toggle.
- Persistence with `saveCurrentDesign()` and `loadDesign()`.
- Synchronized scaling with floor plan canvas zoom.

### Out-of-Scope
- Multi-page PDF parsing or vector CAD (`.dwg` / `.dxf`) file interpretation (hosts export their layout as PNG/JPG/SVG).
- Automated architectural edge-detection or procedural wall vectorization.
