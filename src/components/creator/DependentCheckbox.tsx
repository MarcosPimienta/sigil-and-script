import { useState } from 'react';
import type { Dependent } from '../../types/sigil.types';
import { useSigil } from '../../context/SigilContext';
import { useSigilStore } from '../../state/sigilStore';

interface DependentCheckboxProps {
  dependent: Dependent;
  inviteeId: string;
  inviteeName: string;
}

export function DependentCheckbox({ dependent, inviteeId, inviteeName }: DependentCheckboxProps) {
  const { toggleDependent, removeDependent } = useSigil();
  const updateDependentName = useSigilStore((s) => s.updateDependentName);

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(dependent.name);

  function handleSaveName() {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== dependent.name && updateDependentName) {
      updateDependentName(inviteeId, dependent.id, trimmed);
    } else {
      setNameInput(dependent.name);
    }
    setIsEditing(false);
  }

  return (
    <li className="lp-dependent-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
      <input
        type="checkbox"
        id={dependent.id}
        checked={dependent.included}
        onChange={() => toggleDependent(inviteeId, dependent.id)}
        aria-label={`Include ${dependent.name}, dependent of ${inviteeName}`}
      />

      {isEditing ? (
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
          autoFocus
          style={{
            background: '#1a202c',
            border: '1px solid #4a5568',
            borderRadius: '4px',
            padding: '2px 6px',
            fontSize: '0.85rem',
            color: '#ffffff',
            flex: 1,
          }}
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          style={{
            cursor: 'pointer',
            fontSize: '0.85rem',
            color: '#ffffff',
            flex: 1,
          }}
          title="Click to edit dependent name"
        >
          {dependent.name} <span style={{ opacity: 0.65, fontSize: '0.85em' }}>✏️</span>
        </span>
      )}

      <button
        type="button"
        className="lp-dependent-remove"
        onClick={() => removeDependent(inviteeId, dependent.id)}
        aria-label={`Remove ${dependent.name}`}
        style={{
          background: 'none',
          border: 'none',
          color: '#a00',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: '0 4px',
        }}
      >
        ×
      </button>
    </li>
  );
}
