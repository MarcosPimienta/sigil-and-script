# Design — Fix Centering Letter Overflow

## Architectural Decisions

### Decision 1: Target-Specific Upscaling via CSS Pseudo-Class
**Choice**: Use the `:not(.state-centering)` selector in [creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css) for all upscaled font-size rules.
**Why**:
- Ensures the default small font sizes (used by the pocket letter) are preserved while the letter is centered and small.
- Avoids writing duplicate CSS rules for centering and pocket layouts.
- Ensures a smooth transition during the scale-up phase.

### Decision 2: Overflow Clipping on Small Card Viewports
**Choice**: Add `overflow: hidden` to `.envelope-couple-photo` and `.envelope-letter-viewport-overlay.state-centering`.
**Why**:
- Provides a rigid boundary for the small viewports, ensuring that even if text wrapping goes slightly long, it is neatly clipped inside the card boundaries rather than spilling onto the black screen background.

---

## Risks & Mitigations

### Risk 1: Clipping critical text
- **Risk**: Setting `overflow: hidden` might clip the bottom text (location) if the names are very long.
- **Mitigation**: The default font sizes are small enough (`1.45rem` for host names, etc.) to fit standard names easily. Preserving these small sizes during the centering phase guarantees that all text stays comfortably within the 340px vertical height.
