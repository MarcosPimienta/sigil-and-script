// ─────────────────────────────────────────────────────────────────────────────
// Sigil — SVG Filter Bank (hidden, globally available)
// Renders once; paper overlays and text blocks reference these filter IDs.
// ─────────────────────────────────────────────────────────────────────────────

export function SvgFilterBank() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        visibility: 'hidden',
      }}
    >
      <defs>
        {/* ── Paper Grain Overlay ───────────────────────────────────────────── */}
        <filter id="sigil-paper-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="4"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="gray-noise" />
          <feBlend in="SourceGraphic" in2="gray-noise" mode="multiply" />
        </filter>

        {/* ── Ink Absorption (soft vignette + diffuse edge) ────────────────── */}
        <filter id="sigil-ink-absorb" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
