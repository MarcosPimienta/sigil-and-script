# Proposal: Add Back Button for Studio Invitation Preview

## Problem
When a host previews their invitation from the Creator Studio:
1. Clicking **"Preview Invitation"** switches `appMode` to `'RECIPIENT'`.
2. Clicking on the sealed envelope unseals the invitation, triggering the cinematic opening animation.
3. Once unsealed, [EnvelopeWrapper.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/EnvelopeWrapper.tsx) mounts the full-screen container `.envelope-letter-viewport-overlay` with `position: fixed; z-index: 9999; width: 100vw; height: 100vh;`.
4. Because the top toolbar has `--z-toolbar: 50`, this full-viewport overlay completely covers the toolbar and hides the existing `← Studio` button (`#btn-mode-toggle` / `#btn-mobile-exit-preview`).
5. Inside the opened invitation, there is no back button or exit mechanism, permanently trapping the host in the recipient preview unless they refresh the browser (which risks losing unsaved edits).
6. Similarly, opening the closed envelope test preview in the Host Editor View (`CREATOR` mode) expands the same overlay with no exit control.

## Proposed Solution
1. **Dedicated Floating Studio Back Button (`PreviewBackButton`)**:
   - Introduce an accessible, high-visibility floating pill button at `z-index: 10000` (`position: fixed; top: 1rem; left: 1rem;`).
   - Styled with a luxury glassmorphism / dark parchment aesthetic with a subtle border and blur backdrop, matching the existing luxury stationery design.
   - Text is bilingual: `"← Return to Studio"` (EN) / `"← Volver al Estudio"` (ES).
   - Positioned to avoid obstructing envelope artwork, and guaranteed to float above `.envelope-letter-viewport-overlay` (`z-index: 9999`).
2. **Behavior & State Reset**:
   - When clicked, returns to the Studio (`setAppMode('CREATOR')`).
   - Resets `envelopePhase` in [CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx) to `'CLOSED'` so subsequent previews start fresh.
   - Stops preview ambient audio if playing.
3. **Strict Host-Only Guard**:
   - Rendered only during preview mode (`isRecipient && isPreviewHost`).
   - Real guests accessing the invitation via `/invite/:token` will never see the back button.

## Files to Modify & Create
| File | Action | Purpose |
| --- | --- | --- |
| `src/components/creator/PreviewBackButton.tsx` | Create | Floating back button component with `z-index: 10000` and smooth hover/active transitions. |
| `src/components/creator/CreatorCanvas.tsx` | Modify | Mount `PreviewBackButton` when in recipient preview mode or when envelope overlay is active in host view; reset envelope phase on exit. |
| `src/styles/creator.css` | Modify | Add styling for `.creator-preview-back-btn` with responsive safe-area insets. |
| `src/components/creator/PreviewBackButton.test.tsx` | Create | Unit tests verifying click handling, language switching, and conditional rendering. |

## Scope Constraints
- **In Scope**: Providing a reliable exit button from any stage of the invitation preview (closed envelope, opening sequence, or fully opened scrollable letter); resetting envelope state and audio on exit; ensuring real guests never see the button.
- **Out of Scope**: Changes to RSVP submission logic, email templates, or floor plan editor.
