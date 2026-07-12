import { useState } from 'react';
import { Toolbar } from './Toolbar';
import { LeftPanel } from './LeftPanel';
import { RecipientRsvpPanel } from './RecipientRsvpPanel';
import { EnvelopeWrapper } from './EnvelopeWrapper';
import { CountdownTimer } from './CountdownTimer';
import { ItineraryTimeline } from './ItineraryTimeline';
import { DressCodePanel } from './DressCodePanel';
import { GiftsRegistryPanel } from './GiftsRegistryPanel';
import { AudioToggle } from '../shared/AudioToggle';
import { useSigil } from '../../context/SigilContext';

export function CreatorCanvas() {
  const { state } = useSigil();
  const isRecipient = state.appMode === 'RECIPIENT';

  const [envelopePhase, setEnvelopePhase] = useState<'CLOSED' | 'CRACKING' | 'OPENING' | 'SLIDEOUT'>('CLOSED');
  const isOpened = envelopePhase === 'SLIDEOUT';

  return (
    <div
      className="creator-canvas"
      data-mode={state.appMode}
      data-texture={state.design.paperTexture}
    >
      {/* ── Top Navigation ─── */}
      <Toolbar />

      {/* ── Workspace ─── */}
      <div className="creator-workspace">
        {/* Left control panel (hidden in recipient mode) */}
        {!isRecipient && <LeftPanel />}

        {/* Right canvas / preview area */}
        <main className="creator-preview-area" aria-label="Invitation preview canvas" style={{
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          height: '100%',
        }}>
          {/* Ambient backdrop */}
          <div className="preview-backdrop" aria-hidden="true" />

          <div className="recipient-scroll-container" style={{
            width: '100%',
            height: '100%',
            overflowY: (isOpened || !isRecipient) ? 'auto' : 'hidden',
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{ maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* ── SECTION 1: Closed Envelope Preview (Host mode OR Guest closed envelope) ── */}
              {(!isRecipient || !isOpened) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                  {!isRecipient && (
                    <h4 style={{
                      fontSize: '0.8rem',
                      letterSpacing: '0.12em',
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                      margin: '0 0 -0.5rem 0',
                      fontFamily: 'sans-serif',
                      fontWeight: 600
                    }}>
                      Vista: Sobre Cerrado
                    </h4>
                  )}
                  


                  <EnvelopeWrapper
                    onPhaseChange={setEnvelopePhase}
                    alwaysOpen={false}
                  />

                  {/* Personalized guest card rendered below closed envelope */}
                  <div style={{
                    textAlign: 'center',
                    marginTop: '0.5rem',
                    fontFamily: "'Cormorant Garamond', serif",
                    color: '#ffffff',
                    animation: 'stage-enter 0.5s ease-out'
                  }}>
                    <h4 style={{
                      fontSize: '1.6rem',
                      fontWeight: 500,
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>
                      {state.guest.guestName}
                    </h4>
                    <p style={{
                      fontSize: '1.1rem',
                      color: 'rgba(255, 255, 255, 0.7)',
                      margin: '0.5rem 0 0 0',
                      fontStyle: 'italic',
                    }}>
                      Hemos reservado ({1 + (state.guest.additionalGuests?.length || 0)}) {1 + (state.guest.additionalGuests?.length || 0) === 1 ? 'cupo' : 'cupos'} para ti
                    </p>
                    <p style={{
                      fontSize: '0.85rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: '1rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase'
                    }}>
                      Da clic para abrir la invitación
                    </p>
                  </div>
                </div>
              )}

              {/* Dotted delimiter divider for Host View only */}
              {!isRecipient && (
                <hr style={{ border: 'none', borderTop: '1px dashed rgba(255, 255, 255, 0.25)', margin: '1rem 0', width: '100%' }} />
              )}

              {/* ── SECTION 2: Opened Envelope / Card Slideout (Host mode OR Guest opened envelope) ── */}
              {(!isRecipient || isOpened) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                  {!isRecipient && (
                    <h4 style={{
                      fontSize: '0.8rem',
                      letterSpacing: '0.12em',
                      color: 'rgba(255,255,255,0.4)',
                      textTransform: 'uppercase',
                      margin: '0 0 -0.5rem 0',
                      fontFamily: 'sans-serif',
                      fontWeight: 600
                    }}>
                      Vista: Invitación Abierta (Editable)
                    </h4>
                  )}
                  


                  {/* Opened Pocket Envelope containing the photo */}
                  <EnvelopeWrapper
                    alwaysOpen={true}
                  />

                  {/* Music play call to action */}
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    textAlign: 'center',
                    margin: '0.5rem 0 0 0',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                  }}>
                    Dale play para escuchar nuestra canción
                  </p>
                </div>
              )}

              {/* Additional wedding sections, only visible after envelope slideout or during host editing */}
              {(isOpened || !isRecipient) && (
                <>
                  <CountdownTimer />
                  <ItineraryTimeline />
                  <DressCodePanel />
                  <GiftsRegistryPanel />

                  {/* RSVP at the bottom */}
                  <div style={{ marginTop: '1.5rem', animation: 'stage-enter 0.6s ease-out' }}>
                    <h3 style={{
                      fontSize: '1.8rem',
                      fontStyle: 'italic',
                      textAlign: 'center',
                      margin: '0 0 1rem 0',
                      fontFamily: "'Cormorant Garamond', serif",
                      color: '#ffffff',
                    }}>
                      Confirmar Asistencia
                    </h3>
                    <RecipientRsvpPanel />
                  </div>
                </>
              )}
            </div>
            {isRecipient && <AudioToggle />}
          </div>
        </main>
      </div>
    </div>
  );
}
