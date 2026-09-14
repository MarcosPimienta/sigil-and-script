// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Left Control Panel
//
// This file used to be 750 lines holding every control in the studio in one
// scroll. It is now just the mount point: PanelShell owns the header, the
// three tabs and the single scrolling body, and each tab owns its own content.
//
// The upload helpers that used to live here moved to ./uploadHelpers and
// ./uploads, so the section editors can import them without importing the
// panel back — that cycle is what made the old arrangement impossible.
// ─────────────────────────────────────────────────────────────────────────────

import { PanelShell } from './panel/PanelShell';

export interface LeftPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function LeftPanel({ isOpen = false, onClose }: LeftPanelProps = {}) {
  return (
    <>
      {isOpen && (
        <div
          className="mobile-panel-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`left-panel${isOpen ? ' mobile-open' : ''}`}>
        <PanelShell onCloseMobile={onClose} />
      </aside>
    </>
  );
}
