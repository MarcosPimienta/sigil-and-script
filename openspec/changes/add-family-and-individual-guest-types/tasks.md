# Tasks: Add Family and Individual Guest Types

- [x] 1. **Schema & Types**
  - [x] 1.1 Update `src/types/sigil.types.ts` to add `guestType?: 'INDIVIDUAL' | 'FAMILY'` to `InviteeRecord` and `GuestPayload`.
  - [x] 1.2 Update `server/prisma/schema.prisma` to add `guestType String @default("INDIVIDUAL")` to `Guest` model and run `prisma db push` + `prisma generate`.

- [x] 2. **State & Controllers**
  - [x] 2.1 Update `src/state/sigilStore.ts` `addInvitee` action signature to accept `guestType?: 'INDIVIDUAL' | 'FAMILY'` and initial dependents list.
  - [x] 2.2 Update `refreshRoster`, `loadDesign`, and `fetchInvitationDetails` in `sigilStore.ts` to map `guestType`.
  - [x] 2.3 Update `saveCanvas` in `server/src/controllers/inviteController.ts` to persist `guestType` in `upsert`.

- [x] 3. **Title Formatting & Utilities**
  - [x] 3.1 Update `formatGuestTitleName` in `src/utils/formatGuestTitle.ts` to handle `guestType: 'FAMILY'`.

- [x] 4. **UI Components**
  - [x] 4.1 Update `src/components/creator/AddInviteeForm.tsx` with category toggle (`INDIVIDUAL` vs `FAMILY`) and family member inputs.
  - [x] 4.2 Update `src/components/creator/InviteeRow.tsx` to render category badge (`👤 Individual` vs `👨‍👩‍👧‍👦 Family`).
  - [x] 4.3 Update `src/components/dashboard/DashboardView.tsx` table columns to display and sort by Type/Category.

- [x] 5. **Testing & Verification**
  - [x] 5.1 Update unit tests in `src/utils/formatGuestTitle.test.ts`, `InviteeRow.test.tsx`, and `DashboardView.test.tsx`.
  - [x] 5.2 Execute test suite and verify build cleanly compiles.
