## 0. Setup: Create Feature Branch (MANDATORY — FIRST STEP)

- [ ] 0.1 Create feature branch `feature/guest-roster-and-dashboard` from `master`
- [ ] 0.2 Verify branch: `git branch --show-current`

---

## 1. Types — Add New TypeScript Types to `sigil.types.ts`

- [ ] 1.1 Add `Dependent` interface:
  ```ts
  export interface Dependent {
    id: string;
    name: string;
    included: boolean;
  }
  ```
- [ ] 1.2 Add `InvitationStatus` union type:
  ```ts
  export type InvitationStatus =
    | 'PENDING'
    | 'SENT'
    | 'OPENED'
    | 'RSVP_YES'
    | 'RSVP_NO';
  ```
- [ ] 1.3 Add `InviteeRecord` interface:
  ```ts
  export interface InviteeRecord {
    id: string;
    name: string;
    email?: string;
    dependents: Dependent[];
    status: InvitationStatus;
    openedAt?: string;
  }
  ```
- [ ] 1.4 Add `GuestRoster` interface:
  ```ts
  export interface GuestRoster {
    invitees: InviteeRecord[];
  }
  ```
- [ ] 1.5 Extend `AppMode`:
  ```ts
  export type AppMode = 'CREATOR' | 'RECIPIENT' | 'DASHBOARD';
  ```
- [ ] 1.6 Run `npm run build` — zero TypeScript errors before proceeding

---

## 2. Reducer — TDD: Write Failing Tests First

- [ ] 2.1 Create `src/context/sigilReducer.test.ts` with failing tests for each new action:

  **ADD_INVITEE tests:**
  - adds record with trimmed name, status `'PENDING'`, empty dependents
  - generates a non-empty string id
  - stores optional email when provided
  - does not add when name is empty (guard)

  **REMOVE_INVITEE tests:**
  - removes the matching invitee by id
  - leaves other invitees unchanged
  - is a no-op when id does not exist

  **UPDATE_INVITEE tests:**
  - merges partial updates (name, email) into the matching record
  - does not mutate other records

  **ADD_DEPENDENT tests:**
  - appends dependent with trimmed name, `included: true`, generated id
  - does not add when name is empty (guard)
  - is a no-op when inviteeId does not exist

  **REMOVE_DEPENDENT tests:**
  - removes the dependent by (inviteeId, dependentId)
  - leaves other dependents unchanged

  **TOGGLE_DEPENDENT tests:**
  - flips `included` from `true` to `false`
  - flips `included` from `false` to `true`
  - is a no-op when dependent does not exist

  **MARK_INVITATION_OPENED tests:**
  - sets status to `'OPENED'` and sets `openedAt` to a non-empty string
  - does not overwrite `openedAt` when status is already `'OPENED'`
  - is a no-op when inviteeId does not exist

- [ ] 2.2 Confirm all new tests fail (red phase): `npm test`

---

## 3. Reducer — Implementation (Green Phase)

- [ ] 3.1 Add `guestRoster: GuestRoster` to `SigilAppState` with default `{ invitees: [] }`
- [ ] 3.2 Add all new action types to the `SigilAction` union in `SigilContext.tsx`:
  ```ts
  | { type: 'ADD_INVITEE';          payload: { name: string; email?: string } }
  | { type: 'REMOVE_INVITEE';       payload: { inviteeId: string } }
  | { type: 'UPDATE_INVITEE';       payload: { inviteeId: string; updates: Partial<Pick<InviteeRecord, 'name' | 'email' | 'status'>> } }
  | { type: 'ADD_DEPENDENT';        payload: { inviteeId: string; name: string } }
  | { type: 'REMOVE_DEPENDENT';     payload: { inviteeId: string; dependentId: string } }
  | { type: 'TOGGLE_DEPENDENT';     payload: { inviteeId: string; dependentId: string } }
  | { type: 'MARK_INVITATION_OPENED'; payload: { inviteeId: string } }
  ```
