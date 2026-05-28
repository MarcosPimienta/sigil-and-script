// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Wax Seal SVG Component
// Renders a procedural 3D wax seal using SVG radial gradients and the
// feDiffuseLighting filter defined in SvgFilterBank.
// ─────────────────────────────────────────────────────────────────────────────

import type { WaxSealConfig } from '../../types/sigil.types';

interface WaxSealProps {
  config: WaxSealConfig;
  /** Base size in px (default 112) */
  size?: number;
  onClick?: () => void;
  isSelected?: boolean;
  /** If true, renders in "break" animation state */
  breaking?: boolean;
}

// ── Motif Renderers ────────────────────────────────────────────────────────────

function MotifContent({
  motif,
  monogramText,
}: {
  motif: WaxSealConfig['motif'];
  monogramText: string;
}) {
  const textProps = {
    x: '50',
    y: '54',
    textAnchor: 'middle' as const,
    dominantBaseline: 'middle' as const,
    fill: 'rgba(255,255,255,0.92)',
    style: {
      filter: 'drop-shadow(0 1.5px 1px rgba(0,0,0,0.45))',
      letterSpacing: '0.05em',
    },
  };

  switch (motif) {
    case 'monogram':
      return (
        <text
          {...textProps}
          fontSize="19"
          fontFamily="'Cinzel Decorative', serif"
          fontWeight="700"
        >
          {/* Safe: monogramText is controlled state, rendered as SVG text content */}
          {monogramText}
        </text>
      );

    case 'sigil-s':
      return (
        <text
          {...textProps}
          fontSize="26"
          fontFamily="'Cormorant Garamond', serif"
          fontStyle="italic"
          fontWeight="600"
        >
          𝒮
        </text>
      );

    case 'fleur-de-lis':
      return (
        <text {...textProps} fontSize="28" fontFamily="serif">
          ⚜
        </text>
      );

    case 'botanical':
      // Simplified SVG leaf motif
      return (
        <g transform="translate(50,50) scale(0.55)" fill="rgba(255,255,255,0.88)">
          {/* Central stem */}
          <line x1="0" y1="28" x2="0" y2="-28" stroke="rgba(255,255,255,0.88)" strokeWidth="2" />
          {/* Left leaf */}
          <path d="M0,0 Q-22,-10 -18,-30 Q-8,-18 0,-6" />
          {/* Right leaf */}
          <path d="M0,0 Q22,-10 18,-30 Q8,-18 0,-6" />
          {/* Bottom flourish */}
          <path d="M0,6 Q-12,18 -8,30 Q0,22 0,10" fill="rgba(255,255,255,0.70)" />
          <path d="M0,6 Q12,18 8,30 Q0,22 0,10" fill="rgba(255,255,255,0.70)" />
        </g>
      );

    case 'geometric':
      // Six-pointed star
      return (
        <g transform="translate(50,50)">
          <polygon
            points="0,-22 5.5,-10 18,-10 8,-1 12,12 0,5 -12,12 -8,-1 -18,-10 -5.5,-10"
            fill="rgba(255,255,255,0.85)"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.5"
          />
        </g>
      );
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function WaxSeal({
  config,
  size = 112,
  onClick,
  isSelected = false,
  breaking = false,
}: WaxSealProps) {
  const { color, colorLight, colorSheen, motif, monogramText, rotation, scale } = config;
  const uid = `seal-${motif}`;

  const gradId = `${uid}-grad`;
  const edgeGradId = `${uid}-edge`;
  const outerR = 46;
  const innerRingR = 42;
  const innerRingR2 = 38;

  return (
    <div
      className={`wax-seal-wrapper${isSelected ? ' is-selected' : ''}${breaking ? ' is-breaking' : ''}`}
      style={{
        width: size * scale,
        height: size * scale,
        transform: `rotate(${rotation}deg)`,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Wax seal — click to inspect' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        overflow="visible"
        style={{ filter: 'url(#sigil-wax-bump)' }}
      >
        <defs>
          {/* Dome radial gradient — key to the 3D wax appearance */}
          <radialGradient id={gradId} cx="35%" cy="30%" r="65%" fx="35%" fy="30%">
            <stop offset="0%" stopColor={colorLight} stopOpacity="1" />
            <stop offset="45%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={colorSheen} stopOpacity="1" />
          </radialGradient>

          {/* Edge highlight gradient */}
          <radialGradient id={edgeGradId} cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="transparent" />
            <stop offset="90%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.22)" />
          </radialGradient>
        </defs>

        {/* ── Outer wax disc ─── */}
        <circle cx="50" cy="50" r={outerR} fill={`url(#${gradId})`} />

        {/* ── Edge highlight ring ─── */}
        <circle cx="50" cy="50" r={outerR} fill={`url(#${edgeGradId})`} />

        {/* ── Embossed inner rings ─── */}
        <circle
          cx="50" cy="50" r={innerRingR}
          fill="none"
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="0.8"
        />
        <circle
          cx="50" cy="50" r={innerRingR2}
          fill="none"
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="0.6"
        />

        {/* ── Motif ─── */}
        <MotifContent motif={motif} monogramText={monogramText} />
      </svg>
    </div>
  );
}
