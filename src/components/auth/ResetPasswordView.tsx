import { useState, type FormEvent } from 'react';
import { useSigilStore } from '../../state/sigilStore';

interface ResetPasswordViewProps {
  /** Raw token from the emailed `?reset=` link. */
  token: string;
  /** Called after a successful reset (navigate to sign-in). */
  onDone: () => void;
  /** Called when the host needs a fresh link (navigate to forgot-password). */
  onRequestNew: () => void;
}

export function ResetPasswordView({ token, onDone, onRequestNew }: ResetPasswordViewProps) {
  const resetPassword = useSigilStore((state) => state.resetPassword);
  const authStatus = useSigilStore((state) => state.authStatus);
  const authError = useSigilStore((state) => state.authError);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isLoading = authStatus === 'loading';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!password || !confirmPassword) {
      setLocalError('Please fill in both fields');
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

    const ok = await resetPassword(token, password);
    if (ok) setDone(true);
  };

  const errorMessage = localError || authError;
  const isLinkError = !localError && !!authError && /invalid or has expired/i.test(authError);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">Sigil & Script</h1>
        <p className="auth-subtitle">Choose a new password</p>

        {done ? (
          <>
            <div className="auth-notice" role="status">
              Your password has been updated and any other sessions were signed out. You can sign in
              with your new password now.
            </div>
            <div className="auth-actions">
              <button type="button" className="auth-button" onClick={onDone}>
                Sign In
              </button>
            </div>
          </>
        ) : (
          <>
            {errorMessage && (
              <div className="auth-error">{errorMessage}</div>
            )}

            {isLinkError ? (
              <div className="auth-actions">
                <button type="button" className="auth-button" onClick={onRequestNew}>
                  Request a new link
                </button>
                <p className="auth-toggle" style={{ marginTop: 12 }}>
                  <button type="button" className="auth-toggle-link" onClick={onDone}>
                    Back to Sign In
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="reset-password">New Password</label>
                  <input
                    id="reset-password"
                    type="password"
                    className="auth-input"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="reset-confirm-password">Confirm New Password</label>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <button type="submit" className="auth-button" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
