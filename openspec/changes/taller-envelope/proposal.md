# Proposal — Taller Envelope

## Problem
The envelope PNGs (`ClosedEnvelope00.png` and `OpenedEnvelope00.png`) have a native wide aspect ratio of `2816 x 1536` (`1.83`). Because the container has an aspect ratio of `440 / 340` (`1.29`) and the image layer uses `object-fit: contain`, the rendered height is restricted to `240px` with `100px` of empty vertical space (letterboxing). 

This squashes the envelope, making the closed envelope look very flat/thin and preventing the Polaroid couples card from fitting cleanly inside the pocket (causing it to float above it).

## Proposed Solution
- Modify `.envelope-png-layer` in [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) to use `object-fit: fill` instead of `object-fit: contain`.
- This stretches the envelope images vertically to fill the full `440px` width and `340px` height of the container, increasing the rendered envelope height by 41% (from `240px` to `340px`).
- Stretching the envelope provides a much deeper pocket, matching the Polaroid card dimensions and making the photo transition look correctly nested inside.

---

## Files to Modify

| File | Change |
|---|---|
| `src/styles/creator.css` | Change `object-fit: contain` to `object-fit: fill` on `.envelope-png-layer`. |

---

## Scope Constraints

- **In-Scope**:
  - Altering the image scaling behavior (`object-fit`) of the envelope layers.
  - Verifying layout dimensions and positioning of the pocket clipper and wax seal.
- **Out-of-Scope**:
  - Resizing or editing the source image files (`ClosedEnvelope00.png`, `OpenedEnvelope00.png`).
  - Changing React component structure or states in `EnvelopeWrapper.tsx`.
