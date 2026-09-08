import React, { useState } from 'react';
import type { FloorPlanTable, FloorPlanReferenceLayer } from '../../types/sigil.types';
import { FloorPlanTableNode } from './FloorPlanTableNode';

interface FloorPlanCanvasProps {
  tables: FloorPlanTable[];
  referenceLayer?: FloorPlanReferenceLayer;
  onSeatClick: (table: FloorPlanTable, seatNumber: number) => void;
  onDeleteTable: (tableId: string) => void;
  onMoveTable: (tableId: string, x: number, y: number) => void;
  onAddTableClick: () => void;
  onMoveReferenceLayer?: (x: number, y: number) => void;
  onUpdateTable?: (tableId: string, patch: Partial<Pick<FloorPlanTable, 'name' | 'shape' | 'seatsCount' | 'rotation'>>) => void;
}

export function FloorPlanCanvas({
  tables,
  referenceLayer,
  onSeatClick,
  onDeleteTable,
  onMoveTable,
  onAddTableClick,
  onMoveReferenceLayer,
  onUpdateTable,
}: FloorPlanCanvasProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((z) => Math.min(1.6, Math.round((z + 0.1) * 10) / 10));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, Math.round((z - 0.1) * 10) / 10));
  const handleZoomReset = () => setZoom(1);

  const handleReferencePointerDown = (e: React.PointerEvent) => {
    if (!referenceLayer || referenceLayer.locked || !onMoveReferenceLayer) return;
    e.preventDefault();
    e.stopPropagation();

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const initialX = referenceLayer.x || 0;
    const initialY = referenceLayer.y || 0;

    const handlePointerMove = (moveEv: PointerEvent) => {
      const dx = (moveEv.clientX - startClientX) / zoom;
      const dy = (moveEv.clientY - startClientY) / zoom;
      onMoveReferenceLayer(Math.round(initialX + dx), Math.round(initialY + dy));
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

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
        {/* ── Blueprint Reference Layer (z-index: 1) ── */}
        {referenceLayer && referenceLayer.visible && (
          <div
            className={`floorplan-reference-layer ${!referenceLayer.locked ? 'repositioning' : ''}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `translate(${referenceLayer.x}px, ${referenceLayer.y}px) rotate(${referenceLayer.rotation || 0}deg) scale(${referenceLayer.scale})`,
              transformOrigin: '0 0',
              opacity: referenceLayer.opacity,
              filter: `brightness(${referenceLayer.brightness ?? 1.0}) contrast(${referenceLayer.contrast ?? 1.0}) saturate(${referenceLayer.saturate ?? 1.0}) ${referenceLayer.invert ? 'invert(1)' : ''}`,
              pointerEvents: !referenceLayer.locked ? 'auto' : 'none',
              cursor: !referenceLayer.locked ? 'grab' : 'default',
              zIndex: 1,
            }}
            onPointerDown={handleReferencePointerDown}
            data-testid="floorplan-reference-layer"
          >
            <img
              src={referenceLayer.url}
              alt="Floor Plan Reference Blueprint"
              draggable={false}
              className="floorplan-reference-img"
              style={{
                display: 'block',
                maxWidth: 'none',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
            {!referenceLayer.locked && (
              <div className="floorplan-reference-drag-badge">
                ✋ Drag to align blueprint with canvas
              </div>
            )}
          </div>
        )}

        {/* ── Empty State Card (if 0 tables) ── */}
        {tables.length === 0 && (
          <div
            className="floorplan-empty-state-card"
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(6px)',
              padding: '36px 48px',
              borderRadius: '12px',
              border: '1px solid rgba(40, 30, 20, 0.15)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              zIndex: 10,
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
        )}

        {/* ── Table Nodes (z-index: 10) ── */}
        {tables.map((table) => (
          <FloorPlanTableNode
            key={table.id}
            table={table}
            onSeatClick={onSeatClick}
            onDeleteTable={onDeleteTable}
            onMoveTable={onMoveTable}
            onUpdateTable={onUpdateTable}
            zoom={zoom}
          />
        ))}
      </div>
    </div>
  );
}
