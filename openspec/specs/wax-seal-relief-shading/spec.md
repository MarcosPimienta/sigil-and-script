# Spec: Wax Seal Relief Shading

**Spec ID:** `wax-seal-relief-shading`
**Capability:** Creator Studio → Custom Seal & Sticker Creator → 3D Wax Seal

## Requirements

### Requirement: Height-map based wax rendering

The 3D Wax Seal preview and export SHALL be produced by lighting a per-pixel height field composed from a wax blank asset and the host's emblem, rather than by layered gradients and offset copies.

#### Scenario: Consistent single light source
- **WHEN** a host previews a wax seal with any emblem and any wax colour
- **THEN** the rim, the pressed floor and the emblem relief are all lit from the same direction, with highlights on surfaces facing the light and shadows on surfaces facing away.

#### Scenario: Preview matches export
- **WHEN** the host clicks Apply
- **THEN** the exported 512×512 PNG is pixel-identical to the last rendered preview, with fully transparent pixels outside the wax.

### Requirement: Wax blank assets

The creator SHALL source the wax shape from a registry of blank assets, each consisting of a neutral-gray albedo image and a grayscale height image with a declared pressed-floor region.

#### Scenario: Recolouring a blank
- **WHEN** the host selects any preset colour or enters a custom hex
- **THEN** the same blank asset is rendered in that colour with its surface grain preserved and relief still visible, including for very dark (`#18181b`) and very light (`#e2e8f0`) colours.

#### Scenario: Adding a blank
- **WHEN** a developer adds a new entry to the blank registry with two PNGs and a floor descriptor
- **THEN** it appears in the Wax Shape picker with no other code changes.

### Requirement: Emblem relief

The host's uploaded emblem SHALL be converted into a soft height contribution confined to the blank's pressed floor.

#### Scenario: Embossed emblem
- **WHEN** Relief is set to *Embossed* and a transparent PNG/SVG emblem is uploaded
- **THEN** opaque regions of the emblem appear raised above the floor with rounded edges whose softness increases with the Bevel & Emboss Depth slider.

#### Scenario: Debossed emblem
- **WHEN** Relief is set to *Debossed*
- **THEN** opaque regions appear pressed below the floor, with highlight and shadow sides swapped relative to Embossed under the same light.

#### Scenario: Emblem larger than the floor
- **WHEN** an emblem's bounding box exceeds the pressed floor
- **THEN** its relief contribution fades to zero at the floor edge and never alters the rim.

#### Scenario: Emblem without transparency
- **WHEN** the uploaded emblem has a fully opaque alpha channel (e.g. JPEG)
- **THEN** the creator derives height from inverted luminance (dark = raised) and shows a hint recommending a transparent PNG or SVG.

### Requirement: Material finish

The *Finish* control SHALL select physically meaningful material parameters.

#### Scenario: Matte wax
- **WHEN** Finish is *Matte Wax*
- **THEN** the surface shows broad, low-intensity highlights and no sharp specular spot.

#### Scenario: Metallic gloss
- **WHEN** Finish is *Metallic Gloss*
- **THEN** the surface shows a tight, bright specular highlight that follows surface curvature (rim, emblem edges), and no full-canvas diagonal stripe overlay is drawn.

### Requirement: Light direction

The host SHALL be able to choose the key light direction from three presets.

#### Scenario: Changing the light
- **WHEN** the host switches between Top-left, Top and Top-right
- **THEN** highlights and shadows on rim and emblem move accordingly within one animation frame, and all other parameters are preserved.

### Requirement: Performance

#### Scenario: Slider interaction
- **WHEN** the host drags the Bevel & Emboss Depth slider continuously
- **THEN** at most one full redraw occurs per animation frame and the preview remains responsive (target < 16 ms per redraw at 512×512).

### Requirement: Bevel & Emboss Depth control

The existing slider (range 1–10) SHALL now drive the emblem edge-rounding radius and relief height together instead of the pixel offset of shadow/highlight copies. The label is retained; the value readout no longer shows "px".

## Explicit Non-Modifications

- Sticker Label seal type and all its controls.
- `handleApply` upload to `/upload/media` and fallback to a data URL.
- `design.stickerImage` and `design.sealSize` contract consumed by `EnvelopeWrapper`.
- Previously exported seal PNGs.
