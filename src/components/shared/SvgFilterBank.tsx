// ─────────────────────────────────────────────────────────────────────────────
// Sigil — SVG Filter Bank (hidden, globally available)
// Renders once; all wax seals and paper overlays reference these filter IDs.
// ─────────────────────────────────────────────────────────────────────────────

interface SvgFilterBankProps {
  /** 0–100: controls feDistantLight elevation for wax 3D depth */
  sealDepth?: number;
}

export function SvgFilterBank({ sealDepth = 40 }: SvgFilterBankProps) {
  // Elevation: depth=0 → 15° (dramatic raking light), depth=100 → 75° (flat)
  const elevation = 15 + (sealDepth / 100) * 60;

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
        {/* ── Wax Seal 3D Bump Map ──────────────────────────────────────────── */}
        <filter
          id="sigil-wax-bump"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          {/* Generate bump from the alpha channel */}
          <feDiffuseLighting
            in="SourceAlpha"
            surfaceScale="5"
            diffuseConstant="1.4"
            result="diffuse-light"
          >
            <feDistantLight azimuth="315" elevation={elevation} />
          </feDiffuseLighting>

          {/* Clip lighting to the seal shape */}
          <feComposite
            in="diffuse-light"
            in2="SourceAlpha"
            operator="in"
            result="lit-seal"
          />

          {/* Blend original colour with lighting */}
          <feBlend in="SourceGraphic" in2="lit-seal" mode="multiply" result="blended" />

          {/* Soften slightly for a lacquered wax appearance */}
          <feGaussianBlur in="blended" stdDeviation="0.4" result="softened" />
          <feComposite in="softened" in2="SourceAlpha" operator="in" />
        </filter>

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

        {/* ── Seal Break Clip Paths ─────────────────────────────────────────── */}
        <clipPath id="seal-left-half">
          <polygon points="0,0 50,0 48,20 50,40 47,60 50,80 48,100 0,100" />
        </clipPath>
        <clipPath id="seal-right-half">
          <polygon points="50,0 100,0 100,100 50,100 52,80 50,60 53,40 50,20 52,0" />
        </clipPath>
      </defs>
    </svg>
  );
}
