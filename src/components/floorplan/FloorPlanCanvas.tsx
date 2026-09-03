import { useState } from 'react';
import type { FloorPlanTable } from '../../types/sigil.types';
import { FloorPlanTableNode } from './FloorPlanTableNode';

interface FloorPlanCanvasProps {
  tables: FloorPlanTable[];
  onSeatClick: (table: FloorPlanTable, seatNumber: number) => void;
  onDeleteTable: (tableId: string) => void;
  onMoveTable: (tableId: string, x: number, y: number) => void;
  onAddTableClick: () => void;
}

export function FloorPlanCanvas({
  tables,
  onSeatClick,
  onDeleteTable,
  onMoveTable,
  onAddTableClick,
}: FloorPlanCanvasProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((z) => Math.min(1.6, Math.round((z + 0.1) * 10) / 10));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, Math.round((z - 0.1) * 10) / 10));
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="floorplan-workspace" data-testid="floorplan-workspace">
      {/* ── Zoom Controls ── */}
      <div className="floorplan-zoom-bar">
        <button
          type="button"
          className="floorplan-zoom-btn"
          onClick={handleZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
        >
          &minus;
        </button>
        <span className="floorplan-zoom-label">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          className="floorplan-zoom-btn"
          onClick={handleZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="floorplan-zoom-btn"
          onClick={handleZoomReset}
          title="Reset zoom"
          aria-label="Reset zoom"
        >
          Reset
        </button>
      </div>

      {/* ── Map Canvas Surface ── */}
      <div
        className="floorplan-canvas-viewport"
        style={{
          transform: `scale(${zoom})`,
        }}
      >
        {tables.length === 0 ? (
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(4px)',
              padding: '36px 48px',
              borderRadius: '12px',
              border: '1px solid rgba(40, 30, 20, 0.15)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🗺️</div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '1.6rem',
                margin: '0 0 8px 0',
                color: '#2d2a26',
              }}
            >
              Your Floor Plan is Empty
            </h3>
            <p style={{ color: '#8c7d73', fontSize: '0.9rem', marginBottom: '20px' }}>
              Add tables to start placing seats and distributing your confirmed guests.
            </p>
            <button
              type="button"
              className="floorplan-btn floorplan-btn--primary"
              onClick={onAddTableClick}
              data-testid="empty-state-add-table-btn"
            >
              + Add First Table
            </button>
          </div>
        ) : (
          tables.map((table) => (
            <FloorPlanTableNode
              key={table.id}
              table={table}
              onSeatClick={onSeatClick}
              onDeleteTable={onDeleteTable}
              onMoveTable={onMoveTable}
              zoom={zoom}
            />
          ))
        )}
      </div>
    </div>
  );
}
