# Design: Left Panel Information Architecture

## Architectural decisions

### AD-1: Navigation state lives in the store, not in component state

**Choice.** `panelTab: 'EVENT' | 'SECTIONS' | 'STYLE'` joins the existing
`inspectorFocus` in `sigilStore`. The drill-down is not a second piece of state:
`inspectorFocus.type === 'SECTION'` *is* the drill-down, and the palette is a
third value, `panelTab === 'SECTIONS'` plus a local `isPaletteOpen`.

**Why.** Clicking a section in the *preview* already sets `inspectorFocus`
(`SectionStack` does it today). If the tab were local state, clicking a section
in the preview while the Estilo tab was open would open an inspector nobody can
see. With the tab in the store, that click can switch to Secciones and drill in,
which is what a host expects. It also keeps the panel testable without mounting
the whole studio.

### AD-2: The inspector replaces the list in the same scroll container

**Choice.** `SectionsTab` renders exactly one of: the list, the palette, or the
inspector. Not a list *plus* an inspector.

**Why.** This is the fix for the worst problem in the current panel. A single
occupant also means the scroll position of each view is independent and a long
section can never push the list away, because the list is not mounted.

### AD-3: Per-kind editors become exported fragments, not a switch in one file

**Choice.** The `countdownFields`, `giftsFields` and `itineraryFields` locals in
`SectionEditor` become exported components (`CountdownFields`, `GiftsFields`,
`ItineraryFields`) taking no props and reading the store as they do now. The
inspector composes them by kind.

**Why.** The smallest possible move: the field markup and its handlers are
lifted verbatim, so there is no behavioural risk in the part of this change
that touches the most existing code. `SectionEditor` keeps its name and its
tests; it stops owning layout.

### AD-4: `defaultFonts` on the stack root, overrides on the children

**Choice.** `InvitationDesign.defaultFonts?: SectionFonts`. `SectionStack`
spreads `sectionFontVars(design.defaultFonts)` on its root container; each
section keeps spreading `sectionFontVars(section.fonts)` on its own wrapper.

**Why.** CSS custom properties inherit, so a section that sets neither variable
picks up the root's, and a section that sets one overrides exactly that one —
the cascade does the work with no precedence logic to write or test. When
`defaultFonts` is absent the root sets no variables and every renderer falls
back to its historical font, so existing invitations render byte-identically.

### AD-5: Drag reorder is hand-rolled on pointer events

**Choice.** The row's grip captures the pointer, the list tracks a hovered index,
and `reorderSections(ids)` is called once on release. No drag-and-drop library.

**Why.** The store action already exists and takes the final order, so the only
thing missing is the gesture. Pointer events cover mouse, touch and stylus in
one code path, and a library would be a dependency for one list of nine rows.
`touch-action: none` on the grip only, so the panel still scrolls with a finger
anywhere else.

### AD-6: One string table, not scattered ternaries

**Choice.** `panelStrings.ts` exports `PANEL_STRINGS: Record<key, {ES, EN}>` and
the panel components take `t(key)` from a small hook over `design.language`.

**Why.** The mixed-language labels are a symptom of per-component `t(es, en)`
helpers: it is too easy to leave a string untranslated when the fallback is a
hardcoded English literal. A table makes a missing translation a type error.

### AD-7: The wax-seal creator keeps its inline expansion

**Choice.** Inside Estilo's "Sobre y sello" group, "Editar" still expands
`SealCreator` in place rather than becoming a fourth panel view.

**Why.** The seal creator is a self-contained canvas tool with its own apply and
cancel; making it a routed view would mean teaching the shell about a state that
only one control has. Expanding inside an already-scoped group is not the
push-the-list-away problem, because there is no list to push.

## Panel anatomy

```
┌──────────────────────────────────────┐
│  Boda Rivas & Ortega                 │  header: name + type/lang/date chips
│  [Boda] · Español · 14 feb 2027      │
├──────────────────────────────────────┤
│  EVENTO   SECCIONES   ESTILO         │  tab bar (underline = active)
│           ──────────                 │
├──────────────────────────────────────┤
│                                      │
│  one of: list | palette | inspector  │  the only scrolling region
│                                      │
├──────────────────────────────────────┤
│  Guardado hace 2 min   Vista invitado│  footer
└──────────────────────────────────────┘
```

The shell is a flex column with `height: 100%`; only the body scrolls, so the
tabs and the footer never leave. This is the other half of the fix: today the
whole panel scrolls, so there is no fixed reference point anywhere.

## Where every existing control goes

| Control today | New home |
|---|---|
| Design title input | Evento → header name |
| Language switch (in `SectionEditor`) | Evento → Idioma |
| Hosts / event title | Evento → Datos del evento |
| Guest name, event date, location, RSVP deadline | Evento → Datos / Vista previa |
| Countdown target | Secciones → Cuenta regresiva inspector |
| Header (title) image + scale | Estilo → Tipografía y título |
| Envelope logo + scale | Estilo → Sobre y sello |
| Seal creator, sticker image, seal size | Estilo → Sobre y sello |
| Paper texture + brightness/contrast/saturation | Estilo → Papel y textura |
| Frame image | Estilo → Marco y bordes |
| Registry image + scale | Secciones → Mesa de regalos inspector |
| Registry title/text/symbol/link | Secciones → Mesa de regalos inspector |
| Itinerary items | Secciones → Itinerario inspector |
| Dress code editor | Secciones → Código de vestimenta inspector |
| RSVP form controls | Secciones → Confirmación inspector |
| Background music upload | Secciones → Música inspector |
| Per-section fonts | Secciones → inspector → Tipografía tab |
| *(new)* default fonts | Estilo → Tipografía predeterminada |

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| A control is silently dropped in the move. | The table above is the checklist, and a test asserts every `SECTION_CATALOGUE` kind renders an inspector body rather than an empty panel. |
| The guest view changes. | `SectionStack`'s only edit is one extra style spread that is empty when `defaultFonts` is unset; a test renders a legacy design and asserts no font variables on the root. |
| Existing tests target moved markup. | `SectionsPanel.test.tsx` and `FormConfiguratorPanel.test.tsx` are updated to mount the new hosts; the components' behaviour is unchanged, so assertions move rather than weaken. |
| Drag reorder misbehaves on touch. | `touch-action: none` on the grip only; release always commits a complete order via the existing `reorderSections`. |
| Hosts lose a control they knew the location of. | Tab names and group names use the host's language, and the first release keeps every control's existing `id` so muscle memory and any bookmarks in tests still resolve. |
