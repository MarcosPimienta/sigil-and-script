---
id: backend-specs
---

# Spec — Phase 1 Backend API

## Requirements

### REQ-1: Route Token Hydration Endpoint
Guests can fetch the invitation canvas configuration and their custom guest allocations via a passwordless token-hydrated URL parameter mapped to `GET /api/invite/:token`.

#### Scenario 1.1: Resolve valid invitation token
WHEN a client queries `GET /api/invite/c0a6bda4-1c50-482a-bc9b-3a3f0190cfdb`
THEN the response returns a status code of `200`
AND the body contains the corresponding `GuestRecord` and matching `InvitationCanvasState` details

#### Scenario 1.2: Unknown invitation token
WHEN a client queries `GET /api/invite/00000000-0000-0000-0000-000000000000`
THEN the response returns a status code of `404`
AND the body contains an error message `"Invitation not found"`

#### Scenario 1.3: Malformed token format
WHEN a client queries `GET /api/invite/invalid-token-format`
THEN the response returns a status code of `400`
AND the body contains validation errors from the query schema parser

---

### REQ-2: Guest Status Telemetry Tracker
Querying the token hydration endpoint automatically records when a guest opens their invitation.

#### Scenario 2.1: Transition PENDING to OPENED
WHEN a client queries `GET /api/invite/:token` for a guest whose status is `"PENDING"`
THEN the database updates that guest's status to `"OPENED"`
AND the database records the current timestamp to the guest's `openedTimestamp` field
AND the API returns the updated guest record showing `"status": "OPENED"` and a non-null `openedTimestamp`

#### Scenario 2.2: Retain existing OPENED timestamp
WHEN a client queries `GET /api/invite/:token` for a guest whose status is already `"OPENED"`
THEN the database does not overwrite the existing `openedTimestamp` field
AND the API returns the guest record with the original `openedTimestamp` preserved

---

### REQ-3: Role-Based Access Control Guards
Sensitive endpoints targeting host configuration or admin metrics are secured using headers check.

#### Scenario 3.1: Authorized HOST request
WHEN a client queries a HOST-secured route (e.g. `POST /api/canvas`) with request header `X-Role: HOST`
THEN the response proceeds to execute the handler logic

#### Scenario 3.2: Unauthorized HOST request
WHEN a client queries a HOST-secured route without the header `X-Role: HOST`
THEN the response yields a status code of `403`
AND the request is terminated without querying the database
