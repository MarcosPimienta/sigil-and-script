# Delta Spec: Event Types

**Spec ID:** `event-types`
**Capability:** HOST tenant → Creator Studio; GUEST tenant → Invitation rendering & social preview

## ADDED Requirements

### Requirement: Invitations have an event type

Every invitation SHALL carry an `eventType` from `WEDDING | BIRTHDAY | BAPTISM | CORPORATE | CUSTOM`, persisted in `designData` and in `InvitationCanvas.eventType`.

#### Scenario: Legacy invitation
- **WHEN** an invitation saved before this change is loaded by a host or a guest
- **THEN** it is treated as `WEDDING` and renders with the same sections, icons, copy and title phrasing as before.

#### Scenario: Unknown value
- **WHEN** `designData.eventType` contains a value not in the list
- **THEN** it is normalised to `CUSTOM` and the invitation still renders.

### Requirement: Creating from a template

#### Scenario: Picker
- **WHEN** a host clicks "Create New Event" in the Events Hub
- **THEN** a picker shows the five event types with an icon and one-line description, and a language choice (ES/EN).

#### Scenario: New design
- **WHEN** the host chooses a type and language
- **THEN** the new invitation's title, host label, itinerary items (with kinds), sections, dress-code groups, gifts copy and RSVP defaults come from that template in that language, and its card in the hub shows a type badge.

#### Scenario: Wedding parity
- **WHEN** a host chooses `WEDDING` / ES
- **THEN** the resulting design is field-for-field identical to the previous default design (after normalisation).

### Requirement: Typed itinerary items

#### Scenario: Icon by kind
- **WHEN** an itinerary item has `kind` `CEREMONY`, `RECEPTION`, `PARTY`, `DINNER`, `TALK`, `ACTIVITY` or `CUSTOM`
- **THEN** the timeline shows that kind's icon regardless of the item's title text.

#### Scenario: Legacy inference
- **WHEN** a legacy item has no `kind`
- **THEN** the normaliser infers `CEREMONY` for titles containing "ceremonia"/"ceremony", `RECEPTION` for "recepción"/"recepcion"/"reception", `PARTY` for "fiesta"/"party"/"brindis", otherwise `CUSTOM`.

#### Scenario: Editing
- **WHEN** a host edits an itinerary row
- **THEN** a kind picker with icons is available next to the title.

### Requirement: Dress code groups

#### Scenario: Any number of groups
- **WHEN** a design has 0, 1, 2 or 3 dress-code groups
- **THEN** the panel is hidden (0) or lays the groups out in 1–3 columns, each with label, text, subtext, avoid-colour swatches and optional icon.

#### Scenario: Legacy migration
- **WHEN** a legacy design has `dressCodeMale*` / `dressCodeFemale*` fields
- **THEN** they become two groups with the same labels, texts, subtexts and avoid colours; the panel's visibility rule matches the old one.

### Requirement: Configurable RSVP meal options

#### Scenario: Host-defined menu
- **WHEN** `requireMealPreference` is on
- **THEN** the guest's meal `<select>` lists exactly `rsvpFormConfig.mealOptions`, editable by the host as a chip list.

#### Scenario: Legacy menu
- **WHEN** a legacy design has `requireMealPreference: true` and no `mealOptions`
- **THEN** the normaliser supplies the previous three dishes in the design's language.

### Requirement: Event-type phrasing

#### Scenario: Titles
- **WHEN** the event title is formatted for hosts "Sofía" with type `BIRTHDAY`
- **THEN** ES gives "Cumpleaños de Sofía" and EN gives "Sofía's Birthday"; `WEDDING` keeps "Matrimonio de …" / "… Wedding"; `CORPORATE` and `CUSTOM` use the host text verbatim; blank hosts fall back to the type's noun ("Cumpleaños", "Bautizo", "Evento").

#### Scenario: Spanish connector
- **WHEN** the full invitation title is built in ES
- **THEN** the connector comes from the event type's phrasing entry ("al" for matrimonio, bautizo, cumpleaños; "a" for corporate and custom), with one grammar adjustment: when the resulting title itself begins with a feminine event noun (boda, fiesta, gala, conferencia, cena, reunión, comunión, confirmación) the connector becomes "a la". No wedding-specific regex remains.

#### Scenario: Social preview
- **WHEN** a guest link is shared on WhatsApp
- **THEN** the server-rendered `og:title` uses the same phrasing table for the invitation's `eventType` and language.

#### Scenario: Host copy is never rewritten
- **WHEN** a host has edited any default text (dress code, gifts, itinerary titles)
- **THEN** the guest view shows the host's text unchanged in both languages; no sentinel-string substitution occurs.

## MODIFIED Requirements

### Requirement: Default design

`resetToDefaults()` SHALL take `(eventType, language)` and defer to the template registry. The stale defaults in `SigilContext` are removed.

### Requirement: `InvitationCanvasState` contract

Gains `eventType: EventType`. `itinerary[].kind` is required on write.

## REMOVED Requirements

- Title string-sniffing for itinerary icons.
- `matrimonio|boda|wedding` regex title rewriting (client and server).
- Sentinel-string English substitution in `DressCodePanel`, `GiftsRegistryPanel`, `ItineraryTimeline`.
- Fixed `beefMeal` / `salmonMeal` / `vegMeal` i18n keys.
- The `translator.ts` wedding phrasebook.

## UNCHANGED (explicit)

- Guest roster, RSVP submission payload, dashboard, auth, envelope animation, wax seal, paper/texture controls.
- Persisted `designData` for invitations that are never re-saved.
