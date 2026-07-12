import React, { useState, useEffect } from 'react';
import { audioEngine } from '../../utils/audioEngine';
import { useSigilSelector } from '../../context/SigilContext';

interface EnvelopeWrapperProps {
  children?: React.ReactNode;
  onPhaseChange?: (phase: 'CLOSED' | 'CRACKING' | 'OPENING' | 'SLIDEOUT') => void;
  alwaysOpen?: boolean;
}

export function EnvelopeWrapper({ children, onPhaseChange, alwaysOpen }: EnvelopeWrapperProps) {
  const design = useSigilSelector((s) => s.design);

  // Phase states: 'CLOSED' | 'CRACKING' | 'OPENING' | 'SLIDEOUT'
  const [phase, setPhase] = useState<'CLOSED' | 'CRACKING' | 'OPENING' | 'SLIDEOUT'>(
    alwaysOpen ? 'SLIDEOUT' : 'CLOSED'
  );

  useEffect(() => {
    if (alwaysOpen) {
      setPhase('SLIDEOUT');
    }
  }, [alwaysOpen]);

  const handleSealClick = () => {
    if (phase !== 'CLOSED') return;
    setPhase('CRACKING');
    onPhaseChange?.('CRACKING');
    audioEngine.playCrack();

    setTimeout(() => {
      setPhase('OPENING');
      onPhaseChange?.('OPENING');
      setTimeout(() => {
        setPhase('SLIDEOUT');
        onPhaseChange?.('SLIDEOUT');
        audioEngine.playAmbient();
      }, 800);
    }, 600);
  };

  const envelopeColor = design.backgroundColor || 'var(--paper-parchment)';

  return (
    <div
      className={`envelope-wrapper phase-${phase.toLowerCase()} style-${design.envelopeStyle.toLowerCase()}`}
      style={{ '--envelope-color': envelopeColor } as React.CSSProperties}
    >
      <div className="envelope-container">
        {/* Back panel */}
        <div className="envelope-back" />

        {/* Flaps */}
        <div className="envelope-top-flap" />
        <div className="envelope-left-flap" />
        <div className="envelope-right-flap" />
        <div className="envelope-bottom-flap" />

        {/* Wax Seal */}
        {phase !== 'SLIDEOUT' && (
          <div
            className={`envelope-seal ${phase === 'CRACKING' ? 'cracking' : ''}`}
            onClick={handleSealClick}
            role="button"
            aria-label="Break wax seal and open invitation"
          >
            <div className="wax-seal-btn">
              <span>S</span>
              {phase === 'CRACKING' && <div className="seal-crack-line" />}
            </div>
          </div>
        )}

        {/* Couple Photo (Open Envelope image) tucked inside the pocket */}
        {(phase === 'SLIDEOUT' || phase === 'OPENING') && design.openedEnvelopeImage && (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -65%) rotate(-1.5deg)',
            width: '240px',
            height: '270px',
            zIndex: 3,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'stage-enter 0.6s ease-out',
          }}>
            <img
              src={design.openedEnvelopeImage}
              alt="Couple photo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '10px solid #ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        )}

        {/* Closed envelope decoration layer */}
        {(phase === 'CLOSED' || phase === 'CRACKING') && design.closedEnvelopeImage && (
          <img
            src={design.closedEnvelopeImage}
            alt="Closed envelope decoration"
            style={{
              position: 'absolute',
              right: '-60px',
              bottom: '-30px',
              width: '260px',
              height: 'auto',
              zIndex: 7,
              pointerEvents: 'none',
              animation: 'stage-enter 0.5s ease-out',
            }}
          />
        )}
      </div>
      {children}
    </div>
  );
}
export type { EnvelopeWrapperProps };
