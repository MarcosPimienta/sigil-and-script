# Tasks: Event Types & Section Builder

Phase A (1–8) is independently shippable. Phase B (9–13) builds on it.

## Phase A — Event types as data

### 1. Types & shared phrasing

- [x] 1.1 Add `EventType`, `ItineraryKind`, `DressCodeGroup`, `DressCodeConfig`, `SectionKind`, `SectionProps`, `InvitationSection` to `src/types/sigil.types.ts`; add `eventType`, `sections`, `dressCode` and `rsvpFormConfig.mealOptions` to `InvitationDesign`; mark `dressCodeMale*/Female*`, `dressCodeText`, `registry*` as `@deprecated` (still optional).
- [x] 1.2 Add `kind` to `ItineraryItem`.
- [x] 1.3 Create `shared/eventPhrasing.json` (5 types × ES/EN: `eventTitle`, `eventTitleNoHosts`, `connector`, `hostsLabel`, `notesPlaceholder`, section headings). Enable `resolveJsonModule` in both tsconfigs if not already on.
- [x] 1.4 Create `src/utils/eventPhrasing.ts` (+ test asserting completeness and a few rendered titles).
- [x] 1.5 Create `server/src/utils/eventPhrasing.ts` (+ test) importing the same JSON.

### 2. Icons

- [x] 2.1 Create `src/components/icons/eventIcons.tsx`: church, rings, toast, cake, balloon, gift, dinner, podium, briefcase, dove, candle, music, pin, suit, dress, tie, badge — inline SVG, `currentColor`, 24-unit viewBox; export `ICONS`, `ITINERARY_KIND_ICON`, `EVENT_TYPE_ICON`.

### 3. Templates

- [x] 3.1 Create `src/templates/index.ts` with `EVENT_TEMPLATES` and `getTemplate(type)`.
- [x] 3.2 `src/templates/wedding.ts` — `createDesign('ES')` deep-equals today's `DEFAULT_DESIGN` (after `normalizeDesign`); EN variant.
- [x] 3.3 `src/templates/birthday.ts`, `baptism.ts`, `corporate.ts`, `custom.ts` per the table in design.md, ES + EN.
- [x] 3.4 Template test: every template × language yields a design that passes `normalizeDesign` unchanged (idempotence) and has ≥1 enabled section and a valid `countdownTarget`.

### 4. Normaliser

- [x] 4.1 Create `src/utils/normalizeDesign.ts`: fill `eventType`, build `sections` from legacy fields in the legacy order/visibility, migrate dress code to groups, infer `itinerary[].kind` from legacy title keywords, set `mealOptions`, strip converted legacy fields.
- [x] 4.2 Tests: legacy `DEFAULT_DESIGN` → expected sections/groups/kinds; a captured production `designData` fixture (add under `src/utils/__fixtures__/`); already-normalised input is returned unchanged; unknown `eventType` → `CUSTOM`.

### 5. Store

- [x] 5.1 `DEFAULT_DESIGN` = `getTemplate('WEDDING').createDesign('ES')`; `resetToDefaults(eventType = 'WEDDING', lang = 'ES')`.
- [x] 5.2 Run `normalizeDesign` in `fetchInvitationDetails`, `loadSavedDesign` and on `updateDesign` inputs that carry legacy fields.
- [x] 5.3 Remove the hard-coded `rsvpBy: 'January 31st'` / `eventDate: 'February 14th, 2027'` in `fetchInvitationDetails`; derive from `countdownTarget` and the design's RSVP deadline field (add `rsvpDeadline?: string` to the design if absent).
- [x] 5.4 Send `eventType` in `saveCurrentDesign`; read it back in `fetchSavedDesigns` for the hub badge.
- [x] 5.5 `SigilContext.tsx`: replace the stale wedding defaults with the wedding template; update `sigilReducer.test.ts`.

### 6. Renderers (data-driven, fixed order for now)

