# Delta Spec: Left Panel Information Architecture

**Spec ID:** `left-panel`
**Capability:** HOST tenant → Invitation Studio → left control panel

## ADDED Requirements

### Requirement: Three-tab panel

The left panel SHALL present exactly three top-level tabs — Evento, Secciones,
Estilo — with the header and tabs fixed and only the tab body scrolling.

#### Scenario: Switching tabs
- **WHEN** the host clicks a tab
- **THEN** the body shows that tab's content, the header and footer stay in place, and returning to a tab restores what was open in it.

#### Scenario: Nothing is lost
- **WHEN** the panel is open
- **THEN** every control available before this change is reachable, and no control appears in more than one place.

### Requirement: Controls sit with what they affect

A control that changes a single section SHALL live inside that section.

#### Scenario: RSVP form configuration
- **WHEN** the host opens the Confirmación section
- **THEN** the meal-preference, dietary, plus-one and notes controls are there, and no RSVP configuration block exists at the top level.

#### Scenario: The song
- **WHEN** the host opens the Música section
- **THEN** the song upload is there, and the separate "Background Music" block no longer exists.

#### Scenario: The registry image
- **WHEN** the host opens the Mesa de regalos section
- **THEN** its image and scale are there rather than under global artwork.

### Requirement: The inspector replaces the list

#### Scenario: Entering a section
- **WHEN** the host clicks a section row
- **THEN** the inspector takes over the panel body with a back control, and the list is not rendered below it.

#### Scenario: Long sections
- **WHEN** the open section has many fields
- **THEN** the section list is unaffected, because returning to it restores it at its previous scroll position.

#### Scenario: Clicking a section in the preview
- **WHEN** the host clicks a section in the invitation preview while another tab is open
- **THEN** the panel switches to Secciones and opens that section's inspector.

#### Scenario: Deleting
- **WHEN** the host deletes a section from the inspector
- **THEN** the delete control is separated from the visibility control, and afterwards the panel returns to the list.

### Requirement: Section list

#### Scenario: Fits without scrolling
- **WHEN** an invitation has the default set of sections
- **THEN** the whole list is visible at once at a 900px-tall panel.

#### Scenario: Reordering
- **WHEN** the host drags a row's handle and releases
- **THEN** the sections take the new order, with mouse, touch or stylus.

#### Scenario: Reordering without a pointer
- **WHEN** the host focuses a row and uses the move controls
- **THEN** the section moves one position, so reordering never requires dragging.

#### Scenario: Capped kinds
- **WHEN** a kind that allows only one instance is already present
- **THEN** the palette shows it unavailable with the reason, and the row carries a cap badge.

### Requirement: Default typography

The invitation SHALL have host-chosen default fonts that sections inherit.

#### Scenario: Choosing defaults
- **WHEN** the host picks heading and body fonts in Estilo
- **THEN** every section without its own override uses them.

#### Scenario: A section overrides
- **WHEN** a section sets its own font
- **THEN** that section's font wins over the default.

#### Scenario: An invitation saved before this change
- **WHEN** such an invitation is opened and rendered
- **THEN** no default fonts are set and every section renders exactly as it did before.

### Requirement: One language per panel

#### Scenario: Labels follow the invitation
- **WHEN** the invitation's language is Spanish or English
- **THEN** every label, hint, tab and group name in the panel is in that language.

## UNCHANGED (explicit)

- The guest-facing invitation and its network payload.
- The Dashboard, guest list, floor plan and wax-seal creator behaviour.
- `designData`'s existing fields; only the optional `defaultFonts` is added.
