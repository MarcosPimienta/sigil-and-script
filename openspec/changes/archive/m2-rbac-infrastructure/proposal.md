# Proposal — Milestone M2: RBAC & Dynamic Route Token Validation

## Problem
Currently, the invitation stage resolves guest information locally from the client-side memory using query parameters (`?guest=<id>`). This approach:
- Bypasses backend database verification.
- Does not trigger backend telemetry (e.g. tracking when a guest opens the envelope).
- Bypasses security boundaries because host/dashboard interfaces do not pass access control role headers (`X-Role`).

## Proposed Solution
Bridge the frontend client with the Express backend infrastructure built in Phase 1:
1. **Dynamic Route Parsing**: Parse URLs matching `/invite/:token` natively on component mount.
2. **Backend Hydration**: Fetch guest allocation and canvas setup from `GET /api/invite/:token` instead of client-side `localStorage`.
3. **Telemetry Ingestion**: Allow the fetching action to automatically trigger the backend database write updating guest status to `OPENED`.
4. **Header Guards**: Append `X-Role: HOST` or `X-Role: ADMIN` headers on all state synchronization updates sent from the editor and host dashboard.

---

## Files to Modify

| File | Change |
|---|---|
| `src/App.tsx` | Parse pathname matches for `/invite/:token` on mount; dispatch async backend actions to retrieve and set invitation state. |
| `src/context/SigilContext.tsx` | Extend action dispatchers to support fetching invitation data from the server and managing connection states (loading, error). |
| `src/components/dashboard/DashboardView.tsx` | Send authorized headers (`X-Role: HOST`) for host data modifications. |
| `src/components/creator/LeftPanel.tsx` | Secure host-specific configuration updates with proper headers. |

---

## Scope Constraints

- **In-Scope**:
  - Client-side routing resolution for `/invite/:token`.
  - Backend integration for guest hydration and envelope telemetry.
  - Adding header guards on all HOST and ADMIN data operations.
  - Integration tests for token resolution and telemetry updates.

- **Out-of-Scope**:
  - Migrating frontend state to Zustand (reserved for Phase 3).
  - Transitioning styling to Tailwind CSS (reserved for Phase 3).
  - Building Framer Motion envelopes (reserved for Phase 4).
