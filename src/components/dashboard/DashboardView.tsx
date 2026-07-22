import { useState, useCallback, Fragment } from 'react';
import type { InviteeRecord, InvitationStatus } from '../../types/sigil.types';
import '../../styles/dashboard.css';
import { useSigil, useSigilSelector } from '../../context/SigilContext';
import { DashboardStats } from './DashboardStats';
import { AddInviteeForm } from '../creator/AddInviteeForm';
import { CsvIngestionButton } from '../creator/CsvIngestionButton';
import { DependentCheckbox } from '../creator/DependentCheckbox';

// ── Copy-link cell ────────────────────────────────────────────────────────────

function CopyLinkCell({ invitee }: { invitee: InviteeRecord }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const url = `${window.location.origin}/invite/${invitee.id}`;
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
  const { updateInvitee, removeInvitee, addDependent } = useSigil();
  const invitees = useSigilSelector((s) => s.guestRoster.invitees);

  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');
  const [depInputMap, setDepInputMap] = useState<Record<string, string>>({});

  function toggleExpand(id: string) {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleStartEditName(inv: InviteeRecord) {
    setEditingNameId(inv.id);
    setEditingNameValue(inv.name);
  }

  function handleSaveName(id: string) {
    const trimmed = editingNameValue.trim();
    if (trimmed && updateInvitee) {
      updateInvitee(id, { name: trimmed });
    }
    setEditingNameId(null);
  }

  function handleAddDependent(inviteeId: string) {
    const val = (depInputMap[inviteeId] || '').trim();
    if (!val) return;
    addDependent(inviteeId, val);
    setDepInputMap((prev) => ({ ...prev, [inviteeId]: '' }));
  }

  function handleRemoveInvitee(inv: InviteeRecord) {
    if (window.confirm(`Remove ${inv.name} from the guest list?`)) {
      removeInvitee(inv.id);
    }
  }

  const statusOptions: { value: InvitationStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'SENT', label: 'Sent' },
    { value: 'OPENED', label: 'Opened' },
    { value: 'RSVP_YES', label: 'Attending' },
    { value: 'RSVP_NO', label: 'Declined' },
  ];

  return (
    <div className="dashboard-view">
      {/* Top Header & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
        <DashboardStats invitees={invitees} />
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="dashboard-action-btn"
            onClick={() => setShowAddForm((v) => !v)}
            style={{
              backgroundColor: showAddForm ? '#a08e7c' : '#4A5D23',
              color: '#ffffff',
              borderColor: 'transparent',
              fontWeight: 600,
              padding: '6px 14px',
            }}
          >
            {showAddForm ? '✕ Close Form' : '+ Add Guest'}
          </button>
          <CsvIngestionButton />
        </div>
      </div>

      {/* Expandable Add Guest Inline Form */}
      {showAddForm && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid var(--ui-border)',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '16px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <AddInviteeForm onDone={() => setShowAddForm(false)} />
        </div>
      )}

      <p className="dashboard-limitation-note">
        Opened status is tracked in this browser only. Use the status pill dropdowns below to manage invitation states and dependents.
      </p>

      {invitees.length === 0 ? (
        <div className="dashboard-view--empty" style={{ padding: '60px 0' }}>
          <p>No guests added yet. Click "+ Add Guest" above to get started!</p>
        </div>
      ) : (
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
            {invitees.map((inv) => {
              const isExpanded = !!expandedIds[inv.id];
              const isEditingName = editingNameId === inv.id;

              return (
                <Fragment key={inv.id}>
                  <tr>
                    {/* Guest Name cell */}
                    <td>
                      {isEditingName ? (
                        <input
                          type="text"
                          value={editingNameValue}
                          onChange={(e) => setEditingNameValue(e.target.value)}
                          onBlur={() => handleSaveName(inv.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveName(inv.id)}
                          autoFocus
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid var(--ui-border)',
                            color: '#2d2a26',
                            background: '#ffffff',
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => handleStartEditName(inv)}
                          title="Click to edit name"
                          style={{ cursor: 'pointer', fontWeight: 600 }}
                        >
                          {inv.name} <span style={{ opacity: 0.5, fontSize: '0.8em' }}>✏️</span>
                        </span>
                      )}
                    </td>

                    {/* Dependents Count & Expand Trigger */}
                    <td>
                      <button
                        type="button"
                        onClick={() => toggleExpand(inv.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--ui-text-secondary)',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        aria-expanded={isExpanded}
                      >
                        {inv.dependents.length}{' '}
                        <span style={{ fontSize: '0.75em', opacity: 0.7 }}>
                          {isExpanded ? '▲' : '▼ edit'}
                        </span>
                      </button>
                    </td>

                    {/* Status Pill Dropdown */}
                    <td>
                      <select
                        className={`status-badge status-badge--${inv.status.toLowerCase()}`}
                        value={inv.status}
                        onChange={(e) => updateInvitee && updateInvitee(inv.id, { status: e.target.value as InvitationStatus })}
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontFamily: 'inherit',
                          outline: 'none',
                        }}
                        aria-label={`Status for ${inv.name}`}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value} style={{ background: '#ffffff', color: '#2d2a26' }}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Opened At */}
                    <td>
                      {inv.openedAt ? new Date(inv.openedAt).toLocaleString() : '—'}
                    </td>

                    {/* Actions cell */}
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
                      <button
                        type="button"
                        className="dashboard-action-btn"
                        onClick={() => handleRemoveInvitee(inv)}
                        aria-label={`Remove ${inv.name}`}
                        style={{ color: '#c53030', borderColor: 'rgba(197, 48, 48, 0.3)' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {/* Expandable Dependents Manager Row */}
                  {isExpanded && (
                    <tr style={{ background: 'rgba(40, 30, 20, 0.03)' }}>
                      <td colSpan={5} style={{ padding: '12px 16px 16px 32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '500px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ui-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Dependents for {inv.name}
                          </span>

                          {inv.dependents.length > 0 ? (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {inv.dependents.map((dep) => (
                                <DependentCheckbox
                                  key={dep.id}
                                  dependent={dep}
                                  inviteeId={inv.id}
                                  inviteeName={inv.name}
                                />
                              ))}
                            </ul>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: 'var(--ui-text-muted)', fontStyle: 'italic' }}>
                              No dependents registered yet.
                            </span>
                          )}

                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <input
                              type="text"
                              placeholder="+ Add dependent name"
                              value={depInputMap[inv.id] || ''}
                              onChange={(e) => setDepInputMap((prev) => ({ ...prev, [inv.id]: e.target.value }))}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddDependent(inv.id)}
                              style={{
                                fontSize: '0.85rem',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                border: '1px solid var(--ui-border)',
                                background: '#ffffff',
                                color: '#2d2a26',
                                flex: 1,
                              }}
                            />
                            <button
                              type="button"
                              className="dashboard-action-btn"
                              onClick={() => handleAddDependent(inv.id)}
                              style={{
                                backgroundColor: '#4A5D23',
                                color: '#ffffff',
                                borderColor: 'transparent',
                                fontWeight: 600,
                              }}
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
