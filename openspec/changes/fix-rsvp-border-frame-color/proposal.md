# Proposal: Fix RSVP Border Frame Color

## Problem
The RSVP form decorative border frames currently use stark white fallbacks (`rgba(255, 255, 255, 0.5)` / `0.6`), causing the border lines and corner flourishes to appear overly bright ("too white") against parchment textures and creator panels.

## Proposed Solution
1. **Warm Sepia/Brass Frame Color**: Replace stark white fallbacks in `RecipientRsvpPanel.tsx` with warm sepia/brass border frame tones (`rgba(160, 142, 124, 0.65)` / `var(--rsvp-border, rgba(160, 142, 124, 0.65))`).
2. **Corner Flourishes**: Update `CornerFlourish` default color to match warm sepia border frames.

## Files to Modify
| File | Action | Purpose |
| --- | --- | --- |
| `src/components/creator/RecipientRsvpPanel.tsx` | Modify | Soften RSVP outer/inner border frame colors and corner flourish stroke tones |

## Scope Constraints
- In Scope: RSVP form border frame colors and corner flourish stroke colors.
- Out of Scope: Altering RSVP logic or non-border styles.
