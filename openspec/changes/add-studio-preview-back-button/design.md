# Technical Design: Studio Preview Back Button

## Architectural Decisions

1. **Floating Global Component Placement**:
   - Rather than embedding the back button deep within `EnvelopeWrapper.tsx` (which would only render inside specific animation phases) or relying solely on `Toolbar.tsx` (which is submerged beneath `.envelope-letter-viewport-overlay` with `z-index: 9999`), we render `PreviewBackButton` directly at the root level of `CreatorCanvas.tsx`.
   - `PreviewBackButton` is assigned `z-index: 10000`, ensuring it floats safely above both the canvas backdrop and the full-screen cinematic overlay.

2. **Component Architecture (`PreviewBackButton.tsx`)**:
   - Accepts props:
     ```typescript
     export interface PreviewBackButtonProps {
       onExit: () => void;
       language?: 'EN' | 'ES';
     }
     ```
   - Renders a semantic `<button>` with:
     - `id="btn-preview-back-to-studio"`
     - `type="button"`
     - `aria-label={isEn ? "Return to Studio" : "Volver al Estudio"}`
     - Label: `← Return to Studio` (EN) / `← Volver al Estudio` (ES)
     - Classes: `.creator-preview-back-btn`
   - Fixed coordinates:
     - `top: calc(16px + var(--safe-top, 0px))`
     - `left: calc(16px + var(--safe-left, 0px))`
     - On mobile screens (< 768px): compact icon + concise text (`← Studio` / `← Estudio`) to preserve screen real estate.

3. **State Cleanup & Exit Lifecycle in `CreatorCanvas.tsx`**:
   - When the host clicks the back button:
     1. Stop ambient audio playback via `audioEngine.setMute(true)` or `audioEngine.setSongUrl(null)`.
     2. Reset `envelopePhase` to `'CLOSED'` so subsequent previews start with an intact sealed envelope.
     3. Call `setAppMode('CREATOR')` to restore the studio workspace.

4. **Host vs. Recipient Guard**:
   - The button is displayed if:
     `isRecipient && (user !== null || state.guest.routingToken === 'preview' || !window.location.pathname.startsWith('/invite/'))`
     OR if `!isRecipient && envelopePhase !== 'CLOSED'` (if host unsealed the closed envelope sample inside the studio).
   - Real guests visiting a public `/invite/:token` link will NOT have the back button rendered.

5. **Visual Styling Tokens**:
   - Follows luxury stationery aesthetic:
     - Background: `rgba(28, 22, 18, 0.75)` with `backdrop-filter: blur(12px) saturate(140%)`
     - Border: `1px solid rgba(223, 184, 142, 0.35)`
     - Text color: `#fbf8f3`
     - Font: Cormorant Garamond / system sans serif blend for maximum legibility
     - Hover: slight elevation `translateY(-1px)`, border glow `rgba(223, 184, 142, 0.6)`

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Button covers invitation artwork on small phones | Positioned in the upper-left corner with compact padding (8px 14px) and small font size (0.85rem) on screens < 768px. |
| Button visible to real wedding / event guests | Guarded strictly by checking `user` authentication or preview routing token, excluding `/invite/:token` routes. |
| Audio continues playing after returning to studio | Exit handler explicitly cleans up active ambient sound and resets unsealing animation phase. |
