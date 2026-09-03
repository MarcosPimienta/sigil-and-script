# Design: Event Types & Section Builder

## Data model

```ts
export type EventType = 'WEDDING' | 'BIRTHDAY' | 'BAPTISM' | 'CORPORATE' | 'CUSTOM';

export type ItineraryKind =
  | 'CEREMONY' | 'RECEPTION' | 'PARTY' | 'DINNER' | 'TALK' | 'ACTIVITY' | 'CUSTOM';

export interface ItineraryItem {
  id: string;
  kind: ItineraryKind;          // NEW — drives the icon and default titles
  title: string;
  locationName: string;
  time: string;
  mapLink?: string;
}

export interface DressCodeGroup {
  id: string;
  label: string;                // "Ellos", "Ellas", "Invitados", "Team"
  text: string;                 // "Traje formal"
  subtext?: string;             // "Favor de evitar azul marino"
  avoidColors?: string[];
  icon?: IconId;                // 'suit' | 'dress' | 'tie' | 'badge' | …
}

export interface DressCodeConfig {
  intro?: string;               // was dressCodeText
  groups: DressCodeGroup[];
}

export interface RsvpFormConfig {
  requireMealPreference: boolean;
  requireDietaryRestrictions: boolean;
  allowPlusOnes: boolean;
  customNotesLabel: string | null;
  mealOptions: string[];        // NEW — replaces the fixed 3-dish menu
}

export type SectionKind =
  | 'AUDIO' | 'COUNTDOWN' | 'ITINERARY' | 'DRESS_CODE' | 'GIFTS' | 'RSVP'
  | 'TEXT' | 'IMAGE' | 'DIVIDER';

export interface InvitationSection {
  id: string;
  kind: SectionKind;
  enabled: boolean;
  /** Optional heading override; renderers fall back to the template phrasing. */
  title?: string;
  /** Kind-specific payload (see below). Empty object for AUDIO/RSVP/COUNTDOWN. */
  props: SectionProps;
}

// Kind-specific props
type SectionProps =
  | { kind: 'TEXT'; content: string; style: Pick<TextBlockConfig, 'fontFamily' | 'fontSize' | 'fontStyle' | 'color' | 'textAlign'> }
  | { kind: 'IMAGE'; src: string; scale: number; caption?: string }
  | { kind: 'DIVIDER'; ornament: 'flourish' | 'line' | 'dots' }
  | { kind: 'GIFTS'; link?: string; text: string; symbol?: string; image?: string; imageScale?: number }
  | { kind: 'DRESS_CODE'; config: DressCodeConfig }
  | { kind: 'ITINERARY' | 'COUNTDOWN' | 'AUDIO' | 'RSVP' };   // read shared design fields
```

`InvitationDesign` gains `eventType`, `sections`, `dressCode` (new shape) and keeps the eight legacy `dressCodeMale*/Female*` fields and the `registry*` fields as **optional, deprecated** inputs consumed only by the normaliser. `itinerary`, `countdownTarget`, `musicUrl`, `rsvpFormConfig` stay top-level because exactly one of each exists per invitation and several sections/renderers read them; the ITINERARY/COUNTDOWN/AUDIO/RSVP sections are *placements* of that shared data, which is what lets them be moved without duplicating state.

## Architectural decisions

### AD-1: Event type is a template, not a mode

**Choice.** `eventType` selects a template at creation time (defaults, sections, phrasing, icons). After creation, everything the template produced is ordinary editable data; the type is kept only for phrasing, badges and future analytics. Switching type on an existing invitation is not offered in this change (it would mean discarding content).

**Why.** Treating the type as a live "mode" would re-introduce conditionals across every component. As a template it is one function call per type, and adding a sixth event kind is a new file plus one registry entry — the same pattern already used for wax blanks.

### AD-2: Normalise on read, write the new shape

