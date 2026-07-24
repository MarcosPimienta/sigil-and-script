# Design: Add Family and Individual Guest Types

## Architectural Decisions

1. **Guest Category Enum (`INDIVIDUAL` | `FAMILY`)**:
   - `INDIVIDUAL`: Default for single invitees. Can still have optional plus-ones/dependents attached.
   - `FAMILY`: Represents a household invitation (e.g., *"Familia Gómez Pérez"* or *"Gómez Family"*). The family members are attached as dependent records.

2. **Database Persistence**:
   - Add `guestType String @default("INDIVIDUAL")` to Prisma `Guest` model.
   - Database upserts in `inviteController.ts` store `guestType` in `update` and `create` blocks to ensure guest category persists across design saves.

3. **Title Formatting Hierarchy (`formatGuestTitleName`)**:
   - For `FAMILY` guest type: If the primary name already begins with *"Familia"* or *"The ... Family"*, render as-is; otherwise append `" & Familia"` (ES) or `" & Family"` (EN).
   - For `INDIVIDUAL` guest type: Render primary guest name, and append `& [Dependent]` if 1 dependent is attached, or `& Familia` if 2+ dependents are attached.

4. **Creation UI (`AddInviteeForm.tsx`)**:
   - Segmented toggle control: `[ 👤 Individual | 👨‍👩‍👧‍👦 Family ]`.
   - Switching to `FAMILY` displays a dynamic input list allowing the host to enter family member names (which get saved as initial dependents upon submission).

## Risks & Mitigations

- **Existing Guest Schema Backward Compatibility**: Existing guest records in Postgres will have `guestType` default to `"INDIVIDUAL"`, ensuring zero data breakage for existing invitations.
- **CSV Ingestion**: Bulk CSV imports will default missing category columns to `'INDIVIDUAL'`, or parse optional `Category`/`Type` header columns if present.
