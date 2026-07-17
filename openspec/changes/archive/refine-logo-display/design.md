# Design — Refine Logo Display

## Architectural Decisions

### Decision 1: Render Containment for Custom Artwork
**Choice**: Use `objectFit: 'contain'` and remove `borderRadius: '50%'` on the uploaded image.
**Why**:
- Ensures the image is not clipped or distorted, letting arbitrary graphic layouts (monograms, rectangular drawings, photos) scale to fill the card surface cleanly.

### Decision 2: Standalone Logo Medallion Deletion
**Choice**: Delete the logo medallion renders above the countdown timer.
**Why**:
- Streamlines the page detail hierarchy, reducing clutter and visually drawing the user's eye to the countdown timer and itinerary details.

---

## Risks & Mitigations

### Risk 1: Monogram styling overrides
- **Risk**: Custom styles might break the placeholder monogram's dimensions.
- **Mitigation**: The placeholder monogram styling is isolated to the fallback block and remains untouched, guaranteeing initials continue to display inside the gold double-border seal frame when no logo is uploaded.
