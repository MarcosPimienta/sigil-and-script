# Design — Fix Rising Letter Clipping

## Architectural Decisions

### Decision 1: Headroom Expansion via Inset Adjustments
**Choice**: Increase the top offset of `.envelope-pocket-clipper` from `-150px` to `-250px`.
**Why**:
- This is a safe and localized change that completely resolves the clipping issue without impacting pocket clipping at the bottom or sides.
- Avoids modifying complex transform parameters or scripting logic.

---

## Risks & Mitigations

### Risk 1: Side/Bottom leakage
- **Risk**: A larger clipper box might fail to hide the letter when it is inside the pocket.
- **Mitigation**: The left, right, and bottom insets are untouched, which guarantees the pocket cover and bottom envelope seals continue to mask the letter body perfectly. Only the top section is allowed more vertical space, which is intended since the letter slides upwards.
