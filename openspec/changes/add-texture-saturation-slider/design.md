# Technical Design: Texture Background Saturation Slider

## Architectural Decisions

1. **State Model**:
   - `InvitationDesign.paperSaturate`: number (range `0.0` to `3.0`, default `1.0`).
2. **CSS Filter Formula**:
   - `filter: brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`
   - Default values applied when undefined: `brightness = 1.0`, `contrast = 1.0`, `saturate = 1.0`.
