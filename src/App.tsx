import { useEffect, useState } from 'react';
import { SigilProvider, useSigil } from './context/SigilContext';
import { CreatorCanvas } from './components/creator/CreatorCanvas';
import { DashboardView } from './components/dashboard/DashboardView';
import { Toolbar } from './components/creator/Toolbar';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { useSigilStore } from './state/sigilStore';
import './index.css';
import './styles/auth.css';

// ── Inner shell — has access to SigilContext ──────────────────────────────────

function AppShell() {
  const { state, markInvitationOpened, setGuest, setAppMode, fetchInvitationDetails } = useSigil();
  const user = useSigilStore((s) => s.user);
  const checkAuth = useSigilStore((s) => s.checkAuth);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Read /invite/:token or ?guest=<id> on first mount only
  useEffect(() => {
    const inviteMatch = window.location.pathname.match(/\/invite\/([a-fA-F0-9-]+)/);
    if (inviteMatch) {
      const token = inviteMatch[1];
      setAppMode('RECIPIENT');
      fetchInvitationDetails(token);
      return;
    }

    const guestId = new URLSearchParams(window.location.search).get('guest');
    if (!guestId) return;

    const invitee = state.guestRoster.invitees.find((i) => i.id === guestId);
    if (!invitee) return;

    markInvitationOpened(guestId);
    setGuest({
      guestName: invitee.name,
      additionalGuests: invitee.dependents
        .filter((d) => d.included)
        .map((d) => d.name),
      routingToken: invitee.id,
    });
    setAppMode('RECIPIENT');

    // Remove the param so back-navigation does not re-trigger
    window.history.replaceState({}, '', window.location.pathname);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — runs once on mount

  if (state.apiStatus === 'loading') {
    return (
      <div className="canvas-loading-overlay" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: 'var(--paper-parchment)',
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1.5rem',
        fontStyle: 'italic',
        color: 'var(--status-pending)'
      }}>
        Loading your invitation...
      </div>
    );
  }

  if (state.apiStatus === 'error') {
    return (
      <div className="canvas-error-overlay" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: 'var(--paper-parchment)',
        fontFamily: "'Cormorant Garamond', serif",
        color: 'var(--status-rsvp-no)'
      }}>
        <h2 style={{ fontSize: '2rem', fontStyle: 'italic' }}>Invitation Not Found</h2>
        <p style={{ marginTop: '1rem', color: 'rgba(0,0,0,0.5)' }}>{state.apiError}</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            marginTop: '2rem',
            padding: '8px 16px',
            fontFamily: 'inherit',
            background: 'none',
            border: '1px solid currentColor',
            cursor: 'pointer'
          }}
        >
          Return to Studio
        </button>
      </div>
    );
  }

  const { appMode } = state;

  // Gate creator and dashboard tools behind user login
  if (appMode !== 'RECIPIENT' && !user) {
    if (authView === 'login') {
      return <LoginView onToggleToRegister={() => setAuthView('register')} />;
    }
    return <RegisterView onToggleToLogin={() => setAuthView('login')} />;
  }

  if (appMode === 'DASHBOARD') {
    return (
      <>
        <Toolbar />
        <DashboardView />
      </>
    );
  }

  return <CreatorCanvas />;
}

// ── App root ──────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <SigilProvider>
      <AppShell />
    </SigilProvider>
  );
}
