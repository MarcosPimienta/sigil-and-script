# Tasks — QR Tab & Physical Printable Invitation Cards

## 1. QR Code Engine & Utilities
- [x] 1.1 Implement zero-dependency TypeScript QR code generator in [src/utils/qrcode.ts](file:///home/fenix3819/sigil-and-script/src/utils/qrcode.ts) supporting SVG string and Canvas rendering with Error Correction Levels.
- [x] 1.2 Write unit tests in [src/utils/qrcode.test.ts](file:///home/fenix3819/sigil-and-script/src/utils/qrcode.test.ts) verifying matrix generation, valid SVG output, and error-correction levels.

## 2. Types & Configuration
- [x] 2.1 Add `'QR'` to `PANEL_TABS` in [src/types/sigil.types.ts](file:///home/fenix3819/sigil-and-script/src/types/sigil.types.ts).
- [x] 2.2 Define `QrCardTheme`, `QrCardSize`, and `QrCardConfig` in [src/types/sigil.types.ts](file:///home/fenix3819/sigil-and-script/src/types/sigil.types.ts) and add `qrCard?: QrCardConfig;` to `InvitationDesign`.
- [x] 2.3 Initialize default `qrCard` values in `DEFAULT_DESIGN` in [src/state/sigilStore.ts](file:///home/fenix3819/sigil-and-script/src/state/sigilStore.ts).

## 3. Localization
- [x] 3.1 Add bilingual strings (EN & ES) for QR tab, card sizes, themes, instructions, and modal buttons in [src/components/creator/panel/panelStrings.ts](file:///home/fenix3819/sigil-and-script/src/components/creator/panel/panelStrings.ts).

## 4. Printable Card Component
- [x] 4.1 Create [src/components/shared/QrCardPreview.tsx](file:///home/fenix3819/sigil-and-script/src/components/shared/QrCardPreview.tsx) with theme styling, typography, optional center seal, and embedded SVG QR code.
- [x] 4.2 Add card styles, aspect ratios (4x6, 3.5x2, A6, Square), and print stylesheets in [src/styles/creator.css](file:///home/fenix3819/sigil-and-script/src/styles/creator.css).

## 5. Editor Studio Integration
- [x] 5.1 Create [src/components/creator/panel/QrTab.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/panel/QrTab.tsx) with controls for theme, size, copy, colors, and toggles.
- [x] 5.2 Mount `QrTab` in [src/components/creator/panel/PanelShell.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/panel/PanelShell.tsx) with tab navigation icon.
- [x] 5.3 Update [src/components/creator/CreatorCanvas.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CreatorCanvas.tsx) to render `QrCardPreview` when `panelTab === 'QR'`.

## 6. Guest Roster Pop-up Modal
- [x] 6.1 Create [src/components/creator/QrCardModal.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/QrCardModal.tsx) displaying the guest's personalized QR card, print button, high-res PNG download, and copy link action.
- [x] 6.2 Add "QR" button in [src/components/dashboard/DashboardView.tsx](file:///home/fenix3819/sigil-and-script/src/components/dashboard/DashboardView.tsx) next to `CopyLinkCell`.
- [x] 6.3 Add "QR" button in [src/components/creator/InviteeRow.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/InviteeRow.tsx) next to `📋 Link`.

## 7. Verification & Automated Tests
- [x] 7.1 Write unit tests in `QrTab.test.tsx` and `QrCardModal.test.tsx` verifying card configuration updates and modal interactions.
- [x] 7.2 Run full test suite (`npm test`) and typecheck (`npx tsc -b`) to ensure no regressions.
