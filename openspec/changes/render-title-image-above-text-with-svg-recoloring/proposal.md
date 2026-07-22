# Proposal: Render Title Image Above Title Text with SVG Font Color Painting

## Problem
1. **Title Image & Text Positioning**: Currently, when a Title Image is loaded, it either replaces the title text or renders without maintaining both. Users want the Title Image to render **above** the title text on both the envelope closed view and unfolded letter view.
2. **SVG Font Color Painting**: For SVG title artwork/monograms, users want all vector paths to dynamically inherit and paint in the current font color (`#ffffff` on dark background, `#111111` or `#4c4844` on parchment paper).

## Proposed Solution
1. **`SvgColorImage` Component**: Create a helper component using CSS `mask-image` (`mask-image: url(...)`, `backgroundColor: fontColor`) when rendering SVG artwork. This automatically fills all vector paths with the active font color while maintaining full aspect ratio and crispness.
2. **Positioning Above Title Text**:
   - In `EnvelopeWrapper.tsx` (closed view header): Render `headerImage` (recolored to `#ffffff`) **above** `{hostNames}`.
   - In `EnvelopeWrapper.tsx` (unfolded letter content): Render `headerImage` (recolored to `#111111`) **above** `{hostNames}`.
   - In `InvitationStage.tsx` (parchment stage canvas): Render `headerImage` (recolored to `var(--color-sepia-800)`) **above** the `tb-headline` block.

## Files to Modify & Create
| File | Action | Purpose |
| --- | --- | --- |
| `src/components/common/SvgColorImage.tsx` | Create | Component for SVG path recoloring and scaling |
| `src/components/creator/EnvelopeWrapper.tsx` | Modify | Render Title Image above title text in closed & open letter views |
| `src/components/creator/InvitationStage.tsx` | Modify | Render Title Image above headline block in stage canvas |
| `src/components/creator/EnvelopeWrapper.test.tsx` | Modify | Unit test verifying title image above title text & SVG color painting |

## Scope Constraints
- In Scope: Rendering Title Image above title text on all screens, recoloring SVG paths to font color, updating unit tests.
- Out of Scope: Changing non-SVG image colors or modifying RSVP form logic.
