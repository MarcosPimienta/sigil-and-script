# Specification: Floor Plan Reference Blueprint Layer

**Spec ID:** `floor-plan-reference-layer`
**Capability:** HOST tenant → Floor Plan Blueprint Reference Overlay

## Requirements

### Requirement: Blueprint Reference Upload

The application SHALL allow hosts to upload an architectural drawing, blueprint, or venue floor plan image into the Floor Plan workspace.

#### Scenario: Supported File Formats
- **WHEN** the host selects a file to upload as the reference blueprint
- **THEN** the system accepts `image/png`, `image/jpeg`, `image/webp`, and `image/svg+xml` files up to 8MB in size.

#### Scenario: Successful Upload and Initialization
- **WHEN** a valid image file is uploaded
- **THEN** the system uploads the image to the media storage API (or stores a local fallback data URL), initializes a `FloorPlanReferenceLayer` with default values (`opacity: 0.45`, `scale: 1.0`, `x: 0`, `y: 0`, `visible: true`, `locked: true`), and renders it on the floor plan canvas.

---

### Requirement: Canvas Layer Rendering and Zoom Synchronization

The reference blueprint SHALL render directly beneath the table layout and scale identically with the canvas zoom factor.

#### Scenario: Visual Layering Under Tables
- **WHEN** the floor plan canvas renders tables and a reference blueprint layer
- **THEN** the reference image is positioned with `z-index: 1` beneath all table nodes and seat elements (`z-index: 10`), so tables, chairs, and guest labels remain legible above the blueprint.

#### Scenario: Zoom Synchronization
- **WHEN** the host zooms in, zooms out, or resets zoom on the floor plan canvas
- **THEN** the reference layer scales synchronously with the table nodes inside `.floorplan-canvas-viewport`.

---

### Requirement: Reference Layer Opacity and Visibility Controls

Hosts SHALL be able to adjust the transparency of the reference blueprint or temporarily hide it.

#### Scenario: Adjusting Opacity
- **WHEN** the host changes the opacity slider in the reference controls
- **THEN** the blueprint layer updates its CSS opacity in real-time between 0.05 (5%) and 1.0 (100%).

#### Scenario: Toggling Visibility
- **WHEN** the host toggles the visibility control (eye icon) off
- **THEN** the reference blueprint is hidden from the canvas without deleting its configuration or upload URL.
- **WHEN** the host toggles visibility back on
- **THEN** the reference blueprint is shown with its previous position, scale, and opacity preserved.

---

### Requirement: Reference Layer Scaling and Alignment

Hosts SHALL be able to scale and translate the blueprint to align real-world architectural features with the table grid.

#### Scenario: Adjusting Blueprint Scale
- **WHEN** the host changes the scale slider
- **THEN** the blueprint scales proportionally from 0.2× (20%) to 3.0× (300%) relative to its top-left origin.

#### Scenario: Repositioning the Blueprint
- **WHEN** the host unlocks or enables "Reposition / Align" mode
- **THEN** the host can drag the blueprint across the canvas to adjust its `(x, y)` coordinate offsets.

#### Scenario: Resetting Alignment
- **WHEN** the host clicks "Reset Alignment"
- **THEN** `x` and `y` are reset to `0` and `scale` is reset to `1.0`.

---

### Requirement: Reference Layer Persistence

The blueprint configuration SHALL persist across save and reload cycles.

#### Scenario: Saving to Database
- **WHEN** the host clicks "Save to Database" or design auto-save fires
- **THEN** `referenceLayer` is serialized as part of `floorPlan` within `InvitationDesign` and stored via the `/canvas` API.

#### Scenario: Reloading Saved Blueprint
- **WHEN** the host opens or reloads an event design with a saved `referenceLayer`
- **THEN** the blueprint image is retrieved from its URL and rendered with the saved opacity, scale, position, and visibility state.
