# Design — Taller Envelope

## Architectural Decisions

### Decision 1: Stretch Image Layers Using `object-fit: fill`
**Choice**: Change `.envelope-png-layer` styling from `object-fit: contain` to `object-fit: fill`.
**Why**:
- Using `object-fit: fill` stretches the native `2816 x 1536` image to fit the container bounds (`440 x 340`) exactly.
- This increases the height of the envelope on screen from `240px` to `340px`, eliminating the letterbox margin.
- Stretching is ideal here as it naturally deepens the visual pocket pocket depth from `120px` to `170px` without cutting off the side wings/flaps (which would happen with `object-fit: cover`).

### Decision 2: Preservation of Layer Symmetry
**Why**:
- The wax seal and Polaroid card are separate DOM elements layered *on top* of the envelope image layers rather than being flattened inside the image file.
- The `object-fit: fill` rule will only apply to the background envelope `<img>` tags, meaning the circular wax seal button and square Polaroid photo will maintain their correct, non-distorted aspect ratios.

---

## Risks & Mitigations

### Risk 1: Image Stretching Distortion
- **Risk**: Strecthing a `1.83` image to a `1.29` aspect ratio could make the paper texture folds look slightly elongated.
- **Mitigation**: Tested visually; since the envelopes consist of organic paper textures and shadows rather than circular patterns or text, the vertical elongation is not visually disruptive and yields a much cleaner envelope cover look.
