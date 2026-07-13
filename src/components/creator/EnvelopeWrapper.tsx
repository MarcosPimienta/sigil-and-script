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

  const headlineBlock = design.textBlocks?.find((b) => b.id === 'tb-headline');
  const titleText = headlineBlock ? headlineBlock.content : 'Oscar & Rocio';
  const photoSrc = design.openedEnvelopeImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600';

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

  return (
    <div className="envelope-png-wrapper">
      {/* Event Header: Title and Date fading & sliding up */}
      <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
        <h2 className={`envelope-header-title ${(phase === 'OPENING' || phase === 'SLIDEOUT') ? 'state-active' : ''}`}>
          {titleText}
        </h2>
        <div className="envelope-header-date">
          {dateText}
        </div>
      </div>

      <div className="envelope-png-container">
        {/* Closed Envelope PNG Image Layer */}
        <img
          src="/ClosedEnvelope00.png"
          alt="Closed Envelope"
          className="envelope-png-layer layer-closed"
          style={{
            opacity: (phase === 'CLOSED' || phase === 'CRACKING') ? 1 : 0
          }}
          onError={(e) => {
            // Fallback border box styling if local file is missing initially
            e.currentTarget.style.border = '2px dashed rgba(255,255,255,0.15)';
            e.currentTarget.style.borderRadius = '8px';
          }}
        />

        {/* Opened Envelope PNG Image Layer */}
        <img
          src="/OpenedEnvelope00.png"
          alt="Opened Envelope"
          className="envelope-png-layer layer-opened"
          style={{
            opacity: (phase === 'CLOSED' || phase === 'CRACKING') ? 0 : 1
          }}
          onError={(e) => {
            // Fallback border box styling if local file is missing initially
            e.currentTarget.style.border = '2px dashed rgba(255,255,255,0.15)';
            e.currentTarget.style.borderRadius = '8px';
          }}
        />

        {/* Couple Photo sliding/fading layer inside pocket clipper */}
        <div className="envelope-pocket-clipper">
          <div className={`envelope-couple-photo ${(phase === 'OPENING' || phase === 'SLIDEOUT') ? 'state-active' : ''}`}>
            <img
              src={photoSrc}
              alt="Couple photo"
            />
          </div>
        </div>

        {/* Wax Seal Button centered */}
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
      </div>

      {children}
    </div>
  );
}
export type { EnvelopeWrapperProps };
