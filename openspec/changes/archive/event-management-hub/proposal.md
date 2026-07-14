# Proposal — Event Management Hub

## Problem
Currently, after a user logs in, they are immediately placed inside the invitation creator canvas with a default configuration. 
- There is no central landing dashboard or "My Events" portal to view all saved events.
- Creating a new event or switching between saved invitations requires opening modal dropdowns in the toolbar.
- We need an elegant, unified **Events Hub** portal where hosts can view, edit, create, and delete their invitations in one clear space.

## Proposed Solution

1. **Frontend App Mode Extension**:
   - Extend `AppMode` in [sigil.types.ts](file:///home/fenix3819/sigil-and-script/src/types/sigil.types.ts#L8) to include `'EVENTS_HUB'`.
   - Configure the application to default to `'EVENTS_HUB'` mode when a host is logged in.

2. **Develop Events Hub Component (`EventsHubView.tsx`)**:
   - Create a dashboard portal listing all invitations owned by the user.
   - Style each event invitation as a premium, glassmorphic card presenting:
     * Event Title (e.g. "Oscar & Rocio Wedding")
     * Countdown Target Date
     * Action items: **Edit Design** (loads layout and switches to Studio), **Manage Guests** (loads layout and switches to Guest Dashboard), and **Delete** (deletes the layout).
   - Display a prominent **Create New Event** card/button that triggers a default template initialization and redirects to the Studio.

3. **Update Navigation Toolbar**:
   - Modify the header toolbar to display a "← My Events" back navigation button when the user is inside the Creator Studio (`CREATOR` mode) or the guest manager (`DASHBOARD` mode).

---

## Files to Modify

| File | Change |
|---|---|
| `src/types/sigil.types.ts` | Add `'EVENTS_HUB'` to the `AppMode` type union. |
| `src/state/sigilStore.ts` | Update defaults: start in `'EVENTS_HUB'` mode if `user` is logged in, and handle canvas loading state resets. |
| `src/App.tsx` | Route to `<EventsHubView />` if `appMode === 'EVENTS_HUB'`. |
| `src/components/creator/Toolbar.tsx` | Add "← My Events" back button and adapt visibility guards. |

## New Files

| File | Description |
|---|---|
| `src/components/events/EventsHubView.tsx` | Landing hub component listing events, loading invitation details, and launching creations. |
| `src/styles/eventsHub.css` | Premium glassmorphism layout and hover transition styles for the Events Hub cards. |

---

## Scope Constraints

- **In-Scope**:
  - Landing Events Hub view.
  - CRUD visual controls for invitations.
  - "← My Events" navigation header.
- **Out-of-Scope**:
  - User profile editing forms.
  - Event templates category selector page.
