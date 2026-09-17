import { useSigilStore } from '../../../state/sigilStore';
import type { QrCardConfig, QrCardSize, QrCardTheme } from '../../../types/sigil.types';
import { usePanelStrings } from './panelStrings';
import { CollapsibleGroup } from './CollapsibleGroup';
import { drawQrToCanvas } from '../../../utils/qrcode';

export function QrTab() {
  const design = useSigilStore((s) => s.design);
  const updateDesign = useSigilStore((s) => s.updateDesign);
  const { t } = usePanelStrings();

  const qrConfig: QrCardConfig = design.qrCard || {
    theme: 'PARCHMENT',
    cardSize: '4x6',
    orientation: 'PORTRAIT',
    includeGuestName: true,
    includeSealLogo: false,
    showDate: true,
    qrColor: '#2b2622',
  };

  const updateQr = (patch: Partial<QrCardConfig>) => {
    updateDesign({
      qrCard: {
        ...qrConfig,
        ...patch,
      },
    });
  };

  const handlePrintSample = () => {
    window.print();
  };

  const handleDownloadSamplePng = () => {
    const canvas = document.createElement('canvas');
    const sampleUrl = `${window.location.origin}/invite/sample-preview`;
    drawQrToCanvas(canvas, sampleUrl, {
      size: 900,
      margin: 3,
      darkColor: qrConfig.qrColor || (qrConfig.theme === 'MODERN_DARK' ? '#f5e6c8' : '#2b2622'),
      lightColor: qrConfig.theme === 'MODERN_DARK' ? '#1c1917' : '#ffffff',
      ecLevel: qrConfig.includeSealLogo ? 'H' : 'M',
    });

    const link = document.createElement('a');
    link.download = `invitation-qr-sample.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="lp-tab-content">
      {/* ── Theme and sizing ──────────────────────────────────────────────── */}
      <CollapsibleGroup title={t('qrGroupTheme')} defaultOpen>
        <div className="lp-field">
          <label className="lp-field-label" htmlFor="qr-theme-select">
            {t('qrThemeLabel')}
          </label>
          <select
            id="qr-theme-select"
            className="lp-input"
            value={qrConfig.theme || 'PARCHMENT'}
            onChange={(e) => updateQr({ theme: e.target.value as QrCardTheme })}
          >
            <option value="PARCHMENT">{t('qrThemeParchment')}</option>
            <option value="MINIMAL_WHITE">{t('qrThemeMinimalWhite')}</option>
            <option value="MODERN_DARK">{t('qrThemeModernDark')}</option>
            <option value="GOLDEN_BORDER">{t('qrThemeGoldenBorder')}</option>
          </select>
        </div>

        <div className="lp-field">
          <label className="lp-field-label" htmlFor="qr-size-select">
            {t('qrSizeLabel')}
          </label>
          <select
            id="qr-size-select"
            className="lp-input"
            value={qrConfig.cardSize || '4x6'}
            onChange={(e) => updateQr({ cardSize: e.target.value as QrCardSize })}
          >
            <option value="4x6">{t('qrSize4x6')}</option>
            <option value="3.5x2">{t('qrSize35x2')}</option>
            <option value="A6">{t('qrSizeA6')}</option>
            <option value="SQUARE">{t('qrSizeSquare')}</option>
          </select>
        </div>

        {qrConfig.cardSize !== 'SQUARE' && (
          <div className="lp-field">
            <label className="lp-field-label" htmlFor="qr-orientation-select">
              {t('qrOrientationLabel')}
            </label>
            <select
              id="qr-orientation-select"
              className="lp-input"
              value={qrConfig.orientation || 'PORTRAIT'}
              onChange={(e) => updateQr({ orientation: e.target.value as 'PORTRAIT' | 'LANDSCAPE' })}
            >
              <option value="PORTRAIT">{t('qrOrientationPortrait')}</option>
              <option value="LANDSCAPE">{t('qrOrientationLandscape')}</option>
            </select>
          </div>
        )}
      </CollapsibleGroup>

      {/* ── Content and personalization ───────────────────────────────────── */}
      <CollapsibleGroup title={t('qrGroupContent')} defaultOpen>
        <div className="lp-field">
          <label className="lp-field-label" htmlFor="qr-headline-input">
            {t('qrHeadlineLabel')}
          </label>
          <input
            id="qr-headline-input"
            type="text"
            className="lp-input"
            value={qrConfig.headline ?? ''}
            placeholder={t('qrHeadlinePlaceholder')}
            onChange={(e) => updateQr({ headline: e.target.value })}
          />
        </div>

        <div className="lp-field">
          <label className="lp-field-label" htmlFor="qr-instructions-input">
            {t('qrInstructionsLabel')}
          </label>
          <textarea
            id="qr-instructions-input"
            className="lp-input"
            rows={2}
            value={qrConfig.instructionsText ?? ''}
            placeholder={t('qrInstructionsDefault')}
            onChange={(e) => updateQr({ instructionsText: e.target.value })}
          />
        </div>

        <div className="lp-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              id="qr-include-guest"
              checked={qrConfig.includeGuestName ?? true}
              onChange={(e) => updateQr({ includeGuestName: e.target.checked })}
            />
            {t('qrIncludeGuestName')}
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              id="qr-include-seal"
              checked={qrConfig.includeSealLogo ?? false}
              onChange={(e) => updateQr({ includeSealLogo: e.target.checked })}
            />
            {t('qrIncludeSealLogo')}
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              id="qr-show-date"
              checked={qrConfig.showDate ?? true}
              onChange={(e) => updateQr({ showDate: e.target.checked })}
            />
            {t('qrShowDate')}
          </label>
        </div>

        <div className="lp-field" style={{ marginTop: '10px' }}>
          <label className="lp-field-label" htmlFor="qr-color-input">
            {t('qrColorLabel')}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              id="qr-color-input"
              type="color"
              value={qrConfig.qrColor || '#2b2622'}
              onChange={(e) => updateQr({ qrColor: e.target.value })}
              style={{ width: '42px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.8rem', opacity: 0.8, fontFamily: 'monospace' }}>
              {qrConfig.qrColor || '#2b2622'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '1.25rem' }}>
          <button
            type="button"
            className="qr-modal-btn qr-modal-btn--secondary"
            onClick={handlePrintSample}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {t('qrPrintSampleBtn')}
          </button>
          <button
            type="button"
            className="qr-modal-btn qr-modal-btn--primary"
            onClick={handleDownloadSamplePng}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {t('qrDownloadPngBtn')}
          </button>
        </div>
      </CollapsibleGroup>
    </div>
  );
}
