import { describe, it, expect } from 'vitest';
import {
  getConfirmedAttendees,
  calculateRoundTableLayout,
  calculateSquareTableLayout,
  calculateRectangularTableLayout,
  getTableLayout,
  calculateSeatingStats,
  createEmptySeats,
  generateTableSeatingManifest,
  generateGuestSeatingDirectory,
  generateSeatingManifestCSVContent,
  formatSeatingManifestPlainText,
} from './floorPlanUtils';
import type { InviteeRecord, FloorPlanConfig, FloorPlanTable } from '../types/sigil.types';

describe('floorPlanUtils', () => {
  describe('getConfirmedAttendees', () => {
    it('extracts confirmed primary guests and their included dependents', () => {
      const invitees: InviteeRecord[] = [
        {
          id: 'inv-1',
          name: 'Carlos Santana',
          status: 'RSVP_YES',
          dependents: [
            { id: 'dep-1', name: 'Maria Santana', included: true },
            { id: 'dep-2', name: 'Child Santana', included: false },
          ],
        },
        {
          id: 'inv-2',
          name: 'Ana Gomez',
          status: 'RSVP_NO',
          dependents: [
            { id: 'dep-3', name: 'Pedro Gomez', included: true },
          ],
        },
        {
          id: 'inv-3',
          name: 'Beatriz Luna',
          status: 'RSVP_YES',
          dependents: [],
        },
        {
          id: 'inv-4',
          name: 'David Ortiz',
          status: 'PENDING',
          dependents: [],
        },
      ];

      const attendees = getConfirmedAttendees(invitees);

      // Ana is RSVP_NO (excluded), David is PENDING (excluded).
      // Carlos (primary), Maria (included dependent), Beatriz (primary) should be present.
      expect(attendees).toHaveLength(3);

      const names = attendees.map((a) => a.name);
      expect(names).toEqual(['Beatriz Luna', 'Carlos Santana', 'Maria Santana']);

      const maria = attendees.find((a) => a.name === 'Maria Santana');
      expect(maria?.isDependent).toBe(true);
      expect(maria?.primaryInviteeId).toBe('inv-1');
      expect(maria?.primaryInviteeName).toBe('Carlos Santana');

      const beatriz = attendees.find((a) => a.name === 'Beatriz Luna');
      expect(beatriz?.isDependent).toBe(false);
      expect(beatriz?.primaryInviteeId).toBe('inv-3');
    });

    it('returns empty array when no invitees exist or none are confirmed', () => {
      expect(getConfirmedAttendees([])).toEqual([]);
      expect(
        getConfirmedAttendees([
          { id: 'inv-1', name: 'John', status: 'PENDING', dependents: [] },
        ])
      ).toEqual([]);
    });
  });

  describe('Geometry calculations', () => {
    it('calculates round table layout with N seats', () => {
      const layout4 = calculateRoundTableLayout(4);
      expect(layout4.seats).toHaveLength(4);
      expect(layout4.containerWidth).toBeGreaterThan(layout4.tableWidth);
      expect(layout4.seats[0].seatNumber).toBe(1);

      const layout8 = calculateRoundTableLayout(8);
      expect(layout8.seats).toHaveLength(8);
      // All seats have non-NaN coordinates
      layout8.seats.forEach((seat) => {
        expect(Number.isFinite(seat.x)).toBe(true);
        expect(Number.isFinite(seat.y)).toBe(true);
      });
    });

    it('calculates square table layout with N seats', () => {
      const layout4 = calculateSquareTableLayout(4);
      expect(layout4.seats).toHaveLength(4);

      const layout8 = calculateSquareTableLayout(8);
      expect(layout8.seats).toHaveLength(8);
      layout8.seats.forEach((seat) => {
        expect(Number.isFinite(seat.x)).toBe(true);
        expect(Number.isFinite(seat.y)).toBe(true);
      });
    });

    it('calculates rectangular table layout with N seats', () => {
      const layout6 = calculateRectangularTableLayout(6);
      expect(layout6.seats).toHaveLength(6);

      const layout10 = calculateRectangularTableLayout(10);
      expect(layout10.seats).toHaveLength(10);
      layout10.seats.forEach((seat) => {
        expect(Number.isFinite(seat.x)).toBe(true);
        expect(Number.isFinite(seat.y)).toBe(true);
      });
    });

    it('getTableLayout delegates to shape calculators', () => {
      const round = getTableLayout('round', 6);
      expect(round.seats).toHaveLength(6);

      const square = getTableLayout('square', 6);
      expect(square.seats).toHaveLength(6);

      const rect = getTableLayout('rectangular', 6);
      expect(rect.seats).toHaveLength(6);
    });
  });

  describe('calculateSeatingStats', () => {
    it('correctly calculates seating stats', () => {
      const attendees = [
        { id: 'g-1', name: 'Alice', isDependent: false, primaryInviteeId: 'g-1', primaryInviteeName: 'Alice' },
        { id: 'g-2', name: 'Bob', isDependent: false, primaryInviteeId: 'g-2', primaryInviteeName: 'Bob' },
        { id: 'g-3', name: 'Charlie', isDependent: false, primaryInviteeId: 'g-3', primaryInviteeName: 'Charlie' },
      ];

      const config: FloorPlanConfig = {
        tables: [
          {
            id: 't-1',
            name: 'Table 1',
            shape: 'round',
            seatsCount: 4,
            x: 100,
            y: 100,
            seats: [
              { id: 't-1-s-1', seatNumber: 1, assignedGuestId: 'g-1', assignedGuestName: 'Alice' },
              { id: 't-1-s-2', seatNumber: 2, assignedGuestId: 'g-2', assignedGuestName: 'Bob' },
              { id: 't-1-s-3', seatNumber: 3 },
              { id: 't-1-s-4', seatNumber: 4 },
            ],
          },
          {
            id: 't-2',
            name: 'Table 2',
            shape: 'square',
            seatsCount: 4,
            x: 400,
            y: 100,
            seats: [
              { id: 't-2-s-1', seatNumber: 1 },
              { id: 't-2-s-2', seatNumber: 2 },
              { id: 't-2-s-3', seatNumber: 3 },
              { id: 't-2-s-4', seatNumber: 4 },
            ],
          },
        ],
      };

      const stats = calculateSeatingStats(config, attendees);
      expect(stats.totalConfirmed).toBe(3);
      expect(stats.totalSeats).toBe(8);
      expect(stats.seatedCount).toBe(2);
      expect(stats.unassignedCount).toBe(1); // Charlie is not seated
      expect(stats.tableCount).toBe(2);
    });
  });

  describe('createEmptySeats', () => {
    it('creates specified count of empty seat objects', () => {
      const seats = createEmptySeats('tbl-100', 5);
      expect(seats).toHaveLength(5);
      expect(seats[0]).toEqual({ id: 'tbl-100-seat-1', seatNumber: 1 });
      expect(seats[4]).toEqual({ id: 'tbl-100-seat-5', seatNumber: 5 });
    });
  });

  describe('Manifest & Directory Utilities', () => {
    const mockAttendees = [
      { id: 'att-1', name: 'Zoe Smith', isDependent: false, primaryInviteeId: 'att-1', primaryInviteeName: 'Zoe Smith' },
      { id: 'att-2', name: 'Adam Jones', isDependent: false, primaryInviteeId: 'att-2', primaryInviteeName: 'Adam Jones' },
      { id: 'att-3', name: 'Betty Jones', isDependent: true, primaryInviteeId: 'att-2', primaryInviteeName: 'Adam Jones' },
      { id: 'att-4', name: 'Carl Miller', isDependent: false, primaryInviteeId: 'att-4', primaryInviteeName: 'Carl Miller' },
    ];

    const mockTables: FloorPlanTable[] = [
      {
        id: 't-1',
        name: 'VIP Table',
        shape: 'round',
        seatsCount: 3,
        x: 0,
        y: 0,
        seats: [
          { id: 't-1-s-1', seatNumber: 1, assignedGuestId: 'att-2', assignedGuestName: 'Adam Jones' },
          { id: 't-1-s-2', seatNumber: 2, assignedGuestId: 'att-3', assignedGuestName: 'Betty Jones', isDependent: true, primaryInviteeId: 'att-2' },
          { id: 't-1-s-3', seatNumber: 3 }, // empty
        ],
      },
      {
        id: 't-2',
        name: 'Family Table',
        shape: 'rectangular',
        seatsCount: 2,
        x: 100,
        y: 100,
        seats: [
          { id: 't-2-s-1', seatNumber: 1, assignedGuestId: 'att-1', assignedGuestName: 'Zoe Smith' },
          { id: 't-2-s-2', seatNumber: 2 }, // empty
        ],
      },
    ];

    it('generates table seating manifest correctly', () => {
      const manifest = generateTableSeatingManifest(mockTables, mockAttendees);
      expect(manifest).toHaveLength(2);

      const vip = manifest[0];
      expect(vip.tableName).toBe('VIP Table');
      expect(vip.totalSeats).toBe(3);
      expect(vip.occupiedCount).toBe(2);
      expect(vip.emptyCount).toBe(1);
      expect(vip.seats[0].guestName).toBe('Adam Jones');
      expect(vip.seats[0].isOccupied).toBe(true);
      expect(vip.seats[1].guestName).toBe('Betty Jones');
      expect(vip.seats[1].isDependent).toBe(true);
      expect(vip.seats[1].primaryInviteeName).toBe('Adam Jones');
      expect(vip.seats[2].isOccupied).toBe(false);
      expect(vip.seats[2].guestName).toBeUndefined();
    });

    it('generates guest seating directory sorted alphabetically', () => {
      const directory = generateGuestSeatingDirectory(mockTables, mockAttendees);
      expect(directory).toHaveLength(4);

      // Alphabetical order: Adam Jones, Betty Jones, Carl Miller, Zoe Smith
      expect(directory[0].guestName).toBe('Adam Jones');
      expect(directory[0].isSeated).toBe(true);
      expect(directory[0].tableName).toBe('VIP Table');
      expect(directory[0].seatNumber).toBe(1);

      expect(directory[1].guestName).toBe('Betty Jones');
      expect(directory[1].isDependent).toBe(true);
      expect(directory[1].primaryInviteeName).toBe('Adam Jones');
      expect(directory[1].tableName).toBe('VIP Table');
      expect(directory[1].seatNumber).toBe(2);

      expect(directory[2].guestName).toBe('Carl Miller');
      expect(directory[2].isSeated).toBe(false);
      expect(directory[2].tableName).toBeUndefined();

      expect(directory[3].guestName).toBe('Zoe Smith');
      expect(directory[3].isSeated).toBe(true);
      expect(directory[3].tableName).toBe('Family Table');
    });

    it('generates RFC 4180 CSV content with escaped fields', () => {
      const csv = generateSeatingManifestCSVContent(mockTables, mockAttendees);
      expect(csv).toContain('Table Name,Seat Number,Guest Name,Guest Type,Primary Contact,Seat Status');
      expect(csv).toContain('VIP Table,1,Adam Jones,Primary Guest,Adam Jones,Seated');
      expect(csv).toContain('VIP Table,2,Betty Jones,Dependent / Plus-One,Adam Jones,Seated');
      expect(csv).toContain('VIP Table,3,,,,Empty Seat');
      expect(csv).toContain('--- UNASSIGNED ATTENDEES ---');
      expect(csv).toContain('Unassigned,-,Carl Miller,Primary Guest,Carl Miller,Unseated');
    });

    it('formats plain text manifest for clipboard', () => {
      const text = formatSeatingManifestPlainText(mockTables, mockAttendees);
      expect(text).toContain('=== SEATING MANIFEST ===');
      expect(text).toContain('TABLE: VIP Table (ROUND, 2/3 occupied)');
      expect(text).toContain('Seat 1: Adam Jones');
      expect(text).toContain('Seat 2: Betty Jones (with Adam Jones)');
      expect(text).toContain('Seat 3: [Empty Seat]');
      expect(text).toContain('=== UNASSIGNED GUESTS (1) ===');
      expect(text).toContain('• Carl Miller');
    });
  });
});
