import React, { useState, useRef, useCallback } from 'react';
import type { FloorPlanTable, FloorPlanSeat } from '../../types/sigil.types';
import { getTableLayout } from '../../utils/floorPlanUtils';

interface FloorPlanTableNodeProps {
  table: FloorPlanTable;
  onSeatClick: (table: FloorPlanTable, seatNumber: number) => void;
  onDeleteTable: (tableId: string) => void;
  onMoveTable: (tableId: string, x: number, y: number) => void;
  zoom?: number;
}

export function FloorPlanTableNode({
  table,
  onSeatClick,
  onDeleteTable,
  onMoveTable,
  zoom = 1,
}: FloorPlanTableNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPosRef = useRef<{ pointerX: number; pointerY: number; tableX: number; tableY: number }>({
    pointerX: 0,
    pointerY: 0,
    tableX: table.x,
    tableY: table.y,
  });

  const layout = getTableLayout(table.shape, table.seatsCount);

  // Map seat records by seatNumber
  const seatMap = new Map<number, FloorPlanSeat>();
  table.seats.forEach((s) => seatMap.set(s.seatNumber, s));

  const occupiedSeatsCount = table.seats.filter((s) => Boolean(s.assignedGuestId)).length;

  // Pointer dragging handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Don't drag if clicking seat or action buttons
      if ((e.target as HTMLElement).closest('.fp-seat-node, .fp-table-actions-menu')) {
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      startPosRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        tableX: table.x,
        tableY: table.y,
      };
      setDragOffset({ x: 0, y: 0 });
    },
    [table.x, table.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const dx = (e.clientX - startPosRef.current.pointerX) / zoom;
      const dy = (e.clientY - startPosRef.current.pointerY) / zoom;
      setDragOffset({ x: dx, y: dy });
    },
    [isDragging, zoom]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
      const finalX = startPosRef.current.tableX + dragOffset.x;
      const finalY = startPosRef.current.tableY + dragOffset.y;
      setDragOffset({ x: 0, y: 0 });
      onMoveTable(table.id, finalX, finalY);
    },
    [isDragging, dragOffset, onMoveTable, table.id]
  );

  const posX = table.x + (isDragging ? dragOffset.x : 0);
  const posY = table.y + (isDragging ? dragOffset.y : 0);

  return (
    <div
      className={`fp-table-wrapper ${isDragging ? 'fp-table-wrapper--dragging' : ''}`}
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        width: `${layout.containerWidth}px`,
        height: `${layout.containerHeight}px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      data-testid={`table-node-${table.id}`}
    >
      {/* ── Table Surface ── */}
      <div
        className={`fp-table-surface fp-table-surface--${table.shape}`}
        style={{
          left: `${layout.tableX}px`,
          top: `${layout.tableY}px`,
          width: `${layout.tableWidth}px`,
          height: `${layout.tableHeight}px`,
        }}
      >
        <h3 className="fp-table-name" title={table.name}>
          {table.name}
        </h3>
        <span className="fp-table-sub">
          {occupiedSeatsCount} / {table.seatsCount} seats
        </span>

        <div className="fp-table-actions-menu">
          <button
            type="button"
            className="fp-table-action-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete ${table.name}?`)) {
                onDeleteTable(table.id);
              }
            }}
            title="Delete table"
            aria-label={`Delete ${table.name}`}
          >
            🗑
          </button>
        </div>
      </div>

      {/* ── Perimeter Seats ── */}
      {layout.seats.map((seatCoord) => {
        const seat = seatMap.get(seatCoord.seatNumber);
        const isOccupied = Boolean(seat?.assignedGuestId);
        const guestName = seat?.assignedGuestName || '';

        // Derive short initials for avatar
        const initials = guestName
          ? guestName
              .split(' ')
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('')
              .toUpperCase()
          : String(seatCoord.seatNumber);

        return (
          <button
            key={seatCoord.seatNumber}
            type="button"
            className={`fp-seat-node ${
              isOccupied ? 'fp-seat-node--occupied' : 'fp-seat-node--vacant'
            }`}
            style={{
              left: `${seatCoord.x}px`,
              top: `${seatCoord.y}px`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSeatClick(table, seatCoord.seatNumber);
            }}
            aria-label={`Table ${table.name}, Seat ${seatCoord.seatNumber}: ${
              isOccupied ? guestName : 'Empty'
            }`}
            data-testid={`seat-node-${table.id}-${seatCoord.seatNumber}`}
          >
            <span>{initials}</span>

            {isOccupied && (
              <div className="fp-seat-tooltip">
                <strong>{guestName}</strong>
                {seat?.isDependent && <span style={{ opacity: 0.8 }}> (Dependent)</span>}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
