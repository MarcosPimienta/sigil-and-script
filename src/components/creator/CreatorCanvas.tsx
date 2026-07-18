import { useState, useEffect } from 'react';
import { Toolbar } from './Toolbar';
import { LeftPanel } from './LeftPanel';
import { RecipientRsvpPanel } from './RecipientRsvpPanel';
import { EnvelopeWrapper } from './EnvelopeWrapper';
import { CountdownTimer } from './CountdownTimer';
import { ItineraryTimeline } from './ItineraryTimeline';
import { DressCodePanel } from './DressCodePanel';
import { GiftsRegistryPanel } from './GiftsRegistryPanel';
import { AudioControls } from './AudioControls';
import { AudioToggle } from '../shared/AudioToggle';
import { useSigil } from '../../context/SigilContext';
import { audioEngine } from '../../utils/audioEngine';

export function CreatorCanvas() {
  const { state } = useSigil();
  const isRecipient = state.appMode === 'RECIPIENT';

  // Sync background song url on load / update to prevent async browser play blocks
  useEffect(() => {
    if (state.design.musicUrl) {
      audioEngine.setSongUrl(state.design.musicUrl);
    } else {
      audioEngine.setSongUrl(null);
    }
  }, [state.design.musicUrl]);

  // State phases: 'CLOSED' | 'CRACKING' | 'OPENING' | 'LETTER_SLIDING' | 'LETTER_CENTERING' | 'LETTER_SCALING' | 'FADING_OUT' | 'COMPLETED'
  const [envelopePhase, setEnvelopePhase] = useState<
    | 'CLOSED'
    | 'CRACKING'
    | 'OPENING'
    | 'LETTER_SLIDING'
    | 'LETTER_CENTERING'
    | 'LETTER_SCALING'
    | 'FADING_OUT'
    | 'COMPLETED'
  >('CLOSED');

  const showRosterDetails = envelopePhase === 'FADING_OUT' || envelopePhase === 'COMPLETED';

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
            overflowY: (showRosterDetails || !isRecipient) ? 'auto' : 'hidden',
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: (isRecipient && envelopePhase !== 'COMPLETED') ? 'center' : 'flex-start',
          }}>
            <div style={{ maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {isRecipient ? (
                /* ── Recipient/Guest View ── */
                /* ── Recipient/Guest View ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', width: '100%' }}>
                  <EnvelopeWrapper
                    onPhaseChange={setEnvelopePhase}
                    alwaysOpen={false}
                  >
                    <div className="recipient-invite-details state-visible" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                      <AudioControls musicUrl={state.design.musicUrl} />
                      <CountdownTimer />
                      <ItineraryTimeline />
                      <DressCodePanel />
                      <GiftsRegistryPanel />

                      {/* RSVP at the bottom */}
                      <div style={{ marginTop: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3 style={{
                          fontSize: '1.8rem',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          margin: '0 0 1rem 0',
                          fontFamily: "'Cormorant Garamond', serif",
                          color: '#4c4844',
                        }}>
                          Confirmar Asistencia
                        </h3>
                        <RecipientRsvpPanel />
                      </div>
                    </div>
                  </EnvelopeWrapper>
                  
                  {(envelopePhase === 'CLOSED' || envelopePhase === 'CRACKING') ? (
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
                  ) : null}
                </div>
              ) : (
                /* ── Host Editor View ── */
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
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
                    
                    <EnvelopeWrapper
                      onPhaseChange={setEnvelopePhase}
                      alwaysOpen={false}
                    />

                    <div style={{
                      textAlign: 'center',
                      marginTop: '0.5rem',
                      fontFamily: "'Cormorant Garamond', serif",
                      color: '#ffffff',
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
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px dashed rgba(255, 255, 255, 0.25)', margin: '1rem 0', width: '100%' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
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
                    
                    <EnvelopeWrapper
                      alwaysOpen={true}
                    />

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
                </>
              )}

              {/* Additional wedding sections, only visible during host editing */}
              {!isRecipient && (
                <div className="recipient-invite-details state-visible">


                  <AudioControls musicUrl={state.design.musicUrl} />
                  <CountdownTimer />
                  <ItineraryTimeline />
                  <DressCodePanel />
                  <GiftsRegistryPanel />

                  {/* RSVP at the bottom */}
                  <div style={{ marginTop: '1.5rem', width: '100%' }}>
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
                </div>
              )}
            </div>
             <AudioToggle />
          </div>
        </main>
      </div>
    </div>
  );
}
