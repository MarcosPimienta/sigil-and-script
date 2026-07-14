import { useState, type FormEvent } from 'react';
import { useSigilStore } from '../../state/sigilStore';

interface LoginViewProps {
  onToggleToRegister: () => void;
}

export function LoginView({ onToggleToRegister }: LoginViewProps) {
  const login = useSigilStore((state) => state.login);
  const authStatus = useSigilStore((state) => state.authStatus);
  const authError = useSigilStore((state) => state.authError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    await login(email, password);
  };

  const isLoading = authStatus === 'loading';

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">Sigil & Script</h1>
        <p className="auth-subtitle">Sign in to manage your digital invitations</p>

        {(localError || authError) && (
          <div className="auth-error">
            {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
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
            <label className="auth-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-toggle">
          Don't have an account?
          <button
            type="button"
            className="auth-toggle-link"
            onClick={onToggleToRegister}
            disabled={isLoading}
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}