- [ ] 3.3 Implement reducer cases in `sigilReducer`:
  - `ADD_INVITEE`: trim name, guard empty, generate id via `crypto.randomUUID()`, append
  - `REMOVE_INVITEE`: filter by id
  - `UPDATE_INVITEE`: map and merge by id
  - `ADD_DEPENDENT`: trim name, guard empty, find invitee, append dependent with generated id
  - `REMOVE_DEPENDENT`: find invitee, filter dependents by id
  - `TOGGLE_DEPENDENT`: find invitee, find dependent, flip `included`
  - `MARK_INVITATION_OPENED`: find invitee, guard `status !== 'OPENED'`, set status and `openedAt`
- [ ] 3.4 Add convenience action creators to `SigilContextValue` and expose them in the Provider:
  - `addInvitee(name: string, email?: string): void`
  - `removeInvitee(inviteeId: string): void`
  - `updateInvitee(inviteeId: string, updates: Partial<Pick<InviteeRecord, 'name' | 'email' | 'status'>>): void`
  - `addDependent(inviteeId: string, name: string): void`
  - `removeDependent(inviteeId: string, dependentId: string): void`
  - `toggleDependent(inviteeId: string, dependentId: string): void`
  - `markInvitationOpened(inviteeId: string): void`
- [ ] 3.5 Run `npm test` — all reducer tests must pass (green phase)
- [ ] 3.6 Run `npm run build` — zero TypeScript errors

---

## 4. Persistence — localStorage Sync

- [ ] 4.1 In `SigilProvider`, add a `useEffect` that watches `state.guestRoster` and writes to localStorage:
  ```ts
  useEffect(() => {
    try {
      localStorage.setItem('sigil-guest-roster', JSON.stringify(state.guestRoster));
    } catch {
      // Storage quota exceeded — fail silently
    }
  }, [state.guestRoster]);
  ```
- [ ] 4.2 In the `useReducer` initializer function, hydrate roster from localStorage:
  ```ts
  (base) => {
    let roster: GuestRoster = { invitees: [] };
    try {
      const stored = localStorage.getItem('sigil-guest-roster');
      if (stored) roster = JSON.parse(stored) as GuestRoster;
    } catch {
      // Malformed JSON — use empty roster
    }
    return {
      ...base,
      guestRoster: roster,
      guest: initialGuest ? { ...DEFAULT_GUEST, ...initialGuest } : base.guest,
    };
  }
  ```
- [ ] 4.3 Write tests for the localStorage hydration logic (stub `localStorage` in Vitest):
  - valid JSON hydrates the roster correctly
  - malformed JSON results in an empty roster without throwing
  - missing key results in an empty roster

---

## 5. URL Param — Guest Link & Opened Tracking

- [ ] 5.1 In `App.tsx`, add a one-time `useEffect` (empty deps array) that:
  1. Reads `new URLSearchParams(window.location.search).get('guest')`
  2. If a matching `InviteeRecord` exists in `guestRoster.invitees`, dispatches:
     - `MARK_INVITATION_OPENED` (only if status is not already `'OPENED'`)
     - `SET_GUEST` with `{ guestName: invitee.name, additionalGuests: invitee.dependents.filter(d => d.included).map(d => d.name), routingToken: invitee.id }`
     - `SET_APP_MODE('RECIPIENT')`
  3. Calls `window.history.replaceState({}, '', window.location.pathname)` to remove the param
- [ ] 5.2 Write unit tests for the guest URL hydration logic (stub `window.location.search` and `history.replaceState`):
  - matching guest id → MARK_INVITATION_OPENED dispatched, app mode becomes RECIPIENT
  - unknown id → no dispatch, app mode stays CREATOR
  - already-OPENED id → MARK_INVITATION_OPENED NOT dispatched, openedAt preserved

---

## 6. Design Tokens — `src/styles/tokens.css`

- [ ] 6.1 Add invitation status tokens under a new `/* Invitation Status */` group:
  ```css
  --status-pending:  #a89070;
  --status-sent:     #4a7c9e;
  --status-opened:   #3a7a50;
  --status-rsvp-yes: #5a6b28;
  --status-rsvp-no:  #8b3a3a;
  ```
