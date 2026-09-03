import { describe, it, expect, beforeEach } from 'vitest';
import { useSigilStore } from './sigilStore';

describe('Floor Plan Store Actions', () => {
  beforeEach(() => {
    // Reset floorPlan state before each test
    useSigilStore.setState((s) => ({
      design: {
        ...s.design,
        floorPlan: {
          tables: [],
          canvasWidth: 1400,
          canvasHeight: 900,
        },
      },
    }));
  });

  it('adds a new floor plan table with specified shape and seat count', () => {
    const store = useSigilStore.getState();
    const tableId = store.addFloorPlanTable({
      name: 'Head Table',
      shape: 'rectangular',
      seatsCount: 8,
      x: 120,
      y: 160,
    });

    const tables = useSigilStore.getState().design.floorPlan?.tables;
    expect(tables).toHaveLength(1);
    expect(tables?.[0].id).toBe(tableId);
    expect(tables?.[0].name).toBe('Head Table');
    expect(tables?.[0].shape).toBe('rectangular');
    expect(tables?.[0].seatsCount).toBe(8);
    expect(tables?.[0].seats).toHaveLength(8);
    expect(tables?.[0].x).toBe(120);
    expect(tables?.[0].y).toBe(160);
  });

  it('updates table properties and resizes seat count up and down', () => {
    const store = useSigilStore.getState();
    const tableId = store.addFloorPlanTable({
      shape: 'round',
      seatsCount: 4,
    });

    // Update name and shape
    useSigilStore.getState().updateFloorPlanTable(tableId, {
      name: 'Family Table',
      shape: 'square',
    });

    let table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
    expect(table?.name).toBe('Family Table');
    expect(table?.shape).toBe('square');

    // Scale seats up from 4 to 6
    useSigilStore.getState().updateFloorPlanTable(tableId, {
      seatsCount: 6,
    });

    table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
    expect(table?.seatsCount).toBe(6);
    expect(table?.seats).toHaveLength(6);
    expect(table?.seats[5].seatNumber).toBe(6);

    // Scale seats down from 6 to 3
    useSigilStore.getState().updateFloorPlanTable(tableId, {
      seatsCount: 3,
    });

    table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
    expect(table?.seatsCount).toBe(3);
    expect(table?.seats).toHaveLength(3);
  });

  it('moves a table with grid snapping', () => {
    const store = useSigilStore.getState();
    const tableId = store.addFloorPlanTable({
      shape: 'round',
      seatsCount: 6,
      x: 50,
      y: 50,
    });

    // 147 should snap to 140 (20px grid) or 160 (nearest 20) -> Math.round(147 / 20) * 20 = 140
    useSigilStore.getState().moveFloorPlanTable(tableId, 147, 213);

    const table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tableId);
    expect(table?.x).toBe(140);
    expect(table?.y).toBe(220);
  });

  it('removes a table from the floor plan', () => {
    const store = useSigilStore.getState();
    const id1 = store.addFloorPlanTable({ shape: 'round', seatsCount: 4 });
    const id2 = store.addFloorPlanTable({ shape: 'square', seatsCount: 4 });

    expect(useSigilStore.getState().design.floorPlan?.tables).toHaveLength(2);

    useSigilStore.getState().removeFloorPlanTable(id1);

    const remaining = useSigilStore.getState().design.floorPlan?.tables;
    expect(remaining).toHaveLength(1);
    expect(remaining?.[0].id).toBe(id2);
  });

  it('assigns a guest to a seat and enforces the single-seat invariant', () => {
    const store = useSigilStore.getState();
    const tbl1 = store.addFloorPlanTable({ name: 'Table 1', shape: 'round', seatsCount: 4 });
    const tbl2 = store.addFloorPlanTable({ name: 'Table 2', shape: 'round', seatsCount: 4 });

    // Assign Guest A to Table 1, Seat 1
    useSigilStore.getState().assignFloorPlanSeat(tbl1, 1, {
      id: 'guest-a',
      name: 'Alice Wonder',
      isDependent: false,
    });

    let table1 = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tbl1);
    expect(table1?.seats[0].assignedGuestId).toBe('guest-a');
    expect(table1?.seats[0].assignedGuestName).toBe('Alice Wonder');

    // Assign Guest A to Table 2, Seat 3 -> Should remove from Table 1, Seat 1!
    useSigilStore.getState().assignFloorPlanSeat(tbl2, 3, {
      id: 'guest-a',
      name: 'Alice Wonder',
      isDependent: false,
    });

    table1 = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tbl1);
    const table2 = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tbl2);

    // Vacated from Table 1
    expect(table1?.seats[0].assignedGuestId).toBeUndefined();
    expect(table1?.seats[0].assignedGuestName).toBeUndefined();

    // Placed in Table 2, Seat 3
    expect(table2?.seats[2].assignedGuestId).toBe('guest-a');
    expect(table2?.seats[2].assignedGuestName).toBe('Alice Wonder');
  });

  it('unassigns a seat and clears all assignments', () => {
    const store = useSigilStore.getState();
    const tblId = store.addFloorPlanTable({ shape: 'round', seatsCount: 4 });

    useSigilStore.getState().assignFloorPlanSeat(tblId, 1, {
      id: 'guest-1',
      name: 'Guest One',
    });
    useSigilStore.getState().assignFloorPlanSeat(tblId, 2, {
      id: 'guest-2',
      name: 'Guest Two',
    });

    // Unassign seat 1
    useSigilStore.getState().unassignFloorPlanSeat(tblId, 1);
    let table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tblId);
    expect(table?.seats[0].assignedGuestId).toBeUndefined();
    expect(table?.seats[1].assignedGuestId).toBe('guest-2');

    // Clear all
    useSigilStore.getState().clearAllFloorPlanAssignments();
    table = useSigilStore.getState().design.floorPlan?.tables.find((t) => t.id === tblId);
    expect(table?.seats[1].assignedGuestId).toBeUndefined();
  });
});