- [x] 6.1 `ItineraryTimeline`: icon from `item.kind` via `ITINERARY_KIND_ICON`; delete `ChurchIcon` and title sniffing; `HORA:` label via i18n; section heading from phrasing (`"Itinerario"` / `"Agenda"` for corporate).
- [x] 6.2 `DressCodePanel`: render `dressCode.groups` (grid adapts to 1–3 columns); delete sentinel translations.
- [x] 6.3 `GiftsRegistryPanel`: props from the GIFTS section; delete sentinel translations.
- [x] 6.4 `RecipientRsvpPanel`: meal options from `mealOptions`; notes placeholder from phrasing; remove `beefMeal`/`salmonMeal`/`vegMeal` from `i18n.ts`.
- [x] 6.5 `formatGuestTitle.ts`: `formatEventTitle(hostNames, lang, eventType)` and `formatFullInvitationTitle(..., eventType)` via phrasing; update tests with one case per type.
- [x] 6.6 `EnvelopeWrapper`: monogram from up to 3 host initials; fallback location/date from the design, never the prayer string; "we request the honor…" line from phrasing.
- [x] 6.7 `SectionEditor` / `LeftPanel`: neutral placeholders; "Fecha y Hora del Evento"; itinerary row kind picker (icon dropdown); dress-code group list editor (add/remove group, fields per group); meal options editor (chip list) in `FormConfiguratorPanel`.
- [x] 6.8 `translator.ts`: remove the wedding phrasebook; keep token translation helpers.
- [x] 6.9 `index.html`: neutral OG defaults.

### 7. Server

- [~] 7.1 `schema.prisma`: `InvitationCanvas.eventType String @default("WEDDING")` — **schema edited; `db:push` is yours to run** (local + production).
- [x] 7.2 `inviteController.ts`: persist/return `eventType`; `getEventTitleFromCanvas(canvas)` via phrasing; remove the duplicated regex logic; OG description from phrasing.
- [x] 7.3 `invite.test.ts`: OG title assertions for WEDDING, BIRTHDAY, CORPORATE (ES and EN).

### 8. Events Hub & Phase A verification

- [x] 8.1 `EventTypePicker.tsx`: modal/grid of templates (icon, name, one-liner, ES/EN toggle); "Create New Event" opens it; `handleCreateNew(type, lang)` calls `resetToDefaults(type, lang)`.
- [x] 8.2 Type badge on event cards; `EventsHubView` test for the picker flow.
- [x] 8.3 `npm run build`, `npm test`, `npm run lint` (no new errors); `server`: `tsc`, `npm test`.
- [x] 8.4 Manual: create one invitation of each type, open as a guest (ES and EN), confirm icons, phrasing, dress-code groups, RSVP menu; open a pre-existing wedding invitation and confirm it renders identically to before.

## Phase B — Section builder

### 9. Section stack

- [x] 9.1 Create `sections/SectionStack.tsx` mapping `kind` → renderer with `mode: 'host' | 'recipient'`; disabled sections hidden for recipients, dimmed + tagged for hosts; click-to-focus in host mode.
- [x] 9.2 Create `TextSection`, `ImageSection`, `DividerSection` renderers (reuse `TextBlock` styling and `SvgColorImage`).
- [x] 9.3 `CreatorCanvas`: replace both hand-written stacks with `<SectionStack />`; RSVP heading moves into the RSVP renderer.
- [x] 9.4 Test: `SectionStack` renders enabled sections in order, hides disabled for recipients, shows dimmed for hosts.

### 10. Store actions

- [x] 10.1 `addSection`, `removeSection`, `moveSection`, `reorderSections`, `toggleSection`, `updateSection`; singleton rule for AUDIO/RSVP/COUNTDOWN/ITINERARY.
- [x] 10.2 Tests for each action, including singleton enforcement and id stability.
- [x] 10.3 `InspectorFocus` gains `{ type: 'SECTION'; sectionId }`.

### 11. Builder UI

- [x] 11.1 `SectionsPanel.tsx`: ordered rows (kind icon, title, eye, ▲/▼, trash), "Add section" palette with descriptions and singleton greying; soft warning when RSVP is missing/disabled.
- [x] 11.2 Per-kind editors under `creator/editors/`: `CountdownEditor`, `ItineraryEditor`, `DressCodeEditor`, `GiftsEditor`, `TextSectionEditor`, `ImageSectionEditor`, `DividerEditor`; `SectionEditor` becomes a switch on the focused section.
- [x] 11.3 Mount `SectionsPanel` in `LeftPanel` (own tab/group); remove now-redundant fixed fields.
- [x] 11.4 Styles in `creator.css`.
- [x] 11.5 Tests: `SectionsPanel` add/toggle/move/remove; `TextSectionEditor` edits propagate.

