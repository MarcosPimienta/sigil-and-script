# Delta Spec: Section Builder

**Spec ID:** `section-builder`
**Capability:** HOST tenant → Creator Studio; GUEST tenant → Invitation rendering

## ADDED Requirements

### Requirement: Sections are ordered data

An invitation SHALL have `sections: InvitationSection[]`; each has an `id`, a `kind` from `AUDIO | VIDEO | COUNTDOWN | ITINERARY | DRESS_CODE | GIFTS | RSVP | TEXT | IMAGE | DIVIDER`, an `enabled` flag, an optional `title`, and kind-specific `props`.

#### Scenario: Rendering order
- **WHEN** a guest opens an invitation
- **THEN** enabled sections render in array order below the headline, and disabled sections do not render at all.

#### Scenario: Host preview
- **WHEN** a host views the creator
- **THEN** all sections render in order; disabled ones are dimmed and tagged "hidden"; clicking a section focuses its editor.

#### Scenario: Legacy layout
- **WHEN** a legacy design without `sections` is loaded
- **THEN** sections are created in the order audio, countdown, itinerary, dress code, gifts, RSVP, each enabled exactly when the legacy renderer would have shown it.

### Requirement: Managing sections

#### Scenario: Add
- **WHEN** the host opens "Add section" and picks a kind
- **THEN** a new section of that kind is appended (or inserted at the chosen position) with template-language default props, and its editor opens.

#### Scenario: Music is one per invitation
- **WHEN** the design already contains an `AUDIO` section
- **THEN** the music player is greyed out in the palette with a note explaining why, and cannot be added again — two songs must never play at once.

#### Scenario: Every other kind repeats
- **WHEN** the host adds any kind other than `AUDIO`
- **THEN** it is added even if one already exists; `VIDEO`, `TEXT`, `IMAGE`, `DIVIDER`, `GIFTS`, `DRESS_CODE`, `COUNTDOWN`, `ITINERARY` and `RSVP` may all appear more than once.

#### Scenario: Duplicate RSVP warning
- **WHEN** more than one `RSVP` section is enabled
- **THEN** the panel shows a non-blocking warning that guests will see two forms; nothing is prevented, and each form's field ids are scoped to its section so the markup stays valid.

#### Scenario: Reorder
- **WHEN** the host presses ▲ or ▼ on a section (or drags it, where supported)
- **THEN** the section moves one position and the preview updates immediately.

#### Scenario: Hide / show
- **WHEN** the host toggles a section's eye icon
- **THEN** `enabled` flips; hidden sections keep their content.

#### Scenario: Remove
- **WHEN** the host removes a section
- **THEN** it is deleted from the list; removing the only `RSVP` shows a non-blocking warning in the panel.

#### Scenario: Persistence
- **WHEN** the host saves and reloads
- **THEN** order, enabled flags and per-section props round-trip unchanged.

### Requirement: Video sections

#### Scenario: Uploaded clip
- **WHEN** the host uploads an `.mp4` or `.webm` file of 7 MB or less
- **THEN** it is stored via the existing media upload and played inline with native controls.

#### Scenario: Oversize upload
- **WHEN** the chosen file is larger than 7 MB or of another type
- **THEN** the editor refuses it and explains the limit, suggesting a link instead.

#### Scenario: Pasted link
- **WHEN** the host pastes a YouTube or Vimeo link, or a direct `.mp4`/`.webm` URL
- **THEN** the provider is detected and the video renders as the appropriate embed or native player; an unrecognised link shows an inline error in the editor.

#### Scenario: Never autoplay with sound
- **WHEN** a video section is rendered for a guest
- **THEN** it does not autoplay with audio, and starting playback pauses the invitation's background music so the two never overlap.

### Requirement: Per-section typography

Every section MAY override the invitation's fonts through `fonts: { heading?, body? }`.

#### Scenario: Choosing a font
- **WHEN** the host picks a heading or body font for a section
- **THEN** only that section's text changes; other sections keep their own fonts.

#### Scenario: Default
- **WHEN** a section has no font override (or the host selects "Predeterminada / Default")
- **THEN** the section renders in the font it has always used — the override is removed rather than pinned to the current value.

#### Scenario: Only loaded families are offered
- **WHEN** the font picker is opened
- **THEN** it lists only families the app loads (Cormorant Garamond, Pinyon Script, Cinzel Decorative, Playfair Display, IM Fell English, Spectral, GFS Didot) plus system serif and sans stacks, each previewed in its own face.

#### Scenario: Text blocks
- **WHEN** a `TEXT` section has a legacy `props.fontFamily` and no section-level body font
- **THEN** the paragraph keeps that font, and the picker shows it as the current default until the host chooses another.

### Requirement: Free-form sections

#### Scenario: Text section
- **WHEN** a `TEXT` section is rendered
- **THEN** it shows its content with the chosen font, size, style, ink colour and alignment, and supports the same `{{tokens}}` as text blocks.

#### Scenario: Image section
- **WHEN** an `IMAGE` section is rendered
- **THEN** it shows the uploaded image centred at the chosen scale with an optional caption; SVGs are recoloured like other artwork.

#### Scenario: Divider section
- **WHEN** a `DIVIDER` section is rendered
- **THEN** it shows the selected ornament (flourish, line or dots) in the current ink colour.

### Requirement: Shared-data sections are placements

#### Scenario: Moving the itinerary
- **WHEN** the host moves the `ITINERARY` section
- **THEN** the itinerary items themselves are unchanged; only the position changes. The same holds for `COUNTDOWN`, `AUDIO` and `RSVP`.

## MODIFIED Requirements

### Requirement: Creator canvas

`CreatorCanvas` SHALL render one `SectionStack` for both host and recipient views instead of two hand-maintained stacks.

### Requirement: Templates

Each event template SHALL define its own initial `sections` list.

## REMOVED Requirements

- Fixed section order in `CreatorCanvas`.
- Section visibility implied solely by empty fields (now explicit `enabled`).

## UNCHANGED (explicit)

- Headline text blocks (`textBlocks`) remain above the sections and keep their own editor.
- RSVP submission and roster behaviour.
