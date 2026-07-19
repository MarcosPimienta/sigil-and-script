# Implementation Tasks

## 1. Backend Endpoint & Controllers
- [x] 1.1 Add `submitRsvp` function in `server/src/controllers/inviteController.ts` using Prisma to update guest `status`, `confirmedSeats`, and `formResponses`.
- [x] 1.2 Register `POST /invite/:token/rsvp` route in `server/src/routes/invite.ts`.

## 2. Frontend State & Actions
- [x] 2.1 Add `submitRsvp` action in `src/state/sigilStore.ts` updating `guestRoster`, `localStorage`, and calling backend API if applicable.
- [x] 2.2 Expose `submitRsvp` in `src/context/SigilContext.tsx`.

## 3. Recipient RSVP Component Integration
- [x] 3.1 Update `handleSubmit` in `src/components/creator/RecipientRsvpPanel.tsx` to trigger `submitRsvp` with the form state.

## 4. Dashboard Stats & Visual Status
- [x] 4.1 Update `computeStats` and stats display in `src/components/dashboard/DashboardStats.tsx` to include Attending (`RSVP_YES`) and Declined (`RSVP_NO`).
- [x] 4.2 Update `src/components/dashboard/DashboardStats.test.ts` to cover `attending` and `declined` counts.

## 5. Verification & Testing
- [x] 5.1 Run `npm test` to verify all unit tests pass.
- [x] 5.2 Test guest RSVP submission and verify status changes on Guest Dashboard.
