// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Toolbar / Navigation Header
// ─────────────────────────────────────────────────────────────────────────────

import { useSigil } from '../../context/SigilContext';

const NAV_LINKS = ['Create', 'Templates', 'Features', 'Inspiration'] as const;

export function Toolbar() {
  const { state, setAppMode } = useSigil();
  const isRecipient = state.appMode === 'RECIPIENT';

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
        <button
          id="btn-log-in"
          className="toolbar-btn-ghost"
          type="button"
          aria-label="Log in"
        >
          Log In
        </button>

        {/* Mode toggle — swaps between Creator and Recipient preview */}
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
      </div>
    </header>
  );
}
