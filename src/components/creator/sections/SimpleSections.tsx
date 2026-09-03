// ─────────────────────────────────────────────────────────────────────────────
// Free-form section renderers: TEXT, IMAGE, DIVIDER.
// ─────────────────────────────────────────────────────────────────────────────

import { useSigilSelector } from '../../../context/SigilContext';
import type { InvitationSection } from '../../../types/sigil.types';
import { INK_COLOR_TO_CSS_VAR } from '../../../utils/luminanceGuards';
import { resolveTokens } from '../../../utils/tokenResolver';
import { SvgColorImage } from '../../common/SvgColorImage';

export function TextSection({ section }: { section: InvitationSection }) {
  const guest = useSigilSelector((s) => s.guest);
  const props = section.props;
  if (props.kind !== 'TEXT') return null;

  return (
    <div
      className="section-text"
      style={{
        width: '100%',
        marginTop: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {section.title && (
        <h3 style={{ fontSize: '1.6rem', fontStyle: 'italic', margin: '0 0 0.5rem 0', fontWeight: 400, color: '#4c4844', fontFamily: "var(--sec-body-font, 'Cormorant Garamond', serif)" }}>
          {section.title}
        </h3>
      )}
      <p
        style={{
          margin: 0,
          width: '100%',
          maxWidth: '520px',
          whiteSpace: 'pre-wrap',
          // A section-level body font wins over the block's own legacy setting.
          fontFamily: section.fonts?.body || props.fontFamily,
          fontSize: `${props.fontSize}rem`,
          fontStyle: props.fontStyle,
          textAlign: props.textAlign,
          lineHeight: 1.5,
          color: INK_COLOR_TO_CSS_VAR[props.color] ?? 'var(--color-sepia-800)',
        }}
      >
        {resolveTokens(props.content, guest)}
      </p>
    </div>
  );
}

export function ImageSection({ section }: { section: InvitationSection }) {
  const props = section.props;
  if (props.kind !== 'IMAGE' || !props.src) return null;
  const max = `${Math.round(320 * ((props.scale ?? 100) / 100))}px`;
  const isSvg = props.src.startsWith('data:image/svg') || /\.svg($|\?)/i.test(props.src);

  return (
    <div
      className="section-image"
      style={{ width: '100%', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
    >
      {section.title && (
        <h3 style={{ fontSize: '1.6rem', fontStyle: 'italic', margin: 0, fontWeight: 400, color: '#4c4844', fontFamily: "var(--sec-body-font, 'Cormorant Garamond', serif)" }}>
          {section.title}
        </h3>
      )}
      {isSvg ? (
        <SvgColorImage
          src={props.src}
          alt={props.caption || 'Invitation artwork'}
          color="#4c4844"
          maxWidth={parseInt(max, 10)}
          maxHeight={parseInt(max, 10)}
        />
      ) : (
        <img
          src={props.src}
          alt={props.caption || 'Invitation artwork'}
          style={{ maxWidth: max, maxHeight: max, width: 'auto', height: 'auto', objectFit: 'contain', display: 'block' }}
        />
      )}
      {props.caption && (
        <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: 'rgba(0,0,0,0.6)', textAlign: 'center', fontFamily: "var(--sec-body-font, 'Cormorant Garamond', serif)" }}>
          {props.caption}
        </p>
      )}
    </div>
  );
}

export function DividerSection({ section }: { section: InvitationSection }) {
  const props = section.props;
  if (props.kind !== 'DIVIDER') return null;
  const color = 'rgba(120, 100, 80, 0.55)';

  return (
    <div className="section-divider" style={{ width: '100%', margin: '1.5rem 0', display: 'flex', justifyContent: 'center' }}>
      {props.ornament === 'line' && (
        <div style={{ width: '60%', height: '1px', background: color }} />
      )}
      {props.ornament === 'dots' && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, display: 'block' }} />
          ))}
        </div>
      )}
      {props.ornament === 'flourish' && (
        <svg width="180" height="20" viewBox="0 0 180 20" aria-hidden="true">
          <path d="M6 10h58" stroke={color} strokeWidth="1" fill="none" />
          <path d="M116 10h58" stroke={color} strokeWidth="1" fill="none" />
          <path d="M74 10c4-6 8-6 8 0s-4 6-8 0zM106 10c-4-6-8-6-8 0s4 6 8 0z" stroke={color} strokeWidth="1" fill="none" />
          <circle cx="90" cy="10" r="2" fill={color} />
        </svg>
      )}
    </div>
  );
}
