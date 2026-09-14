# Technical Design: Mobile Creator Studio Toggle & Responsive Toolbar

**Change ID:** `mobile-studio-toggle-and-toolbar`
**Created:** 2026-09-14
**Status:** Awaiting approval

## 1. Architectural Decisions

### A. Mobile Left Panel State & Off-Canvas Drawer
- **State Management**:
  - Introduce `isMobilePanelOpen` boolean state in `CreatorCanvas.tsx` (defaulting to `false` so the mobile user sees their invitation first).
  - Pass `onToggleMobilePanel={() => setIsMobilePanelOpen(prev => !prev)}` and `isMobilePanelOpen` to `<LeftPanel />` and `<Toolbar />`.
- **CSS Architecture**:
  - On desktop (`@media (min-width: 768px)`):
    - `.left-panel` remains `position: static; width: 340px; flex-shrink: 0; display: block;`.
    - No changes to desktop layout or scrolling behavior.
  - On mobile (`@media (max-width: 767px)`):
    - `.left-panel` transitions to an off-canvas drawer:
      ```css
      @media (max-width: 767px) {
        .left-panel {
          position: fixed;
          top: 56px;
          left: 0;
          bottom: 0;
          width: 100%;
          max-width: 420px;
          z-index: var(--z-inspector, 100);
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: none;
        }

        .left-panel.mobile-open {
          transform: translateX(0);
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.25);
        }

        .creator-preview-area {
          width: 100%;
          flex: 1;
        }
      }
      ```
  - Backdrop overlay: When `.left-panel.mobile-open` is active, render a backdrop scrim (`.mobile-panel-backdrop`) that dims the canvas behind it and closes the drawer when tapped.
- **Mobile Close Button**:
  - Inside `PanelShell.tsx` (top right of the panel header), display a subtle `✕` close button visible only on mobile screens (`display: none;` on desktop, `display: flex;` on mobile) to immediately slide the panel away.

### B. Responsive Toolbar & Mobile Action Menu
- **Pruning Desktop Crowding on Mobile**:
  - On `< 768px`:
    - `.toolbar-logo-wordmark`: Hidden on narrow screens (< 480px) to make room, showing the distinctive "S&S" badge and "← Events".
    - Hide the raw desktop row of action buttons (`#btn-save-layout`, `#btn-load-layout`, `#btn-cohosts`, language toggle, mode switcher).
    - Render a mobile toggle pill in the toolbar: `[✏️ Design]` / `[👁️ Preview]` that toggles the panel.
    - Render a mobile menu trigger button (`#btn-mobile-menu`) with three dots (`⋯`) or hamburger icon.
- **Mobile Menu Dialog / Dropdown**:
  - Clicking the menu button opens a polished dropdown menu anchored to the toolbar:
    - **Navigation Section**: Studio, Guest Dashboard, Floor Plan, Preview as Guest.
    - **Language Section**: Switch between EN and SPA.
    - **Actions Section**: Save Layout, Load Layout, Co-Hosts.
    - **Account Section**: User email & Log Out.
  - Keyboard and focus friendly (`aria-expanded`, `aria-haspopup`, close on escape or outside click).

---

## 2. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Desktop studio layout regressions | All mobile drawer CSS is strictly scoped within `@media (max-width: 767px)`. The desktop sidebar retains its existing styling, dimensions, and DOM order. |
| User closes panel and gets lost finding it | A floating toggle button (or clear toolbar button) with `✏️ Design Controls` remains visible on mobile so the host can reopen the editor anytime with a single tap. |
| Backdrop scroll bleed | When the mobile panel is open, set body overflow or drawer containment to ensure scrolling inside the panel tabs doesn't scroll the preview underneath. |
| Test suite breakage for existing buttons | All action buttons (`btn-save-layout`, `btn-load-layout`, `btn-cohosts`, etc.) remain in the DOM so Vitest and end-to-end tests find them unconditionally. |
