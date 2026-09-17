import { useMemo } from 'react';
import type { InvitationDesign, QrCardConfig } from '../../types/sigil.types';
import { generateQrSvg } from '../../utils/qrcode';
import { formatEventTitleFor } from '../../utils/eventPhrasing';
import { panelText } from '../creator/panel/panelStrings';

export interface QrCardPreviewProps {
  config?: QrCardConfig;
  design: InvitationDesign;
  guestName?: string;
  inviteUrl: string;
  lang?: 'ES' | 'EN';
  id?: string;
  className?: string;
}

export function QrCardPreview({
  config,
  design,
  guestName,
  inviteUrl,
  lang = 'ES',
  id = 'printable-qr-card',
  className = '',
}: QrCardPreviewProps) {
  const theme = config?.theme || 'PARCHMENT';
  const size = config?.cardSize || '4x6';
  const orientation = config?.orientation || 'PORTRAIT';
  const includeGuestName = config?.includeGuestName ?? true;
  const includeSeal = config?.includeSealLogo ?? false;
  const showDate = config?.showDate ?? true;

  const headline = config?.headline?.trim() || formatEventTitleFor(design.title || '', design.eventType, lang);
  const instructions = config?.instructionsText?.trim() || panelText('qrInstructionsDefault', lang);

  const formattedDate = useMemo(() => {
    if (!showDate || !design.countdownTarget) return null;
    const date = new Date(design.countdownTarget);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [showDate, design.countdownTarget, lang]);

  const qrDarkColor = config?.qrColor || (theme === 'MODERN_DARK' ? '#f5e6c8' : '#2b2622');
  const qrLightColor = theme === 'MODERN_DARK' ? '#1c1a17' : 'transparent';

  const qrSvgMarkup = useMemo(() => {
    return generateQrSvg(inviteUrl || 'https://sigil-and-script.vercel.app', {
      size: 200,
      margin: 2,
      darkColor: qrDarkColor,
      lightColor: qrLightColor,
      ecLevel: includeSeal ? 'H' : 'M',
    });
  }, [inviteUrl, qrDarkColor, qrLightColor, includeSeal]);

  const sealImgSrc = design.stickerImage || null;

  return (
    <div
      id={id}
      className={`qr-card-preview theme-${theme.toLowerCase()} size-${size.replace('.', '')} orientation-${orientation.toLowerCase()} ${className}`}
    >
      <div className="qr-card-inner-frame">
        {/* Header Artwork / Seal badge if top layout */}
        <header className="qr-card-header">
          <h2 className="qr-card-title">{headline}</h2>
          {formattedDate && <p className="qr-card-date">{formattedDate}</p>}
        </header>

        {/* Guest Name Personalization */}
        {includeGuestName && (
          <div className="qr-card-guest">
            <span className="qr-card-guest-prefix">{lang === 'EN' ? 'To:' : 'Para:'}</span>
            <span className="qr-card-guest-name">
              {guestName || panelText('qrSampleGuest', lang)}
            </span>
          </div>
        )}

        {/* QR Code Container */}
        <div className="qr-card-code-wrapper">
          <div
            className="qr-card-svg-container"
            dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
          />

          {includeSeal && sealImgSrc && (
            <div className="qr-card-center-logo" aria-hidden="true">
              <img src={sealImgSrc} alt="Seal" />
            </div>
          )}
        </div>

        {/* Scan Call-to-action */}
        <footer className="qr-card-footer">
          <p className="qr-card-instructions">{instructions}</p>
          <p className="qr-card-url">{inviteUrl.replace(/^https?:\/\//, '')}</p>
        </footer>
      </div>
    </div>
  );
}
