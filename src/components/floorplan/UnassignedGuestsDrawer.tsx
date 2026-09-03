import { useState } from 'react';
import type { ConfirmedAttendee } from '../../utils/floorPlanUtils';

interface UnassignedGuestsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unassignedAttendees: ConfirmedAttendee[];
}

export function UnassignedGuestsDrawer({
  isOpen,
  onClose,
  unassignedAttendees,
}: UnassignedGuestsDrawerProps) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const query = search.trim().toLowerCase();
  const filtered = unassignedAttendees.filter((a) => {
    if (!query) return true;
    return (
      a.name.toLowerCase().includes(query) ||
      a.primaryInviteeName.toLowerCase().includes(query)
    );
  });

  return (
    <aside className="fp-drawer" aria-label="Unassigned Guests Drawer">
      <div className="fp-drawer-header">
        <div>
          <h3 className="fp-drawer-title">Unassigned Guests</h3>
          <span style={{ fontSize: '0.8rem', color: '#5c534c' }}>
            {unassignedAttendees.length} confirmed attendee{unassignedAttendees.length === 1 ? '' : 's'} awaiting seating
          </span>
        </div>
        <button
          type="button"
          className="fp-modal-close"
          onClick={onClose}
          aria-label="Close drawer"
        >
          &times;
        </button>
      </div>

      <div className="fp-drawer-search">
        <input
          type="text"
          placeholder="Filter guests by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ul className="fp-drawer-list">
        {filtered.length === 0 ? (
          <li className="fp-drawer-empty">
            {unassignedAttendees.length === 0
              ? '🎉 All confirmed guests have been assigned to tables!'
              : 'No matching unassigned guests.'}
          </li>
        ) : (
          filtered.map((attendee) => (
            <li key={attendee.id} className="fp-drawer-item">
              <div>
                <div className="fp-drawer-item-name">{attendee.name}</div>
                <div className="fp-drawer-item-sub">
                  {attendee.isDependent ? `Dependent of ${attendee.primaryInviteeName}` : 'Primary Guest'}
                </div>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  background: 'rgba(74, 93, 35, 0.1)',
                  color: '#4A5D23',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                Unseated
              </span>
            </li>
          ))
        )}
      </ul>

      <div
        style={{
          padding: '12px 16px',
          background: '#fbf9f5',
          borderTop: '1px solid rgba(40, 30, 20, 0.1)',
          fontSize: '0.75rem',
          color: '#8c7d73',
          fontStyle: 'italic',
        }}
      >
        💡 Tip: Click any empty seat on the floor map to assign an unseated guest.
      </div>
    </aside>
  );
}
