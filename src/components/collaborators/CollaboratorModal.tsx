import { useState, useEffect, type FormEvent } from 'react';
import { useSigilStore } from '../../state/sigilStore';
import type { CanvasCollaborator, CollaboratorRole } from '../../types/sigil.types';
import '../../styles/collaborator.css';

interface CollaboratorModalProps {
  canvasId: string;
  onClose: () => void;
}

export function CollaboratorModal({ canvasId, onClose }: CollaboratorModalProps) {
  const fetchCollaborators = useSigilStore((s) => s.fetchCollaborators);
  const inviteCollaborator = useSigilStore((s) => s.inviteCollaborator);
  const removeCollaborator = useSigilStore((s) => s.removeCollaborator);

  const [collaborators, setCollaborators] = useState<CanvasCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CollaboratorRole>('CO_HOST');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);

  const loadList = async () => {
    setLoading(true);
    try {
      const list = await fetchCollaborators(canvasId);
      setCollaborators(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId]);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSending(true);
    setError(null);
    setSuccessNotice(null);
    setLastInviteLink(null);

    try {
      const res = await inviteCollaborator(canvasId, email.trim(), role);
      setSuccessNotice(`Invitation sent to ${email.trim()}`);
      if (res.inviteLink) {
        setLastInviteLink(res.inviteLink);
      }
      setEmail('');
      await loadList();
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  };

  const handleRemove = async (collabId: string) => {
    if (!confirm('Are you sure you want to revoke access for this collaborator?')) return;
    try {
      await removeCollaborator(canvasId, collabId);
      setCollaborators((prev) => prev.filter((c) => c.id !== collabId));
    } catch (err: any) {
      alert(`Error removing collaborator: ${err.message}`);
    }
  };

  const handleCopyLink = () => {
    if (!lastInviteLink) return;
    navigator.clipboard.writeText(lastInviteLink);
    alert('Invite link copied to clipboard!');
  };

  return (
    <div className="collab-modal-overlay" onClick={onClose}>
      <div className="collab-modal" onClick={(e) => e.stopPropagation()}>
        <div className="collab-modal-header">
          <div>
            <h2 className="collab-modal-title">Event Co-Hosts &amp; Team</h2>
            <p className="collab-modal-subtitle">
              Invite partners, wedding planners, or committees to collaborate on this event.
            </p>
          </div>
          <button
            type="button"
            className="collab-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {successNotice && (
          <div className="auth-notice" style={{ marginBottom: '1rem' }}>
            {successNotice}
          </div>
        )}

        {lastInviteLink && (
          <div
            style={{
              background: 'rgba(223, 184, 142, 0.08)',
              border: '1px dashed rgba(223, 184, 142, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#a08e7c', wordBreak: 'break-all' }}>
              {lastInviteLink}
            </span>
            <button
              type="button"
              className="landing-btn-ghost"
              style={{ padding: '4px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
              onClick={handleCopyLink}
            >
              Copy Link
            </button>
          </div>
        )}

        {/* Invite Form */}
        <form className="collab-invite-form" onSubmit={handleInvite}>
          <div className="collab-form-row">
            <input
              type="email"
              className="collab-input"
              placeholder="cohost@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
              required
            />
            <select
              className="collab-select"
              value={role}
              onChange={(e) => setRole(e.target.value as CollaboratorRole)}
              disabled={isSending}
            >
              <option value="CO_HOST">Co-Host (Full Access)</option>
              <option value="EDITOR">Editor</option>
            </select>
            <button
              type="submit"
              className="collab-btn-send"
              disabled={isSending}
            >
              {isSending ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>

        {/* Collaborators List */}
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a08e7c', margin: '0 0 0.75rem' }}>
          Active &amp; Pending Collaborators ({collaborators.length})
        </h4>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#a08e7c', fontSize: '0.9rem' }}>
            Loading team members...
          </div>
        ) : collaborators.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: '#a08e7c', fontSize: '0.9rem' }}>
            No collaborators yet. Invite someone above to start co-designing.
          </div>
        ) : (
          <div className="collab-list">
            {collaborators.map((c) => (
              <div key={c.id} className="collab-item">
                <div className="collab-item-info">
                  <div className="collab-avatar">
                    {(c.userName || c.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="collab-item-name">{c.userName || c.email}</div>
                    {c.userName && <div className="collab-item-email">{c.email}</div>}
                  </div>
                </div>

                <div className="collab-item-badges">
                  <span className="collab-badge collab-badge--role">
                    {c.role === 'CO_HOST' ? 'Co-Host' : 'Editor'}
                  </span>
                  <span
                    className={`collab-badge ${
                      c.status === 'ACCEPTED'
                        ? 'collab-badge--status-accepted'
                        : 'collab-badge--status-pending'
                    }`}
                  >
                    {c.status === 'ACCEPTED' ? 'Active' : 'Pending'}
                  </span>
                  <button
                    type="button"
                    className="collab-btn-remove"
                    onClick={() => handleRemove(c.id)}
                    title="Remove collaborator"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
