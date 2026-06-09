# Data Model — Sigil & Script

Domain entities, state shape, and action types for the Sigil & Script invitation creator.

---

## AppMode

```ts
type AppMode = 'CREATOR' | 'RECIPIENT' | 'DASHBOARD';
```

| Value | Description |
|-------|-------------|
| `CREATOR` | Default. The event host is designing the invitation. |
| `RECIPIENT` | Preview / delivery mode. The invited guest is viewing the invitation. |
| `DASHBOARD` | Host is reviewing the guest roster and invitation tracking stats. |

---

## SigilAppState

The single state atom managed by `sigilReducer` and provided via `SigilContext`.

```ts
interface SigilAppState {
  appMode:         AppMode;
  revealState:     RevealState;
  design:          InvitationDesign;
  guest:           GuestPayload;
  inspectorFocus:  InspectorFocus;
  canvasSelection: CanvasSelection;
  isEditingText:   boolean;
  guestRoster:     GuestRoster;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `appMode` | `AppMode` | Current top-level application mode. |
| `revealState` | `RevealState` | Reveal sequence phase (`LOCKED → ANIMATING → REVEALED`). |
| `design` | `InvitationDesign` | Full invitation design being authored or viewed. |
| `guest` | `GuestPayload` | Guest data populating template tokens in recipient mode. |
| `inspectorFocus` | `InspectorFocus` | Which canvas element the inspector sidebar is inspecting. |
| `canvasSelection` | `CanvasSelection` | Currently selected canvas element (text block). |
| `isEditingText` | `boolean` | Whether an inline text editor is active. |
| `guestRoster` | `GuestRoster` | All invitees and their invitation tracking state. Persisted to `localStorage` under the key `sigil-guest-roster`. |

---

## Guest Roster Types

### GuestRoster

```ts
interface GuestRoster {
  invitees: InviteeRecord[];
}
```

Top-level roster container. Persisted to `localStorage` (key: `sigil-guest-roster`) and hydrated synchronously in the `useReducer` initializer.

### InviteeRecord

```ts
interface InviteeRecord {
  id: string;            // crypto.randomUUID()
  name: string;
  email?: string;
  dependents: Dependent[];
  status: InvitationStatus;
  openedAt?: string;     // ISO 8601 timestamp; set when status changes to OPENED
}
```

Represents a single invited guest. The `id` is used as the `?guest=<id>` URL parameter to mark the invitation as opened when the link is visited.

### Dependent

```ts
interface Dependent {
  id: string;      // crypto.randomUUID()
  name: string;
  included: boolean;  // whether this dependent is included in the invitation
}
```

A dependent attached to an invitee (e.g., a child or plus-one). The host toggles inclusion with a checkbox. When an invitee's guest link is visited, only dependents where `included === true` are passed to the recipient view via `setGuest`.

### InvitationStatus

```ts
type InvitationStatus = 'PENDING' | 'SENT' | 'OPENED' | 'RSVP_YES' | 'RSVP_NO';
```

| Value | Description |
|-------|-------------|
| `PENDING` | Invitation created but not yet sent to the guest. |
| `SENT` | Host manually marked it as sent (no email integration). |
| `OPENED` | Guest visited the `?guest=<id>` link in this browser. Frontend-only — not tracked across devices. |
| `RSVP_YES` | Reserved for future RSVP functionality. |
| `RSVP_NO` | Reserved for future RSVP functionality. |

---

## SigilAction

All action types dispatched through `sigilReducer`.

### Mode & Reveal

| Action type | Payload | Effect |
|-------------|---------|--------|
| `SET_APP_MODE` | `AppMode` | Switches mode; resets `revealState`, `canvasSelection`, `inspectorFocus`, `isEditingText`. |
| `SET_REVEAL_STATE` | `RevealState` | Sets reveal state directly. |
| `START_REVEAL_ANIMATION` | — | `LOCKED → ANIMATING` (guarded). |
| `COMPLETE_REVEAL` | — | `ANIMATING → REVEALED` (guarded). |
| `RESET_REVEAL` | — | Forces `revealState` back to `LOCKED`. |

### Inspector & Canvas

| Action type | Payload | Effect |
|-------------|---------|--------|
| `SET_INSPECTOR_FOCUS` | `InspectorFocus` | Updates the inspector sidebar target. |
| `SET_CANVAS_SELECTION` | `CanvasSelection` | Updates the selected text block ID. |
| `SET_IS_EDITING_TEXT` | `boolean` | Toggles inline text editing state. |

### Design

| Action type | Payload | Effect |
|-------------|---------|--------|
| `UPDATE_DESIGN` | `Partial<InvitationDesign>` | Merges partial design update. |
| `UPDATE_TEXT_BLOCK` | `{ blockId, updates }` | Merges updates into a specific text block by ID. |
| `UPDATE_WAX_SEAL` | `Partial<WaxSealConfig>` | Merges updates into the wax seal config. |

### Guest Payload

| Action type | Payload | Effect |
|-------------|---------|--------|
| `SET_GUEST` | `Partial<GuestPayload>` | Merges partial guest payload (recipient name, event details). |
| `RESET_TO_DEFAULTS` | — | Resets full state to `INITIAL_STATE`. |

### Guest Roster

| Action type | Payload | Effect |
|-------------|---------|--------|
| `ADD_INVITEE` | `{ name, email? }` | Appends a new `InviteeRecord` with `status: 'PENDING'` and a new UUID. Name is trimmed; empty name is a no-op. |
| `REMOVE_INVITEE` | `{ inviteeId }` | Filters the invitee out of the roster. |
| `UPDATE_INVITEE` | `{ inviteeId, updates }` | Merges `{ name, email, status }` updates into the matching invitee. |
| `ADD_DEPENDENT` | `{ inviteeId, name }` | Appends a new `Dependent` (`included: true`) to the invitee's `dependents` array. Name is trimmed; empty name is a no-op. |
| `REMOVE_DEPENDENT` | `{ inviteeId, dependentId }` | Filters the dependent out of the invitee's `dependents` array. |
| `TOGGLE_DEPENDENT` | `{ inviteeId, dependentId }` | Flips `included` on the matching dependent. |
| `MARK_INVITATION_OPENED` | `{ inviteeId }` | Sets `status: 'OPENED'` and `openedAt: new Date().toISOString()`. No-op if already `OPENED`. |

---

## WaxSealConfig

```ts
interface WaxSealConfig {
  color:       string;  // hex (#RRGGBB) for custom; CSS var for presets
  colorLight:  string;  // CSS variable for lighter sheen
  colorSheen:  string;  // CSS variable for deep shadow
  motif:       'fleur-de-lis' | 'sigil-s' | 'botanical' | 'geometric' | 'monogram';
  monogramText: string;
  rotation:    number;  // degrees
  scale:       number;  // relative to 96px base
  depth:       number;  // 0 = dramatic, 100 = flat (feDistantLight elevation)
  state:       SealState;
}
```

**Color fields note**: `color` can be either a CSS custom property (`var(--wax-crimson)`) when a preset is chosen or a raw hex value (`#a03040`) when the host picks a custom color. `colorLight` and `colorSheen` are always CSS variables pointing to palette tokens derived from the chosen preset. When a custom hex is used, the sheen/light variants fall back gracefully to the preset tokens.

---

## localStorage Persistence

| Key | Value shape | Notes |
|-----|-------------|-------|
| `sigil-guest-roster` | `GuestRoster` (JSON) | Synced on every `guestRoster` state change via `useEffect`. Hydrated synchronously in the `useReducer` initializer. |

No other state is persisted across page loads.
