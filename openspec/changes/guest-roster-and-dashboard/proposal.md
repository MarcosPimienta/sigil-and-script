# Proposal — Guest Roster & Invitation Tracking Dashboard

## Problem

The Sigil & Script creator currently supports designing a single invitation with one static guest payload (`GuestPayload`). There is no way for the event host to:

- Manage a list of specific people being invited
- Attach dependents (partners, children, plus-ones) to an invitee
- Control which dependents are included on each invitation
- Know which personalized invitations have been opened by recipients

The existing `GuestPayload` is a template-filler for preview purposes only. It does not model a real guest list and disappears on page refresh. This is a critical gap: a host cannot use the tool to orchestrate an actual event without managing invitees outside the app.

## Proposed Capability: `guest-roster-and-dashboard`

Introduce a **Guest Roster** — a persistent, editable list of `InviteeRecord` entries — and a **Dashboard view** that surfaces invitation status per invitee.

### New functionality

1. **Guest Roster panel** (in creator mode): Add/remove invitees by name; attach and toggle dependents per invitee.
2. **Dependent management**: Each invitee can have 0..n dependents. Each dependent has an `included` checkbox (e.g., the host can exclude children from a formal dinner).
3. **Invitation status tracking**: Opening a guest-specific link (`?guest=<id>`) marks that invitation as `OPENED` and records a timestamp. The host can also manually mark an invitation as `SENT`.
4. **Dashboard view** (new `AppMode`): Shows all invitees, their status badge, opened timestamp, a "Copy link" button per invitee, and aggregate stats.

## Files to Create

| File | Purpose |
|---|---|
| `src/components/creator/GuestRosterPanel.tsx` | Roster management within creator mode |
| `src/components/creator/InviteeRow.tsx` | Single invitee row with dependents |
| `src/components/creator/DependentCheckbox.tsx` | Accessible checkbox per dependent |
| `src/components/creator/AddInviteeForm.tsx` | Inline add-invitee form |
| `src/components/dashboard/DashboardView.tsx` | Full dashboard layout |
| `src/components/dashboard/DashboardStats.tsx` | Aggregate stats row |
| `src/components/dashboard/InvitationStatusBadge.tsx` | Status pill component |
| `src/styles/dashboard.css` | Dashboard-specific styles |

## Files to Modify

| File | Change |
|---|---|
| `src/types/sigil.types.ts` | Add `Dependent`, `InviteeRecord`, `InvitationStatus`, `GuestRoster`; extend `AppMode` |
| `src/context/SigilContext.tsx` | Add `guestRoster` state, all new actions, action creators, localStorage sync |
| `src/styles/tokens.css` | Add invitation status color tokens |
| `src/styles/creator.css` | Add roster panel styles |
| `src/App.tsx` | Render `<DashboardView>` for `appMode === 'DASHBOARD'`; add Dashboard nav entry |
| `docs/data-model.md` | Document new types and actions |

## Constraints

- **Frontend-only**: No backend exists. Opened-status tracking is simulated via `?guest=<id>` URL params and `localStorage`. This limitation must be surfaced in the dashboard UI.
- **No routing library**: Use `URLSearchParams` directly; no React Router.
- **Persistence via localStorage**: Key `sigil-guest-roster`; synced from `SigilProvider` via `useEffect`.
- **ID generation**: `crypto.randomUUID()` — no external library.
