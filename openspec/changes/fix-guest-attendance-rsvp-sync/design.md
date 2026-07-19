# Technical Design: Fix Guest Attendance & RSVP Persistence Sync

## Architectural Decisions

### Decision 1: Token-based Guest RSVP API (`POST /invite/:token/rsvp`)
- **Choice**: Allow unauthenticated guests who have a valid invitation token (UUID) to submit RSVP responses to `POST /invite/:token/rsvp`.
- **Reasoning**: Recipient guests access their personalized invitation via unique token link (`/invite/:token`) without logging into an account. The token acts as their authorization credential.
- **Payload Schema**:
  ```json
  {
    "status": "RSVP_YES" | "RSVP_NO",
    "mealPref": "Beef" | "Fish" | "Vegetarian" | null,
    "dietary": "Gluten-free" | null,
    "plusOne": "Jane Doe" | null,
    "notes": "Looking forward to it!" | null,
    "dependents": [ { "id": "dep-1", "name": "Child 1", "included": true } ]
  }
  ```
- **Prisma Updates**:
  - `status`: `'RSVP_YES'` if attending, `'RSVP_NO'` if declined.
  - `confirmedSeats`: 1 (guest) + count of included dependents/plusOnes (if `RSVP_YES`), else 0.
  - `formResponses`: JSON string containing meal, dietary, plusOne, notes, and dependents preferences.

### Decision 2: Dual Persistence Strategy (Database + Local Storage Fallback)
- **Choice**: The store action `submitRsvp` will update the Zustand store `guestRoster.invitees` and persist to browser `localStorage` (`sigil-guest-roster`), while asynchronously posting to `/invite/:token/rsvp` when connected to the backend.
- **Reasoning**: Guarantees that even in standalone/offline frontend mode or preview mode (`routingToken === 'preview'`), the RSVP state updates immediately in the UI and Dashboard.

### Decision 3: Extended Dashboard Summary Statistics
- **Choice**: Update `computeStats(invitees)` in `DashboardStats.tsx` to return:
  ```typescript
  {
    total: number;
    opened: number;
    sent: number;
    pending: number;
    attending: number;
    declined: number;
  }
  ```
  And render:
  `X Guests · A Attending · D Declined · O Opened · S Sent · P Pending`
- **Reasoning**: Gives event hosts clear, immediate visibility into headcount and RSVPs directly on the Guest Dashboard.

## Risks & Mitigations
- **Token Spoofing**: Validate that the token format is a valid UUID with Zod schema.
- **Form Data Parsing Errors**: Gracefully handle missing or malformed fields in `formResponses` JSON string.
- **Offline / Local Demo Mode**: Handle `routingToken === 'preview'` gracefully without failing when backend API is unreachable.
