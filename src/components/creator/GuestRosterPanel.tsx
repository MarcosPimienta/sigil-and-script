import { useSigilSelector } from '../../context/SigilContext';
import { AddInviteeForm } from './AddInviteeForm';
import { InviteeRow } from './InviteeRow';
import { CsvIngestionButton } from './CsvIngestionButton';

export function GuestRosterPanel() {
  const invitees = useSigilSelector((s) => s.guestRoster.invitees);
  const totalDependents = invitees.reduce((acc, i) => acc + (i.dependents?.length || 0), 0);
  const totalGuestCount = invitees.length + totalDependents;

  return (
    <section className="lp-roster-section">
      <h3 className="lp-section-heading">
        Guests ({totalGuestCount})
        <span style={{ fontSize: '0.8em', fontWeight: 'normal', opacity: 0.8, marginLeft: '0.5rem' }}>
          ({invitees.length} primary, {totalDependents} {totalDependents === 1 ? 'dependent' : 'dependents'})
        </span>
      </h3>
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
