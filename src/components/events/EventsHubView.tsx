import { useEffect, useState } from 'react';
import { useSigilStore } from '../../state/sigilStore';
import '../../styles/eventsHub.css';

export function EventsHubView() {
  const fetchSavedDesigns = useSigilStore((s) => s.fetchSavedDesigns);
  const deleteSavedDesign = useSigilStore((s) => s.deleteSavedDesign);
  const loadDesign = useSigilStore((s) => s.loadDesign);
  const setAppMode = useSigilStore((s) => s.setAppMode);
  const resetToDefaults = useSigilStore((s) => s.resetToDefaults);
  const updateDesign = useSigilStore((s) => s.updateDesign);
  const user = useSigilStore((s) => s.user);

  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDesignsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchSavedDesigns();
      setDesigns(list);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch your invitations list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignsList();
  }, []);

  const handleEdit = async (id: string) => {
    try {
      await loadDesign(id);
      setAppMode('CREATOR');
    } catch (e: any) {
      alert(`Error loading event design: ${e.message}`);
    }
  };

  const handleManageGuests = async (id: string) => {
    try {
      await loadDesign(id);
      setAppMode('DASHBOARD');
    } catch (e: any) {
      alert(`Error loading event guest list: ${e.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event invitation? This cannot be undone.')) {
      return;
    }
    try {
      await deleteSavedDesign(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    } catch (e: any) {
      alert(`Error deleting event: ${e.message}`);
    }
  };

  const saveCurrentDesign = useSigilStore((s) => s.saveCurrentDesign);

  const handleCreateNew = async () => {
    resetToDefaults();
    updateDesign({
      id: crypto.randomUUID(),
      title: 'My Celebration Invitation',
    });
    try {
      await saveCurrentDesign();
    } catch (e: any) {
      console.error('Failed to save new event to backend:', e);
    }
    setAppMode('CREATOR');
  };

  return (
    <div className="events-hub-container">
      <div className="events-hub-header">
        <div>
          <h1 className="events-hub-title">My Event Invitations</h1>
          <p className="events-hub-subtitle">
            Welcome back, {user?.name || user?.email}. Manage your active invitation cards.
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#f87171',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '32px'
        }}>
          {error}
        </div>
      )}

      <div className="events-hub-grid">
        {/* Create Card */}
        <div className="create-event-card" onClick={handleCreateNew}>
          <div className="create-event-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <h2 className="create-event-title">Create New Event</h2>
          <p className="create-event-desc">Start designing a premium invitation card</p>
        </div>

        {loading ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px',
            color: '#a08e7c',
            fontStyle: 'italic'
          }}>
            Loading your invitations...
          </div>
        ) : designs.length === 0 ? (
          <div className="events-hub-empty">
            <div className="events-hub-empty-icon">📭</div>
            <p className="events-hub-empty-text">No invitations found. Click 'Create New Event' to begin!</p>
          </div>
        ) : (
          designs.map((design) => {
            const dateStr = design.countdownTarget
              ? new Date(design.countdownTarget).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : 'No date set';

            return (
              <div key={design.id} className="event-card">
                <div className="event-card-content">
                  <h2 className="event-card-title">{design.title}</h2>
                  <div className="event-card-meta">
                    <div className="event-card-meta-item">
                      <svg className="event-card-meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {dateStr}
                    </div>
                  </div>
                </div>

                <div className="event-card-actions">
                  <button
                    type="button"
                    className="event-card-btn event-card-btn--primary"
                    onClick={() => handleEdit(design.id)}
                  >
                    Edit Design
                  </button>
                  <button
                    type="button"
                    className="event-card-btn event-card-btn--ghost"
                    onClick={() => handleManageGuests(design.id)}
                  >
                    Guests
                  </button>
                  <button
                    type="button"
                    className="event-card-btn event-card-btn--danger"
                    onClick={() => handleDelete(design.id)}
                    aria-label="Delete event"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
