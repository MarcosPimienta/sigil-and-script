# Proposal: Studio Language Switch (English / Spanish)

## Problem
Currently, invitation sections (Countdown Timer, Itinerary, Dress Code, Gifts Registry, and Guest RSVP Panel) render hardcoded section titles, button texts, and form labels in a single language. Hosts designing invitations in Spanish or English need a simple way to toggle the invitation language in the Studio so that all main sections and recipient-facing labels dynamically adjust to English (EN) or Spanish (ES / SPA).

## Proposed Solution
1. **Schema & State**: Add `language: 'EN' | 'ES'` to `InvitationDesign` in `src/types/sigil.types.ts` and default design in `src/state/sigilStore.ts`.
2. **Dictionary Utility**: Create `src/utils/i18n.ts` containing a clean, typed localization dictionary for section titles, countdown units, map links, registry labels, and RSVP form inputs in English and Spanish.
3. **Studio Language Switch UI**: Add an interactive `[ EN | SPA ]` toggle switch in `src/components/creator/Toolbar.tsx` (next to preview/save actions) and `src/components/creator/SectionEditor.tsx`.
4. **Section Localization**: Update invitation section components (`CountdownTimer.tsx`, `ItineraryTimeline.tsx`, `DressCodePanel.tsx`, `GiftsRegistryPanel.tsx`, `RecipientRsvpPanel.tsx`) to dynamically render section headers and labels based on `design.language`.
5. **Testing**: Add unit tests for `src/utils/i18n.ts` and language toggle state changes.

## Files to Create & Modify
| File Path | Description |
| --- | --- |
| `src/types/sigil.types.ts` | Add `language?: 'EN' | 'ES'` property to `InvitationDesign` interface. |
| `src/state/sigilStore.ts` | Add `language: 'ES'` default to `DEFAULT_DESIGN`. |
| `src/utils/i18n.ts` | [NEW] Typed dictionary map and getter function for EN and ES labels. |
| `src/components/creator/Toolbar.tsx` | Add Studio header `[ EN | SPA ]` segmented language switch toggle. |
| `src/components/creator/SectionEditor.tsx` | Add language switch control in the Inspector panel. |
| `src/components/creator/CountdownTimer.tsx` | Localize section header and time unit labels ("DAYS", "HOURS", "MINUTES", "SECONDS"). |
| `src/components/creator/ItineraryTimeline.tsx` | Localize section title and "View Map" button text. |
| `src/components/creator/DressCodePanel.tsx` | Localize "DRESS CODE" section title. |
| `src/components/creator/GiftsRegistryPanel.tsx` | Localize "GIFTS REGISTRY" section title and "View Registry" button text. |
| `src/components/creator/RecipientRsvpPanel.tsx` | Localize RSVP form title, question, buttons, inputs, and thank you message. |
| `src/utils/i18n.test.ts` | [NEW] Unit tests for dictionary localization lookup function. |

## Scope Constraints
### In-Scope
- `language?: 'EN' | 'ES'` state property on `InvitationDesign`.
- Studio `[ EN | SPA ]` toggle control in `Toolbar.tsx` and `SectionEditor.tsx`.
- Localization dictionary `src/utils/i18n.ts`.
- Dynamic translation of Countdown, Itinerary, Dress Code, Gifts Registry, and RSVP components.
- Unit tests for i18n dictionary.

### Out-of-Scope
- Automated translation APIs for freeform custom user-typed body text.
