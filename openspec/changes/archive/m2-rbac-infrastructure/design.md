# Design — Milestone M2: RBAC & Dynamic Route Token Validation

## Architectural Decisions

### Decision 1: Pure Pathname Router Matching
**Choice**: Parse paths matching `/invite/:token` directly in the frontend using standard window location APIs without importing `react-router-dom`.
**Why**:
- Complies with project constraints (no routing libraries, standard SPA setup).
- Enables clean, predictable parsing of dynamic URLs matching `/invite/([a-fA-F0-9-]{36})` (UUID pattern).

---

### Decision 2: Backend Hydration & Telemetry Integration
**Choice**: On mounting `/invite/:token`, dispatch an asynchronous HTTP fetch to `GET /api/invite/:token`. 
**Why**:
- Hydrates invitation structure directly from the database, eliminating discrepancy between host updates and guest renders.
- Automatically triggers backend telemetry to record when the invitation was loaded.
- Stores hydration state (`loading`, `error`, `data`) in the central application state.

---

### Decision 3: Role-Based Header Injection
**Choice**: Build a utility fetch client `apiFetch` in `src/utils/api.ts` that automatically appends necessary role headers.
**Why**:
- Centralizes headers configuration.
- Enforces access limits on host designer modifications and admin dashboard analytics queries.

```typescript
// Example apiFetch helper
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const role = options.method === 'GET' ? 'GUEST' : 'HOST';
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'X-Role': role,
  };
  return fetch(url, { ...options, headers });
}
```

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Latency when resolving guest token | Render a themed loading state during the hydration phase. |
| Server connection failure or offline status | Fall back to `localStorage` caches and show a visual alert: "Running in Offline Mode." |
| Token format validation fails | Immediately redirect malformed tokens to an error page before executing network queries. |
