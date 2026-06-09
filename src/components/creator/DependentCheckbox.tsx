import type { Dependent } from '../../types/sigil.types';
import { useSigil } from '../../context/SigilContext';

interface DependentCheckboxProps {
  dependent: Dependent;
  inviteeId: string;
  inviteeName: string;
}

export function DependentCheckbox({ dependent, inviteeId, inviteeName }: DependentCheckboxProps) {
  const { toggleDependent, removeDependent } = useSigil();

  return (
    <li className="lp-dependent-item">
      <input
        type="checkbox"
        id={dependent.id}
        checked={dependent.included}
        onChange={() => toggleDependent(inviteeId, dependent.id)}
        aria-label={`Include ${dependent.name}, dependent of ${inviteeName}`}
      />
      <label htmlFor={dependent.id}>{dependent.name}</label>
      <button
        type="button"
        className="lp-dependent-remove"
        onClick={() => removeDependent(inviteeId, dependent.id)}
        aria-label={`Remove ${dependent.name}`}
      >
        ×
      </button>
    </li>
  );
}
