import type {
  InviteeRecord,
  FloorPlanConfig,
  FloorPlanSeat,
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
