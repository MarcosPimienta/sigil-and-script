# Design — Phase 1 Backend Infrastructure

## Architectural Decisions

### Decision 1: Node.js, Express, and Prisma ORM
**Choice**: Standardize the backend stack on Node.js/Express for API routing and Prisma with SQLite/PostgreSQL for database persistence.
**Why**:
- Node/Express runs easily alongside Vite in local development environments.
- Prisma provides full TypeScript autocomplete, static type validation, and automatic schema migration capability.
- SQLite is ideal for localized dev/test cycles with zero-configuration setup, while easily upgrading to PostgreSQL for multi-tenant deployment.

---

### Decision 2: API Route `/api/invite/:token` for Guest Validation and Telemetry
**Choice**: Implement a single endpoint `GET /api/invite/:token` that combines verification and telemetry updates.
**Why**: 
Combining verification and write operations avoids race conditions and reduces API latency for guests. When this endpoint is queried:
1. The token is verified against the database.
2. If found, the guest record status is updated to `OPENED` and the current timestamp is recorded to `openedTimestamp` (if not already set).
3. The response returns both the personalized `GuestRecord` and the matching `InvitationCanvasState`.

---

### Decision 3: Role-Based Access Control (RBAC) Middleware
**Choice**: Establish authorization middleware verifying request headers (`X-Role: HOST` or `X-Role: ADMIN`).
**Why**: 
Provides simplified, robust role validation boundaries for Phase 1. This can later be easily extended to a JWT-based authentication system in future milestones without rewriting the route handlers.

---

## Data Schema Models (Prisma)

### `InvitationCanvas`
Matches `InvitationCanvasState`. Defines the global layout and styles.
```prisma
model InvitationCanvas {
  id              String   @id @default(uuid())
  envelopeColor   String
  waxSealAsset    String
  musicUrl        String?
  countdownTarget String
  colorPalette    String   // Stored as JSON string
  itinerary       String   // Stored as JSON string of itinerary events
  hostId          String
  invitees        Guest[]
}
```

### `Guest`
Matches `GuestRecord`. Represents individual invitees.
```prisma
model Guest {
  id               String            @id @default(uuid())
  name             String
  allottedSeats    Int               @default(1)
  confirmedSeats   Int               @default(0)
  status           String            @default("PENDING") // PENDING | OPENED | CONFIRMED | DECLINED
  openedTimestamp  DateTime?
  formResponses    String            @default("{}") // JSON string of custom RSVP responses
  canvasId         String
  canvas           InvitationCanvas  @relation(fields: [canvasId], references: [id])
}
```

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Concurrent database updates on guest visit overwriting status | Use atomic Prisma updates matching only `status: "PENDING"` before writing `openedTimestamp`. |
| DB testing issues in CI environments | Set up a dynamic SQLite database file path using env variables (`DATABASE_URL="file:./test.db"`) during unit test execution, and run automated cleanups before/after tests. |
| Malformed payload parsing in controller endpoints | Enforce strict schema validation on body/params using Zod middleware prior to database queries. |
