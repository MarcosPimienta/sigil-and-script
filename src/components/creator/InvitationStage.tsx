// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Invitation Stage (The Paper Canvas)
// Central WYSIWYG workspace: renders the invitation sheet with textures,
// deckled edges, ornamental borders, text blocks, and the wax seal.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from 'react';
import { useSigil } from '../../context/SigilContext';
import { resolveTokens } from '../../utils/tokenResolver';
import { PAPER_CSS_VAR } from '../../utils/luminanceGuards';
import { TextBlock } from './TextBlock';
import { WaxSeal } from './WaxSeal';
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
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}
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
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}
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

function DividerOrnament({ y, width }: { y: number; width: number }) {
  const cx = width / 2;
  return (
    <svg
      viewBox={`0 0 ${width} 20`}
      width={width}
      height={20}
      style={{
        position: 'absolute',
        left: 0,
        top: y,
        pointerEvents: 'none',
        zIndex: 6,
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

const STAGE_W = 460;
const STAGE_H = 650;

// Deckled edge polygon (a simplified version; full version is in tokens.css)
const DECKLED_CLIP =
  'polygon(0% 1.2%, 1.8% 0.4%, 3.6% 1.8%, 5.4% 0.3%, 7.2% 1.6%, 9.0% 0.2%, 10.8% 1.9%, 12.6% 0.5%, 14.4% 1.8%, 16.2% 0.2%, 18.0% 1.7%, 19.8% 0.3%, 21.6% 1.9%, 23.4% 0.4%, 25.2% 1.7%, 27.0% 0.1%, 28.8% 2.0%, 30.6% 0.5%, 32.4% 1.8%, 34.2% 0.2%, 36.0% 1.7%, 37.8% 0.3%, 39.6% 1.9%, 41.4% 0.4%, 43.2% 1.7%, 45.0% 0.1%, 46.8% 2.0%, 48.6% 0.5%, 50.4% 1.8%, 52.2% 0.2%, 54.0% 1.7%, 55.8% 0.3%, 57.6% 1.9%, 59.4% 0.4%, 61.2% 1.7%, 63.0% 0.1%, 64.8% 2.0%, 66.6% 0.5%, 68.4% 1.8%, 70.2% 0.2%, 72.0% 1.7%, 73.8% 0.3%, 75.6% 1.9%, 77.4% 0.4%, 79.2% 1.7%, 81.0% 0.1%, 82.8% 2.0%, 84.6% 0.5%, 86.4% 1.8%, 88.2% 0.2%, 90.0% 1.7%, 91.8% 0.3%, 93.6% 1.9%, 95.4% 0.4%, 97.2% 1.7%, 98.8% 0.3%, 100% 1.5%, 100% 100%, 0% 100%)';

const SCALLOPED_CLIP =
  'polygon(0% 2%, 2% 0%, 4% 2%, 6% 0%, 8% 2%, 10% 0%, 12% 2%, 14% 0%, 16% 2%, 18% 0%, 20% 2%, 22% 0%, 24% 2%, 26% 0%, 28% 2%, 30% 0%, 32% 2%, 34% 0%, 36% 2%, 38% 0%, 40% 2%, 42% 0%, 44% 2%, 46% 0%, 48% 2%, 50% 0%, 52% 2%, 54% 0%, 56% 2%, 58% 0%, 60% 2%, 62% 0%, 64% 2%, 66% 0%, 68% 2%, 70% 0%, 72% 2%, 74% 0%, 76% 2%, 78% 0%, 80% 2%, 82% 0%, 84% 2%, 86% 0%, 88% 2%, 90% 0%, 92% 2%, 94% 0%, 96% 2%, 98% 0%, 100% 2%, 100% 100%, 0% 100%)';

function getClipPath(borderStyle: string): string {
  switch (borderStyle) {
    case 'deckled': return DECKLED_CLIP;
    case 'torn': return DECKLED_CLIP;
    case 'scalloped': return SCALLOPED_CLIP;
    default: return 'none';
  }
}

export function InvitationStage() {
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
      if (e.target !== stageRef.current) return;
      selectTextBlock(null);
      focusInspector({ type: 'PAPER', design });
      dispatch({ type: 'SET_IS_EDITING_TEXT', payload: false });
      setEditingBlockId(null);
    },
    [selectTextBlock, focusInspector, design, dispatch],
  );

  // ── Text block interactions ───────────────────────────────────────────────
  const handleBlockSelect = useCallback(
    (blockId: string) => {
      selectTextBlock(blockId);
      focusInspector({ type: 'TEXT_BLOCK', blockId });
    },
    [selectTextBlock, focusInspector],
  );

  const handleBlockEdit = useCallback(
    (blockId: string) => {
      setEditingBlockId(blockId);
      dispatch({ type: 'SET_IS_EDITING_TEXT', payload: true });
    },
    [dispatch],
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

  // ── Wax seal interaction ──────────────────────────────────────────────────
  const handleSealClick = useCallback(() => {
    selectTextBlock(null);
    focusInspector({ type: 'WAX_SEAL' });
  }, [selectTextBlock, focusInspector]);

  const paperBg = PAPER_CSS_VAR[design.paperTexture] ?? 'var(--paper-parchment)';
  const clipPath = getClipPath(design.borderStyle);

  return (
    <div className="stage-wrapper" style={{ position: 'relative' }}>
      <SvgFilterBank sealDepth={design.waxSeal.depth} />

      <div
        ref={stageRef}
        id="invitation-stage"
        className={`invitation-stage border-${design.borderStyle}`}
        style={{
          width: STAGE_W,
          height: STAGE_H,
          backgroundColor: `var(${paperBg.replace('var(', '').replace(')', '')})`,
          clipPath,
          color: 'var(--color-sepia-800)', // default ink — picked up by border SVGs
        }}
        onClick={handleStageClick}
        aria-label="Invitation canvas"
      >
        {/* ── Paper grain texture overlay ─── */}
        <div className="stage-grain-overlay" aria-hidden="true" />

        {/* ── Ornamental border ─── */}
        <OrnamentalBorder
          width={STAGE_W}
          height={STAGE_H}
          style={design.borderStyle}
        />

        {/* ── Decorative divider after headline ─── */}
        <DividerOrnament y={STAGE_H * 0.32} width={STAGE_W} />

        {/* ── Text Blocks ─── */}
        {design.textBlocks.map((block) => {
          const displayText = resolveTokens(block.content, guest);
          return (
            <TextBlock
              key={block.id}
              config={block}
              displayText={displayText}
              isSelected={canvasSelection.selectedTextBlockId === block.id}
              isEditing={editingBlockId === block.id}
              onSelect={() => handleBlockSelect(block.id)}
              onEdit={() => handleBlockEdit(block.id)}
              onBlur={handleBlockBlur}
              onContentChange={(c) => handleContentChange(block.id, c)}
              stageWidth={STAGE_W}
              stageHeight={STAGE_H}
            />
          );
        })}

        {/* ── Wax Seal ─── */}
        <div
          className="seal-anchor"
          style={{
            position: 'absolute',
            bottom: '9%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
          }}
        >
          <WaxSeal
            config={design.waxSeal}
            size={112}
            onClick={handleSealClick}
            isSelected={state.inspectorFocus.type === 'WAX_SEAL'}
          />
        </div>
      </div>
    </div>
  );
}
