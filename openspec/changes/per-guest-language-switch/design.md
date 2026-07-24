# Technical Design: Per-Guest Language Switch in Guest Roster

## Architecture & Decisions

### Decision 1: Per-Guest Language Property on Guest Model
- **Choice**: Store `language: 'ES' | 'EN'` directly on the `Guest` database model in `server/prisma/schema.prisma` with `@default("ES")`.
- **Reasoning**: Ensures that individual language assignments persist permanently across sessions, devices, and reloads.

### Decision 2: Fallback Resolution Strategy
- **Choice**: Evaluate language using the order: `guest.language` -> `canvas.designData.language` -> `'ES'`.
- **Reasoning**: Guarantees zero regression for existing invitations or guests created prior to this change. If a guest does not have an explicit `language` specified, it gracefully inherits the host's overall canvas language preference.

### Decision 3: Compact Segmented Switch Component in `InviteeRow`
- **Choice**: Implement a subtle `[ ES | EN ]` toggle in `InviteeRow.tsx` alongside the RSVP status selector and link copy button.
- **Reasoning**: Maintains a clean, aligned table layout without cluttering the guest row.

```tsx
<div className="lp-guest-lang-switch">
  <button
    type="button"
    className={guest.language === 'ES' ? 'active' : ''}
    onClick={() => updateInvitee(invitee.id, { language: 'ES' })}
  >
    ES
  </button>
  <button
    type="button"
    className={guest.language === 'EN' ? 'active' : ''}
    onClick={() => updateInvitee(invitee.id, { language: 'EN' })}
  >
    EN
  </button>
</div>
```

---

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Legacy DB records missing `language` field | Prisma default `@default("ES")` handles missing values in database queries. Fallback logic safely checks `guest.language`. |
| Unsaved language state when guest row changes | Trigger `updateInvitee` immediately on toggle, syncing state to `sigilStore` and dispatching API update if persisted. |
