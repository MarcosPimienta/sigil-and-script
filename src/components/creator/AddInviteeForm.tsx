import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useSigil } from '../../context/SigilContext';

export function AddInviteeForm({ onDone }: { onDone?: () => void }) {
  const { addInvitee } = useSigil();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Guest name is required');
      return;
    }
    addInvitee(trimmedName, email.trim() || undefined);
    setName('');
    setEmail('');
    setError('');
    if (onDone) onDone();
  }

  function handleNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <form className="lp-add-invitee-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        className="lp-add-invitee-name"
        type="text"
        placeholder="Guest name"
        value={name}
        onChange={(e) => { setName(e.target.value); setError(''); }}
        onKeyDown={handleNameKeyDown}
        aria-label="Guest name"
        style={{
          color: '#2d2a26',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(40, 30, 20, 0.25)',
          borderRadius: '4px',
          padding: '6px 12px',
          fontSize: '0.88rem',
          flex: '1 1 160px',
        }}
      />
      <input
        className="lp-add-invitee-email"
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Guest email (optional)"
        style={{
          color: '#2d2a26',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(40, 30, 20, 0.25)',
          borderRadius: '4px',
          padding: '6px 12px',
          fontSize: '0.88rem',
          flex: '1 1 160px',
        }}
      />
      <button
        type="submit"
        className="dashboard-action-btn"
        style={{
          backgroundColor: '#4A5D23',
          color: '#ffffff',
          fontWeight: 600,
          border: 'none',
          borderRadius: '4px',
          padding: '6px 14px',
          cursor: 'pointer',
          fontSize: '0.85rem',
        }}
      >
        + Add Guest
      </button>
      {error && <p className="lp-validation-error" role="alert" style={{ width: '100%', margin: '4px 0 0 0', color: '#c53030', fontSize: '0.85rem' }}>{error}</p>}
    </form>
  );
}