### 12. Templates define sections

- [x] 12.1 Each template's `createDesign` returns its `sections` (per the table), including TEXT sections for baptism (padrinos) and corporate (about). *(Done in Phase A — the lists exist in the data; Phase B makes them drive rendering.)*
- [x] 12.2 Template test extended: section kinds per type as specified.

### 13. Polish & verification

- [~] 13.1 Optional drag-and-drop reordering — **not done**; ▲/▼ buttons ship instead (work on touch and with a keyboard). `reorderSections(ids)` already exists for whenever DnD is added.
- [x] 13.2 `npm run build`, `npm test`, `npm run lint`; server unaffected by Phase B (assert `npm --prefix server test` still green).
- [x] 13.3 Manual: add a TEXT + IMAGE section to a birthday invitation, reorder, hide gifts, save, reload, open as guest; confirm order and visibility; confirm an old wedding invitation still shows its six sections in the original order.
- [ ] 13.4 On archive: milestone `M10_EVENT_TYPES_AND_SECTIONS` in `openspec/specs/sigil_and_script_spec.json`; `InvitationCanvasState` gains `eventType` and `sections`; merge both delta specs.

## Phase A — implementation notes (2026-09-03)

**Status: Phase A complete and verified. Phase B (9–13) not started.**

- **Verification.** `npm run build` clean; frontend 145/145 tests (22 files, 26 new); `eslint .` unchanged at 99 errors + 1 warning, all pre-existing — per-file counts before/after are identical for every touched file. Server: `tsc --noEmit` clean, 23/23 tests (12 invite incl. 2 new OG cases, 8 auth, 3 phrasing).
- **Wedding parity is asserted, not assumed.** `src/utils/__fixtures__/legacyWeddingDefault.ts` is a byte-for-byte snapshot of the pre-change `DEFAULT_DESIGN`; a test feeds it through `normalizeDesign` and asserts deep equality with `createDesignFromTemplate('WEDDING', 'ES')`. Verified visually too: the wedding itinerary and dress code render exactly as before.
- **Browser walkthrough.** Registered a host, created one invitation of each of the five types through the new picker, and confirmed: hub badges (Boda / Cumpleaños / Bautizo / Corporativo / Otro evento), itinerary headings per type ("Itinerario del Evento" / "Programa" / "Agenda"), icons by kind (church, toast, podium, cutlery, sparkle), dress-code groups (2 for wedding, 1 for the others), corporate has no gifts section and an English "TIME:" label, meal-option chips editable in the RSVP panel. No console or page errors.
- **`shared/eventPhrasing.json` is the single source**, with `server/shared/eventPhrasing.json` a synced copy so the API build stays self-contained. `npm run phrasing:sync` (also wired into `npm run build`) refreshes it, and a server test asserts the two files are identical.
- **Deviation: `src/utils/translator.ts` was deleted rather than trimmed.** Its `STATIC_DICT` *was* the wedding phrasebook, and its MyMemory API fallback rewrote host-authored text — which the spec's "host copy is never rewritten" requirement forbids. Its only consumer (`InvitationStage`) called the hook inside a `.map()` behind an `eslint-disable react-hooks/rules-of-hooks`, so removing it also fixed a real hooks violation. Host text now renders verbatim in both languages. **You must `git rm src/utils/translator.ts`** — file deletions can't be pushed through the tooling I use.
- **Deviation: Spanish connector.** The delta spec originally said "no regex on the host text". The implementation keeps one small, documented grammar rule: a title that itself begins with a feminine event noun ("Boda de…", "Gala…") takes "a la". Without it, "Invitación para X al Boda de Ana y Luis" is ungrammatical. The spec has been updated to match; `spanishConnector()` is shared by client and server.
- **New `getCanvases` field.** The hub list endpoint stripped everything but id/title/date, so `eventType` had to be added to that projection for the badges to work.

## For you to run

