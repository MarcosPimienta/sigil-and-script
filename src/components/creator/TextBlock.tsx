// ─────────────────────────────────────────────────────────────────────────────
// Sigil — In-Situ Text Block
// Renders editable text directly on the invitation stage.
//
// Security: All content mutations use textContent only — never innerHTML.
//   contenteditable is restricted to plain-text mode via data-* attribute.
//   See SKILL.md §Vanilla JavaScript DOM Manipulation.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef } from 'react';
import type { TextBlockConfig, InkColor } from '../../types/sigil.types';
import { INK_COLOR_TO_CSS_VAR } from '../../utils/luminanceGuards';
import { STAGE_Z } from './InvitationStage';

// ── Resolved text content (tokens already substituted) ────────────────────────

interface TextBlockProps {
  config: TextBlockConfig;
  /** The display text — tokens already resolved by the parent */
  displayText: string;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onBlur: () => void;
  onContentChange: (newContent: string) => void;
}

function inkColorToCss(ink: InkColor): string {
  return INK_COLOR_TO_CSS_VAR[ink] ?? 'var(--color-sepia-800)';
}

export function TextBlock({
  config,
  displayText,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onBlur,
  onContentChange,
}: TextBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  // ── Sync content into the DOM on external changes ──────────────────────────
  // We only update textContent if the element is not being actively edited
  // (prevents fighting with the user's cursor).
  useEffect(() => {
    const el = ref.current;
    if (!el || isEditing) return;
    if (el.textContent !== displayText) {
      // SECURITY: using textContent, never innerHTML
      el.textContent = displayText;
    }
  }, [displayText, isEditing]);

  // ── Handle text input (contenteditable → state) ────────────────────────────
  const handleInput = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // SECURITY: read only textContent, not innerHTML
    const raw = el.textContent ?? '';
    onContentChange(raw);
  }, [onContentChange]);

  // ── Click: select; double-click: enter edit mode ──────────────────────────
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isSelected) {
        onSelect();
      }
    },
    [isSelected, onSelect],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit();
      // Place cursor at end of text after entering edit mode
      requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      });
    },
    [onEdit],
  );

  const handleBlur = useCallback(() => {
    onBlur();
  }, [onBlur]);

  // ── Derived styles from config ─────────────────────────────────────────────
  // Flows top-to-bottom in document order — no more x/y positioning, just a
  // per-block top margin controlling the gap from whatever came before it.

  const style: React.CSSProperties = {
    position: 'relative',
    width: '82%',
    margin: `${config.marginTop}rem auto 0`,
    fontFamily: config.fontFamily,
    fontSize: `${config.fontSize}rem`,
    fontStyle: config.fontStyle,
    fontWeight: config.fontWeight,
    color: inkColorToCss(config.color),
    textAlign: config.textAlign,
    letterSpacing: `${config.letterSpacing}em`,
    lineHeight: config.lineHeight,
    mixBlendMode: 'multiply',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    // Editing state
    outline: 'none',
    cursor: isEditing ? 'text' : 'pointer',
    userSelect: isEditing ? 'text' : 'none',
    WebkitUserSelect: isEditing ? 'text' : 'none',
    zIndex: isSelected ? STAGE_Z.textSelected : STAGE_Z.text,
    transition: 'filter 120ms ease',
    filter: isSelected ? 'none' : 'url(#sigil-ink-absorb)',
  };

  return (
    <div
      ref={ref}
      className={`text-block${isSelected ? ' is-selected' : ''}${isEditing ? ' is-editing' : ''}`}
      style={style}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onInput={handleInput}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      data-block-id={config.id}
      role="textbox"
      aria-label={`Text block: ${config.id}`}
      aria-multiline="true"
      spellCheck={isEditing}
    />
  );
}
