// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Application Root
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { SigilProvider, useSigil } from './context/SigilContext';
import { CreatorCanvas } from './components/creator/CreatorCanvas';
import { DashboardView } from './components/dashboard/DashboardView';
import { Toolbar } from './components/creator/Toolbar';
import './index.css';

// ── Inner shell — has access to SigilContext ──────────────────────────────────

function AppShell() {
  const { state, markInvitationOpened, setGuest, setAppMode } = useSigil();

  // Read ?guest=<id> on first mount only; mark invitation opened and enter
  // recipient mode if a matching invitee exists in the roster.
  useEffect(() => {
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

  const { appMode } = state;

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
