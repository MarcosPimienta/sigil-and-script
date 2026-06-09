import { useState, useCallback } from 'react';
import type { InviteeRecord } from '../../types/sigil.types';
import '../../styles/dashboard.css';
import { useSigil, useSigilSelector } from '../../context/SigilContext';
import { DashboardStats } from './DashboardStats';
import { InvitationStatusBadge } from './InvitationStatusBadge';

// ── Copy-link cell ────────────────────────────────────────────────────────────

function CopyLinkCell({ invitee }: { invitee: InviteeRecord }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const url = `${window.location.origin}?guest=${invitee.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy this link:', url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [invitee.id]);

  return (
    <button type="button" className="dashboard-action-btn" onClick={handleCopy}>
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  );
}

// ── Dashboard view ────────────────────────────────────────────────────────────

export function DashboardView() {
  const { updateInvitee } = useSigil();
  const invitees = useSigilSelector((s) => s.guestRoster.invitees);

  if (invitees.length === 0) {
    return (
      <div className="dashboard-view dashboard-view--empty">
        <p>No guests added yet. Go to Create to build your guest list.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      <DashboardStats invitees={invitees} />
      <p className="dashboard-limitation-note">
        Opened status is tracked in this browser only. A backend integration is required for
        real-time tracking across devices.
      </p>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Dependents</th>
            <th scope="col">Status</th>
            <th scope="col">Opened At</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invitees.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.name}</td>
              <td>{inv.dependents.length}</td>
              <td>
                <InvitationStatusBadge status={inv.status} />
              </td>
              <td>
                {inv.openedAt
                  ? new Date(inv.openedAt).toLocaleString()
                  : '—'}
              </td>
              <td className="dashboard-actions-cell">
                <CopyLinkCell invitee={inv} />
                {inv.status === 'PENDING' && (
                  <button
                    type="button"
                    className="dashboard-action-btn"
                    onClick={() => updateInvitee(inv.id, { status: 'SENT' })}
                  >
                    Mark sent
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