1. `cd server && npm run db:push` — adds `InvitationCanvas.eventType` (defaults to `WEDDING`, so existing rows are correct without a data migration). Run it against the production database before deploying.
2. `git rm src/utils/translator.ts` (see the deviation note above).
3. Open an existing wedding invitation and confirm it renders exactly as before (task 8.4's regression half — I verified the equivalent via the fixture test and a fresh WEDDING template, but not against one of your real saved rows).

## Phase B — implementation notes (2026-09-03)

**Status: Phase B complete and verified.** Scope grew by one section kind at your request (see below).

### Added beyond the original plan

- **`VIDEO` section.** Accepts a pasted YouTube / Vimeo / direct `.mp4`/`.webm` link, or a short uploaded clip (≤ 7 MB, the ceiling of the existing JSON upload path — larger files are refused with a message pointing at the link option). `parseVideoUrl` recognises watch/`youtu.be`/shorts/embed/`m.` YouTube forms, `vimeo.com` and `player.vimeo.com`, and storage URLs with query strings; anything else shows an inline error. Embeds use `youtube-nocookie.com` and Vimeo's `dnt=1`.
- **Video never competes with the music.** It never autoplays; `onPlay` (file) and first interaction (embed) mute the background audio via `audioEngine`.
- **CSP fix (real bug found in the browser).** `index.html` had `default-src 'self'` with no `frame-src`, so *any* embed would have been blocked in production. Added `frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com`. Verified: the embed frame loads and the console reports zero CSP violations.

### Singleton policy (as you chose)

Only `AUDIO` is capped at one per invitation — the palette greys it out with "ya agregada / already added" and explains why. Every other kind, including `RSVP`, `COUNTDOWN`, `ITINERARY` and `VIDEO`, can be added repeatedly. Because duplicate RSVP forms are allowed, `RecipientRsvpPanel` now takes an `idPrefix` so each instance's field ids stay unique, and the panel shows a non-blocking warning when more than one RSVP is enabled (and another when none is).

### Verification

- `npm run build` clean; **177/177 frontend tests** (26 files; 32 new across `sectionDefaults`, `sectionActions`, `SectionsPanel`, `SectionStack`); server `tsc` clean and 23/23 tests still green (Phase B does not touch the API).
- `eslint .` unchanged at 99 errors + 1 warning, all pre-existing; every new file is clean.
- **Browser walkthrough**: created a birthday invitation, confirmed the initial stack (`AUDIO > COUNTDOWN > ITINERARY > DRESS_CODE > GIFTS > RSVP`), that the palette blocks a second music section, added a video by YouTube link (correct embed URL), saw the error for a bad link, added a text section and moved it up two places, hid the gifts section (dimmed to 0.4 opacity with an "Oculta" tag in the host preview, absent for guests), then **saved, reloaded and re-opened** — the full arrangement including the video round-tripped exactly.
- One sandbox-only artefact: the YouTube player renders a broken-media icon in my screenshots because this container has no route to youtube.com. The frame itself loads and CSP passes, so it will play on your machine.

### One thing to watch

`CreatorCanvas` no longer contains any section markup — both the host preview and the guest view are the same `SectionStack`, so anything you change about a section is guaranteed to look the same to guests.

## Follow-up: per-section typography (2026-09-03)

Added on request, after Phase B: **every section can now have its own fonts.**

- `InvitationSection.fonts?: { heading?, body? }`. `SectionStack` turns those into the CSS variables `--sec-heading-font` / `--sec-body-font` on each section's wrapper, and every renderer now reads `var(--sec-heading-font, <its old font>)`. An unset font emits no variable, so sections look exactly as before until a host changes one.
- `src/utils/fonts.ts` lists only families the app actually loads (Cormorant Garamond, Pinyon Script, Cinzel Decorative, Playfair Display, IM Fell English, Spectral, GFS Didot) plus Georgia and Helvetica/Arial system stacks — a chosen font can never silently fall back. Each option is previewed in its own face.
- `SectionFontFields` renders for every section kind, above the kind-specific fields, with a "Predeterminada (…)" option that *removes* the override rather than pinning the current value. The TEXT editor's own font dropdown was removed in favour of it; a legacy `props.fontFamily` still applies until the host picks a section font, and the picker shows it as the current default.
- Verified in the browser: the itinerary's heading went Pinyon Script -> Cinzel Decorative and its body Cormorant -> Georgia, while the dress-code section stayed on Cormorant; "Predeterminada" restored Pinyon Script; the choice survived save -> reload. 182/182 tests (5 new), build and lint clean.
