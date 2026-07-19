# Proposal: Fix Guest Attendance & RSVP Persistence Sync

## Problem
When a guest completes and submits the RSVP form on their invitation page (`/invite/:token`), their attendance choice (`RSVP_YES` / `RSVP_NO`) and custom form responses (meal selection, dietary restrictions, plus-ones, notes, family dependents) are not persisted. 
- The guest form submission handler (`RecipientRsvpPanel.tsx`) only updates local UI state (`setSubmitted(true)`), without dispatching an action or calling an API endpoint.
- The server (`server/src/controllers/inviteController.ts`) lacks an RSVP submission endpoint for unauthenticated guests holding an invitation token.
- As a result, the guest's status remains `OPENED` (or `PENDING`) on the host's Guest Dashboard (`DashboardView.tsx`), and the stats component (`DashboardStats.tsx`) does not compute or display attending versus declined guest totals.

## Proposed Solution
Implement Option 1 (Full-Stack Real-Time RSVP Persistence):
1. **Backend Route & Controller**: Add `POST /invite/:token/rsvp` endpoint to `inviteController.ts` & `invite.ts`. Update `prisma.guest` status to `RSVP_YES` or `RSVP_NO`, calculate `confirmedSeats`, and store responses in `formResponses`.
2. **State & Store Integration**: Add `submitRsvp` action to `sigilStore.ts` and `SigilContext.tsx`. Update both the local `guestRoster` in Zustand / `localStorage` and send the API request to the backend.
3. **Recipient Form Wiring**: Wire `handleSubmit` in `RecipientRsvpPanel.tsx` to dispatch `submitRsvp`.
4. **Dashboard Stats**: Update `computeStats` and `DashboardStats.tsx` to include `Attending` (`RSVP_YES`) and `Declined` (`RSVP_NO`) breakdown in the host summary bar.
5. **Testing**: Add unit tests for `submitRsvp` store action, backend endpoint, and `DashboardStats`.

## Files to Create & Modify
| File Path | Description |
| --- | --- |
| `server/src/controllers/inviteController.ts` | Add `submitRsvp` controller function to validate token and update Prisma Guest record with RSVP status and responses. |
| `server/src/routes/invite.ts` | Register `POST /invite/:token/rsvp` route. |
| `src/state/sigilStore.ts` | Add `submitRsvp` store action that updates local state / `localStorage` and calls `POST /invite/:token/rsvp`. |
| `src/context/SigilContext.tsx` | Expose `submitRsvp` through `useSigil()` hook. |
| `src/components/creator/RecipientRsvpPanel.tsx` | Update `handleSubmit` to call `submitRsvp` before setting `submitted = true`. |
| `src/components/dashboard/DashboardStats.tsx` | Update `computeStats` and render `Attending` and `Declined` guest counts. |
| `src/components/dashboard/DashboardStats.test.ts` | Update unit tests to verify `attending` and `declined` stat calculation. |

## Scope Constraints
### In-Scope
- Server endpoint `POST /invite/:token/rsvp` for guest RSVP persistence.
- Store action `submitRsvp` with database and `localStorage` sync.
- RSVP form wiring in `RecipientRsvpPanel.tsx`.
- Dashboard stats computation for `RSVP_YES` (Attending) and `RSVP_NO` (Declined).
- Unit tests for stats and reducer/store logic.

### Out-of-Scope
- WebSocket or Server-Sent Events push notifications for real-time live host updates.
- Automated email sending upon guest RSVP submission.