**Choice.** `normalizeDesign(raw): InvitationDesign` is a pure, idempotent function applied whenever a design enters the store (`fetchInvitationDetails`, `loadSavedDesign`, tests). It fills `eventType: 'WEDDING'`, builds `sections` in the legacy fixed order (audio, countdown, itinerary, dress code, gifts, rsvp — each `enabled` iff the legacy data would have rendered it), converts `dressCodeMale*/Female*` into two groups, infers `itinerary[].kind` from titles using the *same* keyword list the old renderer used (this is the one place the string-sniffing survives, as a migration heuristic), and sets `mealOptions` to the old three dishes when `requireMealPreference` is on. Saving always writes the new shape; legacy fields are dropped from the payload once converted.

**Why.** No bulk database migration, no downtime, and the ~200-line normaliser is the most testable piece of the change. Invitations that are never re-saved keep working because the recipient path also normalises.

### AD-3: Phrasing table shared by client and server as JSON

**Choice.** `shared/eventPhrasing.json` is the single source: per type, per language, `eventTitle` pattern (`"Matrimonio de {hosts}"`, `"Cumpleaños de {hosts}"`, `"Bautizo de {hosts}"`, `"{hosts}"`), `eventTitleNoHosts` (`"Matrimonio"`, `"Cumpleaños"`, `"Bautizo"`, `"Evento"`), `connector` for the Spanish "Invitación para X **al/a** …", `hostsLabel` ("Novios" / "Cumpleañero(a)" / "Festejado(a)" / "Organizador"), `notesPlaceholder` ("Deja una nota para los novios" / "…para el cumpleañero" / …), and default section headings. Both `src/utils/eventPhrasing.ts` and `server/src/utils/eventPhrasing.ts` import it (Vite and tsconfig `resolveJsonModule`). Tests on both sides assert every type × language has every key.

**Why.** The WhatsApp/OG preview is generated server-side and must say "Cumpleaños de Sofía", not "Matrimonio de Sofía". A JSON file is the lightest thing both builds can consume without a monorepo package.

### AD-4: Sections are placements; singleton data stays top-level

**Choice.** See the data model. `RSVP` and `AUDIO` are single-instance (the palette disables them once present); `COUNTDOWN` and `ITINERARY` are single-instance too because they render shared data; `TEXT`, `IMAGE`, `DIVIDER`, `GIFTS`, `DRESS_CODE` can repeat and carry their own props.

**Why.** Duplicating the itinerary into a section payload would create two sources of truth for the guest's `{{event_date}}`/`{{event_location}}` tokens and the dashboard's countdown. Placements give reordering without that risk.

### AD-5: One `SectionStack`, two modes

