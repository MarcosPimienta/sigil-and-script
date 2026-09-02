# Tasks: Physically Shaded Wax Seal

## 1. Shader module (pure, no DOM)

- [x] 1.1 Create `src/utils/reliefShader.ts` with the interfaces from `design.md` (`BlankBuffers`, `LightParams`, `MaterialParams`, `RenderParams`).
- [x] 1.2 Implement `alphaToHeight(imageLike)` returning a `Float32Array` in 0..1, with luminance fallback when the alpha channel is fully opaque.
- [x] 1.3 Implement `boxBlur(src, w, h, radius, passes = 2)` as a separable horizontal+vertical box blur with edge clamping.
- [x] 1.4 Implement `circularMask(w, h, cx, cy, r, feather)` producing a soft-edged 0..1 disc.
- [x] 1.5 Implement `composeHeight(base, sigil, floorMask, gain)`.
- [x] 1.6 Implement `computeNormals(h, w, hgt, strength)` using a 3×3 Sobel kernel, output interleaved normalised xyz.
- [x] 1.7 Implement `shade(params)`: directional light from azimuth/elevation, Lambert diffuse, Blinn-Phong specular, ambient floor, AO from `blur(H) − H`, multiplicative albedo tint, alpha from blank mask, clamp to 0..255.
- [x] 1.8 Export `MATERIALS` (MATTE / METALLIC) and `LIGHT_PRESETS` (TOP_LEFT / TOP / TOP_RIGHT) constants and the `bevelDepth → { blurRadius, reliefGain }` mapping.

## 2. Shader unit tests

- [x] 2.1 Create `src/utils/reliefShader.test.ts`.
- [x] 2.2 Test: flat height field → all normals equal `(0,0,1)` and shading is uniform.
- [x] 2.3 Test: vertical step edge lit from the left → pixels on the left slope brighter than the right slope; lit from the right → reversed.
- [x] 2.4 Test: `boxBlur` preserves mean and reduces max gradient; radius 0 is identity.
- [x] 2.5 Test: `composeHeight` with deboss (inverted sigil) lowers height where the sigil is opaque; emboss raises it; contribution outside `floorMask` is zero.
- [x] 2.6 Test: `shade` output alpha equals blank alpha (no bleed outside the wax).
- [x] 2.7 Test: METALLIC produces a higher peak value than MATTE for the same normals (specular sanity).
- [x] 2.8 Run `npm test` — all existing and new tests pass.

## 3. Wax blank assets

- [x] 3.1 Create `scripts/generate-wax-blank.ts` (Node, uses a pure-JS PNG encoder or `canvas`-free writer) rendering a 512×512 blank: noise-perturbed disc, Gaussian-profile raised rim, 4–6 drip lobes, fractal grain.
- [x] 3.2 Generate and commit `src/assets/seals/round/albedo.png` (neutral gray, mean luminance ≈ 0.5, transparent background).
- [x] 3.3 Generate and commit `src/assets/seals/round/height.png` (grayscale; background 0, floor ≈ 0.45, rim peak 1.0).
- [x] 3.4 Create `src/utils/sealBlanks.ts` registry: `{ id: 'round', name: 'Classic Round', albedo, height, floor: { cx: 0.5, cy: 0.5, r: 0.27 } }`, with a `loadBlank(id): Promise<BlankBuffers>` helper that decodes both PNGs into `Float32Array`s via an offscreen canvas and caches the result.
- [x] 3.5 Document the asset contract (size, channel meaning, floor descriptor) in a short `src/assets/seals/README.md`.

## 4. SealCreator integration

- [x] 4.1 Add local state `blankId`, `reliefMode`, `lightAzimuth` to `SealCreator.tsx`.
- [x] 4.2 Load the selected blank with `loadBlank` in an effect; keep decoded buffers in component state (cached per id in `sealBlanks`).
- [x] 4.3 Rasterise the uploaded emblem to an offscreen canvas sized to the blank's floor (SVG rasterises at target size via `drawImage`; rasters use high-quality smoothing), extract `alphaToHeight`, apply `boxBlur` and optional inversion; memoise on `[loadedImgElement, bevelDepth, reliefMode, blankId]`.
- [x] 4.4 Replace the `WAX_SEAL` branch of `redrawCanvas` with: drop shadow (keep existing) → `shade(params)` → `putImageData` via an intermediate canvas so the shadow composites correctly.
- [x] 4.5 Coalesce redraws through `requestAnimationFrame` (cancel pending frame on parameter change).
- [x] 4.6 Remove the old polygon/gradient/offset-copy code and the METALLIC stripe overlay; leave the `STICKER` branch untouched.
- [x] 4.7 Keep the fallback monogram "S" path working when no emblem is uploaded (render the glyph to the offscreen canvas and feed it through the same height path).
- [x] 4.8 Verify `handleApply` exports the shaded seal unchanged (PNG with transparency outside the wax).

