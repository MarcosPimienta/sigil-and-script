import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useSigil } from '../../context/SigilContext';

export function AddInviteeForm() {
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
  }

  function handleNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <form className="lp-add-invitee-form" onSubmit={handleSubmit} noValidate>
      <input
        className="lp-add-invitee-name"
        type="text"
        placeholder="Guest name"
        value={name}
        onChange={(e) => { setName(e.target.value); setError(''); }}
        onKeyDown={handleNameKeyDown}
        aria-label="Guest name"
      />
      <input
        className="lp-add-invitee-email"
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Guest email (optional)"
      />
      <button type="submit" className="lp-add-invitee-btn">Add Guest</button>
      {error && <p className="lp-validation-error" role="alert">{error}</p>}
    </form>
  );
}
