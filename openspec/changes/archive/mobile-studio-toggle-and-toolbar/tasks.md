# Implementation Tasks: Mobile Creator Studio Toggle & Responsive Toolbar

**Change ID:** `mobile-studio-toggle-and-toolbar`
**Created:** 2026-09-14
**Status:** Awaiting approval

## Tasks

- [x] **1. Responsive Mobile Toolbar & Action Menu**
  - [x] 1.1 In `src/styles/creator.css`, add media queries for `.site-toolbar` on screens < 768px (hide wordmark on small phones, prevent wrapping).
  - [x] 1.2 In `src/components/creator/Toolbar.tsx`, add mobile menu button (`#btn-mobile-menu`) and dropdown modal/sheet for secondary actions (Save, Load, Co-Hosts, Lang, Mode navigation, Logout).
  - [x] 1.3 Add mobile panel toggle button to toolbar header (`[✏️ Design]` / `[👁️ Preview]`).

- [x] **2. Mobile Left Panel Toggle & Off-Canvas Drawer**
  - [x] 2.1 In `src/components/creator/CreatorCanvas.tsx`, add `isMobilePanelOpen` state and mobile toggle handler.
  - [x] 2.2 In `src/components/creator/LeftPanel.tsx`, support `isOpen` / `onClose` props and apply `.mobile-open` class.
  - [x] 2.3 In `src/components/creator/panel/PanelShell.tsx`, add a mobile close button (`✕`) in the panel header.
  - [x] 2.4 In `src/styles/creator.css`, style `.left-panel` as an off-canvas drawer with smooth slide transition on `@media (max-width: 767px)` and full-width canvas expansion.
  - [x] 2.5 Add backdrop scrim when mobile panel is open to close on tap.
  - [x] 2.6 Refine drawer on mobile (< 768px): ensure 100% full screen width (`width: 100vw; max-width: 100vw;`) and truncate/scale title input so it never overlaps the header close button (`✕`).

- [x] **3. Responsive Floor Plan View**
  - [x] 3.1 In `src/styles/floorPlan.css`, add `@media (max-width: 767px)` styles: compact header padding, make stat pills scrollable horizontally, and make action buttons scrollable with smooth touch scrolling so no buttons are clipped.
  - [x] 3.2 Ensure floor plan canvas touch/viewport ergonomics work cleanly on mobile.

- [x] **4. Responsive Guest Dashboard View**
  - [x] 4.1 In `src/components/dashboard/DashboardView.tsx`, wrap the guest roster table inside `.dashboard-table-container` with `overflow-x: auto; -webkit-overflow-scrolling: touch;`.
  - [x] 4.2 In `src/styles/dashboard.css`, add `@media (max-width: 767px)` styles to prevent document horizontal overflow blowout and ensure compact padding and buttons.

- [x] **5. Verification & Testing**
  - [x] 5.1 Run unit test suite (`npm run test`) to ensure no regressions in existing Toolbar and CreatorCanvas tests.
  - [x] 5.2 Add tests verifying mobile panel toggling and mobile menu opening/closing (`MobileCreatorStudio.test.tsx`).
  - [x] 5.3 Add tests verifying Dashboard table container and Floor Plan responsive classes.
  - [x] 5.4 Verify production build (`npm run build`).
