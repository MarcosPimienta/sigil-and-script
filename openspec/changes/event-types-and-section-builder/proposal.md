# Proposal: Event Types & Section Builder

**Change ID:** `event-types-and-section-builder`
**Created:** 2026-09-02
**Status:** Awaiting approval

## Problem

Sigil & Script can only produce one kind of invitation: a Spanish-language Catholic wedding. The wedding is not expressed as a *type* anywhere — it is smeared across the codebase as seed data, string-matching and fixed layout:

- `DEFAULT_DESIGN` in `sigilStore.ts` is "Oscar & Rocio", a parish ceremony, a reception, an Ellos/Ellas dress code and a "Mesa de Regalos"; `handleCreateNew()` in the Events Hub clones it for every new event.
- The itinerary picks its icons by sniffing titles for "ceremonia religiosa" / "recepción" / "fiesta"; `formatEventTitle` (client and a duplicate on the server for WhatsApp previews) rewrites titles with `matrimonio|boda|wedding` regexes and returns "Matrimonio"/"Wedding" for blank hosts; `DressCodePanel` and `GiftsRegistryPanel` decide whether to render English by comparing against their own Spanish defaults. Custom text silently loses icons and translations.
- Dress code is a hard male/female pair, the RSVP meal choice is a fixed beef/salmon/vegetarian menu, and `CreatorCanvas` renders sections in a hard-coded order (duplicated for host and recipient views) that cannot be reordered, repeated or extended.
- The shell speaks wedding: `hostNames` split on `&` for a two-person monogram, "Fecha y Hora de la Boda", "a note for the couple", a St. Joseph prayer as the fallback location, Spanish wedding OG tags in `index.html`.

A host who wants a birthday, a baptism or a corporate gala has to fight all of this by hand, and the app cannot even remember which kind of event an invitation is.

## Proposed Solution

Two coordinated ideas, delivered in two phases that can ship independently.

### Phase A — Event types as data (templates)

1. **`eventType` on the design.** `InvitationDesign.eventType: 'WEDDING' | 'BIRTHDAY' | 'BAPTISM' | 'CORPORATE' | 'CUSTOM'`, persisted in `designData` and mirrored in a new `InvitationCanvas.eventType` column (default `WEDDING`) so the server can phrase social previews. Designs without the field are treated as `WEDDING` — existing invitations are unaffected.
2. **Template registry.** `src/templates/<type>.ts` each export a factory `createDesign(lang)` producing the full default design for that event (copy, itinerary, sections, icons, RSVP defaults) plus a `phrasing` table (event title grammar, "hosts" label, "note for the…" wording) for ES and EN. `resetToDefaults()` and the Events Hub "Create New Event" flow take an event type; the hub gets a template picker and shows a type badge on each card.
3. **Typed itinerary items.** `ItineraryItem.kind: 'CEREMONY' | 'RECEPTION' | 'PARTY' | 'DINNER' | 'TALK' | 'ACTIVITY' | 'CUSTOM'` with an icon registry (`src/components/icons/eventIcons.tsx`, inline SVG so nothing can 404). Title string-sniffing is removed; a one-time normaliser infers `kind` for legacy items from their titles so old invitations keep their icons.
4. **Dress code as groups.** `dressCode: { intro, groups: { id, label, text, subtext, avoidColors, icon }[] }` replaces the eight `dressCodeMale*/Female*` fields (legacy fields are migrated on load). Zero, one or many groups.
5. **Configurable RSVP menu.** `rsvpFormConfig.mealOptions: string[]` replaces the fixed three-dish menu; `customNotesLabel` default comes from the template phrasing.
6. **Phrasing instead of regexes.** `formatEventTitle` / `formatFullInvitationTitle` and the server's `getEventTitleFromCanvas` read a per-event-type phrasing table (`"Matrimonio de {hosts}"`, `"Cumpleaños de {hosts}"`, `"Bautizo de {hosts}"`, `"{hosts}"` for corporate/custom, with the correct Spanish connector). The sentinel-string translations in `DressCodePanel` / `GiftsRegistryPanel` / `ItineraryTimeline` are deleted; per-language defaults come from the template, and hosts' own text is left alone.

