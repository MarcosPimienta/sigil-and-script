# Proposal — QR Tab & Physical Printable Invitation Cards

## Problem
Event hosts often need to distribute physical invitations (place cards, save-the-date cards, or formal printed enclosure cards) that lead directly to each guest's personalized digital invitation and RSVP flow. 
Currently:
1. There is no way to design or export a physical, printable QR card in the editor studio.
2. In the guest roster, the host only has a "Copy link" text button; there is no quick way to view or generate a personalized QR code card for a specific guest to print or share.

## Proposed Solution

1. **Zero-Dependency QR Code Utility (`src/utils/qrcode.ts`)**:
   - Implement a lightweight, self-contained TypeScript QR code generator that produces pure SVG elements and draws directly to high-DPI `<canvas>`.
   - Supports Error Correction Level H (high redundancy) so an optional wax seal / event monogram can be centered inside the QR code without hindering camera scannability.

2. **QR Design Model (`sigil.types.ts`)**:
   - Add `qrCard?: QrCardConfig;` to `InvitationDesign`.
   - Options include:
     - `theme`: `'PARCHMENT' | 'MINIMAL_WHITE' | 'MODERN_DARK' | 'GOLDEN_BORDER'`
     - `cardSize`: `'4x6' | '3.5x2' | 'A6' | 'SQUARE'`
     - `orientation`: `'PORTRAIT' | 'LANDSCAPE'`
     - `headline`: Custom event headline or host names
     - `instructionsText`: Scan instruction text (e.g. "Escanea para confirmar tu asistencia" / "Scan to view invitation & RSVP")
     - `includeGuestName`: Toggle to render "Para: [Nombre del Invitado]" on the card
     - `includeSealLogo`: Toggle to place the wax seal / logo in the center of the QR code
     - `showDate`: Toggle to render the event date
     - `qrColor`: Custom QR code color
     - `qrBgColor`: QR code background color

3. **Editor "QR" Tab (`src/components/creator/panel/QrTab.tsx`)**:
   - Expand `PANEL_TABS = ['EVENT', 'SECTIONS', 'STYLE', 'QR']`.
   - Mount in [PanelShell.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/panel/PanelShell.tsx) with a QR code icon and bilingual labels in [panelStrings.ts](file:///home/fenix3819/sigil-and-script/src/components/creator/panel/panelStrings.ts).
   - Provide visual controls for theme, sizing, custom copy, seal toggle, and color palette.
   - When active, the main editor canvas ([CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx)) renders a realistic live preview of the printable card.

4. **Printable Card Component (`src/components/shared/QrCardPreview.tsx`)**:
   - Reusable component used both for the editor canvas preview and the pop-up modal.
   - Renders high-fidelity typography, borders, paper textures, personalized guest name, and the generated SVG/Canvas QR code.

5. **Guest Roster QR Card Pop-up Modal (`src/components/creator/QrCardModal.tsx`)**:
   - In both [DashboardView.tsx](file:///home/fenix3819/sigil-and-script/src/components/dashboard/DashboardView.tsx) and [InviteeRow.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/InviteeRow.tsx), add a **`🔲 QR`** button next to `Copy link`.
   - Clicking it opens a modal displaying the personalized QR card generated with the guest's unique link (`/invite/${invitee.id}`) and name.
   - Action buttons:
     - **🖨️ Print Card**: Triggers `window.print()` formatted with `@media print` CSS for exact physical dimensions.
     - **⬇️ Download PNG**: Downloads a high-resolution 300 DPI PNG file suitable for professional print shops.
     - **📋 Copy Link**: Quick access to copy the invite URL.

---

## Files to Create & Modify

| File | Modification | Purpose |
|---|---|---|
| `src/utils/qrcode.ts` | New | Zero-dependency TypeScript QR code generator (SVG & Canvas rendering). |
| `src/utils/qrcode.test.ts` | New | Unit tests verifying QR matrix calculation and SVG generation. |
| `src/types/sigil.types.ts` | Modify | Add `'QR'` to `PANEL_TABS` and declare `QrCardConfig` interface. |
| `src/components/creator/panel/panelStrings.ts` | Modify | Add bilingual strings for the QR tab and QR card modal. |
| `src/components/creator/panel/QrTab.tsx` | New | Editor panel tab for configuring physical QR card appearance. |
| `src/components/creator/panel/PanelShell.tsx` | Modify | Add the QR tab to navigation and render `QrTab`. |
| `src/components/shared/QrCardPreview.tsx` | New | Visual card component rendering the physical invitation with QR code. |
| `src/components/creator/QrCardModal.tsx` | New | Pop-up modal in guest roster displaying the guest's personalized QR card with print/download actions. |
| `src/components/creator/CreatorCanvas.tsx` | Modify | Render printable QR card preview when `panelTab === 'QR'`. |
| `src/components/dashboard/DashboardView.tsx` | Modify | Add "QR" button next to "Copy link" to launch `QrCardModal`. |
| `src/components/creator/InviteeRow.tsx` | Modify | Add "QR" button next to "📋 Link" to launch `QrCardModal`. |
| `src/styles/creator.css` | Modify | Styles for `QrTab`, `QrCardPreview`, `QrCardModal`, and print stylesheets. |

---

## Scope Constraints

- **In-Scope**:
  - Full editor panel tab (`QR`) with configurable theme, copy, size, and styling.
  - Live preview of the physical card in the editor canvas.
  - Per-guest QR card pop-up modal from both Roster views (`DashboardView` table and `InviteeRow` sidebar).
  - High-res PNG export (300 DPI canvas) and direct browser printing.
  - Optional center wax seal / logo in QR code.
- **Out-of-Scope**:
  - Integration with third-party commercial printing APIs (cards are printed locally or exported as image/PDF).
  - Dynamic NFC tag encoding.
