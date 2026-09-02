# Design: Physically Shaded Wax Seal

## Pipeline overview

```
 wax blank (asset)                     user emblem (upload)
 ┌──────────┬──────────┐               ┌──────────────┐
 │ albedo   │ height   │               │ RGBA raster  │
 │ (gray)   │ (H_base) │               └──────┬───────┘
 └────┬─────┴────┬─────┘                      │ alpha → float
      │          │                            ▼
      │          │                    ┌──────────────┐
      │          │                    │ box blur ×2  │  radius = f(bevelDepth)
      │          │                    │ (invert if   │
      │          │                    │  deboss)     │
      │          │                    └──────┬───────┘
      │          ▼                           │
      │   H = H_base + floorMask · k · H_sigil ◄──┘
      │          │
      │          ▼
      │   Sobel → N = normalize(-dx·s, -dy·s, 1)
      │          │
      │          ▼
      │   L = ambient + kd·max(0,N·L) + ks·max(0,N·Hv)^p   (Hv = half vector)
      │   AO = clamp(1 - a·(blur(H) - H), 0.6, 1)
      │          │
      ▼          ▼
 rgb = waxColor · L · AO · albedoGray ;  a = blankAlpha
                 │
                 ▼
         ImageData → canvas (+ existing drop shadow)
```

All stages operate on `Float32Array` buffers of size `w*h`, sized to the preview canvas (512×512). The React component owns the canvas and the parameters; `reliefShader.ts` owns the math.

## Architectural decisions

### AD-1: Canvas 2D + typed arrays, not WebGL

**Choice.** Implement the height→normal→lighting pass as plain TypeScript loops over `Float32Array`, output to `ImageData`.

**Why.** At 512² pixels the whole pass is ~260k iterations of a few multiply-adds; this runs in single-digit milliseconds. WebGL would add a shader toolchain, context-loss handling, jsdom test friction, and a second rendering path for `toDataURL` export. The pure-function approach is testable in vitest with no DOM and can later be moved to a Web Worker unchanged if needed.

**Trade-off.** No free bilinear sampling or GPU parallelism; acceptable at this resolution. Preview canvas resolution stays fixed at 512 (matching the current export contract).

### AD-2: Height map as the single source of shape

**Choice.** Everything that has 3D form — rim, floor, drips, emblem relief — is expressed in one composed height field `H`. Shading never reads the emblem or the blank directly; it only reads `H`, the albedo and the alpha mask.

**Why.** One height field means one light source and mutually consistent shadows/highlights across rim, floor and sigil, which is the core visual defect of the current approach. It also makes the artist contract for blanks trivial: "paint a height map".

### AD-3: Gray albedo + runtime tint instead of per-colour assets

**Choice.** Blank albedo is stored desaturated with its mean luminance normalised to ~0.5. Final colour is `waxColor × lighting × (albedo / 0.5)`.

**Why.** Nine preset colours plus a free colour picker already exist; shipping a coloured asset per colour is impossible. Multiplicative tint preserves grain while letting the hue come from the host's choice. The lighting term (not the albedo) carries the value range, so dark colours like Charcoal still show relief.

### AD-4: Bevel Depth slider drives blur radius *and* relief gain

**Choice.** `bevelDepth ∈ [1,10]` maps to blur radius `r = 1 + bevelDepth × 0.6` px (at 512px) and relief gain `k = 0.35 + bevelDepth × 0.05`. Exposed to the host as one slider with the same label.

**Why.** Blur radius controls how rounded the emblem's edges are; gain controls how tall they are. A real bevel changes both together. Keeping one slider preserves the host's existing mental model and avoids control sprawl.

### AD-5: Finish maps to material parameters

| Finish | `ks` (specular) | `p` (shininess) | `kd` |
|---|---|---|---|
| MATTE | 0.12 | 8 | 0.85 |
| METALLIC | 0.55 | 48 | 0.70 |

**Why.** A tight, strong specular lobe on a normal-mapped surface *is* the metallic look; the current diagonal-stripe overlay is removed.

### AD-6: Light direction presets, fixed elevation

**Choice.** Three presets (top-left, top, top-right) select the azimuth; elevation is fixed at ~55°. View vector is `(0,0,1)`.

**Why.** The current code and the reference asset both assume top-left key light; presets give the host a meaningful choice without a dial that is easy to make look wrong. Azimuth is stored as a number so a free dial can be added later without a data migration.

### AD-7: Emblem confined to the pressed floor

**Choice.** The blank registry describes the floor as a circle (centre, radius as fractions of the image). The sigil height contribution is multiplied by a soft-edged floor mask before being added to `H_base`.

