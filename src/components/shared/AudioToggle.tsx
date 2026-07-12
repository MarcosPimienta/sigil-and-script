import { useState } from 'react';
import { audioEngine } from '../../utils/audioEngine';

export function AudioToggle() {
  const [muted, setMuted] = useState(audioEngine.getMuted());

  const handleToggle = () => {
    const nextMute = !muted;
    audioEngine.setMute(nextMute);
    setMuted(nextMute);
  };

  return (
    <button
      id="floating-audio-toggle"
      onClick={handleToggle}
      aria-label={muted ? 'Unmute ambient sound' : 'Mute ambient sound'}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(8px)',
        color: '#ffffff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.2s, background-color 0.2s',
        zIndex: 9999,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
        e.currentTarget.style.transform = 'scale(1.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {muted ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" className="audio-wave-1" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" className="audio-wave-2" />
        </svg>
      )}
    </button>
  );
}
