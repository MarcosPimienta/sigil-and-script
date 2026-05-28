// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Creator Canvas (Layout Orchestrator)
// Assembles Toolbar + LeftPanel + InvitationStage into the full workspace.
// ─────────────────────────────────────────────────────────────────────────────

import { Toolbar } from './Toolbar';
import { LeftPanel } from './LeftPanel';
import { InvitationStage } from './InvitationStage';
import { useSigil } from '../../context/SigilContext';

export function CreatorCanvas() {
  const { state } = useSigil();

  return (
    <div
      className="creator-canvas"
      data-mode={state.appMode}
      data-texture={state.design.paperTexture}
    >
      {/* ── Top Navigation ─── */}
      <Toolbar />

      {/* ── Workspace ─── */}
      <div className="creator-workspace">
        {/* Left control panel */}
        <LeftPanel />

        {/* Right canvas / preview area */}
        <main className="creator-preview-area" aria-label="Invitation preview canvas">
          {/* Ambient backdrop */}
          <div className="preview-backdrop" aria-hidden="true" />

          {/* The invitation paper itself */}
          <div className="preview-stage-container">
            <InvitationStage />

            {/* Helper text below the stage */}
            <p className="preview-hint" aria-live="polite">
              {state.isEditingText
                ? 'Editing — click outside to finish'
                : state.canvasSelection.selectedTextBlockId
                ? 'Double-click to edit text'
                : state.inspectorFocus.type === 'WAX_SEAL'
                ? 'Wax seal selected — adjust in the panel'
                : 'Click any element to inspect & edit'}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