### Phase B — Section builder

7. **Sections as data.** `InvitationDesign.sections: InvitationSection[]` — an ordered list of `{ id, kind, enabled, title?, props }` where `kind ∈ 'AUDIO' | 'VIDEO' | 'COUNTDOWN' | 'ITINERARY' | 'DRESS_CODE' | 'GIFTS' | 'RSVP' | 'TEXT' | 'IMAGE' | 'DIVIDER'`. Existing panels become section renderers keyed by `kind`; `CreatorCanvas` renders one `SectionStack` loop for both host and recipient views instead of two hand-written copies. Legacy designs are normalised to the fixed wedding order on load.
8. **Builder UI.** A "Sections" panel in the creator: the ordered list with show/hide, rename, move up/down (drag-and-drop as an enhancement), remove, and an "Add section" palette. Selecting a section opens its editor (the existing `SectionEditor` fields, split per kind). New `TEXT`, `IMAGE`, `DIVIDER` and `VIDEO` sections give hosts free-form content anywhere in the stack. **`AUDIO` is the only single-instance kind** (two songs at once is never wanted); every other kind may be added repeatedly, with a soft warning for duplicate `RSVP`. Video accepts a short uploaded `.mp4`/`.webm` (≤ 7 MB, the existing upload path's ceiling) or a pasted YouTube / Vimeo / direct-file URL, never autoplays with sound, and pauses the background music when it starts.
9. **Templates define sections.** Each event template's `createDesign` returns its own `sections` list, so a corporate gala starts with an agenda and no gifts, a birthday starts with a wishlist and a single dress-code group, and `CUSTOM` starts with headline, countdown, itinerary and RSVP only.

## Files to Create & Modify

| File | Action | Purpose |
|---|---|---|
| `src/types/sigil.types.ts` | Modify | `EventType`, `ItineraryKind`, `DressCodeGroup`, `DressCodeConfig`, `SectionKind`, `InvitationSection`, `mealOptions`; deprecate legacy dress-code fields (kept optional for migration). |
| `src/templates/index.ts` | Create | `EVENT_TEMPLATES` registry: id, label (ES/EN), description, icon, `createDesign(lang)`, `phrasing`. |
| `src/templates/{wedding,birthday,baptism,corporate,custom}.ts` | Create | One template each. `wedding.ts` reproduces today's `DEFAULT_DESIGN` exactly. |
| `src/utils/normalizeDesign.ts` (+ test) | Create | Pure migration: legacy design → `eventType`, `sections`, `dressCode.groups`, `itinerary[].kind`, `mealOptions`. Idempotent; runs on load and before save. |
| `src/utils/eventPhrasing.ts` (+ test) | Create | Per-type ES/EN title grammar used by `formatEventTitle` and shared (copied) with the server. |
| `src/utils/formatGuestTitle.ts` (+ test) | Modify | `formatEventTitle(hostNames, lang, eventType)` via phrasing; remove wedding regexes. |
| `src/components/icons/eventIcons.tsx` | Create | Inline SVG registry: church, rings, toast, cake, balloon, gift, dinner, podium, briefcase, dove, candle, music, pin. Used by itinerary kinds, dress-code groups and the template picker. |
| `src/state/sigilStore.ts` | Modify | `DEFAULT_DESIGN` → `EVENT_TEMPLATES.WEDDING.createDesign('ES')`; `resetToDefaults(eventType, lang)`; section CRUD actions (`addSection`, `removeSection`, `moveSection`, `updateSection`, `toggleSection`); run `normalizeDesign` in `fetchInvitationDetails` / `loadSavedDesign`; send `eventType` on save; drop the hard-coded `rsvpBy`/`eventDate` re-assignment. |
| `src/context/SigilContext.tsx` | Modify | Remove the stale second wedding default; derive from the wedding template. |
| `src/components/events/EventsHubView.tsx` (+ `EventTypePicker.tsx`) | Modify / Create | Template picker on "Create New Event"; type badge on cards. |
| `src/components/creator/CreatorCanvas.tsx` | Modify | Replace the two hard-coded stacks with `<SectionStack sections=… mode=… />`. |
| `src/components/creator/sections/SectionStack.tsx` | Create | Maps `kind` → renderer; handles enabled flag and host-vs-recipient mode. |
| `src/components/creator/sections/{TextSection,ImageSection,DividerSection}.tsx` | Create | New free-form section renderers. |
| `src/components/creator/ItineraryTimeline.tsx` | Modify | Icon from `item.kind`; delete title sniffing and inline `ChurchIcon`. |
| `src/components/creator/DressCodePanel.tsx` | Modify | Render `dressCode.groups`; delete sentinel translations. |
| `src/components/creator/GiftsRegistryPanel.tsx` | Modify | Delete sentinel translations; title/text from section props. |
| `src/components/creator/RecipientRsvpPanel.tsx` | Modify | Meal `<select>` from `mealOptions`; notes label from phrasing. |
| `src/components/creator/SectionsPanel.tsx` | Create | Builder list + add palette. |
| `src/components/creator/SectionEditor.tsx` | Modify | Split into per-kind editors (`editors/ItineraryEditor.tsx`, `DressCodeEditor.tsx`, `GiftsEditor.tsx`, `CountdownEditor.tsx`, `TextSectionEditor.tsx`, `ImageSectionEditor.tsx`); wedding labels replaced by phrasing; itinerary rows get a kind picker. |
| `src/components/creator/LeftPanel.tsx` | Modify | Mount `SectionsPanel`; neutral placeholders (no "Oscar & Rocio"). |
| `src/components/creator/EnvelopeWrapper.tsx` | Modify | Monogram from up to N host initials; fallback location/date from template, not the prayer. |
| `src/utils/i18n.ts`, `src/utils/translator.ts` | Modify | Remove fixed menu keys and the wedding phrasebook; keep generic UI strings; `translator` keyed on section/phrasing ids. |
| `src/styles/creator.css`, `eventsHub.css` | Modify | Sections panel, palette, type picker, badges. |
| `index.html` | Modify | Neutral default OG copy (server already overrides per invite). |
| `server/prisma/schema.prisma` | Modify | `InvitationCanvas.eventType String @default("WEDDING")`. |
| `server/src/utils/eventPhrasing.ts` (+ test) | Create | Mirror of the client phrasing table (kept in sync by a test fixture shared as JSON in `shared/eventPhrasing.json`). |
| `server/src/controllers/inviteController.ts` | Modify | Persist/return `eventType`; `getEventTitleFromCanvas` via phrasing; neutral OG description. |
| `server/tests/invite.test.ts` | Modify | OG title cases per event type. |
| `openspec/specs/sigil_and_script_spec.json` | Modify (on archive) | Milestone `M10_EVENT_TYPES_AND_SECTIONS`; `InvitationCanvasState` gains `eventType`, `sections`. |

## Scope Constraints

### In scope

- Five event types: `WEDDING` (bit-for-bit today's defaults), `BIRTHDAY` (also quinceañera / sweet 16 via copy), `BAPTISM` (also first communion / confirmation), `CORPORATE` (conference / gala), `CUSTOM` (neutral).
- Typed itinerary kinds with an icon registry; dress-code groups; configurable meal options; per-type title phrasing on client and server.
- Data-driven, reorderable, repeatable sections with a builder UI and three new free-form section kinds.
- Lossless migration of existing invitations on load; no database rewrite required (one new nullable-with-default column).
- Tests: normaliser, phrasing (both sides), store section actions, `SectionStack` rendering, template factories (every template produces a valid design and round-trips through `normalizeDesign`), Events Hub picker.

### Out of scope

- Drag-and-drop reordering is an enhancement inside Phase B; move up/down buttons are the required baseline.
- Per-section paper/texture overrides, multi-page invitations, or a section marketplace.
- New RSVP question types beyond meal/dietary/plus-one/notes (a generic form builder is a separate change).
- Translating hosts' free text automatically (the `translator.ts` phrasebook is being removed, not replaced with a service).
- Re-designing the visual style of existing panels; they keep their look and become data-driven.
- Guest-side language switching, dashboard, auth — untouched.