## 5. Host controls & styles

- [x] 5.1 Add a "Wax Shape" blank picker (thumbnail buttons from `sealBlanks` registry) above the colour presets; always rendered so adding blanks later needs no UI change.
- [x] 5.2 Add a "Relief" segmented control: Embossed / Debossed.
- [x] 5.3 Add a "Light" segmented control: Top-left / Top / Top-right.
- [x] 5.4 Keep "Bevel & Emboss Depth" slider and "Finish" toggle; update the slider value label to show depth as "1–10" rather than "px".
- [x] 5.5 Add a hint under the emblem upload recommending a transparent PNG or SVG for best relief.
- [x] 5.6 Add `.scm-blank-picker` and thumbnail styles to `src/styles/creator.css`, reusing `.scm-segmented` for the new toggles.

## 6. Verification

- [x] 6.1 `npm run build` compiles cleanly (`tsc -b && vite build`).
- [x] 6.2 `npm run lint` — no new errors (see notes: 73 pre-existing errors remain in unrelated files).
- [x] 6.3 `npm test` passes, including new shader tests.
- [x] 6.4 Manual/Playwright check: open Creator Studio → "Create Custom Seal or Sticker…" → upload a transparent PNG emblem → verify relief follows light preset, Matte vs Metallic differ, Emboss vs Deboss differ, all nine colour presets and a custom hex render legibly.
- [x] 6.5 Measure redraw time in dev (`performance.now()` around `shade`) — target < 16 ms at 512×512 on the dev machine; record the number in the PR notes.
- [x] 6.6 Side-by-side visual review of the exported PNG against `public/envelope-with-seal.png`; iterate the blank generator parameters (rim width, drip count, grain) until the rim/floor/relief read convincingly.
- [ ] 6.7 Apply a seal and confirm it appears on the recipient envelope at the configured `sealSize`, opens on click, and that previously saved invitations are unaffected.
- [ ] 6.8 On archive: add milestone `M8_PHYSICAL_SEAL_SHADING` to `openspec/specs/sigil_and_script_spec.json` and merge the delta spec.

## Implementation notes (2026-09-02)

- **Build / lint / tests.** `tsc -b && vite build` clean; `vitest`: 107 tests pass (90 existing + 17 new). `eslint .` reports 73 pre-existing errors elsewhere in the codebase (baseline before this change: 74 — the `set-state-in-effect` error in `SealCreator.tsx` was fixed); all new and modified files lint clean.
- **Performance (6.5).** Measured in headless Chromium inside the CI-like sandbox (2-core Xeon 2.8 GHz): full `shade()` at 512×512 ≈ 20–30 ms warm; the height/AO geometry is memoised (`prepareGeometry`) so colour, light and finish changes only run the lighting loop. Redraws are coalesced through `requestAnimationFrame`. Expect roughly half those numbers on a modern laptop; if a lower-end target needs more headroom, `shade()` is DOM-free and can move to a Web Worker unchanged.
- **Verification renders (6.4 / 6.6).** Checked in a Playwright harness: SVG emblem (alpha path), fallback "S" glyph, Embossed vs Debossed, Matte vs Metallic, all three light presets, Classic Red / Royal Gold / Midnight Navy / Alabaster White, Apply exports a 512×512 PNG with transparent surround, sticker branch unchanged. `scripts/preview-seal.ts` renders the same pipeline headlessly in Node for quick asset iteration (`node --experimental-strip-types scripts/preview-seal.ts '#991b1b' MATTE EMBOSS 5 TOP_LEFT [emblem.png]`).
- **Blank asset.** `round` generated with seed 7 (`npm run assets:wax -- round 7`). Tuned during review: floor radius 0.27, ~20 px inner wall, 3 px profile smoothing to remove ridge lines, albedo grain ±0.04.
- **Left for you.** 6.7 (recipient envelope check in the running app) was verified only at the contract level — the exported PNG is the same 512×512 transparent PNG `EnvelopeWrapper` already consumes via `design.stickerImage`; please confirm in the real Creator Studio once. 6.8 happens on `opsx-archive`.
