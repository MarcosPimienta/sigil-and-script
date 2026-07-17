# Design — Cinematic Flip and Scale Animation

## Architectural Decisions

### Decision 1: Unified Keyframe for Translation, Scaling, and Rotation
**Choice**: Use a single CSS keyframe animation (`letter-move-down`) to perform translation from top to center, scaling from small to full-screen, and a 180-degree 3D flip.
**Why**:
- Guarantees perfect synchronization between all three spatial transforms (move, scale, flip).
- Leverages hardware-accelerated CSS animations.

### Decision 2: Phase-Level Conditional Swapping
**Choice**: Render the 3D double-faced flip card wrapper only during `LETTER_CENTERING` phase, and revert to normal block document flow during the static `LETTER_SCALING` and `COMPLETED` phases.
**Why**:
- 3D card layout requires absolute positioning of its front and back faces.
- While acceptable during animation, absolute positioning in static screens collapses the document height, breaking scrollable viewport boundaries.
- Swapping structures at the phase boundary ensures that once the animation finishes, the document flow and scrolling continue to behave perfectly.

---

## Risks & Mitigations

### Risk 1: Mirrored Text
- **Risk**: Rotating the parent card 180 degrees mirrors all child content.
- **Mitigation**: Rotate the back face (Invitation Content) 180 degrees initially inside the 3D card so that it aligns correctly to the viewer once the parent container completes its 180-degree rotation.
