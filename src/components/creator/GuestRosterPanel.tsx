import { useSigilSelector } from '../../context/SigilContext';
import { AddInviteeForm } from './AddInviteeForm';
import { InviteeRow } from './InviteeRow';

export function GuestRosterPanel() {
  const invitees = useSigilSelector((s) => s.guestRoster.invitees);

  return (
    <section className="lp-roster-section">
      <h3 className="lp-section-heading">Guests ({invitees.length})</h3>
      <AddInviteeForm />
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
