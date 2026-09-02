# Wax blank assets

Each subfolder is one wax "blank" consumed by `src/utils/reliefShader.ts` via the
registry in `src/utils/sealBlanks.ts`.

```
seals/<id>/albedo.png   RGBA. Neutral gray surface (mean luminance ≈ 0.5) with grain.
                        Alpha = coverage (1 inside the wax, 0 outside, ~1.5px feather).
seals/<id>/height.png   RGB or RGBA. Red channel = height:
                          0.00  outside the wax
                          ~0.45 pressed floor (where the sigil is stamped)
                          ~1.00 crest of the rim
                        Smooth transitions — hard steps produce ridge lines.
```

Rules:

- Both images must have identical dimensions. 512×512 is the shipped size and
  matches the creator's export canvas.
- Albedo carries **no colour**: the host's wax colour is multiplied in at runtime.
  Keep it gray so any preset or custom hex works.
- The registry entry declares the pressed floor as a circle (`cx`, `cy`, `r` as
  fractions of the image). The sigil relief is confined to that circle, so it must
  sit inside the flat floor area of `height.png`.
- Hand-painted or photo-derived blanks are welcome; the first-pass `round` blank is
  procedural and can be regenerated with:

  ```
  npm run assets:wax -- round 7        # <id> <seed>
  ```

  (runs `scripts/generate-wax-blank.ts` with Node's TypeScript strip mode).
