# Design — Image-Based Envelope with Fade-in Title & Photo Transition

## Architectural Decisions

### Decision 1: Static Asset Resolution in `public/` Folder
**Choice**: Instruct the user to place their images directly in `public/ClosedEnvelope00.png` and `public/OpenedEnvelope00.png`.
**Why**:
- Assets in the `public/` directory are copied to the root of the build output.
- Avoids complex dynamic import hashes (`import.meta.glob` or absolute relative path mapping) inside Vite, allowing clean URLs: `/ClosedEnvelope00.png` and `/OpenedEnvelope00.png`.

### Decision 2: Stacked Image Layer Cross-Fade
**Choice**: Stack the closed and opened envelope images on top of each other using absolute positioning, controlling their visibility via opacity.
**Why**:
- Swapping the `src` of a single `<img>` tag can cause a flicker/flash while the browser loads the new asset.
- Stacking them allows us to apply CSS transitions (`transition: opacity 0.5s ease-in-out`), yielding a smooth cross-fade animation.

### Decision 3: Transition Syncing for Title and Photo
**Choice**: Animate the title and photo using state-driven CSS classes (`phase-closed`, `phase-cracking`, `phase-opening`, `phase-slideout`).
**Why**:
- Consolidating the transition classes allows us to synchronize the slide-up and fade-in timing perfectly.
- Ensures the title and photo start their animation exactly when the seal cracks and the envelope cross-fades to open.

---

## Risks & Mitigations

### Risk 1: Missing Images
- **Risk**: If the user has not placed `ClosedEnvelope00.png` or `OpenedEnvelope00.png` in the directory yet, it will render a broken image link.
- **Mitigation**: Add a graceful fallback placeholder or border/loading state in the render flow so it looks neat if the assets are not present yet.

### Risk 2: Sizing Layout Shifts on Custom Aspect Ratios
- **Risk**: Since the user's envelope PNG aspect ratio might differ slightly from the original CSS-drawn box, the wax seal or couple photo may offset incorrectly.
- **Mitigation**: Style the envelope container using percentage-based proportions (`max-width: 440px`, flexible heights) and test to ensure it scales cleanly on mobile devices.
