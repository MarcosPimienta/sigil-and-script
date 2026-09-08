# Design: Floor Plan Reference Blueprint Layer

**Change ID:** `floor-plan-reference-layer`

## Architectural Decisions

### 1. Data Schema within `FloorPlanConfig`
- **Context**: The reference layer is an intrinsic attribute of the event's floor plan layout. It should save, load, and restore alongside tables and seats.
- **Decision**: Define `FloorPlanReferenceLayer` in `src/types/sigil.types.ts` and attach it as `referenceLayer?: FloorPlanReferenceLayer` on `FloorPlanConfig`:
  ```typescript
  export interface FloorPlanReferenceLayer {
    url: string;            // Hosted Supabase storage URL or local data URL
    opacity: number;        // Transparency: 0.05 to 1.0 (default: 0.45)
    scale: number;          // Scale factor: 0.2 to 3.0 (default: 1.0)
    x: number;              // Offset X in canvas pixels (default: 0)
    y: number;              // Offset Y in canvas pixels (default: 0)
    visible: boolean;       // Instant visibility toggle (default: true)
    locked?: boolean;       // Lock position to prevent accidental drags (default: true)
    fileName?: string;      // Original file name for UI display
  }
  ```
- **Alternatives Considered**:
  - *Storing in top-level `InvitationDesign` (e.g. `floorPlanBlueprintUrl`)*: Pollutes the top-level design interface with specialized spatial layout details. Keeping it nestled in `FloorPlanConfig` preserves modular encapsulation.
  - *Storing in local client cache / IndexedDB*: Fails cross-device collaboration; if a coordinator works on a laptop and checks from a tablet at the venue, the reference blueprint wouldn't be visible.
- **Trade-offs**: Slightly increases the serialized JSON payload size if using fallback data URLs, but standard uploads will use lightweight public Supabase CDN URLs.

### 2. Canvas Layering & Zoom Transformation
- **Context**: The floor plan canvas utilizes CSS scaling (`transform: scale(zoom)`) on `.floorplan-canvas-viewport`. Draggable table nodes are positioned using absolute pixel coordinates within this viewport.
- **Decision**:
  - Render the reference layer inside `.floorplan-canvas-viewport` as an `<img>` element inside a dedicated wrapper with `position: absolute`, `z-index: 1`, and `pointer-events: none` (when locked).
  - Use CSS `transform: translate(${x}px, ${y}px) scale(${scale})` with `transform-origin: top left`.
  - When locked, `pointer-events: none` guarantees that dragging gestures directly over the blueprint target either table nodes (`z-index: 10`) or the canvas scroll viewport without interference.
  - When unlocked in "Reposition Mode", the blueprint displays a subtle dashed bounding accent and captures pointer drag events to adjust `(x, y)` offsets.

### 3. Media Upload Pipeline & Fallback
- **Context**: Sigil & Script uses an authenticated Express backend with a `/upload/media` route pushing to Supabase Storage bucket `'event-assets'`, returning a CDN URL.
- **Decision**:
  - Use `compressImage` to downscale excessively huge camera photos (e.g., 20MB raw photos) to manageable dimensions (up to 2400px width/height for blueprints) while maintaining crisp line quality.
  - Send the payload to `/upload/media` with bucket `'event-assets'`.
  - If the server or Supabase storage is offline/unreachable in local development, gracefully fall back to storing the compressed data URL in local state so development and testing never stall.

### 4. Floating Control Bar & Quick Inspector
- **Context**: Blueprint controls (opacity slider, scale, show/hide, lock) must be quickly accessible without obscuring the canvas or competing with the seating statistics bar.
- **Decision**:
  - Place a toggle button in the `FloorPlanView` header: `📐 Blueprint` (indicating active/inactive state).
  - Clicking opens a compact floating toolbar in the corner of the canvas (similar to the Zoom bar):
    - When no blueprint exists: Clean dropzone/file upload trigger.
    - When blueprint exists:
      - Quick thumbnail and name.
      - Visibility toggle icon.
      - Opacity slider (5% – 100%).
      - Scale slider (20% – 300%) with reset button.
      - Lock / Align toggle.
      - Replace / Delete actions.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Large raster files slowing down canvas rendering | Apply client-side image compression with high max dimension bounds (2400px) and WebP/JPEG compression; SVGs bypass raster compression. |
| Blueprint layer blocking table clicks/drags | Set `pointer-events: none` on the blueprint image whenever locked (which is default). Only enable pointer drag during explicit "Reposition Blueprint" mode. |
| Extreme offset coordinates pushing blueprint off-canvas | Provide a "Center / Reset Position" button in the controls toolbar that resets `(x, y)` to `(0, 0)` and scale to `1.0`. |
| Legacy floor plans without `referenceLayer` | Default `floorPlan.referenceLayer` safely to `undefined` and render nothing unless defined and visible. |
