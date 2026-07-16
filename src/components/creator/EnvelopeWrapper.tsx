import React, { useState, useEffect } from 'react';
import { audioEngine } from '../../utils/audioEngine';
import { useSigilSelector } from '../../context/SigilContext';

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

          // 4. Letter centers (600ms) -> Letter starts full viewport scaling (LETTER_SCALING)
          setTimeout(() => {
            setPhase('LETTER_SCALING');
            onPhaseChange?.('LETTER_SCALING');

            // 5. Scaling completes (800ms) -> Transition directly to COMPLETED
            setTimeout(() => {
              setPhase('COMPLETED');
              onPhaseChange?.('COMPLETED');
            }, 800);
          }, 600);
        }, 1000);
      }, 800);
    }, 600);
  };

  const headlineBlock = design.textBlocks?.find((b) => b.id === 'tb-headline');
  const titleText = headlineBlock ? headlineBlock.content : 'You Are Cordially Invited';

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

  // Paper letter internal content card layout
  const renderLetterContent = () => (
    <>
      <div className="envelope-letter-title">{titleText}</div>
      <div className="envelope-letter-names">{design.title || 'Marcos & Diana'}</div>
      <div className="envelope-letter-body">
        to share in our joy as we celebrate our wedding day.
        <div style={{ marginTop: '1.5rem', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', color: '#a08e7c', letterSpacing: '0.05em' }}>
          Prepared for
        </div>
        <div style={{ fontStyle: 'italic', fontSize: '1.1rem', marginTop: '0.2rem', color: '#333333' }}>
          {guest?.guestName || 'Esteemed Guest'}
        </div>
      </div>
    </>
  );

  return (
    <>
      {isEnvelopeVisible && (
        <div className="envelope-png-wrapper">
          {/* Header titles: fade in after seal cracking */}
          <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
            <h2 className={`envelope-header-title ${(phase !== 'CLOSED' && phase !== 'CRACKING') ? 'state-active' : ''}`}>
              {design.title || 'Marcos & Diana'}
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
                style={{
                  opacity: isPocketLetterVisible ? 1 : 0
                }}
              >
                {renderLetterContent()}
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
          <div className="envelope-letter-header">
            {renderLetterContent()}
          </div>
          {(phase === 'LETTER_SCALING' || phase === 'COMPLETED') && (
            <div className="envelope-letter-details-content">
              {children}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export type { EnvelopeWrapperProps };
