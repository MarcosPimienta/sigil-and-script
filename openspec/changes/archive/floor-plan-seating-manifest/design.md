# Technical Design: Floor Plan Seating Manifest

**Change ID:** `floor-plan-seating-manifest`
**Created:** 2026-09-07

## Architectural Decisions

### 1. Pure Data Projection vs Storing Manifest State
- **Decision**: Derive the seating manifest on the fly from `floorPlan.tables` and `guestRoster.invitees` rather than caching or storing duplicate manifest state in the Zustand store.
- **Rationale**:
  - `design.floorPlan.tables` is the single source of truth for seat assignments, and `guestRoster.invitees` is the single source of truth for confirmed guest status.
  - Deriving the manifest reactively via `useMemo` guarantees zero cache invalidation bugs when guests are seated, unseated, or added.
  - Data sizes in banquet settings (typically 50 to 500 guests across 5 to 50 tables) execute linear projection in less than 1 millisecond.

### 2. Manifest Schema & Interfaces
```typescript
export interface ManifestSeat {
  seatNumber: number;
  isOccupied: boolean;
  guestId?: string;
  guestName?: string;
  isDependent?: boolean;
  primaryInviteeName?: string;
}

export interface TableManifestItem {
  tableId: string;
  tableName: string;
  shape: TableShape;
  totalSeats: number;
  occupiedCount: number;
  emptyCount: number;
  seats: ManifestSeat[];
}

export interface GuestDirectoryItem {
  guestId: string;
  guestName: string;
  isDependent: boolean;
  primaryInviteeName: string;
  isSeated: boolean;
  tableId?: string;
  tableName?: string;
  seatNumber?: number;
}
```

### 3. CSV Generation & RFC 4180 Compliance
- **Columns**: `Table Name`, `Seat Number`, `Guest Name`, `Guest Type`, `Primary Contact`, `Status`.
- **Escaping**: Values containing commas, quotes, or line breaks are wrapped in double quotes, and inner quotes are doubled (`""`).
- **Download mechanism**: Uses browser `Blob` with MIME type `text/csv;charset=utf-8;` and simulated anchor download.

### 4. Dual-View Mode with Real-Time Filtering
- **By Table (Banquet View)**:
  - Visual cards for each table showing:
    - Table Title & shape icon (e.g. `Table 1 (Round)`).
    - Capacity pill (`8 / 10 seats filled`).
    - Grid or list of seats with seat number circles, guest name, and relationship tags (`+1 / Dependent of X`).
    - Highlighted empty seats (`Empty`).
- **By Guest (Concierge / Usher View)**:
  - Table grid arranged alphabetically by guest last/first name.
  - Quick glance at `Table Name` and `Seat #`.
  - Prominent badge for `Unassigned` guests to immediately identify anyone needing placement.
- **Filter**:
  - Live search input matching guest names, table names, or primary contact names.

### 5. Print Styling Architecture (`@media print`)
- When printing via `window.print()`:
  - Hide canvas, navigation headers, search inputs, modal close/export buttons.
  - Show the manifest content directly with dark typography on pure white background.
  - Table cards use CSS `break-inside: avoid;` to prevent breaking a table mid-page.
  - Compact typography for high data density on standard US Letter / A4 paper.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Large guest rosters causing slow searches | Derive memoized collections; search filtering uses fast lowercase substring matching. |
| Incomplete table data (e.g., table with 0 seats or null fields) | Defensive guards in helper functions (`table.seats || []`, optional chaining). |
| Browser clipboard permissions restricted | Try `navigator.clipboard.writeText`; if rejected, fall back to hidden textarea copy command or notify user gracefully. |
| Print styles leaking into normal UI | Strictly encapsulate print rules within `@media print` targeting `.seating-manifest-modal`. |