**Choice.** `<SectionStack sections mode="host" | "recipient" />` replaces the duplicated JSX in `CreatorCanvas`. Renderers receive `{ section, mode }`; host mode adds selection affordances (click to open the section's editor, faint outline, disabled sections rendered at 40 % opacity with an "hidden" tag), recipient mode renders only enabled sections.

**Why.** The two copies have already drifted (different heading colours); a single loop removes a whole class of "works in the editor, broken for guests" bugs.

### AD-6: Builder UI is a list, not a canvas

**Choice.** `SectionsPanel` in the left column: rows with a kind icon, title, eye toggle, ▲/▼, trash; "Add section" opens a palette grid of kinds with one-line descriptions. Clicking a row sets `inspectorFocus = { type: 'SECTION', sectionId }` and the right-hand editor shows that section's fields. Drag-and-drop reordering via the native HTML5 DnD API is an optional polish task after ▲/▼ works.

**Why.** Matches the existing left-panel-plus-inspector interaction model, works on touch, needs no dependency, and keeps the invitation preview itself unchanged.

### AD-7: Icons are inline SVG in a registry

**Choice.** `eventIcons.tsx` exports `ICONS: Record<IconId, (props) => JSX.Element>` and `ITINERARY_KIND_ICON: Record<ItineraryKind, IconId>`; `SvgColorImage` is reused where a recolourable file icon already exists.

**Why.** The audit found the itinerary and dress-code panels referencing `/icons/*.svg` files by path; inline components cannot 404, are recolourable via `currentColor`, tree-shake, and give the template picker and palette the same set.

### AD-8: Translation by ids, not by literal text

**Choice.** Template factories produce fully localised defaults for the requested language; UI chrome uses `i18n.ts`; `translator.ts` keeps only the `translateText` utility for tokens and loses the wedding phrasebook and the `=== 'Traje formal'` style sentinels. Host-authored text is never rewritten.

**Why.** The sentinel approach only ever worked for the untouched defaults, and it actively fought hosts who edited the copy.

### AD-9: Phase A ships alone

**Choice.** Phase A (types, normaliser, templates, phrasing, typed itinerary, dress groups, meal options, hub picker) lands with `sections` present in the data but rendered in the fixed legacy order; Phase B swaps in `SectionStack` and adds the builder UI. `opsx-apply` can stop after Phase A's verification tasks.

**Why.** Phase A already delivers "any event type" for hosts; Phase B is UI-heavy and benefits from Phase A's data being real before it's built.

## Templates (Phase A content)

| Type | Hosts label | Itinerary defaults | Sections (order) | Dress code | Gifts | RSVP defaults |
|---|---|---|---|---|---|---|
| WEDDING | Novios / The couple | CEREMONY "Ceremonia Religiosa", RECEPTION "Recepción" | audio, countdown, itinerary, dress, gifts, rsvp | 2 groups (Ellos/Ellas) | "Mesa de Regalos" | meal off, plus-ones off, notes "…para los novios" |
| BIRTHDAY | Cumpleañero(a) / Guest of honour | PARTY "Fiesta", DINNER "Cena" | audio, countdown, itinerary, dress, gifts, rsvp | 1 group "Invitados", "Elegante casual" | "Lista de Deseos" / "Wishlist" | meal off, plus-ones on, notes "…para {hosts}" |
| BAPTISM | Festejado(a) / Celebrant | CEREMONY "Ceremonia", RECEPTION "Recepción" | audio, countdown, text (padrinos), itinerary, dress, gifts, rsvp | 1 group "Invitados", "Formal" | "Regalos" | meal off, plus-ones off |
| CORPORATE | Organizador / Organiser | TALK "Bienvenida", TALK "Conferencia", DINNER "Cena de gala" | countdown, text (about), itinerary (labelled "Agenda"), dress, rsvp | 1 group "Asistentes", "Business formal" | none | meal on (3 generic options), plus-ones off, dietary on |
| CUSTOM | Anfitrión / Host | one ACTIVITY "Evento" | countdown, itinerary, rsvp | none | none | all off |

Every template has ES and EN copy. WEDDING ES must equal today's `DEFAULT_DESIGN` field for field (asserted by a test) so nothing changes for current hosts.

## Store actions (Phase B)

```ts
addSection(kind: SectionKind, atIndex?: number): string;   // returns id
removeSection(id: string): void;
moveSection(id: string, direction: 'up' | 'down'): void;
reorderSections(ids: string[]): void;                       // DnD
toggleSection(id: string, enabled?: boolean): void;
updateSection(id: string, patch: Partial<InvitationSection>): void;
```

All are pure updates to `design.sections`; existing `updateDesign` continues to handle shared fields.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| A legacy invitation renders differently after normalisation. | Normaliser reproduces the legacy fixed order and visibility rules; a snapshot test feeds today's `DEFAULT_DESIGN` and a captured production `designData` fixture through `normalizeDesign` and asserts the rendered section list and itinerary icons match the previous behaviour. |
| Client and server phrasing drift. | Single JSON source; both test suites validate completeness; server OG test covers each type. |
| `designData` grows (sections + props). | Payload is still a few KB; the store already strips data-URL images before save. |
| Hosts lose the old male/female dress-code editor they know. | Wedding template creates the same two groups with the same labels; the group editor is the same fields in a list. |
| Section palette lets hosts create a nonsensical stack (e.g. no RSVP). | Palette marks RSVP as recommended; a soft warning appears in the panel when RSVP is absent or disabled; nothing is blocked. |
| Server `eventType` column missing on production until `db:push`. | Column has a default; the API tolerates absence on read (`?? 'WEDDING'`). `db:push` is a listed task. |
| Scope creep from the full builder. | Phase gating (AD-9); DnD and IMAGE section styling are explicitly polish tasks. |
| `SigilContext` still exports the old reducer defaults used by tests. | Defaults are derived from the wedding template; `sigilReducer.test.ts` updated to the new shape. |
