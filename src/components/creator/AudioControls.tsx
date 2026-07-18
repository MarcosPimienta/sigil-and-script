import React, { useState, useEffect } from 'react';
import { audioEngine } from '../../utils/audioEngine';

export function AudioControls({ musicUrl }: { musicUrl?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!musicUrl) {
      audioEngine.setSongUrl(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    // Pass custom MP3 URL to Centralized Audio Engine
    audioEngine.setSongUrl(musicUrl);
    
    // Sync local playing state with Centralized Audio Engine Mute property
    setIsPlaying(!audioEngine.getMuted());
  }, [musicUrl]);

  useEffect(() => {
    const audio = audioEngine.getAudioElement();
    if (!audio) return;

    // Set initial values
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);
    setLoop(audio.loop);
    setIsPlaying(!audio.paused);

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [musicUrl, isPlaying]);

  if (!musicUrl) return null;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering envelope click events
    const nextMute = !audioEngine.getMuted();
    audioEngine.setMute(nextMute);
    setIsPlaying(!nextMute);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioEngine.getAudioElement();
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkipBackward = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioEngine.getAudioElement();
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const handleSkipForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioEngine.getAudioElement();
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const handleToggleLoop = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioEngine.getAudioElement();
    if (!audio) return;
    const nextLoop = !audio.loop;
    audio.loop = nextLoop;
    setLoop(nextLoop);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-controls-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      maxWidth: '320px',
      margin: '1.5rem auto 1rem auto',
      animation: 'stage-enter 0.8s ease-out',
    }}>
      {/* Title */}
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#4c4844',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: '1rem',
        textAlign: 'center',
        display: 'block',
      }}>
        Dale play para escuchar nuestra canción
      </span>

      {/* Seekbar */}
      <div style={{ width: '100%', padding: '0 0.5rem', marginBottom: '1.2rem' }}>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeekChange}
          className="audio-progress-slider"
          style={{
            background: `linear-gradient(to right, #4c4844 ${progressPercent}%, rgba(76, 72, 68, 0.15) ${progressPercent}%)`
          }}
          aria-label="Seek music"
        />
      </div>

      {/* Buttons controls row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0 0.5rem',
      }}>
        {/* Heart / Like button */}
        <button
          onClick={handleToggleLike}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            color: isLiked ? '#a08e7c' : '#4c4844',
            transition: 'color 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          aria-label={isLiked ? "Unlike song" : "Like song"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke={isLiked ? "currentColor" : "#4c4844"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>

        {/* Skip backward */}
        <button
          onClick={handleSkipBackward}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            color: '#4c4844',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Restart song"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </button>

        {/* Center circular Play/Pause button */}
        <button
          onClick={handleToggle}
          style={{
            background: 'none',
            border: '1px solid rgba(76, 72, 68, 0.4)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            color: '#4c4844',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.borderColor = 'rgba(76, 72, 68, 0.8)';
            e.currentTarget.style.background = 'rgba(76, 72, 68, 0.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'rgba(76, 72, 68, 0.4)';
            e.currentTarget.style.background = 'none';
          }}
          aria-label={isPlaying ? "Pause music" : "Play music"}
        >
          {isPlaying ? (
            /* Pause Icon */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="14" y="4" width="4" height="16" rx="1" />
              <rect x="6" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            /* Play Icon */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateX(1px)' }}>
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          )}
        </button>

        {/* Skip forward */}
        <button
          onClick={handleSkipForward}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            color: '#4c4844',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Skip song forward"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>

        {/* Repeat / Loop button */}
        <button
          onClick={handleToggleLoop}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            color: loop ? '#4c4844' : 'rgba(76, 72, 68, 0.4)',
            transition: 'color 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          aria-label={loop ? "Disable repeat" : "Enable repeat"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m17 2 4 4-4 4" />
            <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
            <path d="m7 22-4-4 4-4" />
            <path d="M21 13v1a4 4 0 0 1-4 4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
