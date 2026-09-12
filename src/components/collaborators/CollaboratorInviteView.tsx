import { useEffect, useState, type FormEvent } from 'react';
import { useSigilStore } from '../../state/sigilStore';
import type { CollaboratorInviteDetails } from '../../types/sigil.types';
import '../../styles/collaborator.css';
import '../../styles/auth.css';

interface CollaboratorInviteViewProps {
  token: string;
  onAccepted: () => void;
}

export function CollaboratorInviteView({ token, onAccepted }: CollaboratorInviteViewProps) {
  const getCollaboratorInviteDetails = useSigilStore((s) => s.getCollaboratorInviteDetails);
  const acceptCollaboratorInvite = useSigilStore((s) => s.acceptCollaboratorInvite);
  const loadDesign = useSigilStore((s) => s.loadDesign);
  const setAppMode = useSigilStore((s) => s.setAppMode);
  const user = useSigilStore((s) => s.user);
  const login = useSigilStore((s) => s.login);
  const register = useSigilStore((s) => s.register);

  const [details, setDetails] = useState<CollaboratorInviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth toggle when unauthenticated
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const d = await getCollaboratorInviteDetails(token);
        if (d && d.valid) {
          setDetails(d);
          setAuthEmail(d.email);
        } else {
          setError('This invitation link is invalid or has already been used.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to verify invitation token.');
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleAcceptExisting = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const canvasId = await acceptCollaboratorInvite(token);
      if (canvasId) {
        await loadDesign(canvasId);
        setAppMode('CREATOR');
        onAccepted();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to claim invitation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegisterAndAccept = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !authPassword || !authConfirmPassword) {
      setAuthError('Please fill in all fields.');
      return;
    }

    if (authPassword !== authConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (authPassword.length < 12) {
      setAuthError('Password must be at least 12 characters long.');
      return;
    }

    setIsProcessing(true);
    try {
      const ok = await register(authEmail.trim(), authPassword, authName.trim() || undefined);
      if (ok) {
        const canvasId = await acceptCollaboratorInvite(token);
        if (canvasId) {
          await loadDesign(canvasId);
          setAppMode('CREATOR');
          onAccepted();
        }
      } else {
        setAuthError('Registration failed. If you already have an account, please sign in.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoginAndAccept = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please fill in email and password.');
      return;
    }

    setIsProcessing(true);
    try {
      const ok = await login(authEmail.trim(), authPassword);
      if (ok) {
        const canvasId = await acceptCollaboratorInvite(token);
        if (canvasId) {
          await loadDesign(canvasId);
          setAppMode('CREATOR');
          onAccepted();
        }
      } else {
        setAuthError('Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="collab-invite-page">
        <div className="collab-invite-card">
          <div className="collab-invite-crest">✦</div>
          <h2 className="collab-invite-title">Verifying Invitation...</h2>
          <p className="collab-invite-subtitle">Connecting with Sigil &amp; Script registry</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="collab-invite-page">
        <div className="collab-invite-card">
          <div className="collab-invite-crest" style={{ background: '#ef4444', color: '#fff' }}>✕</div>
          <h2 className="collab-invite-title" style={{ color: '#ef4444' }}>Invitation Not Available</h2>
          <p className="collab-invite-subtitle" style={{ marginBottom: '2rem' }}>
            {error || 'This invitation link is invalid or has expired.'}
          </p>
          <button
            type="button"
            className="auth-button"
            onClick={() => {
              window.location.href = '/';
            }}
          >
            Return to Studio
          </button>
        </div>
      </div>
    );
  }

  const roleLabel = details.role === 'CO_HOST' ? 'Co-Host' : 'Editor';

  return (
    <div className="collab-invite-page">
      <div className="collab-invite-card">
        <div className="collab-invite-header">
          <div className="collab-invite-crest">✦</div>
          <h1 className="collab-invite-title">You&apos;re Invited to Collaborate</h1>
          <p className="collab-invite-subtitle">
            <strong>{details.inviterName}</strong> has invited you to collaborate as a <strong>{roleLabel}</strong>.
          </p>
        </div>

        <div className="collab-event-highlight">
          <div className="collab-event-name">{details.eventTitle}</div>
          <div className="collab-event-meta">{details.eventType} Celebration</div>
        </div>

        {user ? (
          <div>
            <p style={{ color: '#a08e7c', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Signed in as <strong>{user.email}</strong>
            </p>
            <button
              type="button"
              className="auth-button"
              onClick={handleAcceptExisting}
              disabled={isProcessing}
            >
              {isProcessing ? 'Claiming Invitation...' : 'Accept Invitation & Open Studio →'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'none',
                  border: 'none',
                  borderBottom: authTab === 'register' ? '2px solid #dfb88e' : 'none',
                  color: authTab === 'register' ? '#dfb88e' : '#a08e7c',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onClick={() => setAuthTab('register')}
              >
                Create Account
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'none',
                  border: 'none',
                  borderBottom: authTab === 'login' ? '2px solid #dfb88e' : 'none',
                  color: authTab === 'login' ? '#dfb88e' : '#a08e7c',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onClick={() => setAuthTab('login')}
              >
                Sign In
              </button>
            </div>

            {authError && (
              <div className="auth-error" style={{ marginBottom: '1rem' }}>
                {authError}
              </div>
            )}

            {authTab === 'register' ? (
              <form onSubmit={handleRegisterAndAccept}>
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="collab-name">Your Full Name</label>
                  <input
                    id="collab-name"
                    type="text"
                    className="auth-input"
                    placeholder="e.g. Marcus Vance"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="collab-email">Email Address</label>
                  <input
                    id="collab-email"
                    type="email"
                    className="auth-input"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    disabled={isProcessing}
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="collab-password">Password</label>
                  <input
                    id="collab-password"
                    type="password"
                    className="auth-input"
                    placeholder="Min. 12 characters"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    disabled={isProcessing}
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="collab-confirm-pwd">Confirm Password</label>
                  <input
                    id="collab-confirm-pwd"
                    type="password"
                    className="auth-input"
                    placeholder="••••••••••••"
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    disabled={isProcessing}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Joining Event...' : 'Register & Join as Co-Host →'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginAndAccept}>
                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="collab-login-email">Email Address</label>
                  <input
                    id="collab-login-email"
                    type="email"
                    className="auth-input"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    disabled={isProcessing}
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-label" htmlFor="collab-login-pwd">Password</label>
                  <input
                    id="collab-login-pwd"
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    disabled={isProcessing}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Signing In...' : 'Sign In & Join Event →'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
