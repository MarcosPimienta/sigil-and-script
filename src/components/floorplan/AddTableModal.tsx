import { useState, useEffect } from 'react';
import type { TableShape } from '../../types/sigil.types';

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (table: { name: string; shape: TableShape; seatsCount: number }) => void;
  defaultTableNumber: number;
}

export function AddTableModal({
  isOpen,
  onClose,
  onAdd,
  defaultTableNumber,
}: AddTableModalProps) {
  const [name, setName] = useState(`Table ${defaultTableNumber}`);
  const [shape, setShape] = useState<TableShape>('round');
  const [seatsCount, setSeatsCount] = useState(8);

  useEffect(() => {
    if (isOpen) {
      setName(`Table ${defaultTableNumber}`);
      setSeatsCount(8);
      setShape('round');
    }
  }, [isOpen, defaultTableNumber]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: name.trim() || `Table ${defaultTableNumber}`,
      shape,
      seatsCount: Math.max(2, Math.min(20, seatsCount)),
    });
    onClose();
  };

  return (
    <div className="fp-modal-overlay" onClick={onClose} data-testid="add-table-modal-overlay">
      <div className="fp-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="fp-modal-header">
          <h3 className="fp-modal-title">Add New Table</h3>
          <button type="button" className="fp-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fp-modal-body">
            {/* Table Name */}
            <div className="fp-form-group">
              <label className="fp-form-label" htmlFor="new-table-name">
                Table Name / Number
              </label>
              <input
                id="new-table-name"
                type="text"
                className="fp-form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Table 1, VIP Table, Mesa Principal"
                required
                autoFocus
              />
            </div>

            {/* Table Shape */}
            <div className="fp-form-group">
              <label className="fp-form-label">Table Shape</label>
              <div className="fp-shape-grid">
                <div
                  className={`fp-shape-card ${shape === 'round' ? 'fp-shape-card--selected' : ''}`}
                  onClick={() => {
                    setShape('round');
                    if (seatsCount === 4) setSeatsCount(8);
                  }}
                  data-testid="shape-card-round"
                >
                  <div className="fp-shape-icon">⚪</div>
                  <div className="fp-shape-title">Round</div>
                </div>

                <div
                  className={`fp-shape-card ${shape === 'square' ? 'fp-shape-card--selected' : ''}`}
                  onClick={() => {
                    setShape('square');
                    if (seatsCount > 8) setSeatsCount(4);
                  }}
                  data-testid="shape-card-square"
                >
                  <div className="fp-shape-icon">⏹</div>
                  <div className="fp-shape-title">Square</div>
                </div>

                <div
                  className={`fp-shape-card ${
                    shape === 'rectangular' ? 'fp-shape-card--selected' : ''
                  }`}
                  onClick={() => {
                    setShape('rectangular');
                    if (seatsCount < 6) setSeatsCount(8);
                  }}
                  data-testid="shape-card-rectangular"
                >
                  <div className="fp-shape-icon">▭</div>
                  <div className="fp-shape-title">Rectangular</div>
                </div>
              </div>
            </div>

            {/* Seat Count */}
            <div className="fp-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="fp-form-label" htmlFor="new-table-seats" style={{ margin: 0 }}>
                  Number of Seats
                </label>
                <span style={{ fontWeight: 700, color: '#4A5D23', fontSize: '0.95rem' }}>
                  {seatsCount} seats
                </span>
              </div>
              <input
                id="new-table-seats"
                type="range"
                min="2"
                max="20"
                value={seatsCount}
                onChange={(e) => setSeatsCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#4A5D23', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8c7d73' }}>
                <span>2 seats</span>
                <span>10 seats</span>
                <span>20 seats</span>
              </div>
            </div>
          </div>

          <div className="fp-modal-footer">
            <button type="button" className="floorplan-btn floorplan-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="floorplan-btn floorplan-btn--primary">
              Create Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
