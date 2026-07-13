# Design — Remove Assets and Scale Wax Seal

## Architectural Decisions

### Decision 1: Proportional Scaling via CSS Variable
**Choice**: Use an inline CSS variable `--seal-scale` on the `.envelope-seal` element, and resolve it in the stylesheet using `scale(var(--seal-scale))`.
**Why**:
- Inline styles overriding `transform: translate(-50%, -50%) scale(...)` would completely break CSS hover transforms (`scale(1.08)`) and transitions since CSS properties would overwrite each other.
- Decoupling the scale factor via a custom property (`--seal-scale`) allows the stylesheet to calculate the hover transition scale cleanly:
  `transform: translate(-50%, -50%) scale(calc(var(--seal-scale, 1) * 1.08))`
- Ensures proportional scaling for all elements inside the seal (the wax icon, the text label "S", the cracking line, shadows) without layout distortion.

### Decision 2: UI Hiding and Layout Clean Up
**Choice**: Completely remove the four upload slots from the configurator sidebar, and delete the JSX and style injections that render them.
**Why**:
- Keeps the sidebar interface clean and focused.
- Prevents unused fields from taking up screen estate.
- Keeps existing stores backward-compatible (in case existing designs have data in those fields, they simply won't be rendered, keeping them completely safe from breaking).

---

## Risks & Mitigations

### Risk 1: Extreme Scale Overflow
- **Risk**: Setting the seal size to a very large value (e.g. 150px) might cover the couple photo or overlap the envelope flaps on small mobile viewports.
- **Mitigation**: Constrain the slider range to `40px` - `150px` (standard default is `75px`). The absolute centered alignment ensures it scales outwards from the center, keeping it aligned on all screens.
