import { useState, type KeyboardEvent } from 'react';
import type { InviteeRecord, InvitationStatus } from '../../types/sigil.types';
import { useSigil } from '../../context/SigilContext';
import { DependentCheckbox } from './DependentCheckbox';

interface InviteeRowProps {
  invitee: InviteeRecord;
}

export function InviteeRow({ invitee }: InviteeRowProps) {
  const { removeInvitee, addDependent, updateInvitee } = useSigil();
  const [expanded, setExpanded] = useState(false);
  const [depInput, setDepInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(invitee.name);
  const [copied, setCopied] = useState(false);

  function handleRemove() {
    if (window.confirm(`Remove ${invitee.name} from the guest list?`)) {
      removeInvitee(invitee.id);
    }
  }

  function handleSaveName() {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== invitee.name && updateInvitee) {
      updateInvitee(invitee.id, { name: trimmed });
    } else {
      setNameInput(invitee.name);
    }
    setIsEditingName(false);
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

  function handleCopyLink() {
    const link = `${window.location.origin}/invite/${invitee.id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const statusOptions: { value: InvitationStatus; label: string }[] = [
    { value: 'PENDING', label: '⏳ Pendiente' },
    { value: 'OPENED', label: '📬 Abierta' },
    { value: 'RSVP_YES', label: '✅ Confirmado' },
    { value: 'RSVP_NO', label: '❌ Declinado' },
  ];

  return (
    <li className="lp-invitee-row" style={{ borderBottom: '1px solid var(--cr-border, #eee)', padding: '10px 0' }}>
      <div className="lp-invitee-row__header" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Name / Inline Edit */}
        {isEditingName ? (
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            autoFocus
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid var(--cr-border, #ccc)',
              flex: '1 1 120px',
            }}
          />
        ) : (
          <span
            className="lp-invitee-row__name"
            onClick={() => setIsEditingName(true)}
            title="Click to edit guest name"
            style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', flex: '1 1 120px' }}
          >
            {invitee.name} ✏️
          </span>
        )}

        {/* Manual Status Editor Dropdown */}
        <select
          className="lp-status-select"
          value={invitee.status}
          onChange={(e) => updateInvitee && updateInvitee(invitee.id, { status: e.target.value as InvitationStatus })}
          style={{
            fontSize: '0.8rem',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid var(--cr-border, #ccc)',
            background: 'var(--cr-input-bg, #f9f9f9)',
            cursor: 'pointer',
          }}
          aria-label={`Change status for ${invitee.name}`}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Copy Invite Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            fontSize: '0.78rem',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid var(--cr-border, #ccc)',
            background: copied ? '#4A5D23' : 'var(--cr-input-bg, #fff)',
            color: copied ? '#fff' : 'inherit',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {copied ? 'Copied! ✓' : '📋 Link'}
        </button>

        {/* Expand Dependents */}
        <button
          type="button"
          className="lp-invitee-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          style={{ fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.8 }}
        >
          {expanded ? '▾' : '▸'} Dependents ({invitee.dependents.length})
        </button>

        {/* Remove Guest */}
        <button
          type="button"
          className="lp-invitee-remove"
          onClick={handleRemove}
          aria-label={`Remove ${invitee.name}`}
          style={{ background: 'none', border: 'none', color: '#a00', fontSize: '1.1rem', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>

      {/* Expanded Dependents Management */}
      {expanded && (
        <div className="lp-dependents-section" style={{ marginTop: '8px', paddingLeft: '12px', borderLeft: '2px solid var(--status-pending, #4A5D23)' }}>
          <ul className="lp-dependents-list" style={{ listStyle: 'none', padding: 0, margin: '0 0 8px 0' }}>
            {invitee.dependents.map((dep) => (
              <DependentCheckbox
                key={dep.id}
                dependent={dep}
                inviteeId={invitee.id}
                inviteeName={invitee.name}
              />
            ))}
          </ul>
          <div className="lp-add-dependent-inline" style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder="+ Agregar dependiente"
              value={depInput}
              onChange={(e) => setDepInput(e.target.value)}
              onKeyDown={handleDepKeyDown}
              aria-label={`Add dependent for ${invitee.name}`}
              style={{
                fontSize: '0.82rem',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--cr-border, #ccc)',
                flex: 1,
              }}
            />
            <button
              type="button"
              onClick={handleAddDependent}
              aria-label="Confirm add dependent"
              style={{
                fontSize: '0.85rem',
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                background: 'var(--status-pending, #4A5D23)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              +
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
