// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Toolbar / Navigation Header
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useSigil } from '../../context/SigilContext';
import { useSigilStore } from '../../state/sigilStore';

const NAV_LINKS = ['Create', 'Templates', 'Features', 'Inspiration'] as const;

export function Toolbar() {
  const { state, setAppMode } = useSigil();
  const { appMode } = state;
  const isRecipient = appMode === 'RECIPIENT';
  const isDashboard = appMode === 'DASHBOARD';

  // Store actions
  const saveCurrentDesign = useSigilStore((s) => s.saveCurrentDesign);
  const loadDesign = useSigilStore((s) => s.loadDesign);
  const fetchSavedDesigns = useSigilStore((s) => s.fetchSavedDesigns);
  const deleteSavedDesign = useSigilStore((s) => s.deleteSavedDesign);

  // Local state
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSave = async () => {
    try {
      await saveCurrentDesign();
      setToastMessage('Layout saved successfully!');
    } catch (e: any) {
      setToastMessage(`Error saving: ${e.message}`);
    }
  };

  const handleOpenLoadModal = async () => {
    setIsLoadModalOpen(true);
    setLoading(true);
    try {
      const list = await fetchSavedDesigns();
      setSavedDesigns(list);
    } catch (e: any) {
      setToastMessage(`Error loading layouts list: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (id: string) => {
    try {
      await loadDesign(id);
      setIsLoadModalOpen(false);
      setToastMessage('Layout loaded successfully!');
    } catch (e: any) {
      setToastMessage(`Error loading: ${e.message}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this layout?')) return;
    try {
      await deleteSavedDesign(id);
      setSavedDesigns((prev) => prev.filter((d) => d.id !== id));
      setToastMessage('Layout deleted successfully!');
    } catch (e: any) {
      setToastMessage(`Error deleting: ${e.message}`);
    }
  };

  return (
    <header className="site-toolbar" role="banner">
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div className="toolbar-logo">
        <span className="toolbar-logo-badge" aria-hidden="true">S&amp;S</span>
        <span className="toolbar-logo-wordmark">Sigil &amp; Script</span>
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="toolbar-nav" aria-label="Main navigation">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            className="toolbar-nav-link"
            aria-label={link}
            onClick={(e) => e.preventDefault()}
          >
            {link.toUpperCase()}
          </a>
        ))}
      </nav>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="toolbar-actions">
        {/* Save/Load Layout buttons — hidden in recipient/guest mode */}
        {!isRecipient && !isDashboard && (
          <>
            <button
              id="btn-save-layout"
              className="toolbar-btn-ghost"
              type="button"
              onClick={handleSave}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              aria-label="Save layout"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Layout
            </button>

            <button
              id="btn-load-layout"
              className="toolbar-btn-ghost"
              type="button"
              onClick={handleOpenLoadModal}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              aria-label="Load layout"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Load Layout
            </button>
          </>
        )}

        <button
          id="btn-log-in"
          className="toolbar-btn-ghost"
          type="button"
          aria-label="Log in"
        >
          Log In
        </button>

        {/* Dashboard toggle — hidden in recipient mode */}
        {!isRecipient && (
          <button
            id="btn-dashboard"
            className={`toolbar-btn-ghost${isDashboard ? ' toolbar-btn-ghost--active' : ''}`}
            type="button"
            onClick={() => setAppMode(isDashboard ? 'CREATOR' : 'DASHBOARD')}
            aria-pressed={isDashboard}
            aria-label={isDashboard ? 'Return to Studio' : 'Open guest dashboard'}
          >
            {isDashboard ? '← Studio' : 'Dashboard'}
          </button>
        )}

        {/* Preview toggle — swaps between Creator and Recipient preview */}
        {!isDashboard && (
          <button
            id="btn-mode-toggle"
            className={`toolbar-btn-primary${isRecipient ? ' toolbar-btn-primary--exit' : ''}`}
            type="button"
            onClick={() => setAppMode(isRecipient ? 'CREATOR' : 'RECIPIENT')}
            aria-pressed={isRecipient}
            aria-label={isRecipient ? 'Return to Studio' : 'Preview as Recipient'}
          >
            {isRecipient ? '← Studio' : 'Preview Invitation'}
          </button>
        )}
      </div>

      {/* ── Saved configurations modal dialog ── */}
      {isLoadModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLoadModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Saved Configurations</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsLoadModalOpen(false)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)' }}>
                  Loading saved layouts...
                </div>
              ) : savedDesigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)' }}>
                  No saved layouts found. Name your invitation in the sidebar and click "Save Layout" to start.
                </div>
              ) : (
                <div className="modal-list">
                  {savedDesigns.map((designItem) => (
                    <div key={designItem.id} className="modal-item">
                      <div className="modal-item-info">
                        <span className="modal-item-title">{designItem.title}</span>
                        <span className="modal-item-meta">
                          Target: {designItem.countdownTarget ? new Date(designItem.countdownTarget).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="modal-item-actions">
                        <button
                          type="button"
                          className="modal-btn modal-btn-primary"
                          onClick={() => handleLoad(designItem.id)}
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          className="modal-btn modal-btn-danger"
                          onClick={(e) => handleDelete(e, designItem.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="toast-notification" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </header>
  );
}
