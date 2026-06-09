---
id: invitation-dashboard
---

# Spec — Invitation Tracking Dashboard

## Requirements

### REQ-8: Dashboard is accessible as a distinct app mode

A "Dashboard" entry in the top navigation switches `appMode` to `'DASHBOARD'`. The creator canvas and inspector are hidden; the dashboard view occupies the main area. Switching back to "Create" restores `appMode` to `'CREATOR'`.

#### Scenario 8.1: Enter Dashboard mode
WHEN the host clicks "Dashboard" in the top navigation
THEN `appMode` becomes `'DASHBOARD'`
AND `<DashboardView>` is rendered
AND the creator canvas is not rendered

#### Scenario 8.2: Return to Creator mode
WHEN the host is in Dashboard mode and clicks "Create"
THEN `appMode` becomes `'CREATOR'`
AND the creator canvas is rendered again

---

### REQ-9: Dashboard shows all invitees with status

`<DashboardView>` renders a table with one row per `InviteeRecord`. Each row displays: primary name, number of dependents, `InvitationStatusBadge`, and `openedAt` timestamp (or "—" if not yet opened).

#### Scenario 9.1: Empty roster
WHEN `guestRoster.invitees` is empty
THEN the dashboard shows a prompt: "No guests added yet. Go to Create to build your guest list."

#### Scenario 9.2: Invitees listed
WHEN the roster has three invitees with mixed statuses
THEN the dashboard table shows three rows with correct name, dependent count, and status badge

#### Scenario 9.3: Opened timestamp displayed
WHEN an invitee has `status: "OPENED"` and `openedAt: "2026-06-08T14:30:00.000Z"`
THEN the row shows the date in a human-readable locale string (e.g., "Jun 8, 2026, 2:30 PM")

---

### REQ-10: Opening a guest link marks that invitation as OPENED

When the app loads with `?guest=<inviteeId>` in the URL and a matching record exists, dispatch `MARK_INVITATION_OPENED` for that invitee. This sets `status: 'OPENED'` and `openedAt` to the current ISO timestamp.

#### Scenario 10.1: Status updated on guest link open
WHEN the app loads at `/?guest=abc-123`
AND the roster contains an invitee with `id: "abc-123"` and `status: "PENDING"`
THEN that invitee's `status` becomes `"OPENED"`
AND `openedAt` is set to the current ISO timestamp

#### Scenario 10.2: Unknown guest ID is silently ignored
WHEN the app loads at `/?guest=unknown-xyz`
AND no invitee with that ID exists in the roster
THEN no state change occurs and the app loads normally in CREATOR mode

#### Scenario 10.3: Already-opened invitation is not re-stamped
WHEN the app loads with a guest ID whose status is already `"OPENED"`
THEN `openedAt` is not overwritten (the original open timestamp is preserved)

---

### REQ-11: Host can manually mark an invitation as SENT

Each invitee row in the dashboard has a "Mark sent" button visible when status is `PENDING`. Clicking it sets `status: 'SENT'`. Once sent or opened, the button is replaced by the status badge only.

#### Scenario 11.1: Mark as sent
WHEN the host clicks "Mark sent" for a PENDING invitee
THEN that invitee's status becomes `'SENT'`
AND the "Mark sent" button is replaced by the SENT badge

#### Scenario 11.2: Mark sent not shown for OPENED
WHEN an invitee has status `'OPENED'`
THEN no "Mark sent" button is rendered for that row

---

### REQ-12: Dashboard displays aggregate stats

A `<DashboardStats>` bar above the table shows: total guests, number with status `OPENED`, number with status `PENDING`, and number with status `SENT`.

#### Scenario 12.1: Stats reflect current roster
WHEN the roster has 5 invitees: 2 PENDING, 2 SENT, 1 OPENED
THEN the stats bar shows "5 Guests · 1 Opened · 2 Sent · 2 Pending"

#### Scenario 12.2: Stats update in real time
WHEN the host marks an invitee as SENT
THEN the stats counts update immediately without a page reload

---

### REQ-13: Host can copy a guest-specific invitation link

Each row in the dashboard has a "Copy link" button. Clicking it writes the guest URL (`window.location.origin + "?guest=" + invitee.id`) to the clipboard and shows a brief "Copied!" confirmation.

#### Scenario 13.1: Link copied to clipboard
WHEN the host clicks "Copy link" for invitee with `id: "abc-123"`
THEN `navigator.clipboard.writeText` is called with the full guest URL
AND the button label changes to "Copied!" for 2 seconds, then reverts

#### Scenario 13.2: Clipboard unavailable
WHEN `navigator.clipboard` is not available (e.g., non-HTTPS context)
THEN a fallback `window.prompt` displays the URL for manual copying
AND no uncaught error is thrown

---

### REQ-14: Status badges are accessible

`InvitationStatusBadge` must convey status through more than color alone. Each badge carries an `aria-label` and a short text label.

#### Scenario 14.1: Badge accessibility
WHEN a screen reader focuses the OPENED status badge for "Sophie Martin"
THEN the accessible name is "Invitation status: Opened"

#### Scenario 14.2: Dashboard table is semantic
WHEN the dashboard table is rendered
THEN it uses `<table>`, `<thead>`, `<th scope="col">` for column headers, and `<tbody>`
