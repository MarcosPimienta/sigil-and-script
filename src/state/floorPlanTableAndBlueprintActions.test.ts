import { describe, it, expect, beforeEach } from 'vitest';
import { useSigilStore } from './sigilStore';

describe('Floor Plan Table & Blueprint Refinements Store Actions', () => {
  beforeEach(() => {
    useSigilStore.setState((s) => ({
      design: {
        ...s.design,
        floorPlan: {
          tables: [],
          canvasWidth: 1400,
          canvasHeight: 900,
          referenceLayer: undefined,
        },
      },
    }));
  });

  describe('Table Seat Removal', () => {
    it('removes a specific seat from a table and renumbers remaining seats', () => {
      const store = useSigilStore.getState();
      const tableId = store.addFloorPlanTable({
        name: 'Table 1',
        shape: 'round',
        seatsCount: 4,
      });

      // Initially 4 seats: 1, 2, 3, 4
      let table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
      expect(table?.seatsCount).toBe(4);
      expect(table?.seats).toHaveLength(4);

      // Remove seat 2
      store.removeFloorPlanSeat(tableId, 2);

      table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
      expect(table?.seatsCount).toBe(3);
      expect(table?.seats).toHaveLength(3);
      expect(table?.seats.map((s) => s.seatNumber)).toEqual([1, 2, 3]);
    });

    it('safely unseats assigned guest when their seat is removed', () => {
      const store = useSigilStore.getState();
      const tableId = store.addFloorPlanTable({
        name: 'Table 1',
        shape: 'round',
        seatsCount: 4,
      });

      // Assign guest to seat 3
      store.assignFloorPlanSeat(tableId, 3, { id: 'guest-99', name: 'Diana Prince' });

      let table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
      const seat3 = table?.seats.find((s) => s.seatNumber === 3);
      expect(seat3?.assignedGuestId).toBe('guest-99');

      // Remove seat 3
      store.removeFloorPlanSeat(tableId, 3);

      table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
      expect(table?.seatsCount).toBe(3);
      // No seat on table has guest-99 anymore
      const stillSeated = table?.seats.some((s) => s.assignedGuestId === 'guest-99');
      expect(stillSeated).toBe(false);
    });

    it('enforces minimum table capacity of 2 seats', () => {
      const store = useSigilStore.getState();
      const tableId = store.addFloorPlanTable({
        name: 'Small Table',
        shape: 'round',
        seatsCount: 2,
      });

      // Attempt to remove a seat when table only has 2 seats
      store.removeFloorPlanSeat(tableId, 1);

      const table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
      expect(table?.seatsCount).toBe(2);
      expect(table?.seats).toHaveLength(2);
    });
  });

  describe('Table Rotation', () => {
    it('updates table rotation angle in degrees', () => {
      const store = useSigilStore.getState();
      const tableId = store.addFloorPlanTable({
        name: 'Rect Table',
        shape: 'rectangular',
        seatsCount: 6,
      });

      // Rotate 45 degrees
      store.updateFloorPlanTable(tableId, { rotation: 45 });
      let table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
      expect(table?.rotation).toBe(45);

      // Rotate to 90 degrees
      store.updateFloorPlanTable(tableId, { rotation: 90 });
      table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
      expect(table?.rotation).toBe(90);
    });
  });

  describe('Blueprint Image Adjustments', () => {
    it('updates brightness, contrast, invert, and rotation on reference layer', () => {
      const store = useSigilStore.getState();
      store.setFloorPlanReferenceLayer({
        url: 'https://example.com/dark-cad.png',
        opacity: 0.5,
        scale: 1.0,
        x: 0,
        y: 0,
        visible: true,
        locked: true,
      });

      // Apply CAD Invert, brightness, contrast, and 90-degree rotation
      store.updateFloorPlanReferenceLayer({
        invert: true,
        brightness: 1.2,
        contrast: 1.5,
        rotation: 90,
      });

      const layer = useSigilStore.getState().design.floorPlan?.referenceLayer;
      expect(layer?.invert).toBe(true);
      expect(layer?.brightness).toBe(1.2);
      expect(layer?.contrast).toBe(1.5);
      expect(layer?.rotation).toBe(90);
    });
  });
});
