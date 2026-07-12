## 1. Schema Expansion
- [x] 1.1 Add new properties (`countdownTarget`, `itinerary`, `colorPalette`, `dressCodeText`, `registryLink`, `registryText`) to `InvitationDesign` inside `src/types/sigil.types.ts`
- [x] 1.2 Update initial defaults inside [src/state/sigilStore.ts](file:///home/fenix3819/sigil-and-script/src/state/sigilStore.ts)

## 2. Scrollable Sections Implementation
- [x] 2.1 Create [src/components/creator/CountdownTimer.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CountdownTimer.tsx) ticking down days/hours/minutes
- [x] 2.2 Create [src/components/creator/ItineraryTimeline.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/ItineraryTimeline.tsx) rendering timeline cards and map buttons
- [x] 2.3 Create [src/components/creator/DressCodePanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/DressCodePanel.tsx) showing theme color circles
- [x] 2.4 Create [src/components/creator/GiftsRegistryPanel.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/GiftsRegistryPanel.tsx) holding registry details

## 3. Host Editor Fields
- [x] 3.1 Create configuration widgets under [src/components/creator/SectionEditor.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/SectionEditor.tsx) allowing Event Hosts to update timeline items, dates, palettes, and registry URLs
- [x] 3.2 Mount widgets inside `LeftPanel.tsx`

## 4. Recipient Layout Orchestration
- [x] 4.1 Update [src/components/creator/CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx) to flow components vertically when `isRecipient` is true, moving `RecipientRsvpPanel` to the bottom of the scroll container
- [x] 4.2 Allow guests to override audio status via floating overlay triggers
- [x] 4.3 Append responsive css margins and floral border decoration stylings to `src/styles/creator.css`

## 5. Verification
- [x] 5.1 Add unit tests for countdown rendering and custom CSV/Itinerary additions
- [x] 5.2 Validate that existing regression tests pass and bundle builds cleanly
