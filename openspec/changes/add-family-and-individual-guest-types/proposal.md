# Proposal: Add Family and Individual Guest Types

## Problem
Currently, all guest entries in the roster are created uniformly without explicit categorization between individual guests and family groups. While dependents can be attached to guests, there is no explicit `guestType` classification (`INDIVIDUAL` vs `FAMILY`) or tailored creation flow to distinguish household entries from single invitees.

## Proposed Solution
Introduce explicit `guestType` support (`INDIVIDUAL` | `FAMILY`) across the frontend state, database schema, creation forms, guest list rows, and invitation title resolution logic:
1. Extend `InviteeRecord` and Prisma `Guest` model to support `guestType: 'INDIVIDUAL' | 'FAMILY'`.
2. Add a `[ 👤 Individual | 👨‍👩‍👧‍👦 Family ]` segmented category toggle to `AddInviteeForm`.
3. Allow family entries to specify household titles (e.g., *"Familia Gómez Pérez"*) and add initial family member dependents directly within the creation form.
4. Display category badges (`👤 Individual` vs `👨‍👩‍👧‍👦 Family`) in `InviteeRow` and `DashboardView` with expandable dependent controls for both types.
5. Update title formatting (`formatGuestTitleName`) to resolve family titles appropriately.

## Files to Create & Modify

| File Path | Purpose |
| --- | --- |
| `src/types/sigil.types.ts` | Add `guestType?: 'INDIVIDUAL' \| 'FAMILY'` to `InviteeRecord` & `GuestPayload` |
| `server/prisma/schema.prisma` | Add `guestType String @default("INDIVIDUAL")` column to `Guest` model |
| `src/state/sigilStore.ts` | Update `addInvitee`, `refreshRoster`, `loadDesign`, and `fetchInvitationDetails` to persist `guestType` |
| `src/utils/formatGuestTitle.ts` | Format titles according to `guestType` (`INDIVIDUAL` vs `FAMILY`) |
| `src/components/creator/AddInviteeForm.tsx` | Add category toggle (`INDIVIDUAL` / `FAMILY`) and family member inputs |
| `src/components/creator/InviteeRow.tsx` | Render guest category badge and guest type toggle/badge |
| `src/components/dashboard/DashboardView.tsx` | Include guest category in roster table columns & sorting |
| `server/src/controllers/inviteController.ts` | Persist `guestType` during backend canvas/guest upsert |

## Scope Constraints
- **In-Scope**: Category support (`INDIVIDUAL` vs `FAMILY`), form toggle, dependent management, title formatting, DB migration, test updates.
- **Out-of-Scope**: Altering existing RSVP responses or external ticketing systems.
