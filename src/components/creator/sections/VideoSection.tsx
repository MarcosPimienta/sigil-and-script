// ─────────────────────────────────────────────────────────────────────────────
// Video section — a short uploaded clip or a YouTube / Vimeo embed.
// Never autoplays with sound; starting playback pauses the invitation's music
// so the two can never overlap.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from 'react';
import type { InvitationSection } from '../../../types/sigil.types';
import { videoEmbedUrl } from '../../../utils/sectionDefaults';
import { audioEngine } from '../../../utils/audioEngine';

export function VideoSection({ section }: { section: InvitationSection }) {
  const props = section.props;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  if (props.kind !== 'VIDEO' || !props.src) return null;

  const duckMusic = () => {
    try {
      if (!audioEngine.getMuted()) audioEngine.setMute(true);
    } catch {
      // audio engine not ready — nothing to duck
    }
  };

  const frame = (children: React.ReactNode) => (
    <div
      className="section-video"
      style={{
        width: '100%',
        marginTop: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.6rem',
        fontFamily: "var(--sec-body-font, 'Cormorant Garamond', serif)",
      }}
    >
      {section.title && (
        <h3
          style={{
            fontSize: '1.8rem',
            fontStyle: 'italic',
            margin: 0,
            fontWeight: 400,
            color: '#4c4844',
          }}
        >
          {section.title}
        </h3>
      )}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          aspectRatio: '16 / 9',
          borderRadius: '6px',
          overflow: 'hidden',
          background: '#000',
          boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        }}
      >
        {children}
      </div>
      {props.caption && (
        <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: 'rgba(0,0,0,0.6)', textAlign: 'center' }}>
          {props.caption}
        </p>
      )}
    </div>
  );

  if (props.provider === 'FILE') {
    return frame(
      <video
        ref={videoRef}
        src={props.src}
        poster={props.poster || undefined}
        controls
        playsInline
        preload="metadata"
        loop={props.loop || false}
        onPlay={duckMusic}
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', background: '#000' }}
      />,
    );
  }

  return frame(
    <iframe
      src={videoEmbedUrl(props.provider, props.src)}
      title={section.title || 'Video'}
      loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={() => { /* embeds start paused; music is ducked on first interaction */ }}
      onMouseDown={duckMusic}
      onTouchStart={duckMusic}
      style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
    />,
  );
}