- [ ] 6.2 Add dashboard surface tokens:
  ```css
  --dashboard-bg:          var(--paper-parchment);
  --roster-row-bg:         rgba(255,255,255,0.4);
  --roster-row-hover-bg:   rgba(255,255,255,0.7);
  ```

---

## 7. Component — `InvitationStatusBadge`

- [ ] 7.1 Create `src/components/dashboard/InvitationStatusBadge.tsx`:
  ```tsx
  interface InvitationStatusBadgeProps {
    status: InvitationStatus;
  }
  ```
  - Map each status to a label string: `PENDING → "Pending"`, `SENT → "Sent"`, `OPENED → "Opened"`, etc.
  - Render: `<span className={`status-badge status-badge--${status.toLowerCase()}`} aria-label={`Invitation status: ${label}`}>{label}</span>`
- [ ] 7.2 Write component test (Vitest + React Testing Library):
  - renders correct label text for each status value
  - `aria-label` includes the status label

---

## 8. Component — `DependentCheckbox`

- [ ] 8.1 Create `src/components/creator/DependentCheckbox.tsx`:
  ```tsx
  interface DependentCheckboxProps {
    dependent: Dependent;
    inviteeId: string;
    inviteeName: string;
  }
  ```
  - Render: `<input type="checkbox" id={dependent.id} checked={dependent.included} onChange={() => toggleDependent(inviteeId, dependent.id)} />`
  - `<label htmlFor={dependent.id}>` containing `dependent.name`
  - Full `aria-label` on the input: `"Include ${dependent.name}, dependent of ${inviteeName}"`
  - Remove button: calls `removeDependent(inviteeId, dependent.id)` — `aria-label="Remove ${dependent.name}"`
- [ ] 8.2 Write component test:
  - checkbox renders checked when `included: true`, unchecked when `false`
  - clicking checkbox calls `toggleDependent`
  - clicking remove button calls `removeDependent`

---

## 9. Component — `AddInviteeForm`

- [ ] 9.1 Create `src/components/creator/AddInviteeForm.tsx`:
  - Controlled inputs: `name` (required), `email` (optional)
  - On submit: validate name is non-empty after trim; if invalid, show inline error "Guest name is required"; if valid, call `addInvitee(name.trim(), email.trim() || undefined)` and reset fields
  - Submit on button click or Enter key in name field
- [ ] 9.2 Write component test:
  - submitting a valid name calls `addInvitee` with trimmed name
  - submitting empty name shows the validation message, does not call `addInvitee`
  - fields clear after successful submit

---

## 10. Component — `InviteeRow`

- [ ] 10.1 Create `src/components/creator/InviteeRow.tsx`:
  ```tsx
  interface InviteeRowProps {
    invitee: InviteeRecord;
  }
  ```
  - Displays: invitee name, `<InvitationStatusBadge status={invitee.status} />`, dependent count `"(N dependents)"`
  - Collapsible dependents section: toggled by a `"▸ Dependents"` / `"▾ Dependents"` button (local `useState`)
  - Within dependents section: list of `<DependentCheckbox>` + an inline add-dependent input
  - Remove invitee button: `aria-label="Remove ${invitee.name}"`, requires `window.confirm` before calling `removeInvitee`
  - Inline add-dependent: text input + confirm button; on confirm calls `addDependent(invitee.id, name.trim())`; guard empty name
- [ ] 10.2 Write component test:
  - renders name and status badge
  - dependents section hidden by default; shown after toggle click
  - confirm dialog called before `removeInvitee`; cancelling does not call `removeInvitee`
  - adding a dependent calls `addDependent` with trimmed name

---

## 11. Component — `GuestRosterPanel`

- [ ] 11.1 Create `src/components/creator/GuestRosterPanel.tsx`:
  - Reads `guestRoster` from `useSigilSelector((s) => s.guestRoster)`
  - Renders heading: `"Guests (N)"` where N is `invitees.length`
  - Renders `<AddInviteeForm />`
  - Renders scrollable list of `<InviteeRow>` components
  - When `invitees` is empty: shows placeholder "No guests yet. Add the first one above."
