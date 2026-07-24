# Proposal: Per-Guest Language Switch in Guest Roster

Hosts designing digital stationery invitations often host events for bilingual families and friends (e.g., English and Spanish speakers). Currently, invitation language is configured globally on the invitation canvas (`InvitationDesign.language`). As a result, all guests receive their invitation in the same global language when opening their unique link.

This proposal introduces a **per-guest language switch** (`[ ES | EN ]`) inside the Guest Roster. Hosts can set and toggle the specific language preference for each individual guest in the roster. When a guest opens their unique link (`/invite/:id`), the backend dynamically renders the invitation content, page metadata (OG tags), and button labels in that guest's assigned language.

## Proposed Solution

1. **Guest Schema & Types**: Add `language?: 'ES' | 'EN'` to `InviteeRecord` and `GuestPayload` in `src/types/sigil.types.ts`.
2. **Database Persistence**: Add `language String @default("ES")` column to the Prisma `Guest` model in `server/prisma/schema.prisma`.
3. **Guest Roster UI**: Add a compact segmented `[ ES | EN ]` toggle switch on each guest row in `src/components/creator/InviteeRow.tsx`.
4. **State Management**: Update `SigilContext` / `sigilReducer` to support updating `language` via `updateInvitee(id, { language })`.
5. **Backend & Serverless Rendering**: Update `server/src/controllers/inviteController.ts` and `api/invite.js` to evaluate invitation language using `guest.language || canvas.designData.language || 'ES'`.

## Affected Files

| File | Change Type | Purpose |
| --- | --- | --- |
| `src/types/sigil.types.ts` | Modify | Add `language?: 'ES' | 'EN'` to `InviteeRecord` and `GuestPayload`. |
| `server/prisma/schema.prisma` | Modify | Add `language` field with `@default("ES")` to `Guest` model. |
| `src/components/creator/InviteeRow.tsx` | Modify | Render `[ ES | EN ]` language switch toggle per guest. |
| `src/context/SigilContext.tsx` | Modify | Ensure `updateInvitee` handles `language` property updates. |
| `server/src/controllers/inviteController.ts` | Modify | Resolve invitation language from `guest.language` with fallback to canvas design language. |
| `api/invite.js` | Modify | Update Vercel serverless function to read `guest.language` first. |
| `src/components/creator/InviteeRow.test.tsx` | Modify / Add | Add unit tests for per-guest language toggle interaction. |

## Scope Constraints

- **In-Scope**:
  - Per-guest language property (`'ES' | 'EN'`).
  - Interactive language switch in `InviteeRow.tsx`.
  - Database schema migration for `Guest.language`.
  - Server rendering fallback (`guest.language` -> `design.language` -> `'ES'`).
- **Out-of-Scope**:
  - Automated machine translation of freeform text fields.
  - Adding languages beyond English (`EN`) and Spanish (`ES`).
