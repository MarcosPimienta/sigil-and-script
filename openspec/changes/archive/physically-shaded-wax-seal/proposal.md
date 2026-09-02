# Proposal: Physically Shaded Wax Seal

**Change ID:** `physically-shaded-wax-seal`
**Created:** 2026-09-02
**Status:** Awaiting approval

## Problem

The `WAX_SEAL` branch of `SealCreator.tsx` builds the seal entirely procedurally on a Canvas 2D context: a 36-point jittered polygon filled with a radial gradient stands in for the wax blob, two stroked arcs fake the rim wall, and the uploaded emblem is stamped three times (a black copy offset bottom-right, a white copy offset top-left, and a tinted copy on top) to imitate a bevel & emboss effect.

This approach has structural limits that no amount of parameter tuning fixes:

- The offset-copy "bevel" has no notion of surface slope. Every edge gets the same hard highlight/shadow regardless of orientation, so the emblem reads as a flat cutout with a drop shadow rather than relief pressed into wax.
- Rim, floor and emblem are shaded by three unrelated gradients. There is no single light source, so highlights contradict each other.
- The "Metallic Gloss" finish is a diagonal white-stripe overlay, not a specular response to the surface.
- The wax edge is a smooth spline, nothing like the drips, folds and irregular thickness of real pressed wax (compare `public/envelope-with-seal.png`, the target look).

## Proposed Solution

Replace the procedural drawing with a small **relief-shading pipeline** that mirrors what tools like NormalMap-Online do, executed live in the browser on `ImageData` buffers:

1. **Wax blank assets.** Ship a real wax base as a pair of images in `src/assets/seals/`: a neutral-gray *albedo* (grain and colour-free surface detail, transparent outside the wax) and a matching grayscale *height map* (rim high, pressed floor mid, background black). Because the albedo is gray, one asset is recoloured at runtime to any wax colour.
2. **Sigil → height.** Rasterize the user's uploaded emblem, take its alpha as a height field, blur it by a radius driven by the existing *Bevel Depth* slider (soft rounding = real bevel), optionally invert for deboss, and add it onto the blank's height map inside the pressed-floor region.
3. **Height → normals → shading.** Run a Sobel filter on the composed height field to get per-pixel normals, then light every pixel with a single directional light: Lambert diffuse plus Blinn-Phong specular, with a cheap ambient-occlusion term for the recessed floor. *Matte* and *Metallic* become real material parameters (specular strength / shininess) instead of an overlay.
4. **Compose.** Multiply the lit colour by the gray albedo, mask by the blank's alpha, draw onto the existing 512×512 canvas with the existing drop shadow. `handleApply`, the `/upload/media` call and `EnvelopeWrapper` consume the same PNG as today and are untouched.

The shading math lives in a pure, dependency-free TypeScript module (`src/utils/reliefShader.ts`) that operates on typed arrays, so it is unit-testable in vitest without a DOM and reusable outside React.

## Files to Create & Modify

| File | Action | Purpose |
|---|---|---|
| `src/utils/reliefShader.ts` | Create | Pure functions: alpha extraction, separable box blur, height composition, Sobel normals, directional lighting, AO, colour composition. No DOM dependencies. |
| `src/utils/reliefShader.test.ts` | Create | Vitest unit tests on tiny synthetic height fields (flat plane → uniform shading, step edge → highlight on lit side, invert → deboss, etc.). |
| `src/utils/sealBlanks.ts` | Create | Registry of available wax blanks: id, display name, albedo URL, height URL, floor-region descriptor (centre + radius as a fraction of the image). |
| `src/assets/seals/round/albedo.png` | Create | Neutral-gray albedo of a round wax blank with irregular drippy edge, transparent background. First pass generated procedurally by a build-time script; replaceable by a hand-painted asset later. |
| `src/assets/seals/round/height.png` | Create | Matching 16-bit-quality grayscale height map (stored as 8-bit PNG; sufficient at 512px). |
| `scripts/generate-wax-blank.ts` | Create | Node script that renders the first-pass procedural blank pair (noise-perturbed disc with raised rim, drip lobes and grain). Lets us iterate on the blank without a painting tool and documents the asset contract. |
| `src/components/creator/SealCreator.tsx` | Modify | Replace the `WAX_SEAL` branch of `redrawCanvas` with a call into the relief pipeline; add blank picker, emboss/deboss toggle and light-angle presets to the wax controls; keep the `STICKER` branch untouched. |
| `src/styles/creator.css` | Modify | Styles for the blank picker thumbnails and light-angle preset buttons (reuse `.scm-segmented` where possible). |
| `openspec/specs/sigil_and_script_spec.json` | Modify (on archive) | Register milestone `M8_PHYSICAL_SEAL_SHADING`. |

## Scope Constraints

### In scope

- Normal-map style relief shading for the wax seal preview and exported PNG.
- One shipped wax blank (`round`) with the registry designed so more blanks can be added by dropping in two PNGs.
- Repurposing the existing *Bevel Depth* slider (blur radius / relief strength) and *Finish* toggle (material parameters) so their meaning is preserved for the host.
- New host controls: emboss vs. deboss, light direction (three presets: top-left, top, top-right).
- Unit tests for the shader module; visual verification against `public/envelope-with-seal.png`.
- Performance target: a full 512×512 redraw under ~16 ms on a mid-range laptop, with slider redraws coalesced through `requestAnimationFrame`.

### Out of scope

- WebGL / shader-language implementation (Canvas 2D + typed arrays is sufficient at this resolution).
- Animated or interactive lighting on the recipient envelope; the recipient still receives a static PNG.
- Replacing the CSS `.wax-seal-btn` fallback shown in `EnvelopeWrapper` when no sticker image exists (could be a follow-up: pre-render a default seal PNG with this pipeline).
- Changes to the `STICKER` seal type, the media upload API, or the `design.stickerImage` / `sealSize` data contract.
- Hand-painted, photo-derived wax blanks. The asset contract supports them, but authoring them is a separate content task.
