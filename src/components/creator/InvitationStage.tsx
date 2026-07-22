// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Invitation Stage (The Paper Canvas)
// Central WYSIWYG workspace: renders the invitation sheet with textures,
// deckled edges, ornamental borders, and text blocks.
// ─────────────────────────────────────────────────────────────────────────────

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useSigil } from '../../context/SigilContext';
import { resolveTokens } from '../../utils/tokenResolver';
import { PAPER_CSS_VAR } from '../../utils/luminanceGuards';
import { TextBlock } from './TextBlock';
import { SvgFilterBank } from '../shared/SvgFilterBank';

// ── Ornamental border SVG overlay ─────────────────────────────────────────────

function OrnamentalBorder({
  width,
  height,
  style,
}: {
  width: number;
  height: number;
  style: 'deckled' | 'torn' | 'clean' | 'scalloped';
}) {
  if (style === 'clean') return null;

  const strokeColor = 'currentColor';
  const pad = 18;

  if (style === 'deckled' || style === 'torn') {
    return (
      <svg
        className="stage-ornament-border"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: STAGE_Z.frame }}
        aria-hidden="true"
      >
        {/* Double-line border frame */}
        <rect
          x={pad} y={pad}
          width={width - pad * 2} height={height - pad * 2}
          fill="none"
          stroke={strokeColor}
          strokeWidth="0.6"
          strokeOpacity="0.25"
        />
        <rect
          x={pad + 5} y={pad + 5}
          width={width - (pad + 5) * 2} height={height - (pad + 5) * 2}
          fill="none"
          stroke={strokeColor}
          strokeWidth="0.3"
          strokeOpacity="0.15"
        />
        {/* Corner ornaments */}
        {[
          [pad, pad],
          [width - pad, pad],
          [pad, height - pad],
          [width - pad, height - pad],
        ].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx},${cy})`}>
            <circle r="2" fill={strokeColor} fillOpacity="0.30" />
            <circle r="4" fill="none" stroke={strokeColor} strokeWidth="0.4" strokeOpacity="0.20" />
          </g>
        ))}
      </svg>
    );
  }

  if (style === 'scalloped') {
    // Scalloped border using SVG arc paths
    const scallop = (axis: 'x' | 'y', total: number, offset: number, reverse = false) => {
      const count = Math.floor(total / 16);
      const step = total / count;
      let d = '';
      for (let i = 0; i < count; i++) {
        const start = i * step + (axis === 'x' ? offset : 0);
        const end = start + step;
        const mid = (start + end) / 2;
        if (axis === 'x') {
          const y = reverse ? height - pad : pad;
          d += `M${start},${y} Q${mid},${y + (reverse ? 6 : -6)} ${end},${y} `;
        } else {
          const x = reverse ? width - pad : pad;
          d += `M${x},${start} Q${x + (reverse ? 6 : -6)},${mid} ${x},${end} `;
        }
      }
      return d;
    };

    return (
      <svg
        className="stage-ornament-border"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: STAGE_Z.frame }}
        aria-hidden="true"
      >
        <path d={scallop('x', width - pad * 2, pad)} fill="none" stroke={strokeColor} strokeWidth="0.7" strokeOpacity="0.28" />
        <path d={scallop('x', width - pad * 2, pad, true)} fill="none" stroke={strokeColor} strokeWidth="0.7" strokeOpacity="0.28" />
        <path d={scallop('y', height - pad * 2, pad)} fill="none" stroke={strokeColor} strokeWidth="0.7" strokeOpacity="0.28" />
        <path d={scallop('y', height - pad * 2, pad, true)} fill="none" stroke={strokeColor} strokeWidth="0.7" strokeOpacity="0.28" />
      </svg>
    );
  }

  return null;
}

// ── Decorative Divider ────────────────────────────────────────────────────────

function DividerOrnament({ width }: { width: number }) {
  const cx = width / 2;
  return (
    <svg
      viewBox={`0 0 ${width} 20`}
      width="100%"
      height={20}
      style={{
        display: 'block',
        pointerEvents: 'none',
        zIndex: STAGE_Z.divider,
        opacity: 0.35,
      }}
      aria-hidden="true"
    >
      <line x1={cx - 80} y1={10} x2={cx - 18} y2={10} stroke="currentColor" strokeWidth="0.5" />
      <path
        d={`M${cx - 14},10 Q${cx - 7},4 ${cx},10 Q${cx + 7},16 ${cx + 14},10`}
        stroke="currentColor"
        strokeWidth="0.6"
        fill="none"
      />
      <circle cx={cx} cy={10} r="1.5" fill="currentColor" />
      <line x1={cx + 18} y1={10} x2={cx + 80} y2={10} stroke="currentColor" strokeWidth="0.5" />
    </svg>
  );
}

// ── Stage Component ───────────────────────────────────────────────────────────

export const STAGE_W = 460;
// Fallback used only until the first real measurement of the flowing
// stage's rendered height comes in from the ResizeObserver.
const STAGE_MIN_HEIGHT = 650;

// Layer stacking order for the stage — kept as named constants so custom
// uploads slot into the same z-order as the procedural elements they
// replace, rather than floating above/below unrelated layers.
export const STAGE_Z = {
  grain: 1,
  headerImage: 2,
  frame: 5, // matches OrnamentalBorder — the custom frame replaces it in place
  divider: 6,
  text: 10,
  textSelected: 15,
} as const;

// Deckled/scalloped top edge — y offsets are fixed px (not %) so the torn
// amplitude stays constant no matter how tall the page grows; only the
// bottom two points stay percentage-based so the clip always reaches the
// true bottom of whatever height the flowing content produces.
const DECKLED_CLIP =
  'polygon(0% 7.8px, 1.8% 2.6px, 3.6% 11.7px, 5.4% 1.9px, 7.2% 10.4px, 9.0% 1.3px, 10.8% 12.3px, 12.6% 3.2px, 14.4% 11.7px, 16.2% 1.3px, 18.0% 11.1px, 19.8% 1.9px, 21.6% 12.3px, 23.4% 2.6px, 25.2% 11.1px, 27.0% 0.7px, 28.8% 13.0px, 30.6% 3.2px, 32.4% 11.7px, 34.2% 1.3px, 36.0% 11.1px, 37.8% 1.9px, 39.6% 12.3px, 41.4% 2.6px, 43.2% 11.1px, 45.0% 0.7px, 46.8% 13.0px, 48.6% 3.2px, 50.4% 11.7px, 52.2% 1.3px, 54.0% 11.1px, 55.8% 1.9px, 57.6% 12.3px, 59.4% 2.6px, 61.2% 11.1px, 63.0% 0.7px, 64.8% 13.0px, 66.6% 3.2px, 68.4% 11.7px, 70.2% 1.3px, 72.0% 11.1px, 73.8% 1.9px, 75.6% 12.3px, 77.4% 2.6px, 79.2% 11.1px, 81.0% 0.7px, 82.8% 13.0px, 84.6% 3.2px, 86.4% 11.7px, 88.2% 1.3px, 90.0% 11.1px, 91.8% 1.9px, 93.6% 12.3px, 95.4% 2.6px, 97.2% 11.1px, 98.8% 1.9px, 100% 9.8px, 100% 100%, 0% 100%)';

const SCALLOPED_CLIP =
  'polygon(0% 13.0px, 2% 0.0px, 4% 13.0px, 6% 0.0px, 8% 13.0px, 10% 0.0px, 12% 13.0px, 14% 0.0px, 16% 13.0px, 18% 0.0px, 20% 13.0px, 22% 0.0px, 24% 13.0px, 26% 0.0px, 28% 13.0px, 30% 0.0px, 32% 13.0px, 34% 0.0px, 36% 13.0px, 38% 0.0px, 40% 13.0px, 42% 0.0px, 44% 13.0px, 46% 0.0px, 48% 13.0px, 50% 0.0px, 52% 13.0px, 54% 0.0px, 56% 13.0px, 58% 0.0px, 60% 13.0px, 62% 0.0px, 64% 13.0px, 66% 0.0px, 68% 13.0px, 70% 0.0px, 72% 13.0px, 74% 0.0px, 76% 13.0px, 78% 0.0px, 80% 13.0px, 82% 0.0px, 84% 13.0px, 86% 0.0px, 88% 13.0px, 90% 0.0px, 92% 13.0px, 94% 0.0px, 96% 13.0px, 98% 0.0px, 100% 13.0px, 100% 100%, 0% 100%)';

function getClipPath(borderStyle: string): string {
  switch (borderStyle) {
    case 'deckled': return DECKLED_CLIP;
    case 'torn': return DECKLED_CLIP;
    case 'scalloped': return SCALLOPED_CLIP;
    default: return 'none';
  }
}

interface InvitationStageProps {
  /** Recipient-facing render: disables click-to-select/edit interactions and hides the wax seal */
  readOnly?: boolean;
  transparent?: boolean;
}

export function InvitationStage({
  readOnly = false,
  transparent = false,
}: InvitationStageProps = {}) {
  const {
    state,
    dispatch,
    selectTextBlock,
    focusInspector,
    updateTextBlock,
  } = useSigil();

  const { design, guest, canvasSelection } = state;
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // ── Click on stage backdrop → deselect & focus paper ─────────────────────
  const handleStageClick = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly) return;
      if (e.target !== stageRef.current) return;
      selectTextBlock(null);
      focusInspector({ type: 'PAPER', design });
      dispatch({ type: 'SET_IS_EDITING_TEXT', payload: false });
      setEditingBlockId(null);
    },
    [readOnly, selectTextBlock, focusInspector, design, dispatch],
  );

  // ── Text block interactions ───────────────────────────────────────────────
  const handleBlockSelect = useCallback(
    (blockId: string) => {
      if (readOnly) return;
      selectTextBlock(blockId);
      focusInspector({ type: 'TEXT_BLOCK', blockId });
    },
    [readOnly, selectTextBlock, focusInspector],
  );

  const handleBlockEdit = useCallback(
    (blockId: string) => {
      if (readOnly) return;
      setEditingBlockId(blockId);
      dispatch({ type: 'SET_IS_EDITING_TEXT', payload: true });
    },
    [readOnly, dispatch],
  );

  const handleBlockBlur = useCallback(() => {
    setEditingBlockId(null);
    dispatch({ type: 'SET_IS_EDITING_TEXT', payload: false });
  }, [dispatch]);

  const handleContentChange = useCallback(
    (blockId: string, newContent: string) => {
      updateTextBlock(blockId, { content: newContent });
    },
    [updateTextBlock],
  );

  const paperBg = PAPER_CSS_VAR[design.paperTexture] ?? 'var(--paper-parchment)';
  const clipPath = getClipPath(design.borderStyle);

  // The stage is a tall, flowing single page now — its height is whatever
  // its content needs, not a fixed print size. The border overlay's SVG
  // still needs real pixel dimensions to draw itself, so track the
  // rendered height live instead of assuming a constant.
  const [measuredHeight, setMeasuredHeight] = useState(STAGE_MIN_HEIGHT);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h) setMeasuredHeight(h);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stage-wrapper" style={transparent ? { boxShadow: 'none', background: 'transparent' } : undefined}>
      <SvgFilterBank />

      <div
        ref={stageRef}
        id="invitation-stage"
        className={`invitation-stage border-${design.borderStyle} ${transparent ? 'is-transparent' : ''}`}
        style={transparent ? {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          color: 'var(--color-sepia-800)',
        } : {
          backgroundColor: `var(${paperBg.replace('var(', '').replace(')', '')})`,
          clipPath,
          color: 'var(--color-sepia-800)', // default ink — picked up by border SVGs
        }}
        onClick={handleStageClick}
        aria-label="Invitation canvas"
      >
        {/* ── Paper grain texture overlay ─── */}
        {!transparent && (
          <div 
            className="stage-grain-overlay" 
            aria-hidden="true" 
            style={design.paperImage ? {
              backgroundImage: `url(${design.paperImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              mixBlendMode: 'multiply',
              filter: `brightness(${design.paperBrightness ?? 1.0}) contrast(${design.paperContrast ?? 1.0})`,
              opacity: 0.85
            } : undefined}
          />
        )}

        {/* ── Ornamental border ─── */}
        {!transparent && (
          <OrnamentalBorder
            width={STAGE_W}
            height={measuredHeight}
            style={design.borderStyle}
          />
        )}

        {/* ── Flowing content column ─── */}
        <div className="stage-content">
          {/* Custom Event Title Artwork / Calligraphy Header Image */}
          {design.headerImage && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              margin: '0 auto 1rem auto',
            }}>
              <img
                src={design.headerImage}
                alt="Event Title Artwork"
                style={{
                  maxWidth: `${Math.round(280 * ((design.headerImageScale ?? 100) / 100))}px`,
                  maxHeight: `${Math.round(200 * ((design.headerImageScale ?? 100) / 100))}px`,
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </div>
          )}

          {/* ── Text Blocks — flow top-to-bottom in array order ─── */}
          {design.textBlocks
            .filter((block) => !transparent || block.id === 'tb-headline')
            .map((block, i) => {
              const displayText = resolveTokens(block.content, guest);
              return (
                <Fragment key={block.id}>
                  {/* Decorative divider right after the headline (first block) */}
                  {i === 1 && <DividerOrnament width={STAGE_W} />}
                  <TextBlock
                    config={block}
                    displayText={displayText}
                    isSelected={canvasSelection.selectedTextBlockId === block.id}
                    isEditing={editingBlockId === block.id}
                    onSelect={() => handleBlockSelect(block.id)}
                    onEdit={() => handleBlockEdit(block.id)}
                    onBlur={handleBlockBlur}
                    onContentChange={(c) => handleContentChange(block.id, c)}
                  />
                </Fragment>
              );
            })}
        </div>
      </div>
    </div>
  );
}
