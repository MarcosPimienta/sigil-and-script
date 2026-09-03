import { useState } from 'react';
import type { FloorPlanTable } from '../../types/sigil.types';
import type { ConfirmedAttendee } from '../../utils/floorPlanUtils';

interface SeatAssignmentModalProps {
  isOpen: boolean;
  table: FloorPlanTable | null;
  seatNumber: number | null;
  confirmedAttendees: ConfirmedAttendee[];
  allTables: FloorPlanTable[];
  onAssign: (guest: ConfirmedAttendee) => void;
  onUnseat: () => void;
  onClose: () => void;
}

export function SeatAssignmentModal({
  isOpen,
  table,
  seatNumber,
  confirmedAttendees,
  allTables,
  onAssign,
  onUnseat,
  onClose,
}: SeatAssignmentModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !table || seatNumber === null) return null;

  const currentSeat = table.seats.find((s) => s.seatNumber === seatNumber);
  const isOccupied = Boolean(currentSeat?.assignedGuestId);

  // Build a map of where each attendee is currently seated across all tables
  const attendeeSeatingMap = new Map<string, { tableName: string; seatNum: number }>();
  for (const t of allTables) {
    for (const s of t.seats) {
      if (s.assignedGuestId) {
        attendeeSeatingMap.set(s.assignedGuestId, { tableName: t.name, seatNum: s.seatNumber });
      }
    }
  }

  const query = searchQuery.trim().toLowerCase();
  const filteredAttendees = confirmedAttendees.filter((attendee) => {
    if (!query) return true;
    return (
      attendee.name.toLowerCase().includes(query) ||
      attendee.primaryInviteeName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="fp-modal-overlay" onClick={onClose} data-testid="seat-modal-overlay">
      <div className="fp-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="fp-modal-header">
          <div>
            <h3 className="fp-modal-title">Seat Assignment</h3>
            <span style={{ fontSize: '0.8rem', color: '#5c534c' }}>
              {table.name} &bull; Seat {seatNumber}
            </span>
          </div>
          <button
            type="button"
            className="fp-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="fp-modal-body">
          {/* Current occupant section */}
          {isOccupied && (
            <div
              style={{
                padding: '12px',
                background: 'rgba(74, 93, 35, 0.08)',
                border: '1px solid rgba(74, 93, 35, 0.25)',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#4A5D23', fontWeight: 700 }}>
                  Current Occupant
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#2d2a26', marginTop: '2px' }}>
                  {currentSeat?.assignedGuestName}
                  {currentSeat?.isDependent && (
                    <span style={{ fontSize: '0.75rem', color: '#8c7d73', fontWeight: 'normal', marginLeft: '6px' }}>
                      (Dependent)
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="floorplan-btn"
                style={{
                  background: '#ffffff',
                  color: '#e63946',
                  border: '1px solid rgba(230, 57, 70, 0.3)',
                  padding: '5px 10px',
                  fontSize: '0.8rem',
                }}
                onClick={() => {
                  onUnseat();
                  onClose();
                }}
              >
                Unseat Guest
              </button>
            </div>
          )}

          {/* Search bar */}
          <div className="fp-form-group" style={{ marginBottom: '12px' }}>
            <label className="fp-form-label" htmlFor="seat-guest-search">
              Assign Confirmed Guest
            </label>
            <input
              id="seat-guest-search"
              type="text"
              className="fp-form-input"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Guest selection list */}
          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              border: '1px solid rgba(40, 30, 20, 0.12)',
              borderRadius: '6px',
            }}
          >
            {filteredAttendees.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#8c7d73', fontStyle: 'italic', fontSize: '0.85rem' }}>
                {confirmedAttendees.length === 0
                  ? 'No confirmed guests found in roster. Guests must RSVP "Attending" to be seated.'
                  : 'No matching confirmed guests found.'}
              </div>
            ) : (
              filteredAttendees.map((attendee) => {
                const currentSeatInfo = attendeeSeatingMap.get(attendee.id);
                const isThisSeat =
                  currentSeatInfo?.tableName === table.name &&
                  currentSeatInfo?.seatNum === seatNumber;

                return (
                  <div
                    key={attendee.id}
                    onClick={() => {
                      if (!isThisSeat) {
                        onAssign(attendee);
                        onClose();
                      }
                    }}
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid rgba(40, 30, 20, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: isThisSeat ? 'default' : 'pointer',
                      background: isThisSeat ? 'rgba(74, 93, 35, 0.06)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isThisSeat) e.currentTarget.style.background = '#fbf9f5';
                    }}
                    onMouseLeave={(e) => {
                      if (!isThisSeat) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#2d2a26' }}>
                        {attendee.name}
                        {attendee.isDependent && (
                          <span style={{ fontSize: '0.75rem', color: '#8c7d73', fontWeight: 'normal', marginLeft: '6px' }}>
                            (with {attendee.primaryInviteeName})
                          </span>
                        )}
                      </div>
                      {currentSeatInfo && !isThisSeat && (
                        <div style={{ fontSize: '0.72rem', color: '#8c7d73', marginTop: '2px' }}>
                          Currently at: {currentSeatInfo.tableName} (Seat {currentSeatInfo.seatNum}) &bull; Clicking will move
                        </div>
                      )}
                      {isThisSeat && (
                        <div style={{ fontSize: '0.72rem', color: '#4A5D23', fontWeight: 600, marginTop: '2px' }}>
                          &check; Seated here
                        </div>
                      )}
                    </div>

                    {!isThisSeat && (
                      <button
                        type="button"
                        className="floorplan-btn floorplan-btn--secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Assign
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="fp-modal-footer">
          <button type="button" className="floorplan-btn floorplan-btn--secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
