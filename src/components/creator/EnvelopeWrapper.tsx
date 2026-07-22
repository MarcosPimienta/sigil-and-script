import React, { useState, useEffect } from 'react';
import { audioEngine } from '../../utils/audioEngine';
import { useSigilSelector } from '../../context/SigilContext';
import { SvgColorImage } from '../common/SvgColorImage';
import { formatFullInvitationTitle } from '../../utils/formatGuestTitle';

interface EnvelopeWrapperProps {
  children?: React.ReactNode;
  onPhaseChange?: (
    phase:
      | 'CLOSED'
      | 'CRACKING'
      | 'OPENING'
      | 'LETTER_SLIDING'
      | 'LETTER_CENTERING'
      | 'LETTER_SCALING'
      | 'FADING_OUT'
      | 'COMPLETED'
  ) => void;
  alwaysOpen?: boolean;
}

export function EnvelopeWrapper({ children, onPhaseChange, alwaysOpen }: EnvelopeWrapperProps) {
  const design = useSigilSelector((s) => s.design);
  const guest = useSigilSelector((s) => s.guest);

  // Dynamic document title update based on guest & event
  useEffect(() => {
    if (guest && guest.name) {
      const fullTitle = formatFullInvitationTitle(
        guest,
        design.hostNames || design.title,
        design.language || 'ES'
      );
      if (fullTitle) {
        document.title = fullTitle;
      }
    }
  }, [guest, design.hostNames, design.title, design.language]);

  // Expanded cinematic states
  const [phase, setPhase] = useState<
    | 'CLOSED'
    | 'CRACKING'
    | 'OPENING'
    | 'LETTER_SLIDING'
    | 'LETTER_CENTERING'
    | 'LETTER_SCALING'
    | 'FADING_OUT'
    | 'COMPLETED'
  >(alwaysOpen ? 'LETTER_SLIDING' : 'CLOSED');

  useEffect(() => {
    setPhase(alwaysOpen ? 'LETTER_SLIDING' : 'CLOSED');
  }, [alwaysOpen, design.id]);

  const handleSealClick = () => {
    if (phase !== 'CLOSED') return;
    
    // Auto-enable sound on user gesture (wax seal click) to bypass autoplay blocks
    audioEngine.setMute(false);
    
    setPhase('CRACKING');
    onPhaseChange?.('CRACKING');
    audioEngine.playCrack();

    // 1. Shakes and cracks (600ms) -> Flap open begins (OPENING)
    setTimeout(() => {
      setPhase('OPENING');
      onPhaseChange?.('OPENING');

      // 2. Flap swinging up (800ms) -> Letter starts sliding (LETTER_SLIDING)
      setTimeout(() => {
        setPhase('LETTER_SLIDING');
        onPhaseChange?.('LETTER_SLIDING');
        audioEngine.playAmbient();

        // 3. Letter completes slide-up (1000ms) -> Letter starts centering in front (LETTER_CENTERING)
        setTimeout(() => {
          setPhase('LETTER_CENTERING');
          onPhaseChange?.('LETTER_CENTERING');

          // 4. Letter centers, flips and scales (800ms) -> Letter starts full viewport scaling (LETTER_SCALING)
          setTimeout(() => {
            setPhase('LETTER_SCALING');
            onPhaseChange?.('LETTER_SCALING');

            // 5. Scaling completes (800ms) -> Transition directly to COMPLETED
            setTimeout(() => {
              setPhase('COMPLETED');
              onPhaseChange?.('COMPLETED');
            }, 800);
          }, 800);
        }, 1000);
      }, 800);
    }, 600);
  };

  const headlineBlock = design.textBlocks?.find((b) => b.id === 'tb-headline');
  const hostNames = headlineBlock ? headlineBlock.content : 'Marcos & Diana';

  const getFormattedDateFields = (targetDateStr?: string) => {
    const defaultFields = {
      dayOfWeek: 'Jueves',
      dayOfMonth: '17',
      monthName: 'SEPTIEMBRE',
      year: '2026'
    };
    if (!targetDateStr) return defaultFields;
    try {
      const d = new Date(targetDateStr);
      if (isNaN(d.getTime())) return defaultFields;
      
      const weekdaysSpanish = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const monthsSpanish = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
      ];
      
      return {
        dayOfWeek: weekdaysSpanish[d.getDay()],
        dayOfMonth: String(d.getDate()),
        monthName: monthsSpanish[d.getMonth()],
        year: String(d.getFullYear())
      };
    } catch {
      return defaultFields;
    }
  };

  const formatEventDate = (target?: string) => {
    if (!target) return '17 / 09 / 2026';
    try {
      const d = new Date(target);
      if (isNaN(d.getTime())) return '17 / 09 / 2026';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day} / ${month} / ${year}`;
    } catch {
      return '17 / 09 / 2026';
    }
  };

  const dateText = formatEventDate(design.countdownTarget);

  const isEnvelopeVisible = phase !== 'COMPLETED';
  const isPocketLetterVisible = phase === 'OPENING' || phase === 'LETTER_SLIDING';
  const isViewportOverlayVisible = phase === 'LETTER_CENTERING' || phase === 'LETTER_SCALING' || phase === 'FADING_OUT' || phase === 'COMPLETED';

  const renderLogoFace = () => {
    return (
      <div className="letter-logo-face" style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {design.openedEnvelopeImage ? (
          <img 
            src={design.openedEnvelopeImage} 
            alt="Event Logo"
            style={{
              maxWidth: `${Math.round(220 * ((design.openedEnvelopeImageScale ?? 100) / 100))}px`,
              maxHeight: `${Math.round(280 * ((design.openedEnvelopeImageScale ?? 100) / 100))}px`,
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
            }}
          />
        ) : (
          <div style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            border: '2px double rgba(160, 142, 124, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(160, 142, 124, 0.03)',
            boxShadow: 'inset 0 0 15px rgba(160, 142, 124, 0.1)',
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2.4rem',
              color: '#a08e7c',
              fontWeight: 300,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              {hostNames.split('&').map(n => n.trim().charAt(0)).join(' & ')}
            </span>
          </div>
        )}
        </div>
      </div>
    );
  };

  // Paper letter internal content card layout
  const renderLetterContent = () => {
    const { dayOfWeek, dayOfMonth, monthName, year } = getFormattedDateFields(design.countdownTarget);
    return (
      <div className="envelope-letter-content-wrapper" style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0.8rem 1rem',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: "'Cormorant Garamond', serif",
        lineHeight: 1.2,
        color: '#333333'
      }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/* Event Title Artwork (above title text) */}
        {design.headerImage && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            margin: '0 auto 0.5rem auto',
          }}>
            <SvgColorImage
              src={design.headerImage}
              alt="Event Title Artwork"
              color="#111111"
              maxWidth={Math.round(280 * ((design.headerImageScale ?? 100) / 100))}
              maxHeight={Math.round(180 * ((design.headerImageScale ?? 100) / 100))}
            />
          </div>
        )}

        <span className="letter-invite-prompt" style={{
          fontSize: '0.58rem',
          letterSpacing: '0.12em',
          color: '#8c7d6b',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: '0.2rem',
        }}>
          tenemos el honor de invitarte al
        </span>

        <h3 className="letter-cursive-title" style={{
          fontFamily: "'Pinyon Script', cursive",
          fontSize: '2.8rem',
          fontWeight: 400,
          color: '#4c4844',
          margin: '0 0 0.2rem 0',
        }}>
          {design.title || 'Nuestra Boda'}
        </h3>

        <span className="letter-month-name" style={{
          fontSize: '0.62rem',
          letterSpacing: '0.15em',
          color: '#4c4844',
          fontWeight: 600,
          textTransform: 'uppercase',
          marginBottom: '0.4rem',
        }}>
          {monthName}
        </span>

        {/* Structured Date Block */}
        <div className="letter-date-block" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.8rem',
          margin: '0.2rem 0 0.6rem 0',
          width: '100%'
        }}>
          <div className="letter-date-dayofweek" style={{
            borderTop: '0.8px solid rgba(160, 142, 124, 0.4)',
            borderBottom: '0.8px solid rgba(160, 142, 124, 0.4)',
            padding: '2px 0',
            fontSize: '0.72rem',
            letterSpacing: '0.05em',
            color: '#7a6b58',
            minWidth: '55px',
            textTransform: 'uppercase',
            fontWeight: 500
          }}>
            {dayOfWeek}
          </div>

          <div className="letter-date-dayofmonth" style={{
            fontSize: '2.2rem',
            fontWeight: 300,
            color: '#333333',
            lineHeight: 1,
            fontFamily: "'Cormorant Garamond', serif",
          }}>
            {dayOfMonth}
          </div>

          <div className="letter-date-year" style={{
            borderTop: '0.8px solid rgba(160, 142, 124, 0.4)',
            borderBottom: '0.8px solid rgba(160, 142, 124, 0.4)',
            padding: '2px 0',
            fontSize: '0.72rem',
            letterSpacing: '0.05em',
            color: '#7a6b58',
            minWidth: '55px',
            fontWeight: 500
          }}>
            {year}
          </div>
        </div>

        {/* Location */}
        <span className="letter-location" style={{
          fontSize: '0.58rem',
          letterSpacing: '0.1em',
          color: '#8c7d6b',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginTop: '0.1rem',
        }}>
          {guest?.eventLocation || 'San José, cuyo poder sabe hacer posibles las cosas imposibles'}
        </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {isEnvelopeVisible && (
        <div className="envelope-png-wrapper">
          {/* Header titles: fade in after seal cracking */}
          <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
            {design.headerImage && (
              <div style={{ marginBottom: '0.4rem' }}>
                <SvgColorImage
                  src={design.headerImage}
                  alt="Event Title Artwork"
                  color="var(--paper-parchment, #f4ecd8)"
                  maxWidth={Math.round(200 * ((design.headerImageScale ?? 100) / 100))}
                  maxHeight={Math.round(100 * ((design.headerImageScale ?? 100) / 100))}
                />
              </div>
            )}
            <h2 className="envelope-header-title">
              {hostNames}
            </h2>
            <div className="envelope-header-date">
              {dateText}
            </div>
          </div>

          <div className="envelope-png-container">
            {/* Closed Envelope */}
            <img
              src="/ClosedEnvelope00.png"
              alt="Closed Envelope"
              className="envelope-png-layer layer-closed"
              style={{
                opacity: (phase === 'CLOSED' || phase === 'CRACKING') ? 1 : 0
              }}
            />

            {/* Opened Envelope */}
            <img
              src="/OpenedEnvelope00.png"
              alt="Opened Envelope"
              className="envelope-png-layer layer-opened"
              style={{
                opacity: (phase === 'CLOSED' || phase === 'CRACKING') ? 0 : 1
              }}
            />

            {/* Paper Letter inside envelope pocket */}
            <div className="envelope-pocket-clipper">
              <div 
                className={`envelope-couple-photo ${isPocketLetterVisible ? 'state-active' : ''}`}
                style={{ opacity: isPocketLetterVisible ? 1 : 0 }}
              >
                {design.paperImage && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${design.paperImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    mixBlendMode: 'multiply',
                    filter: `brightness(${design.paperBrightness ?? 1.0}) contrast(${design.paperContrast ?? 1.0}) saturate(${design.paperSaturate ?? 1.0})`,
                    pointerEvents: 'none',
                    zIndex: 0,
                    borderRadius: 'inherit'
                  }} />
                )}
                {renderLogoFace()}
              </div>
            </div>

            {/* Wax Seal Button centered */}
            {(phase === 'CLOSED' || phase === 'CRACKING') && (
              <div
                className={`envelope-seal ${phase === 'CRACKING' ? 'cracking' : ''}`}
                onClick={handleSealClick}
                role="button"
                aria-label="Break wax seal and open invitation"
                style={{
                  ['--seal-scale' as any]: (design.sealSize ?? 75) / 75
                }}
              >
                {design.stickerImage ? (
                  <img
                    src={design.stickerImage}
                    alt="Sticker seal"
                    className="envelope-sticker-image"
                  />
                ) : (
                  <div className="wax-seal-btn">
                    <span>S</span>
                    {phase === 'CRACKING' && <div className="seal-crack-line" />}
                  </div>
                )}
              </div>
            )}
          </div>

          {alwaysOpen && children}
        </div>
      )}

      {/* Floating full-screen scale-up overlay copy */}
      {isViewportOverlayVisible && (
        <div 
          className={`envelope-letter-viewport-overlay ${phase === 'LETTER_CENTERING' ? 'state-centering' : ''} ${phase === 'LETTER_SCALING' ? 'state-scaled' : ''} ${phase === 'FADING_OUT' ? 'state-fade-out' : ''} ${phase === 'COMPLETED' ? 'state-completed' : ''}`}
        >
          {design.paperImage && (
            <div style={{
              position: phase === 'COMPLETED' ? 'sticky' : 'absolute',
              top: phase === 'COMPLETED' ? '-60px' : 0, 
              left: 0, right: 0,
              bottom: phase === 'COMPLETED' ? 'auto' : 0,
              height: phase === 'COMPLETED' ? 0 : 'auto',
              alignSelf: phase === 'COMPLETED' ? 'stretch' : 'auto',
              margin: phase === 'COMPLETED' ? '-60px -24px 0 -24px' : 0,
              pointerEvents: 'none', zIndex: 0,
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                bottom: phase === 'COMPLETED' ? 'auto' : 0,
                height: phase === 'COMPLETED' ? '100vh' : 'auto',
                backgroundImage: `url(${design.paperImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                mixBlendMode: 'multiply',
                filter: `brightness(${design.paperBrightness ?? 1.0}) contrast(${design.paperContrast ?? 1.0}) saturate(${design.paperSaturate ?? 1.0})`,
                borderRadius: 'inherit'
              }} />
            </div>
          )}
          <div className="envelope-letter-header" style={{ position: 'relative', zIndex: 1 }}>
            {phase === 'LETTER_CENTERING' ? (
              <div className="letter-flip-card" style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
              }}>
                {/* Front Face: Logo */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(0deg)',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {renderLogoFace()}
                </div>

                {/* Back Face: Invitation text */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {renderLetterContent()}
                </div>
              </div>
            ) : (
              renderLetterContent()
            )}
          </div>
          {(phase === 'LETTER_SCALING' || phase === 'COMPLETED') && (
            <div className="envelope-letter-details-content" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
              {children}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export type { EnvelopeWrapperProps };
