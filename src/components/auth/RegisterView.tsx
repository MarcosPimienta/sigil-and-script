import { useState, type FormEvent } from 'react';
import { useSigilStore } from '../../state/sigilStore';

interface RegisterViewProps {
  onToggleToLogin: () => void;
}

export function RegisterView({ onToggleToLogin }: RegisterViewProps) {
  const register = useSigilStore((state) => state.register);
  const authStatus = useSigilStore((state) => state.authStatus);
  const authError = useSigilStore((state) => state.authError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password || !confirmPassword) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    await register(email, password, name.trim() || undefined);
  };

  const isLoading = authStatus === 'loading';

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">Sigil & Script</h1>
        <p className="auth-subtitle">Create a host account to start designing</p>

        {(localError || authError) && (
          <div className="auth-error">
            {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              className="auth-input"
              placeholder="e.g. Oscar Wilde (Optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              className="auth-input"
              placeholder="e.g. host@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              className="auth-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="register-confirm-password">Confirm Password</label>
            <input
              id="register-confirm-password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-toggle">
          Already have an account?
          <button
            type="button"
            className="auth-toggle-link"
            onClick={onToggleToLogin}
            disabled={isLoading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