- [ ] 11.2 Mount `<GuestRosterPanel>` in `src/components/creator/LeftPanel.tsx` as a new "GUESTS" section below the existing sections

---

## 12. Component — `DashboardStats`

- [ ] 12.1 Create `src/components/dashboard/DashboardStats.tsx`:
  ```tsx
  interface DashboardStatsProps {
    invitees: InviteeRecord[];
  }
  ```
  - Compute counts via `useMemo`: total, opened, sent, pending
  - Render: `<div className="dashboard-stats">N Guests · N Opened · N Sent · N Pending</div>`
- [ ] 12.2 Write unit test (pure function approach — extract `computeStats` as a standalone function tested directly):
  - returns correct counts for a mixed-status array
  - returns all zeros for empty array

---

## 13. Component — `DashboardView`

- [ ] 13.1 Create `src/components/dashboard/DashboardView.tsx`:
  - Reads `guestRoster` via `useSigilSelector`
  - Renders `<DashboardStats invitees={invitees} />`
  - Renders a `<p>` limitation note: "Opened status is tracked in this browser only. A backend integration is required for real-time tracking across devices."
  - Renders an accessible `<table>` with `<thead>`, `<th scope="col">`, `<tbody>`
  - Table columns: Name, Dependents, Status, Opened At, Actions
  - Actions cell: "Copy link" button + "Mark sent" button (only shown when `status === 'PENDING'`)
  - Empty state: renders the prompt "No guests added yet. Go to Create to build your guest list." instead of the table
  - "Copy link" button behavior:
    - on click: `navigator.clipboard.writeText(url)` where `url = window.location.origin + '?guest=' + invitee.id`
    - if clipboard API unavailable: `window.prompt('Copy this link:', url)`
    - on success: label changes to "Copied!" for 2 s, then reverts (local `useState` timer)
  - "Mark sent" button: calls `updateInvitee(invitee.id, { status: 'SENT' })`

---

## 14. App Integration — Dashboard Mode & Navigation

- [ ] 14.1 In `src/App.tsx`, add `'DASHBOARD'` branch to the mode-switch render logic:
  ```tsx
  {appMode === 'DASHBOARD' && <DashboardView />}
  ```
- [ ] 14.2 In the top navigation component (wherever mode buttons exist), add a "Dashboard" button that calls `setAppMode('DASHBOARD')`. This button must not be rendered when `appMode === 'RECIPIENT'` (recipient view has no nav chrome).
- [ ] 14.3 Add the URL-param `useEffect` from task 5.1 to `App.tsx`

---

## 15. Styles

- [ ] 15.1 Add roster panel styles to `src/styles/creator.css`:
  - `.lp-roster-section` — section separator, heading style
  - `.lp-invitee-list` — `max-height: 320px; overflow-y: auto;`
  - `.lp-invitee-row` — flex row, hover using `var(--roster-row-hover-bg)`
  - `.lp-invitee-row__name` — truncated with `text-overflow: ellipsis`
  - `.lp-dependents-list` — indented, smaller font
  - `.lp-add-invitee-form` — flex row with input + button
  - `.lp-add-dependent-inline` — small inline input within row
  - `.lp-validation-error` — red-ish text using `var(--status-rsvp-no)`
- [ ] 15.2 Create `src/styles/dashboard.css` and import it in `App.tsx` or `DashboardView.tsx`:
  - `.dashboard-view` — full-width layout, `background: var(--dashboard-bg)`
  - `.dashboard-stats` — horizontal stat row, `font-size: var(--text-sm)`
  - `.dashboard-table` — full-width `<table>`, standard border-collapse
  - `.dashboard-table th` — left-aligned, `font-weight: 600`, border-bottom
  - `.dashboard-table td` — padding using spacing tokens
  - `.dashboard-table tr:hover` — `background: var(--roster-row-hover-bg)`
  - `.status-badge` — small pill, `font-size: var(--text-xs)`, `border-radius: var(--radius-sm)`, `padding: 2px 8px`
  - `.status-badge--pending` — `background: var(--status-pending)`
  - `.status-badge--sent` — `background: var(--status-sent)`
  - `.status-badge--opened` — `background: var(--status-opened)`
  - `.status-badge--rsvp_yes` — `background: var(--status-rsvp-yes)`
  - `.status-badge--rsvp_no` — `background: var(--status-rsvp-no)`
  - `.dashboard-limitation-note` — italic, `color: var(--ui-text-secondary)`, `font-size: var(--text-xs)`
