import { useState, type FormEvent } from 'react';
import { useSigilStore } from '../../state/sigilStore';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordView({ onBackToLogin }: ForgotPasswordViewProps) {
  const requestPasswordReset = useSigilStore((state) => state.requestPasswordReset);
  const authStatus = useSigilStore((state) => state.authStatus);
  const authError = useSigilStore((state) => state.authError);

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const isLoading = authStatus === 'loading';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    const ok = await requestPasswordReset(email.trim());
    if (ok) setSent(true);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">Sigil & Script</h1>
        <p className="auth-subtitle">Reset your password</p>

        {sent ? (
          <>
            <div className="auth-notice" role="status">
              If an account exists for <strong>{email.trim()}</strong>, we've sent a link to choose a new
              password. It's valid for 60 minutes — check your spam folder if it doesn't arrive.
            </div>
            <div className="auth-actions">
              <button type="button" className="auth-button" onClick={onBackToLogin}>
                Back to Sign In
              </button>
            </div>
          </>
        ) : (
          <>
            {(localError || authError) && (
              <div className="auth-error">
                {localError || authError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label className="auth-label" htmlFor="forgot-email">Email Address</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="auth-input"
                  placeholder="e.g. host@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>

              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-toggle">
              Remembered it?
              <button
                type="button"
                className="auth-toggle-link"
                onClick={onBackToLogin}
                disabled={isLoading}
              >
                Back to Sign In
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
