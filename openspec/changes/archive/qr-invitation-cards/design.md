# Design — QR Tab & Physical Printable Invitation Cards

## Architectural Decisions

1. **Zero-Dependency Native TypeScript QR Generator**:
   - Rather than pulling in an external npm package that requires dependency verification and creates supply-chain surface, we implement a self-contained, standard QR Code (ISO/IEC 18004) engine in `src/utils/qrcode.ts`.
   - Produces clean vector `<svg>` paths for DOM preview and can render to an offscreen `<canvas>` at 300 DPI for export and printing.
   - Automatically utilizes Error Correction Level **H** (~30% recovery) whenever a center seal/monogram logo is enabled, guaranteeing camera scans succeed even when the center modules are overlaid.

2. **Unified Card Renderer (`QrCardPreview.tsx`)**:
   - To ensure visual consistency between the editor preview and the guest roster modal, both render the same `QrCardPreview` component.
   - Props:
     - `config: QrCardConfig` (card styling, dimensions, layout)
     - `guestName?: string` (sample name in editor, real guest name in modal)
     - `inviteUrl: string` (placeholder/preview URL in editor, unique `/invite/:id` in modal)
     - `design: InvitationDesign` (inherits default fonts, title, wax seal asset, event date)
     - `mode: 'interactive' | 'print' | 'export'`

3. **Editor Canvas Preview Integration**:
   - In `CreatorCanvas.tsx`, when `panelTab === 'QR'`, the main workspace switches from rendering the digital envelope/letter viewport to a dedicated physical card preview stage (`.qr-card-preview-stage`).
   - The stage includes realistic paper drop-shadows, an aspect ratio frame reflecting the selected card size (4x6, 3.5x2, etc.), and quick action buttons ("Print Sample", "Download Sample").
   - Switching back to `EVENT`, `SECTIONS`, or `STYLE` immediately restores the envelope invitation stage.

4. **Print & Export Pipeline**:
   - **Print**: In `creator.css`, a dedicated `@media print` rule isolates `#printable-qr-card`, resetting margins and setting exact physical millimeter/inch page rules (`@page { size: auto; margin: 0; }`).
   - **Download PNG**: Uses `canvas.toBlob('image/png')` rendered at a 3x pixel ratio (scale factor) to produce crisp 300 DPI resolution suitable for home printers or professional print shops.

5. **Modal Accessibility & Experience (`QrCardModal.tsx`)**:
   - Follows the existing modal conventions in the repository (e.g. `CollaboratorModal.tsx`, `SeatingManifestModal.tsx`):
     - Focus trapping and Escape key dismissal.
     - Mobile-friendly responsive sizing with pinch/scroll support.
     - Single-click copy for the unique invitation URL alongside print and download buttons.

---

## Risks & Mitigations

- **Risk**: Center seal logo obscures too many QR data modules, making the QR unreadable.
  - **Mitigation**: Error Correction Level H allows up to 30% data loss. We restrict the center logo size to at most 20% of the QR code diameter, with a protective quiet zone ring around the logo.
- **Risk**: QR code URL is too long, resulting in a dense QR matrix that is hard to scan from small print sizes (e.g. 3.5x2" place cards).
  - **Mitigation**: The URL `/invite/:id` is very short (~36 characters), creating a low-version QR code (Version 3 or 4: 29x29 or 33x33 modules) with large, easily readable dots.
- **Risk**: Print margins cutting off borders on home printers.
  - **Mitigation**: Add a default safe print padding (at least 0.25 inches / 6mm) inside the card borders.
