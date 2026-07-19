# Implementation Tasks

## 1. Schema & Dictionary Setup
- [x] 1.1 Add `language?: 'EN' | 'ES'` to `InvitationDesign` in `src/types/sigil.types.ts` and set default `'ES'` in `src/state/sigilStore.ts`.
- [x] 1.2 Create `src/utils/i18n.ts` dictionary utility and `src/utils/i18n.test.ts`.

## 2. Studio Language Switch Controls
- [x] 2.1 Add `[ EN | SPA ]` language switch toggle to `src/components/creator/Toolbar.tsx`.
- [x] 2.2 Add language switch field control to `src/components/creator/SectionEditor.tsx`.

## 3. Section Component Localizations
- [x] 3.1 Update `src/components/creator/CountdownTimer.tsx` to use `getTranslation(lang)`.
- [x] 3.2 Update `src/components/creator/ItineraryTimeline.tsx` to use `getTranslation(lang)`.
- [x] 3.3 Update `src/components/creator/DressCodePanel.tsx` to use `getTranslation(lang)`.
- [x] 3.4 Update `src/components/creator/GiftsRegistryPanel.tsx` to use `getTranslation(lang)`.
- [x] 3.5 Update `src/components/creator/RecipientRsvpPanel.tsx` to use `getTranslation(lang)`.

## 4. Verification & Testing
- [x] 4.1 Run `npm test` to verify all unit tests pass.
- [x] 4.2 Test toggling EN / SPA in Studio and verify invitation sections update accordingly.
