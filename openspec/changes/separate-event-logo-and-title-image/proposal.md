# Proposal: Separate Event Logo and Event Title Image Controls

## Problem
Previously, both the `LeftPanel` (Custom Artwork) and `SectionEditor` (Título del Evento) were updating the same property (`openedEnvelopeImage`), causing confusion because:
1. `openedEnvelopeImage` controls the logo inside the envelope opening presentation.
2. The main invitation paper card itself renders the Event Title ("Matrimonio de Marcos & Diana"), but lacked a dedicated title image renderer on the parchment stage.

## Proposed Solution
1. **Clear Separation**:
   - **Event Logo / Monogram Image (`openedEnvelopeImage`)**: Managed in `LeftPanel` under "Custom Artwork", rendered on the envelope flap view in `EnvelopeWrapper.tsx`, with scale slider `openedEnvelopeImageScale`.
   - **Event Title Image / Calligraphy (`headerImage`)**: Managed in `SectionEditor` under "Título del Evento", rendered directly on the invitation parchment card in `InvitationStage.tsx`, with scale slider `headerImageScale`.
2. **Stage Rendering**: Render `headerImage` centered on `InvitationStage.tsx` with dynamic scaling based on `headerImageScale`.
3. **Type & Store Updates**: Add `headerImageScale?: number` to `InvitationDesign` and default to `100` in `sigilStore.ts`.

## Files to Modify & Create
| File | Action | Purpose |
| --- | --- | --- |
| `src/types/sigil.types.ts` | Modify | Add `headerImageScale?: number;` to `InvitationDesign` |
| `src/state/sigilStore.ts` | Modify | Add `headerImageScale: 100` default value to `DEFAULT_DESIGN` |
| `src/components/creator/SectionEditor.tsx` | Modify | Bind title image uploader to `headerImage` and scale slider to `headerImageScale` |
| `src/components/creator/LeftPanel.tsx` | Modify | Keep `openedEnvelopeImage` slot labeled "Logo del Evento / Monograma" with `openedEnvelopeImageScale` slider |
| `src/components/creator/InvitationStage.tsx` | Modify | Render `headerImage` centered on stage scaled by `headerImageScale` |
| `src/components/creator/InvitationStage.test.tsx` | Create/Modify | Unit tests verifying `headerImage` rendering on stage |

## Scope Constraints
- In Scope: Disambiguating Event Logo (`openedEnvelopeImage`) vs Event Title Image (`headerImage`), rendering `headerImage` on `InvitationStage`, providing scale sliders for both.
- Out of Scope: Modifying RSVP or itinerary handlers.