- [ ] 15.3 Confirm no raw hex or pixel values in CSS — all values reference tokens

---

## 16. MANDATORY: Review and Update Existing Unit Tests

- [ ] 16.1 Review `src/utils/waxColorDeriver.test.ts` — confirm no breakage from new types
- [ ] 16.2 Review all existing component tests — confirm `AppMode` extension does not cause type errors
- [ ] 16.3 Verify `sigilReducer` default case and `RESET_TO_DEFAULTS` correctly handles the new `guestRoster` field (reset to `{ invitees: [] }`)

---

## 17. MANDATORY: Run Unit Tests and Verify State

- [ ] 17.1 Run targeted tests for new modules: `npm test -- --reporter=verbose`
- [ ] 17.2 Run full test suite: `npm test`
- [ ] 17.3 Confirm all pre-existing tests still pass (no regressions)
- [ ] 17.4 Run `npm run build` — zero TypeScript and lint errors
- [ ] 17.5 Create report at `openspec/changes/guest-roster-and-dashboard/specs/guest-roster/reports/YYYY-MM-DD-step-17-unit-test-verification.md`:
  - commands executed, pass/fail counts, any notable findings

---

## 18. N/A: Backend Endpoint Testing

> **Not applicable.** This is a frontend-only SPA with no backend API. There are no HTTP endpoints to test with curl. All data persists in `localStorage`. Skip this mandatory step with this documented justification.

---

## 19. MANDATORY: E2E Testing with Playwright (AGENT MUST EXECUTE)

- [ ] 19.1 Start dev server: `npm run dev`
- [ ] 19.2 Guest Roster workflow:
  - [ ] Open app → Guest Roster panel visible in creator left panel
  - [ ] Add invitee "Sophie Martin" → row appears, status badge shows "Pending"
  - [ ] Expand dependents section → empty
  - [ ] Add dependent "Luca Martin" → appears with checkbox checked
  - [ ] Uncheck Luca → checkbox unchecks
  - [ ] Try adding invitee with empty name → validation message shown, no row added
  - [ ] Remove invitee (confirm) → row disappears; (cancel) → row stays
- [ ] 19.3 Dashboard workflow:
  - [ ] Click "Dashboard" nav entry → dashboard view renders, creator canvas gone
  - [ ] Dashboard shows stats: "1 Guest · 0 Opened · 0 Sent · 1 Pending"
  - [ ] Click "Mark sent" for Sophie → status badge changes to "Sent", button disappears
  - [ ] Click "Copy link" → "Copied!" feedback appears (may need to mock clipboard in headless)
  - [ ] Click "Create" → creator canvas restored
- [ ] 19.4 Guest URL workflow:
  - [ ] Navigate to `/?guest=<sophie's-id>` → app enters RECIPIENT mode, invitation personalized with Sophie's name
  - [ ] Return to dashboard → Sophie's status shows "Opened", `openedAt` timestamp displayed
- [ ] 19.5 Reload persistence:
  - [ ] Add an invitee, reload page → invitee still in roster
- [ ] 19.6 Save Playwright screenshots to `openspec/changes/guest-roster-and-dashboard/specs/` for traceability

---

## 20. MANDATORY: Update Technical Documentation

- [ ] 20.1 Update `docs/data-model.md`:
  - Add `Dependent`, `InviteeRecord`, `InvitationStatus`, `GuestRoster` type tables
  - Add `guestRoster` field to `SigilAppState` table
  - Add all 7 new action types to the `SigilAction` table
  - Add note about localStorage persistence key
- [ ] 20.2 Confirm `docs/frontend-standards.md` covers the new component patterns (no update expected)
