import { useState, type KeyboardEvent } from 'react';
import type { InviteeRecord } from '../../types/sigil.types';
import { useSigil } from '../../context/SigilContext';
import { InvitationStatusBadge } from '../dashboard/InvitationStatusBadge';
import { DependentCheckbox } from './DependentCheckbox';

interface InviteeRowProps {
  invitee: InviteeRecord;
}

export function InviteeRow({ invitee }: InviteeRowProps) {
  const { removeInvitee, addDependent } = useSigil();
  const [expanded, setExpanded] = useState(false);
  const [depInput, setDepInput] = useState('');

  function handleRemove() {
    if (window.confirm(`Remove ${invitee.name} from the guest list?`)) {
      removeInvitee(invitee.id);
    }
  }

  function handleAddDependent() {
    const trimmed = depInput.trim();
    if (!trimmed) return;
    addDependent(invitee.id, trimmed);
    setDepInput('');
  }

  function handleDepKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAddDependent();
  }

  return (
    <li className="lp-invitee-row">
      <div className="lp-invitee-row__header">
        <span className="lp-invitee-row__name">{invitee.name}</span>
        <InvitationStatusBadge status={invitee.status} />
        <button
          type="button"
          className="lp-invitee-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? '▾' : '▸'} Dependents ({invitee.dependents.length})
        </button>
        <button
          type="button"
          className="lp-invitee-remove"
          onClick={handleRemove}
          aria-label={`Remove ${invitee.name}`}
        >
          ×
        </button>
      </div>

      {expanded && (
        <div className="lp-dependents-section">
          <ul className="lp-dependents-list">
            {invitee.dependents.map((dep) => (
              <DependentCheckbox
                key={dep.id}
                dependent={dep}
                inviteeId={invitee.id}
                inviteeName={invitee.name}
              />
            ))}
          </ul>
          <div className="lp-add-dependent-inline">
            <input
              type="text"
              placeholder="Dependent name"
              value={depInput}
              onChange={(e) => setDepInput(e.target.value)}
              onKeyDown={handleDepKeyDown}
              aria-label={`Add dependent for ${invitee.name}`}
            />
            <button type="button" onClick={handleAddDependent} aria-label="Confirm add dependent">
              +
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
