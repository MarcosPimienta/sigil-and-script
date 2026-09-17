import { useState, useEffect, useCallback } from 'react';
import type { InviteeRecord } from '../../types/sigil.types';
import { useSigilStore } from '../../state/sigilStore';
import { QrCardPreview } from '../shared/QrCardPreview';
import { drawQrToCanvas } from '../../utils/qrcode';
import { usePanelStrings } from './panel/panelStrings';

export interface QrCardModalProps {
  invitee: InviteeRecord;
  onClose: () => void;
}

export function QrCardModal({ invitee, onClose }: QrCardModalProps) {
  const design = useSigilStore((s) => s.design);
  const { t } = usePanelStrings();
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/invite/${invitee.id}`;
  const effectiveLang = invitee.language || (design.language === 'EN' ? 'EN' : 'ES');

  // Dismiss on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    const canvas = document.createElement('canvas');
    const qrConfig = design.qrCard;
    drawQrToCanvas(canvas, inviteUrl, {
      size: 1000,
      margin: 3,
      darkColor: qrConfig?.qrColor || (qrConfig?.theme === 'MODERN_DARK' ? '#f5e6c8' : '#2b2622'),
      lightColor: qrConfig?.theme === 'MODERN_DARK' ? '#1c1917' : '#ffffff',
      ecLevel: qrConfig?.includeSealLogo ? 'H' : 'M',
    });

    const cleanName = invitee.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const link = document.createElement('a');
    link.download = `qr-invite-${cleanName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [design.qrCard, inviteUrl, invitee.name]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t('qrModalCopyLink'), inviteUrl);
    }
  }, [inviteUrl, t]);

  return (
    <div
      className="qr-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-heading"
    >
      <div
        className="qr-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="qr-modal-header">
          <div>
            <h3 id="qr-modal-heading">{t('qrModalTitle')}</h3>
            <p>{t('qrModalSubtitle')}</p>
          </div>
          <button
            type="button"
            className="qr-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        <div className="qr-modal-preview-wrapper">
          <QrCardPreview
            config={design.qrCard}
            design={design}
            guestName={invitee.name}
            inviteUrl={inviteUrl}
            lang={effectiveLang}
          />
        </div>

        <footer className="qr-modal-actions">
          <button
            type="button"
            className="qr-modal-btn qr-modal-btn--secondary"
            onClick={handleCopyLink}
          >
            {copied ? '✓ Copied!' : t('qrModalCopyLink')}
          </button>

          <button
            type="button"
            className="qr-modal-btn qr-modal-btn--secondary"
            onClick={handleDownload}
          >
            {t('qrModalDownload')}
          </button>

          <button
            type="button"
            className="qr-modal-btn qr-modal-btn--primary"
            onClick={handlePrint}
          >
            {t('qrModalPrint')}
          </button>
        </footer>
      </div>
    </div>
  );
}
