import { useState, useMemo, useEffect, useCallback } from 'react';
import type { FloorPlanTable } from '../../types/sigil.types';
import type { ConfirmedAttendee } from '../../utils/floorPlanUtils';
import {
  generateTableSeatingManifest,
  generateGuestSeatingDirectory,
  downloadSeatingManifestCSV,
  formatSeatingManifestPlainText,
} from '../../utils/floorPlanUtils';

interface SeatingManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: FloorPlanTable[];
  confirmedAttendees: ConfirmedAttendee[];
  eventTitle?: string;
}

export function SeatingManifestModal({
  isOpen,
  onClose,
  tables,
  confirmedAttendees,
  eventTitle = 'Event Seating Manifest',
}: SeatingManifestModalProps) {
  const [activeTab, setActiveTab] = useState<'tables' | 'guests'>('tables');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Generate memoized manifest and directory
  const tableManifest = useMemo(() => {
    return generateTableSeatingManifest(tables, confirmedAttendees);
  }, [tables, confirmedAttendees]);

  const guestDirectory = useMemo(() => {
    return generateGuestSeatingDirectory(tables, confirmedAttendees);
  }, [tables, confirmedAttendees]);

  // Overall statistics
  const totalConfirmed = confirmedAttendees.length;
  const seatedCount = useMemo(() => guestDirectory.filter((g) => g.isSeated).length, [guestDirectory]);
  const unseatedCount = totalConfirmed - seatedCount;
  const totalSeats = useMemo(
    () => tables.reduce((acc, t) => acc + (t.seats?.length || 0), 0),
    [tables]
  );

  // Filtered Table Manifest
  const filteredTables = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tableManifest;

    return tableManifest.filter((tbl) => {
      if (tbl.tableName.toLowerCase().includes(q)) return true;
      return tbl.seats.some(
        (seat) =>
          seat.guestName?.toLowerCase().includes(q) ||
          seat.primaryInviteeName?.toLowerCase().includes(q)
      );
    });
  }, [tableManifest, searchQuery]);

  // Filtered Guest Directory
  const filteredGuests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return guestDirectory;

    return guestDirectory.filter((guest) => {
      return (
        guest.guestName.toLowerCase().includes(q) ||
        guest.primaryInviteeName.toLowerCase().includes(q) ||
        guest.tableName?.toLowerCase().includes(q)
      );
    });
  }, [guestDirectory, searchQuery]);

  // CSV Export handler
  const handleExportCSV = useCallback(() => {
    const filename = `${eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-seating-manifest.csv`;
    downloadSeatingManifestCSV(tables, confirmedAttendees, filename);
  }, [tables, confirmedAttendees, eventTitle]);

  // Print handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Copy to clipboard handler
  const handleCopyText = useCallback(async () => {
    const plainText = formatSeatingManifestPlainText(tables, confirmedAttendees);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(plainText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = plainText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch (e) {
      console.error('Failed to copy text:', e);
      alert('Unable to copy to clipboard.');
    }
  }, [tables, confirmedAttendees]);

  if (!isOpen) return null;

  return (
    <div
      className="fp-modal-overlay seating-manifest-overlay"
      onClick={onClose}
      data-testid="seating-manifest-modal-overlay"
    >
      <div
        className="fp-modal-content seating-manifest-modal"
        onClick={(e) => e.stopPropagation()}
        data-testid="seating-manifest-modal"
      >
        {/* ── Modal Header ── */}
        <div className="fp-modal-header seating-manifest-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>📜</span>
              <h3 className="fp-modal-title">Seating Manifest &amp; Guest Directory</h3>
            </div>
            <div className="seating-manifest-stats">
              <span>Confirmed: <strong>{totalConfirmed}</strong></span>
              <span>&bull;</span>
              <span>Seats: <strong>{totalSeats}</strong></span>
              <span>&bull;</span>
              <span style={{ color: '#2a9d8f' }}>Seated: <strong>{seatedCount}</strong></span>
              {unseatedCount > 0 && (
                <>
                  <span>&bull;</span>
                  <span style={{ color: '#e63946' }}>Unassigned: <strong>{unseatedCount}</strong></span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            className="fp-modal-close"
            onClick={onClose}
            aria-label="Close"
            data-testid="close-manifest-btn"
          >
            &times;
          </button>
        </div>

        {/* ── Action Toolbar & Search ── */}
        <div className="seating-manifest-toolbar">
          {/* Tabs */}
          <div className="seating-manifest-tabs" role="tablist">
            <button
              type="button"
              className={`seating-manifest-tab ${activeTab === 'tables' ? 'active' : ''}`}
              onClick={() => setActiveTab('tables')}
              data-testid="tab-by-table"
              role="tab"
              aria-selected={activeTab === 'tables'}
            >
              🏢 By Table ({tables.length})
            </button>
            <button
              type="button"
              className={`seating-manifest-tab ${activeTab === 'guests' ? 'active' : ''}`}
              onClick={() => setActiveTab('guests')}
              data-testid="tab-by-guest"
              role="tab"
              aria-selected={activeTab === 'guests'}
            >
              👤 By Guest ({totalConfirmed})
            </button>
          </div>

          {/* Search Input */}
          <div className="seating-manifest-search-wrapper">
            <span className="seating-manifest-search-icon">🔍</span>
            <input
              type="text"
              className="seating-manifest-search-input"
              placeholder="Search guest or table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="manifest-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="seating-manifest-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Export Actions */}
          <div className="seating-manifest-actions">
            <button
              type="button"
              className="floorplan-btn floorplan-btn--secondary seating-manifest-action-btn"
              onClick={handleCopyText}
              data-testid="copy-manifest-btn"
              title="Copy plain-text summary"
            >
              {copiedToast ? '✓ Copied!' : '📋 Copy Text'}
            </button>

            <button
              type="button"
              className="floorplan-btn floorplan-btn--secondary seating-manifest-action-btn"
              onClick={handleExportCSV}
              data-testid="export-csv-btn"
              title="Download CSV spreadsheet"
            >
              📥 Export CSV
            </button>

            <button
              type="button"
              className="floorplan-btn floorplan-btn--primary seating-manifest-action-btn"
              onClick={handlePrint}
              data-testid="print-manifest-btn"
              title="Print seating chart"
            >
              🖨️ Print
            </button>
          </div>
        </div>

        {/* ── Modal Content Area ── */}
        <div className="seating-manifest-body">
          {activeTab === 'tables' ? (
            /* ── VIEW 1: BY TABLE ── */
            <div className="seating-manifest-tables-view" data-testid="manifest-tables-view">
              {filteredTables.length === 0 ? (
                <div className="seating-manifest-empty">
                  {searchQuery ? 'No tables or seated guests match your search.' : 'No tables have been created yet.'}
                </div>
              ) : (
                <div className="seating-manifest-grid">
                  {filteredTables.map((table) => {
                    const fillPercent = table.totalSeats > 0 ? (table.occupiedCount / table.totalSeats) * 100 : 0;
                    return (
                      <div
                        key={table.tableId}
                        className="seating-manifest-card"
                        data-testid={`manifest-table-card-${table.tableId}`}
                      >
                        {/* Table Header */}
                        <div className="seating-manifest-card-header">
                          <div>
                            <div className="seating-manifest-card-title">
                              <span className="seating-manifest-shape-icon">
                                {table.shape === 'round' ? '⭕' : table.shape === 'square' ? '⬛' : '▭'}
                              </span>
                              <strong>{table.tableName}</strong>
                            </div>
                            <span className="seating-manifest-shape-tag">
                              {table.shape} table
                            </span>
                          </div>
                          <div className="seating-manifest-capacity-badge">
                            <strong>{table.occupiedCount}</strong> / {table.totalSeats} seats
                          </div>
                        </div>

                        {/* Occupancy bar */}
                        <div className="seating-manifest-progress-bar">
                          <div
                            className="seating-manifest-progress-fill"
                            style={{
                              width: `${fillPercent}%`,
                              backgroundColor: fillPercent === 100 ? '#2a9d8f' : '#e76f51',
                            }}
                          />
                        </div>

                        {/* Seats list */}
                        <ul className="seating-manifest-seats-list">
                          {table.seats.map((seat) => (
                            <li
                              key={`seat-${seat.seatNumber}`}
                              className={`seating-manifest-seat-row ${seat.isOccupied ? 'occupied' : 'empty'}`}
                            >
                              <span className="seating-manifest-seat-num">
                                #{seat.seatNumber}
                              </span>
                              {seat.isOccupied ? (
                                <div className="seating-manifest-guest-info">
                                  <span className="seating-manifest-guest-name">
                                    {seat.guestName}
                                  </span>
                                  {seat.isDependent && (
                                    <span className="seating-manifest-dep-tag" title={`Invited with ${seat.primaryInviteeName || 'Party'}`}>
                                      +1 / Dependent
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="seating-manifest-empty-slot">
                                  Empty Seat
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ── VIEW 2: BY GUEST (ALPHABETICAL) ── */
            <div className="seating-manifest-guests-view" data-testid="manifest-guests-view">
              {/* Unseated warning banner */}
              {unseatedCount > 0 && !searchQuery && (
                <div className="seating-manifest-unseated-banner">
                  <span>⚠️</span>
                  <span>
                    <strong>{unseatedCount} confirmed {unseatedCount === 1 ? 'guest has' : 'guests have'}</strong> not yet been seated at a table.
                  </span>
                </div>
              )}

              {filteredGuests.length === 0 ? (
                <div className="seating-manifest-empty">
                  {searchQuery ? 'No guests match your search query.' : 'No confirmed attendees found in roster.'}
                </div>
              ) : (
                <div className="seating-manifest-table-wrapper">
                  <table className="seating-manifest-table">
                    <thead>
                      <tr>
                        <th>Guest Name</th>
                        <th>Type</th>
                        <th>Primary Contact</th>
                        <th>Assigned Table</th>
                        <th>Seat</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuests.map((guest) => (
                        <tr
                          key={guest.guestId}
                          className={guest.isSeated ? 'row-seated' : 'row-unassigned'}
                          data-testid={`manifest-guest-row-${guest.guestId}`}
                        >
                          <td className="manifest-cell-name">
                            <strong>{guest.guestName}</strong>
                          </td>
                          <td>
                            <span className={`manifest-type-pill ${guest.isDependent ? 'dep' : 'primary'}`}>
                              {guest.isDependent ? 'Dependent / +1' : 'Primary Guest'}
                            </span>
                          </td>
                          <td className="manifest-cell-contact">
                            {guest.isDependent ? guest.primaryInviteeName : '—'}
                          </td>
                          <td className="manifest-cell-table">
                            {guest.isSeated ? (
                              <span className="manifest-table-assigned">
                                🏢 {guest.tableName}
                              </span>
                            ) : (
                              <span className="manifest-table-none">—</span>
                            )}
                          </td>
                          <td className="manifest-cell-seat">
                            {guest.isSeated && guest.seatNumber !== undefined ? (
                              <span className="manifest-seat-badge">
                                #{guest.seatNumber}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            {guest.isSeated ? (
                              <span className="manifest-status-badge seated">
                                ✓ Seated
                              </span>
                            ) : (
                              <span className="manifest-status-badge unseated">
                                ⚠️ Unassigned
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
