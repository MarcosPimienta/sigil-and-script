# Proposal: Mobile Creator Studio Toggle & Responsive Toolbar

**Change ID:** `mobile-studio-toggle-and-toolbar`
**Created:** 2026-09-14
**Status:** Awaiting approval

## Problem

When using the Creator Studio (`appMode: 'CREATOR'`) on mobile screens (< 768px), two severe layout collisions occur:

1. **Toolbar Header Overlap & Collision**:
   - The desktop toolbar contains over 10 elements in a single horizontal flex row: Brand logo, "← My Events", language toggle (EN / SPA), Save Layout, Load Layout, Co-Hosts, user name, Log Out, Mode switcher (Studio / Dashboard / Floor Plan), and Preview Invitation.
   - On mobile screens (e.g. 375px–414px width), these elements wrap onto each other into 3 overlapping lines with zero vertical clearance. Text elements, badges, and buttons collide into an illegible visual mess.
2. **Side-by-Side Left Panel Collision**:
   - The workspace layout (`.creator-workspace`) renders the 340px LeftPanel side-by-side with the invitation canvas.
   - On mobile devices, the 340px editor consumes 85–90% of the screen width, crushing the invitation canvas preview into a 35px–50px sliver on the right side.
   - There is no toggle control to hide the editor panel to inspect the full invitation, or to summon the editor when adjusting fonts, colors, and sections.

## Proposed Solution

Deliver a responsive mobile workflow for the Creator Studio:

### 1. Mobile Left Panel Drawer with Toggle
- **Toggleable State**:
  - In mobile viewports (< 768px), the LeftPanel defaults to closed (hidden), giving the invitation canvas 100% of the screen width.
  - A prominent, thumb-friendly floating/toolbar toggle button (`[✏️ Design Controls]` / `[👁️ View Preview]`) allows the user to open and close the editor panel at will.
- **Full-Width Mobile Drawer**:
  - When opened on mobile, the LeftPanel transitions smoothly as a slide-out drawer or overlay covering `width: 100%; max-width: 420px;` with full access to Event, Sections, and Style tabs.
  - A clear `✕` close button is rendered in the panel header on mobile to quickly dismiss the panel and return to the live preview.
- **Desktop Preservation**:
  - On screens >= 768px, the existing desktop side-by-side layout (340px sidebar + preview canvas) is strictly preserved with zero disruption.

### 2. Clean, Responsive Mobile Toolbar
- **Compact Mobile Header**:
  - On mobile screens, the top toolbar displays only essentials:
    - Left: Compact "S&S" badge and "← Events" button.
    - Center/Right: Panel toggle button (`[✏️ Edit]` / `[👁️ Preview]`) and a clean mobile menu button (`⋯`).
- **Mobile Actions Dropdown / Sheet**:
  - Secondary actions that previously caused header collisions are moved into a clean, touch-friendly mobile menu:
    - Mode Navigation (Studio, Guest Dashboard, Floor Plan, Public Preview).
    - Language switcher (EN / SPA).
    - Save Layout & Load Layout.
    - Co-Hosts management.
    - User account info & Log Out.
  - Tapping outside or selecting an action smoothly closes the menu.

---

## Files to Create & Modify

| File | Status | Purpose |
|---|---|---|
| `src/components/creator/Toolbar.tsx` | Modify | Implement mobile action menu (`⋯`) and responsive button pruning on screens < 768px. |
| `src/components/creator/CreatorCanvas.tsx` | Modify | Add `isMobilePanelOpen` state, mobile toggle buttons, and full-width canvas expansion when panel is closed. |
| `src/components/creator/panel/PanelShell.tsx` | Modify | Add close button `✕` on mobile to easily dismiss the editing panel. |
| `src/styles/creator.css` | Modify | Add responsive CSS rules for `.left-panel.mobile-open`, off-canvas transitions, and mobile toolbar menu styles. |

---

## Scope Constraints

### Explicitly In-Scope
- Responsive toolbar layout on screens < 768px with mobile menu dropdown/sheet.
- Toggle control to hide and show the Creator Studio left panel on mobile.
- Off-canvas drawer animation for LeftPanel on mobile viewports.
- Preservation of desktop layout on screens >= 768px.

### Explicitly Out-of-Scope
- Redesigning the internal forms of the 3 panel tabs (they will remain identical, now enjoying full mobile screen width).
- Guest Dashboard or Floor Plan specific changes (handled in separate phases).
