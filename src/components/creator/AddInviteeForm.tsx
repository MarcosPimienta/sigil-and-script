import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useSigil } from '../../context/SigilContext';

export function AddInviteeForm({ onDone }: { onDone?: () => void }) {
  const { addInvitee } = useSigil();
  const [guestType, setGuestType] = useState<'INDIVIDUAL' | 'FAMILY'>('INDIVIDUAL');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [familyMembers, setFamilyMembers] = useState<string[]>(['']);
  const [error, setError] = useState('');

  function handleAddFamilyMemberField() {
    setFamilyMembers((prev) => [...prev, '']);
  }

  function handleFamilyMemberChange(idx: number, val: string) {
    setFamilyMembers((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }

  function handleRemoveFamilyMemberField(idx: number) {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(guestType === 'FAMILY' ? 'Family name is required' : 'Guest name is required');
      return;
    }
    const initialDeps = guestType === 'FAMILY' 
      ? familyMembers.map((m) => m.trim()).filter((m) => m.length > 0)
      : [];

    addInvitee(trimmedName, email.trim() || undefined, guestType, initialDeps);
    setName('');
    setEmail('');
    setFamilyMembers(['']);
    setError('');
    if (onDone) onDone();
  }

  function handleNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <form className="lp-add-invitee-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', padding: '12px', background: 'rgba(74, 93, 35, 0.05)', borderRadius: '6px', border: '1px solid rgba(74, 93, 35, 0.2)' }}>
      {/* Category Segmented Toggle Switch */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#4A5D23', marginRight: '4px' }}>Type:</span>
        <button
          type="button"
          onClick={() => { setGuestType('INDIVIDUAL'); setError(''); }}
          style={{
            padding: '4px 10px',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: '4px',
            border: 'none',
            background: guestType === 'INDIVIDUAL' ? '#4A5D23' : 'rgba(0,0,0,0.08)',
            color: guestType === 'INDIVIDUAL' ? '#ffffff' : '#4c4844',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          👤 Individual
        </button>
        <button
          type="button"
          onClick={() => { setGuestType('FAMILY'); setError(''); }}
          style={{
            padding: '4px 10px',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: '4px',
            border: 'none',
            background: guestType === 'FAMILY' ? '#4A5D23' : 'rgba(0,0,0,0.08)',
            color: guestType === 'FAMILY' ? '#ffffff' : '#4c4844',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          👨‍👩‍👧‍👦 Family
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="lp-add-invitee-name"
          type="text"
          placeholder={guestType === 'FAMILY' ? 'Family name (e.g. Familia Gómez)' : 'Guest name (e.g. Carlos Gómez)'}
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          onKeyDown={handleNameKeyDown}
          aria-label={guestType === 'FAMILY' ? 'Family name' : 'Guest name'}
          style={{
            color: '#2d2a26',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(40, 30, 20, 0.25)',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '0.88rem',
            flex: '1 1 200px',
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
            flex: '1 1 180px',
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
          {guestType === 'FAMILY' ? '+ Add Family' : '+ Add Guest'}
        </button>
      </div>

      {/* Family Member Additions (Family Mode Only) */}
      {guestType === 'FAMILY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', paddingLeft: '8px', borderLeft: '2px solid #4A5D23' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4A5D23' }}>
            Family Members / Household Dependents:
          </span>
          {familyMembers.map((member, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder={`Member #${idx + 1} name`}
                value={member}
                onChange={(e) => handleFamilyMemberChange(idx, e.target.value)}
                style={{
                  color: '#2d2a26',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(40, 30, 20, 0.2)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.82rem',
                  flex: '1 1 180px',
                }}
              />
              {familyMembers.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveFamilyMemberField(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c53030',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                  title="Remove member field"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddFamilyMemberField}
            style={{
              alignSelf: 'flex-start',
              background: 'none',
              border: 'none',
              color: '#4A5D23',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            + Add another member
          </button>
        </div>
      )}

      {error && <p className="lp-validation-error" role="alert" style={{ width: '100%', margin: '4px 0 0 0', color: '#c53030', fontSize: '0.85rem' }}>{error}</p>}
    </form>
  );
}
