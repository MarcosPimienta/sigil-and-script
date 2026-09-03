import { useState, useMemo, useCallback } from 'react';
import { useSigilStore } from '../../state/sigilStore';
import type { FloorPlanTable, TableShape } from '../../types/sigil.types';
import { getConfirmedAttendees, calculateSeatingStats } from '../../utils/floorPlanUtils';
import { FloorPlanCanvas } from './FloorPlanCanvas';
import { AddTableModal } from './AddTableModal';
import { SeatAssignmentModal } from './SeatAssignmentModal';
import { UnassignedGuestsDrawer } from './UnassignedGuestsDrawer';
import '../../styles/floorPlan.css';

export function FloorPlanView() {
  const floorPlan = useSigilStore((s) => s.design.floorPlan);
  const invitees = useSigilStore((s) => s.guestRoster.invitees);
  const addFloorPlanTable = useSigilStore((s) => s.addFloorPlanTable);
  const removeFloorPlanTable = useSigilStore((s) => s.removeFloorPlanTable);
  const moveFloorPlanTable = useSigilStore((s) => s.moveFloorPlanTable);
  const assignFloorPlanSeat = useSigilStore((s) => s.assignFloorPlanSeat);
  const unassignFloorPlanSeat = useSigilStore((s) => s.unassignFloorPlanSeat);
  const saveCurrentDesign = useSigilStore((s) => s.saveCurrentDesign);

  // Modals and Drawer state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSeat, setActiveSeat] = useState<{ table: FloorPlanTable; seatNumber: number } | null>(null);

  // Persistence status
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const tables = floorPlan?.tables || [];

  // Resolve confirmed attendees
  const confirmedAttendees = useMemo(() => {
    return getConfirmedAttendees(invitees);
  }, [invitees]);

  // Compute live statistics
  const stats = useMemo(() => {
    return calculateSeatingStats(floorPlan, confirmedAttendees);
  }, [floorPlan, confirmedAttendees]);

  // Unassigned attendees list
  const unassignedAttendees = useMemo(() => {
    const assignedIds = new Set<string>();
    for (const t of tables) {
      for (const s of t.seats) {
        if (s.assignedGuestId) {
          assignedIds.add(s.assignedGuestId);
        }
      }
    }
    return confirmedAttendees.filter((a) => !assignedIds.has(a.id));
  }, [tables, confirmedAttendees]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveCurrentDesign();
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch (e: any) {
      alert(`Save failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [saveCurrentDesign]);

  const handleSeatClick = useCallback((table: FloorPlanTable, seatNumber: number) => {
    setActiveSeat({ table, seatNumber });
  }, []);

  const handleAddTable = useCallback(
    (newTable: { name: string; shape: TableShape; seatsCount: number }) => {
      addFloorPlanTable(newTable);
    },
    [addFloorPlanTable]
  );

  return (
    <div className="floorplan-view" data-testid="floorplan-view">
      {/* ── Top Header ── */}
      <header className="floorplan-header">
        <div className="floorplan-header-left">
          <h2 className="floorplan-title">
            <span>🗺️</span> Floor Plan &amp; Seating
          </h2>

          <div className="floorplan-stats-bar">
            <span className="floorplan-stat-pill">
              Confirmed Guests: <strong>{stats.totalConfirmed}</strong>
            </span>
            <span className="floorplan-stat-pill">
              Tables: <strong>{stats.tableCount}</strong>
            </span>
            <span className="floorplan-stat-pill">
              Total Seats: <strong>{stats.totalSeats}</strong>
            </span>
            <span className="floorplan-stat-pill floorplan-stat-pill--accent">
              Seated: <strong>{stats.seatedCount} / {stats.totalConfirmed}</strong>
            </span>
            {stats.unassignedCount > 0 && (
              <span
                className="floorplan-stat-pill"
                style={{ background: 'rgba(230, 57, 70, 0.1)', color: '#e63946', borderColor: 'rgba(230, 57, 70, 0.25)' }}
              >
                Unseated: <strong>{stats.unassignedCount}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="floorplan-header-actions">
          <button
            type="button"
            className="floorplan-btn floorplan-btn--primary"
            onClick={() => setIsAddModalOpen(true)}
            data-testid="add-table-btn"
          >
            + Add Table
          </button>

          <button
            type="button"
            className={`floorplan-btn floorplan-btn--secondary ${isDrawerOpen ? 'active' : ''}`}
            onClick={() => setIsDrawerOpen((v) => !v)}
            data-testid="toggle-unassigned-drawer-btn"
          >
            📋 Unassigned Guests ({stats.unassignedCount})
          </button>

          <button
            type="button"
            className="floorplan-btn floorplan-btn--save"
            onClick={handleSave}
            disabled={isSaving}
            data-testid="save-floorplan-btn"
          >
            {isSaving ? '💾 Saving...' : savedToast ? '✓ Saved!' : '💾 Save to Database'}
          </button>
        </div>
      </header>

      {/* ── Workspace with Map and optional Drawer ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <FloorPlanCanvas
          tables={tables}
          onSeatClick={handleSeatClick}
          onDeleteTable={removeFloorPlanTable}
          onMoveTable={moveFloorPlanTable}
          onAddTableClick={() => setIsAddModalOpen(true)}
        />

        <UnassignedGuestsDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          unassignedAttendees={unassignedAttendees}
        />
      </div>

      {/* ── Add Table Modal ── */}
      <AddTableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTable}
        defaultTableNumber={tables.length + 1}
      />

      {/* ── Seat Assignment Modal ── */}
      <SeatAssignmentModal
        isOpen={activeSeat !== null}
        table={activeSeat?.table || null}
        seatNumber={activeSeat?.seatNumber || null}
        confirmedAttendees={confirmedAttendees}
        allTables={tables}
        onAssign={(guest) => {
          if (activeSeat) {
            assignFloorPlanSeat(activeSeat.table.id, activeSeat.seatNumber, guest);
          }
        }}
        onUnseat={() => {
          if (activeSeat) {
            unassignFloorPlanSeat(activeSeat.table.id, activeSeat.seatNumber);
          }
        }}
        onClose={() => setActiveSeat(null)}
      />
    </div>
  );
}
