# Design — Guest Roster & Invitation Tracking Dashboard

## Architectural Decisions

### Decision 1: `GuestRoster` as a new top-level state slice (not part of `InvitationDesign`)

**Choice**: Add `guestRoster: GuestRoster` directly to `SigilAppState`, alongside `design` and `guest`.

**Why not inside `InvitationDesign`**: The roster belongs to the *event session*, not the *invitation design*. Multiple invitees share the same design. Coupling the roster into `InvitationDesign` would mean every design snapshot carries a potentially large list, and the data model becomes harder to reason about when designs are later duplicated or templated.

**Why not a separate React context**: A second context would introduce a new Provider tree and complicate the single-reducer pattern that all current code relies on. The `sigilReducer` can handle roster mutations cleanly alongside existing actions.

**Risk**: `SigilAppState` grows larger. Mitigated by keeping roster actions isolated in a clearly-labeled section of the reducer, and by using `useSigilSelector` to avoid unnecessary re-renders.

---

### Decision 2: `AppMode` extended to `'DASHBOARD'`

**Choice**: Add `'DASHBOARD'` as the third `AppMode` variant. The top-level `App.tsx` switch already conditionally renders content by mode; adding a third branch there is minimal.

**Why not a modal or drawer**: A dashboard overlaid as a modal would be cramped for a tabular view with actions per row. A distinct full-page mode matches the existing CREATOR ↔ RECIPIENT duality and gives the dashboard enough space for stats, table, and controls.

**Risk**: The "Dashboard" nav entry must not appear while in RECIPIENT mode (which is a read-only presentation). Guard: only show the Dashboard nav entry when `appMode !== 'RECIPIENT'`.

---

### Decision 3: `localStorage` sync via `useEffect` in `SigilProvider`

**Choice**: A single `useEffect` in `SigilProvider` watches `state.guestRoster` and writes `JSON.stringify(state.guestRoster)` to `localStorage["sigil-guest-roster"]` on every change. On init, `sigilReducer`'s initializer function reads from `localStorage` to hydrate the roster.

**Why not a custom hook**: The sync must happen at the Provider level to catch all dispatches. Extracting it to a hook would require the hook to be called inside the Provider, which is the same location anyway.

**Error handling**: Wrap the `localStorage.getItem` + `JSON.parse` in a `try/catch`; on failure, return the default empty roster. Wrap `localStorage.setItem` in a try/catch as well (storage quota exceeded is possible).

**Risk**: `localStorage` is per-origin, per-browser, per-device. Explicitly note in the dashboard UI: "Guest data is saved in this browser only."

---

### Decision 4: `crypto.randomUUID()` for all IDs

**Choice**: Use the browser-native `crypto.randomUUID()` for generating `InviteeRecord.id` and `Dependent.id`.

**Why**: Available in all modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+), produces cryptographically random UUIDs, no library required, no collision risk for a session-local roster.

**Risk**: `crypto.randomUUID()` is not available in very old browsers or pure Node test environments. For Vitest tests, mock it: `vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' })`.

---

### Decision 5: Guest URL pattern `?guest=<id>` — read once on mount

**Choice**: In `App.tsx` (or `main.tsx`), read `new URLSearchParams(window.location.search).get('guest')` on mount in a `useEffect`. If a matching `InviteeRecord` exists in the roster, dispatch `MARK_INVITATION_OPENED` and `SET_APP_MODE('RECIPIENT')`. After reading, remove the param from the URL with `history.replaceState` to avoid re-triggering on navigation.

**Why `useEffect` in `App.tsx` not in `SigilProvider`**: The URL is a UI concern. The Provider should not have knowledge of browser APIs. `App.tsx` already handles mode-based rendering; it is the natural place to read initial URL params.

**Risk**: The roster must be hydrated from `localStorage` *before* this `useEffect` runs. Since the reducer initializer runs synchronously during component construction, this is guaranteed.

---

### Decision 6: Opened-status tracking is frontend-only; limitation disclosed

**Choice**: There is no backend. "Opened" tracking works only when the guest opens the link in the *same browser profile* where the host saved the roster (or a copy of localStorage was shared). This is a fundamental constraint of a no-backend SPA.

**Where disclosed**: A static note in `<DashboardView>` below the stats bar reads: "Opened status is tracked in this browser only. A backend integration is required for real-time tracking across devices."

---

### Decision 7: `GuestPayload` hydration for recipient mode from `InviteeRecord`

**Choice**: When `?guest=<id>` is detected, construct a `GuestPayload` from the matched `InviteeRecord`:
- `guestName` ← `invitee.name`
- `additionalGuests` ← `invitee.dependents.filter(d => d.included).map(d => d.name)`
- `routingToken` ← `invitee.id`

This is a one-time derivation at mount; the recipient's `GuestPayload` is not reactively re-derived from roster mutations during the session.

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `localStorage` quota exceeded (5 MB limit) | Wrap `setItem` in try/catch; show a toast if write fails |
| `crypto.randomUUID()` not mocked in Vitest | Add `vi.stubGlobal` in test setup |
| Dashboard nav visible during RECIPIENT mode | Guard nav rendering: show Dashboard entry only when `appMode !== 'RECIPIENT'` |
| Dependent checkbox label not meaningful to screen readers | Use `aria-label="Include <name>, dependent of <inviteeName>"` |
| Re-stamping `openedAt` on repeat visits | Check `status !== 'OPENED'` before dispatching `MARK_INVITATION_OPENED` |
