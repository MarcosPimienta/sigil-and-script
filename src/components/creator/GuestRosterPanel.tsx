import { useState, useCallback } from 'react';
import { useSigilSelector } from '../../context/SigilContext';
import { useSigilStore } from '../../state/sigilStore';
import { AddInviteeForm } from './AddInviteeForm';
import { InviteeRow } from './InviteeRow';
import { CsvIngestionButton } from './CsvIngestionButton';

export function GuestRosterPanel() {
  const invitees = useSigilSelector((s) => s.guestRoster.invitees);
  const saveCurrentDesign = useSigilStore((s) => s.saveCurrentDesign);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

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

  const totalDependents = invitees.reduce((acc, i) => acc + (i.dependents?.length || 0), 0);
  const totalGuestCount = invitees.length + totalDependents;

  return (
    <section className="lp-roster-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 className="lp-section-heading" style={{ margin: 0 }}>
          Guests ({totalGuestCount})
          <span style={{ fontSize: '0.8em', fontWeight: 'normal', opacity: 0.8, marginLeft: '0.5rem' }}>
            ({invitees.length} primary, {totalDependents} {totalDependents === 1 ? 'dependent' : 'dependents'})
          </span>
        </h3>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: '4px',
            border: 'none',
            background: savedToast ? '#28c76f' : '#4A5D23',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isSaving ? '💾 Saving...' : savedToast ? '✓ Saved!' : '💾 Save to Database'}
        </button>
      </div>
      <AddInviteeForm />
      <CsvIngestionButton />
      {invitees.length === 0 ? (
        <p className="lp-roster-empty">No guests yet. Add the first one above.</p>
      ) : (
        <ul className="lp-invitee-list">
          {invitees.map((inv) => (
            <InviteeRow key={inv.id} invitee={inv} />
          ))}
        </ul>
      )}
    </section>
  );
}
