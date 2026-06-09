---
id: guest-roster
---

# Spec — Guest Roster

## Requirements

### REQ-1: Host can add an invitee by name

The event host can type a primary contact name into an add-invitee form and submit it. The invitee is appended to the roster with a generated UUID, status `PENDING`, and an empty dependents list. An optional email field is provided but not required.

#### Scenario 1.1: Add invitee with name only
WHEN the host types "Sophie Martin" in the name field and clicks "Add Guest"
THEN a new `InviteeRecord` with `name: "Sophie Martin"`, `status: "PENDING"`, and `dependents: []` is appended to `guestRoster.invitees`
AND the name field is cleared

#### Scenario 1.2: Add invitee with name and email
WHEN the host types "Sophie Martin" and "sophie@example.com" and clicks "Add Guest"
THEN the new record has `email: "sophie@example.com"` stored

#### Scenario 1.3: Reject empty name
WHEN the host submits the form with an empty name field
THEN no record is added
AND an inline validation message "Guest name is required" is shown

#### Scenario 1.4: Trim whitespace from name
WHEN the host types "  Sophie Martin  " and submits
THEN the stored name is `"Sophie Martin"` (leading/trailing whitespace removed)

---

### REQ-2: Host can remove an invitee

The host can delete an invitee from the roster. Because removal is irreversible within the session, the host must confirm before the record is removed.

#### Scenario 2.1: Remove after confirmation
WHEN the host clicks the remove button for "Sophie Martin"
AND confirms the confirmation prompt
THEN the invitee is removed from `guestRoster.invitees`

#### Scenario 2.2: Cancel removal
WHEN the host clicks the remove button for "Sophie Martin"
AND dismisses the confirmation prompt
THEN the invitee remains in `guestRoster.invitees` unchanged

---

### REQ-3: Host can add dependents to an invitee

An invitee can have 0..n dependents. The host adds them via an inline text input that appears when they click "+ Add dependent". Each new dependent defaults to `included: true`.

#### Scenario 3.1: Add first dependent
WHEN the host clicks "+ Add dependent" under "Sophie Martin"
AND types "Luca Martin" and presses Enter or clicks the confirm button
THEN a `Dependent` with `name: "Luca Martin"`, `included: true`, and a generated UUID is added to Sophie's `dependents` array

#### Scenario 3.2: Add multiple dependents
WHEN the host adds "Luca Martin" then "Ella Martin" to Sophie's dependents
THEN both appear in order in Sophie's `dependents` array

#### Scenario 3.3: Reject empty dependent name
WHEN the host opens the dependent input for Sophie and submits an empty name
THEN no dependent is added

---

### REQ-4: Host can toggle a dependent's inclusion

Each dependent has a checkbox labeled with the dependent's name. Unchecking excludes that person from the invitation (e.g., children excluded from a formal dinner). Checking re-includes them. This controls the `included: boolean` flag on the `Dependent`.

#### Scenario 4.1: Exclude a dependent
WHEN the host unchecks "Luca Martin" under Sophie
THEN `dependent.included` becomes `false`
AND the checkbox renders as unchecked

#### Scenario 4.2: Re-include a dependent
WHEN the host checks a previously unchecked dependent "Luca Martin"
THEN `dependent.included` becomes `true`

#### Scenario 4.3: Included state is accessible
WHEN a screen reader focuses the dependent checkbox for "Luca Martin"
THEN the accessible label reads "Include Luca Martin, dependent of Sophie Martin"

---

### REQ-5: Host can remove a dependent

The host can remove a dependent from an invitee with an inline remove button next to each dependent. No confirmation is required for dependent removal.

#### Scenario 5.1: Remove a dependent
WHEN the host clicks the remove button next to "Luca Martin"
THEN `Luca Martin` is removed from Sophie's `dependents` array

---

### REQ-6: Roster persists across page reloads

The full `guestRoster` is written to `localStorage` (key: `sigil-guest-roster`) on every state change. On app init, the roster is hydrated from `localStorage` if a valid entry exists.

#### Scenario 6.1: Roster survives reload
WHEN the host adds "Sophie Martin" and reloads the page
THEN "Sophie Martin" still appears in the roster

#### Scenario 6.2: Corrupt localStorage is ignored
WHEN `localStorage["sigil-guest-roster"]` contains malformed JSON
THEN the app initializes with an empty roster and does not throw

---

### REQ-7: Invitee IDs serve as routing tokens

Each invitee's `id` (UUID) is used to construct a guest-specific URL: `?guest=<id>`. This URL, when opened by a recipient, identifies which `InviteeRecord` to load as the active guest payload.

#### Scenario 7.1: Guest URL construction
WHEN the host views an invitee in the dashboard
THEN a "Copy link" button constructs `window.location.origin + "?guest=" + invitee.id` and copies it to the clipboard

#### Scenario 7.2: Guest payload hydration from URL
WHEN the app loads with `?guest=<inviteeId>` in the URL
AND a matching `InviteeRecord` exists in the roster
THEN the active `GuestPayload` is set from that record's name and dependents
AND the app enters RECIPIENT mode
