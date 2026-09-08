import type {
  InviteeRecord,
  FloorPlanConfig,
  FloorPlanSeat,
  FloorPlanTable,
  TableShape,
} from '../types/sigil.types';

// ── Confirmed Attendee Type ──────────────────────────────────────────────────

export interface ConfirmedAttendee {
  id: string; // InviteeRecord.id or Dependent.id
  name: string;
  isDependent: boolean;
  primaryInviteeId: string;
  primaryInviteeName: string;
}

/**
 * Extracts all confirmed attendees from the invitee roster.
 * Includes primary guests with status === 'RSVP_YES' and their
 * attending dependents (included: true).
 */
export function getConfirmedAttendees(invitees: InviteeRecord[] = []): ConfirmedAttendee[] {
  const result: ConfirmedAttendee[] = [];

  for (const inv of invitees) {
    if (inv.status === 'RSVP_YES') {
      // Primary guest
      result.push({
        id: inv.id,
        name: inv.name,
        isDependent: false,
        primaryInviteeId: inv.id,
        primaryInviteeName: inv.name,
      });

      // Included dependents
      if (Array.isArray(inv.dependents)) {
        for (const dep of inv.dependents) {
          const isIncluded = dep.included === true || (dep as any).included === 'true';
          if (isIncluded) {
            result.push({
              id: dep.id,
              name: dep.name,
              isDependent: true,
              primaryInviteeId: inv.id,
              primaryInviteeName: inv.name,
            });
          }
        }
      }
    }
  }

  // Sort alphabetically by name
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

// ── Geometry & Layout ────────────────────────────────────────────────────────

export interface SeatCoordinate {
  seatNumber: number;
  x: number; // px from table container top-left
  y: number; // px from table container top-left
}

export interface TableLayout {
  containerWidth: number;
  containerHeight: number;
  tableX: number; // offset of table body within container
  tableY: number;
  tableWidth: number;
  tableHeight: number;
  seats: SeatCoordinate[];
}

const SEAT_MARGIN = 26; // Distance from table edge to seat center

/**
 * Calculates table bounding box and seat coordinates for a round table.
 */
export function calculateRoundTableLayout(seatsCount: number): TableLayout {
  const count = Math.max(2, Math.min(24, seatsCount));
  const tableRadius = Math.max(45, 25 + count * 6.5);
  const tableDiameter = tableRadius * 2;
  const seatRadius = tableRadius + SEAT_MARGIN;
  const containerSize = (seatRadius + 22) * 2;
  const center = containerSize / 2;

  const seats: SeatCoordinate[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    seats.push({
      seatNumber: i + 1,
      x: Math.round(center + seatRadius * Math.cos(angle)),
      y: Math.round(center + seatRadius * Math.sin(angle)),
    });
  }

  return {
    containerWidth: containerSize,
    containerHeight: containerSize,
    tableX: center - tableRadius,
    tableY: center - tableRadius,
    tableWidth: tableDiameter,
    tableHeight: tableDiameter,
    seats,
  };
}

/**
 * Calculates table bounding box and seat coordinates for a square table.
 */
export function calculateSquareTableLayout(seatsCount: number): TableLayout {
  const count = Math.max(2, Math.min(24, seatsCount));
  const perSide = Math.ceil(count / 4);
  const tableSize = Math.max(90, 40 + perSide * 40);
  const containerSize = tableSize + (SEAT_MARGIN + 22) * 2;
  const offset = (containerSize - tableSize) / 2;

  // Distribute seats across 4 edges: Top (0), Right (1), Bottom (2), Left (3)
  const edgeCounts = [0, 0, 0, 0];
  for (let i = 0; i < count; i++) {
    edgeCounts[i % 4]++;
  }

  const seats: SeatCoordinate[] = [];
  let seatNum = 1;

  // 0: Top edge (left to right)
  const topCount = edgeCounts[0];
  for (let i = 0; i < topCount; i++) {
    const step = tableSize / (topCount + 1);
    seats.push({
      seatNumber: seatNum++,
      x: Math.round(offset + step * (i + 1)),
      y: Math.round(offset - SEAT_MARGIN),
    });
  }

  // 1: Right edge (top to bottom)
  const rightCount = edgeCounts[1];
  for (let i = 0; i < rightCount; i++) {
    const step = tableSize / (rightCount + 1);
    seats.push({
      seatNumber: seatNum++,
      x: Math.round(offset + tableSize + SEAT_MARGIN),
      y: Math.round(offset + step * (i + 1)),
    });
  }

  // 2: Bottom edge (right to left)
  const bottomCount = edgeCounts[2];
  for (let i = 0; i < bottomCount; i++) {
    const step = tableSize / (bottomCount + 1);
    seats.push({
      seatNumber: seatNum++,
      x: Math.round(offset + tableSize - step * (i + 1)),
      y: Math.round(offset + tableSize + SEAT_MARGIN),
    });
  }

  // 3: Left edge (bottom to top)
  const leftCount = edgeCounts[3];
  for (let i = 0; i < leftCount; i++) {
    const step = tableSize / (leftCount + 1);
    seats.push({
      seatNumber: seatNum++,
      x: Math.round(offset - SEAT_MARGIN),
      y: Math.round(offset + tableSize - step * (i + 1)),
    });
  }

  return {
    containerWidth: containerSize,
    containerHeight: containerSize,
    tableX: offset,
    tableY: offset,
    tableWidth: tableSize,
    tableHeight: tableSize,
    seats,
  };
}

/**
 * Calculates table bounding box and seat coordinates for a rectangular table.
 */
export function calculateRectangularTableLayout(seatsCount: number): TableLayout {
  const count = Math.max(2, Math.min(24, seatsCount));

  // Determine seats on long sides vs ends
  const hasEnds = count >= 6;
  const endSeats = hasEnds ? 2 : 0;
  const sideSeatsTotal = count - endSeats;
  const topCount = Math.ceil(sideSeatsTotal / 2);
  const bottomCount = Math.floor(sideSeatsTotal / 2);

  const tableWidth = Math.max(140, 50 + topCount * 45);
  const tableHeight = 85;

  const padX = SEAT_MARGIN + 22;
  const padY = SEAT_MARGIN + 22;
  const containerWidth = tableWidth + padX * 2;
  const containerHeight = tableHeight + padY * 2;
  const offsetX = padX;
  const offsetY = padY;

  const seats: SeatCoordinate[] = [];
  let seatNum = 1;

  // Top side (left to right)
  for (let i = 0; i < topCount; i++) {
    const step = tableWidth / (topCount + 1);
    seats.push({
      seatNumber: seatNum++,
      x: Math.round(offsetX + step * (i + 1)),
      y: Math.round(offsetY - SEAT_MARGIN),
    });
  }

  // Right end (if present)
  if (hasEnds) {
    seats.push({
      seatNumber: seatNum++,
      x: Math.round(offsetX + tableWidth + SEAT_MARGIN),
      y: Math.round(offsetY + tableHeight / 2),
    });
  }

  // Bottom side (right to left)
  for (let i = 0; i < bottomCount; i++) {
    const step = tableWidth / (bottomCount + 1);
    seats.push({
      seatNumber: seatNum++,
      x: Math.round(offsetX + tableWidth - step * (i + 1)),
      y: Math.round(offsetY + tableHeight + SEAT_MARGIN),
    });
  }

  // Left end (if present)
  if (hasEnds) {
    seats.push({
      seatNumber: seatNum++,
      x: Math.round(offsetX - SEAT_MARGIN),
      y: Math.round(offsetY + tableHeight / 2),
    });
  }

  return {
    containerWidth,
    containerHeight,
    tableX: offsetX,
    tableY: offsetY,
    tableWidth,
    tableHeight,
    seats,
  };
}

/**
 * Returns layout geometry for any table shape.
 */
export function getTableLayout(shape: TableShape, seatsCount: number): TableLayout {
  switch (shape) {
    case 'round':
      return calculateRoundTableLayout(seatsCount);
    case 'square':
      return calculateSquareTableLayout(seatsCount);
    case 'rectangular':
      return calculateRectangularTableLayout(seatsCount);
    default:
      return calculateRoundTableLayout(seatsCount);
  }
}

// ── Seating Metrics ──────────────────────────────────────────────────────────

export interface SeatingStats {
  totalConfirmed: number;
  totalSeats: number;
  seatedCount: number;
  unassignedCount: number;
  tableCount: number;
}

/**
 * Computes live seating statistics from the floor plan and confirmed roster.
 */
export function calculateSeatingStats(
  floorPlan?: FloorPlanConfig,
  confirmedAttendees: ConfirmedAttendee[] = []
): SeatingStats {
  const tables = floorPlan?.tables || [];
  const totalConfirmed = confirmedAttendees.length;

  let totalSeats = 0;
  const assignedAttendeeIds = new Set<string>();

  for (const table of tables) {
    totalSeats += table.seats.length;
    for (const seat of table.seats) {
      if (seat.assignedGuestId) {
        assignedAttendeeIds.add(seat.assignedGuestId);
      }
    }
  }

  const seatedCount = assignedAttendeeIds.size;
  const unassignedCount = Math.max(0, totalConfirmed - seatedCount);

  return {
    totalConfirmed,
    totalSeats,
    seatedCount,
    unassignedCount,
    tableCount: tables.length,
  };
}

/**
 * Creates empty seat records for a table of given capacity.
 */
export function createEmptySeats(tableId: string, seatsCount: number): FloorPlanSeat[] {
  const seats: FloorPlanSeat[] = [];
  for (let i = 1; i <= seatsCount; i++) {
    seats.push({
      id: `${tableId}-seat-${i}`,
      seatNumber: i,
    });
  }
  return seats;
}

// ── Seating Manifest Types & Utilities ───────────────────────────────────────

export interface ManifestSeat {
  seatNumber: number;
  isOccupied: boolean;
  guestId?: string;
  guestName?: string;
  isDependent?: boolean;
  primaryInviteeId?: string;
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
  primaryInviteeId: string;
  primaryInviteeName: string;
  isSeated: boolean;
  tableId?: string;
  tableName?: string;
  seatNumber?: number;
}

/**
 * Generates a structured seating manifest grouped by table.
 * Includes seat-by-seat breakdown with guest details and empty slots.
 */
export function generateTableSeatingManifest(
  tables: FloorPlanTable[] = [],
  confirmedAttendees: ConfirmedAttendee[] = []
): TableManifestItem[] {
  const attendeeMap = new Map<string, ConfirmedAttendee>();
  for (const a of confirmedAttendees) {
    attendeeMap.set(a.id, a);
  }

  return tables.map((table) => {
    const seats: ManifestSeat[] = (table.seats || [])
      .slice()
      .sort((a, b) => a.seatNumber - b.seatNumber)
      .map((seat) => {
        const attendee = seat.assignedGuestId ? attendeeMap.get(seat.assignedGuestId) : undefined;
        const isOccupied = Boolean(seat.assignedGuestId);
        return {
          seatNumber: seat.seatNumber,
          isOccupied,
          guestId: seat.assignedGuestId,
          guestName: seat.assignedGuestName || attendee?.name,
          isDependent: seat.isDependent ?? attendee?.isDependent ?? false,
          primaryInviteeId: seat.primaryInviteeId ?? attendee?.primaryInviteeId,
          primaryInviteeName: attendee?.primaryInviteeName,
        };
      });

    const occupiedCount = seats.filter((s) => s.isOccupied).length;
    const totalSeats = seats.length;
    const emptyCount = Math.max(0, totalSeats - occupiedCount);

    return {
      tableId: table.id,
      tableName: table.name,
      shape: table.shape,
      totalSeats,
      occupiedCount,
      emptyCount,
      seats,
    };
  });
}

/**
 * Compiles an alphabetical directory of all confirmed attendees,
 * cross-referencing their assigned table and seat (or marking as unseated).
 */
export function generateGuestSeatingDirectory(
  tables: FloorPlanTable[] = [],
  confirmedAttendees: ConfirmedAttendee[] = []
): GuestDirectoryItem[] {
  const seatMap = new Map<string, { tableId: string; tableName: string; seatNumber: number }>();
  for (const table of tables) {
    for (const seat of table.seats || []) {
      if (seat.assignedGuestId) {
        seatMap.set(seat.assignedGuestId, {
          tableId: table.id,
          tableName: table.name,
          seatNumber: seat.seatNumber,
        });
      }
    }
  }

  return confirmedAttendees
    .map((attendee) => {
      const seatInfo = seatMap.get(attendee.id);
      return {
        guestId: attendee.id,
        guestName: attendee.name,
        isDependent: attendee.isDependent,
        primaryInviteeId: attendee.primaryInviteeId,
        primaryInviteeName: attendee.primaryInviteeName,
        isSeated: Boolean(seatInfo),
        tableId: seatInfo?.tableId,
        tableName: seatInfo?.tableName,
        seatNumber: seatInfo?.seatNumber,
      };
    })
    .sort((a, b) => a.guestName.localeCompare(b.guestName));
}

/**
 * Escapes a string value according to RFC 4180 CSV specifications.
 */
function escapeCSVValue(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an RFC 4180-compliant CSV string representing the table seating manifest.
 */
export function generateSeatingManifestCSVContent(
  tables: FloorPlanTable[] = [],
  confirmedAttendees: ConfirmedAttendee[] = []
): string {
  const manifest = generateTableSeatingManifest(tables, confirmedAttendees);
  const rows: string[][] = [
    ['Table Name', 'Seat Number', 'Guest Name', 'Guest Type', 'Primary Contact', 'Seat Status'],
  ];

  for (const table of manifest) {
    for (const seat of table.seats) {
      if (seat.isOccupied) {
        const guestType = seat.isDependent ? 'Dependent / Plus-One' : 'Primary Guest';
        const primaryContact = seat.isDependent ? (seat.primaryInviteeName || '') : seat.guestName || '';
        rows.push([
          table.tableName,
          String(seat.seatNumber),
          seat.guestName || '',
          guestType,
          primaryContact,
          'Seated',
        ]);
      } else {
        rows.push([
          table.tableName,
          String(seat.seatNumber),
          '',
          '',
          '',
          'Empty Seat',
        ]);
      }
    }
  }

  // Also append unseated confirmed attendees at the end of the CSV
  const directory = generateGuestSeatingDirectory(tables, confirmedAttendees);
  const unseated = directory.filter((d) => !d.isSeated);
  if (unseated.length > 0) {
    rows.push([]);
    rows.push(['--- UNASSIGNED ATTENDEES ---', '', '', '', '', '']);
    for (const guest of unseated) {
      const guestType = guest.isDependent ? 'Dependent / Plus-One' : 'Primary Guest';
      const primaryContact = guest.isDependent ? guest.primaryInviteeName : guest.guestName;
      rows.push([
        'Unassigned',
        '-',
        guest.guestName,
        guestType,
        primaryContact,
        'Unseated',
      ]);
    }
  }

  return rows.map((row) => row.map(escapeCSVValue).join(',')).join('\r\n');
}

/**
 * Triggers a browser download of the seating manifest CSV.
 */
export function downloadSeatingManifestCSV(
  tables: FloorPlanTable[] = [],
  confirmedAttendees: ConfirmedAttendee[] = [],
  filename: string = 'seating-manifest.csv'
): void {
  const csvContent = generateSeatingManifestCSVContent(tables, confirmedAttendees);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats a clean plain-text summary of the seating manifest suitable for clipboard copying.
 */
export function formatSeatingManifestPlainText(
  tables: FloorPlanTable[] = [],
  confirmedAttendees: ConfirmedAttendee[] = []
): string {
  const manifest = generateTableSeatingManifest(tables, confirmedAttendees);
  const lines: string[] = ['=== SEATING MANIFEST ===', ''];

  for (const table of manifest) {
    lines.push(`TABLE: ${table.tableName} (${table.shape.toUpperCase()}, ${table.occupiedCount}/${table.totalSeats} occupied)`);
    for (const seat of table.seats) {
      if (seat.isOccupied) {
        const depTag = seat.isDependent ? ` (with ${seat.primaryInviteeName || 'Party'})` : '';
        lines.push(`  Seat ${seat.seatNumber}: ${seat.guestName}${depTag}`);
      } else {
        lines.push(`  Seat ${seat.seatNumber}: [Empty Seat]`);
      }
    }
    lines.push('');
  }

  const directory = generateGuestSeatingDirectory(tables, confirmedAttendees);
  const unseated = directory.filter((d) => !d.isSeated);
  if (unseated.length > 0) {
    lines.push(`=== UNASSIGNED GUESTS (${unseated.length}) ===`);
    for (const guest of unseated) {
      const depTag = guest.isDependent ? ` (with ${guest.primaryInviteeName})` : '';
      lines.push(`  • ${guest.guestName}${depTag}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

