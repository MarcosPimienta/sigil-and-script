import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { FloorPlanTable, FloorPlanSeat } from '../../types/sigil.types';
import { getTableLayout } from '../../utils/floorPlanUtils';

interface FloorPlanTableNodeProps {
  table: FloorPlanTable;
  onSeatClick: (table: FloorPlanTable, seatNumber: number) => void;
  onDeleteTable: (tableId: string) => void;
  onMoveTable: (tableId: string, x: number, y: number) => void;
  onUpdateTable?: (tableId: string, patch: Partial<Pick<FloorPlanTable, 'name' | 'shape' | 'seatsCount' | 'rotation'>>) => void;
  onMoveSeat?: (tableId: string, seatNumber: number, angle: number) => void;
  onResetSeats?: (tableId: string) => void;
  zoom?: number;
}

export function FloorPlanTableNode({
  table,
  onSeatClick,
  onDeleteTable,
  onMoveTable,
  onUpdateTable,
  onMoveSeat,
  onResetSeats,
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

  const rotatableInnerRef = useRef<HTMLDivElement>(null);

  // Live seat dragging preview state
  const [draggingSeat, setDraggingSeat] = useState<{ seatNumber: number; angle: number } | null>(null);
  const justDraggedRef = useRef<boolean>(false);
  const seatDragRef = useRef<{
    seatNumber: number;
    startX: number;
    startY: number;
    hasMoved: boolean;
    currentAngle: number;
  } | null>(null);

  const effectiveSeats = useMemo(() => {
    if (!draggingSeat) return table.seats;
    return table.seats.map((s) =>
      s.seatNumber === draggingSeat.seatNumber ? { ...s, angle: draggingSeat.angle } : s
    );
  }, [table.seats, draggingSeat]);

  const layout = getTableLayout(table.shape, table.seatsCount, effectiveSeats);
  const rotation = table.rotation || 0;

  // Map seat records by seatNumber
  const seatMap = new Map<number, FloorPlanSeat>();
  table.seats.forEach((s) => seatMap.set(s.seatNumber, s));

  const occupiedSeatsCount = table.seats.filter((s) => Boolean(s.assignedGuestId)).length;
  const hasCustomAngles = table.seats.some((s) => s.angle !== undefined);

  // Pointer dragging handlers for the TABLE
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Don't drag table if clicking seat, action buttons, or stepper
      if ((e.target as HTMLElement).closest('.fp-seat-node, .fp-table-actions-menu, .fp-table-stepper-row')) {
        return;
      }
      if (typeof e.currentTarget.setPointerCapture === 'function') {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // Safe fallback
        }
      }
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
      if (typeof e.currentTarget.releasePointerCapture === 'function') {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // Safe fallback
        }
      }
      const finalX = startPosRef.current.tableX + dragOffset.x;
      const finalY = startPosRef.current.tableY + dragOffset.y;
      setDragOffset({ x: 0, y: 0 });
      onMoveTable(table.id, finalX, finalY);
    },
    [isDragging, dragOffset, onMoveTable, table.id]
  );

  // Seat dragging handlers (individual seat perimeter move vs click)
  const handleSeatPointerDown = (e: React.PointerEvent<HTMLButtonElement>, seatNumber: number) => {
    e.stopPropagation();
    if (typeof e.currentTarget.setPointerCapture === 'function') {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }

    const seat = seatMap.get(seatNumber);
    const defaultAngle = ((seatNumber - 1) / table.seatsCount) * 360;
    const initialAngle = seat?.angle ?? defaultAngle;

    seatDragRef.current = {
      seatNumber,
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false,
      currentAngle: initialAngle,
    };
  };

  const handleSeatPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!seatDragRef.current) return;
    const dx = e.clientX - seatDragRef.current.startX;
    const dy = e.clientY - seatDragRef.current.startY;
    const dist = Math.hypot(dx, dy);

    if (!seatDragRef.current.hasMoved && dist < 5) {
      return; // Below 5px threshold, treat as potential click
    }

    seatDragRef.current.hasMoved = true;

    if (rotatableInnerRef.current) {
      const rect = rotatableInnerRef.current.getBoundingClientRect();
      const screenCenterX = rect.width > 0 ? rect.left + rect.width / 2 : table.x + layout.containerWidth / 2;
      const screenCenterY = rect.height > 0 ? rect.top + rect.height / 2 : table.y + layout.containerHeight / 2;

      const screenAngleRad = Math.atan2(e.clientY - screenCenterY, e.clientX - screenCenterX);
      const tableRotationRad = ((table.rotation || 0) * Math.PI) / 180;
      const localAngleRad = screenAngleRad - tableRotationRad;

      const deg = (localAngleRad * 180) / Math.PI;
      const clockDeg = Math.round(((((deg + 90) % 360) + 360) % 360) * 10) / 10;

      seatDragRef.current.currentAngle = clockDeg;
      setDraggingSeat({ seatNumber: seatDragRef.current.seatNumber, angle: clockDeg });
    }
  };

  const handleSeatPointerUp = (e: React.PointerEvent<HTMLButtonElement>, seatNumber: number) => {
    if (!seatDragRef.current) return;
    if (typeof e.currentTarget.releasePointerCapture === 'function') {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }

    const { hasMoved, currentAngle } = seatDragRef.current;
    seatDragRef.current = null;
    setDraggingSeat(null);

    if (hasMoved) {
      justDraggedRef.current = true;
      onMoveSeat?.(table.id, seatNumber, currentAngle);
    }
  };

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextRotation = ((table.rotation || 0) + 45) % 360;
    onUpdateTable?.(table.id, { rotation: nextRotation });
  };

  const handleDecreaseSeats = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (table.seatsCount > 2) {
      onUpdateTable?.(table.id, { seatsCount: table.seatsCount - 1 });
    }
  };

  const handleIncreaseSeats = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (table.seatsCount < 24) {
      onUpdateTable?.(table.id, { seatsCount: table.seatsCount + 1 });
    }
  };

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
      {/* ── Rotatable Inner Container ── */}
      <div
        ref={rotatableInnerRef}
        className="fp-table-rotatable-inner"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
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

          {/* Stepper with +/- controls */}
          <div className="fp-table-stepper-row" data-testid={`table-stepper-${table.id}`}>
            <button
              type="button"
              className="fp-table-step-btn"
              onClick={handleDecreaseSeats}
              disabled={table.seatsCount <= 2}
              title="Remove 1 seat"
              aria-label={`Decrease seats for ${table.name}`}
              data-testid={`decrease-seats-${table.id}`}
            >
              &minus;
            </button>
            <span className="fp-table-sub">
              {occupiedSeatsCount} / {table.seatsCount}
            </span>
            <button
              type="button"
              className="fp-table-step-btn"
              onClick={handleIncreaseSeats}
              disabled={table.seatsCount >= 24}
              title="Add 1 seat"
              aria-label={`Increase seats for ${table.name}`}
              data-testid={`increase-seats-${table.id}`}
            >
              +
            </button>
          </div>

          <div className="fp-table-actions-menu">
            <button
              type="button"
              className={`fp-table-action-icon-btn ${hasCustomAngles ? 'fp-table-action-icon-btn--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onResetSeats?.(table.id);
              }}
              title={hasCustomAngles ? "Reset custom seat spacing to uniform" : "Seats are uniformly spaced"}
              aria-label={`Reset seat spacing for ${table.name}`}
              data-testid={`reset-seats-${table.id}`}
            >
              📐
            </button>
            <button
              type="button"
              className="fp-table-action-icon-btn"
              onClick={handleRotate}
              title={`Rotate table (current: ${rotation}°)`}
              aria-label={`Rotate ${table.name}`}
              data-testid={`rotate-table-${table.id}`}
            >
              🔄
            </button>
            <button
              type="button"
              className="fp-table-action-icon-btn fp-table-action-icon-btn--delete"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete ${table.name}?`)) {
                  onDeleteTable(table.id);
                }
              }}
              title="Delete table"
              aria-label={`Delete ${table.name}`}
              data-testid={`delete-table-${table.id}`}
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
          const isSeatDragging = draggingSeat?.seatNumber === seatCoord.seatNumber;

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
              } ${isSeatDragging ? 'fp-seat-node--dragging' : ''}`}
              style={{
                left: `${seatCoord.x}px`,
                top: `${seatCoord.y}px`,
              }}
              onPointerDown={(e) => handleSeatPointerDown(e, seatCoord.seatNumber)}
              onPointerMove={handleSeatPointerMove}
              onPointerUp={(e) => handleSeatPointerUp(e, seatCoord.seatNumber)}
              onPointerCancel={(e) => handleSeatPointerUp(e, seatCoord.seatNumber)}
              onClick={(e) => {
                e.stopPropagation();
                if (justDraggedRef.current) {
                  justDraggedRef.current = false;
                  return;
                }
                onSeatClick(table, seatCoord.seatNumber);
              }}
              aria-label={`Table ${table.name}, Seat ${seatCoord.seatNumber}: ${
                isOccupied ? guestName : 'Empty'
              }`}
              data-testid={`seat-node-${table.id}-${seatCoord.seatNumber}`}
            >
              {/* Counter-rotate text so initials remain upright */}
              <span style={{ transform: `rotate(-${rotation}deg)`, display: 'inline-block' }}>
                {initials}
              </span>

              {isOccupied && (
                <div
                  className="fp-seat-tooltip"
                  style={{ transform: `rotate(-${rotation}deg)` }}
                >
                  <strong>{guestName}</strong>
                  {seat?.isDependent && <span style={{ opacity: 0.8 }}> (Dependent)</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
