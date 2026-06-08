# Data Model — Sigil & Script

This document describes the core domain entities of the Sigil & Script invitation creator. All types are defined in `src/types/sigil.types.ts` and are the authoritative source of truth for shape and naming.

---

## App Mode

```
AppMode = 'CREATOR' | 'RECIPIENT'
```

Top-level operational mode. `CREATOR` is the designer canvas; `RECIPIENT` is the personalised reveal experience.

---

## Reveal State Machine

```
RevealState = 'LOCKED' → 'ANIMATING' → 'REVEALED'
```

The three-phase sequence a recipient goes through when opening an invitation. Transitions are guarded in the reducer (only `LOCKED → ANIMATING` and `ANIMATING → REVEALED` are valid forward moves).

---

## Envelope / Container Styles

```
EnvelopeStyle = 'CLASSIC' | 'SCROLL' | 'BOOKLET'
```

Determines the outer container presentation of the invitation.

---

## Paper Textures

```
PaperTexture = 'linen' | 'parchment' | 'cotton-rag' | 'vellum'
PaperLuminance = 'LIGHT' | 'MEDIUM' | 'DARK'
```

`PaperLuminance` is derived from `PaperTexture` via `luminanceGuards.ts` and drives automatic ink and wax colour guardrails to ensure legibility.

---

## Wax Seal

### `SealState`
```
SealState = 'INTACT' | 'BREAKING' | 'BROKEN'
```

### `WaxSealConfig`

| Field | Type | Description |
|---|---|---|
| `color` | `string` | CSS var token (e.g. `var(--wax-crimson)`) **or** a `#rrggbb` hex string for custom colors |
| `colorLight` | `string` | Lighter gradient tone — CSS var for presets, `#rrggbb` hex for custom colors (derived via HSL +18pp) |
| `colorSheen` | `string` | Deeper shadow tone — CSS var for presets, `#rrggbb` hex for custom colors (derived via HSL −12pp) |
| `motif` | `'fleur-de-lis' \| 'sigil-s' \| 'botanical' \| 'geometric' \| 'monogram'` | SVG glyph identifier |
| `monogramText` | `string` | Custom text for monogram motif (e.g. `"M&A"`) |
| `rotation` | `number` | Seal rotation in degrees |
| `scale` | `number` | Scale factor relative to the 96 px base |
| `depth` | `number` | 3-D depth mapped to `feDistantLight` elevation (`0` = dramatic, `100` = flat) |
| `state` | `SealState` | Current breaking animation phase |

---

## Typography

### `InkColor`
```
InkColor = 'DARK_INK' | 'LIGHT_INK' | 'SEPIA_INK' | 'METALLIC_GOLD' | 'METALLIC_SILVER'
```

### `TextBlockConfig`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (e.g. `"tb-headline"`) |
| `content` | `string` | Raw content string; may contain template tokens (e.g. `{{guest_name}}`) |
| `fontFamily` | `string` | Full CSS font-family declaration |
| `fontSize` | `number` | Size in `rem` |
| `fontStyle` | `'normal' \| 'italic'` | |
| `fontWeight` | `400 \| 600 \| 700` | |
| `color` | `InkColor` | |
| `x` | `number` | Horizontal position as % of invitation stage width |
| `y` | `number` | Vertical position as % of invitation stage height |
| `textAlign` | `'left' \| 'center' \| 'right'` | |
| `letterSpacing` | `number` | Value in `em` |
| `lineHeight` | `number` | Unitless multiplier |

---

## Guest System

### `GuestPayload`

| Field | Type | Description |
|---|---|---|
| `guestName` | `string` | Primary name or family name (supports "The Smith Family") |
| `additionalGuests` | `string[]` (optional) | Additional names for multi-guest invitations |
| `routingToken` | `string` | Unique token used for mock routing |
| `rsvpBy` | `string` (optional) | RSVP deadline date string |
| `eventDate` | `string` (optional) | Event date string |
| `eventLocation` | `string` (optional) | Event location |

**Template Tokens**: The following placeholder strings in `TextBlockConfig.content` are replaced at render time:
- `{{guest_name}}` → `guestName`
- `{{event_date}}` → `eventDate`
- `{{event_location}}` → `eventLocation`
- `{{rsvp_by}}` → `rsvpBy`

---

## Invitation Design

### `InvitationDesign`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique design identifier |
| `title` | `string` | Human-readable design name |
| `paperTexture` | `PaperTexture` | |
| `paperLuminance` | `PaperLuminance` | Derived; drives colour guardrails |
| `envelopeStyle` | `EnvelopeStyle` | |
| `waxSeal` | `WaxSealConfig` | |
| `textBlocks` | `TextBlockConfig[]` | Ordered array of text blocks |
| `borderStyle` | `'deckled' \| 'torn' \| 'clean' \| 'scalloped'` | Edge treatment |
| `backgroundColor` | `string` | CSS color token (e.g. `var(--paper-parchment)`) |

---

## UI State

### `InspectorFocus` (discriminated union)
```
{ type: 'NONE' }
| { type: 'PAPER'; design: InvitationDesign }
| { type: 'TEXT_BLOCK'; blockId: string }
| { type: 'WAX_SEAL' }
```

Drives which inspector panel is active when the user clicks an element.

### `CanvasSelection`
```typescript
interface CanvasSelection {
  selectedTextBlockId: string | null;
}
```

---

## App State Shape (`SigilAppState`)

| Field | Type | Description |
|---|---|---|
| `appMode` | `AppMode` | Current mode |
| `revealState` | `RevealState` | Current reveal phase |
| `design` | `InvitationDesign` | Full invitation design being authored or viewed |
| `guest` | `GuestPayload` | Guest data hydrating template tokens |
| `inspectorFocus` | `InspectorFocus` | Which element the Inspector sidebar is focused on |
| `canvasSelection` | `CanvasSelection` | Currently selected canvas element(s) |
| `isEditingText` | `boolean` | Whether a text block is in active edit mode |

---

## Action Types (`SigilAction`)

| Action | Payload | Effect |
|---|---|---|
| `SET_APP_MODE` | `AppMode` | Switches mode; resets reveal, selection, and inspector |
| `SET_REVEAL_STATE` | `RevealState` | Direct state override |
| `START_REVEAL_ANIMATION` | — | `LOCKED → ANIMATING` (guarded) |
| `COMPLETE_REVEAL` | — | `ANIMATING → REVEALED` (guarded) |
| `RESET_REVEAL` | — | → `LOCKED` |
| `SET_INSPECTOR_FOCUS` | `InspectorFocus` | Updates active inspector panel |
| `SET_CANVAS_SELECTION` | `CanvasSelection` | Updates selected text block |
| `SET_IS_EDITING_TEXT` | `boolean` | Toggles text edit mode |
| `UPDATE_DESIGN` | `Partial<InvitationDesign>` | Merges partial updates into design |
| `UPDATE_TEXT_BLOCK` | `{ blockId, updates }` | Updates a single text block by id |
| `UPDATE_WAX_SEAL` | `Partial<WaxSealConfig>` | Merges partial updates into wax seal |
| `SET_GUEST` | `Partial<GuestPayload>` | Merges partial updates into guest payload |
| `RESET_TO_DEFAULTS` | — | Restores the full initial state |