**Why.** Prevents a large emblem from "climbing" the rim, which would produce impossible geometry and defeat the rim/floor separation that sells the pressed look. The emblem is drawn at `floorRadius × 2 × 0.9` px so it fits by construction; the mask is a safety net for non-square emblems.

### AD-8: Blank assets are generated first, painted later

**Choice.** `scripts/generate-wax-blank.ts` renders the first blank pair (noise-perturbed disc, raised rim with Gaussian profile, 4–6 drip lobes, fine fractal grain) to PNG. Assets are committed to the repo; the script is not part of the app bundle.

**Why.** Unblocks development and testing with no dependency on a painting tool or photo source, while defining the asset contract precisely enough that a hand-painted or photo-derived blank can replace it with no code change.

### AD-9: Rendering is a pure function of parameters

**Choice.** `renderWaxSeal(params): ImageData` is deterministic. The React component memoises the decoded blank buffers and the blurred sigil height (which only change when the blank or emblem or bevel changes) and schedules a single redraw per animation frame.

**Why.** Slider drags cause many state updates per frame; coalescing keeps the preview at 60 fps. Determinism is what makes the export PNG match the preview and makes the unit tests meaningful.

## Data model

No changes to `sigil.types.ts` or the persisted design. The seal creator keeps its parameters in local component state, and the output contract remains a PNG data/public URL stored in `design.stickerImage`.

New local state in `SealCreator`: `blankId: string`, `reliefMode: 'EMBOSS' | 'DEBOSS'`, `lightAzimuth: number` (degrees).

## Module API (`src/utils/reliefShader.ts`)

```ts
export interface BlankBuffers { width: number; height: number; albedo: Float32Array; heightMap: Float32Array; alpha: Float32Array; }
export interface LightParams { azimuthDeg: number; elevationDeg: number; }
export interface MaterialParams { ambient: number; kd: number; ks: number; shininess: number; }
export interface RenderParams {
  blank: BlankBuffers;
  sigilHeight: Float32Array | null;   // same size as blank, already blurred/inverted
  floorMask: Float32Array;            // 0..1, same size
  reliefGain: number;
  normalStrength: number;
  waxColor: [number, number, number]; // 0..1
  light: LightParams;
  material: MaterialParams;
  aoStrength: number;
}
export function alphaToHeight(img: ImageData): Float32Array;
export function boxBlur(src: Float32Array, w: number, h: number, radius: number, passes?: number): Float32Array;
export function composeHeight(base: Float32Array, sigil: Float32Array | null, floorMask: Float32Array, gain: number): Float32Array;
export function computeNormals(h: Float32Array, w: number, hgt: number, strength: number): Float32Array; // xyz interleaved
export function shade(params: RenderParams): ImageData;   // full pipeline
export function circularMask(w: number, h: number, cx: number, cy: number, r: number, feather: number): Float32Array;
```

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Redraw too slow on low-end devices, making sliders laggy. | Memoise blank decode and sigil blur; single rAF-coalesced redraw; separable box blur (O(n) per pass) instead of Gaussian kernels; measure with `performance.now()` in dev and assert < 16 ms in a Playwright smoke test. If needed, move `shade()` to a Web Worker — the API is already DOM-free. |
| SVG emblems rasterise at low resolution → blocky relief. | Draw SVG into the offscreen canvas at 2× the emblem size then downsample; already used size-independent `drawImage`. |
| Coloured or anti-aliased emblems (JPEG, photos) have no meaningful alpha. | If the emblem's alpha channel is fully opaque, fall back to luminance (inverted: dark = raised) as the height source; surface a hint in the UI recommending transparent PNG/SVG. |
| Very dark wax colours lose visible relief. | Lighting term is applied before tint and includes a floor on ambient (0.25); specular is additive white, so highlights remain visible on black wax. |
| Very light colours (Alabaster) clip to white. | Clamp final RGB; specular strength scaled by `1 − luminance(waxColor) × 0.5`. |
| Generated blank looks synthetic compared to a photo. | Asset contract allows drop-in replacement; the generator adds fractal grain and irregular drips so the first pass already beats the current spline. Visual review against `envelope-with-seal.png` is an explicit verification task. |
| Existing exported seals change appearance for saved invitations. | They do not: saved `stickerImage` PNGs are immutable. Only newly generated seals use the new pipeline. |
| jsdom lacks `ImageData` / canvas in unit tests. | Core functions take/return `Float32Array` and plain `{data,width,height}` objects; only the thin `ImageData` wrapper touches the DOM and is exercised in component tests with the existing `test-setup.ts` canvas polyfill (or skipped under jsdom). |
| Bundle size from two 512px PNGs. | Expected < 250 KB total; assets are code-split via Vite asset imports and only loaded when the seal creator opens. |
