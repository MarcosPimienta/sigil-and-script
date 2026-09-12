// ─────────────────────────────────────────────────────────────────────────────
// Secciones — the content of the invitation.
//
// This tab renders exactly ONE of: the list, the palette, or a section's
// inspector. That is the fix for the panel's worst behaviour: the editor used
// to render *below* the list, so opening a long section pushed the list off
// screen precisely when you wanted to switch between sections.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from 'react';
import { useSigilStore } from '../../../state/sigilStore';
import type { InvitationSection, SectionKind } from '../../../types/sigil.types';
import { SECTION_CATALOGUE, getSectionMeta } from '../../../utils/sectionDefaults';
import { EventIcon } from '../../icons/eventIcons';
import { ChevronLeft, ChevronRight, GripIcon, SearchIcon } from './PanelIcons';
import { usePanelStrings } from './panelStrings';
import { SectionInspector } from './SectionInspector';

// ── The palette, as a full-panel view ────────────────────────────────────────

function SectionPalette({ onClose }: { onClose: () => void }) {
  const design = useSigilStore((s) => s.design);
  const addSection = useSigilStore((s) => s.addSection);
  const { t, lang } = usePanelStrings();
  const [query, setQuery] = useState('');

  const usedKinds = new Set((design.sections ?? []).map((s) => s.kind));
  const needle = query.trim().toLocaleLowerCase();
  const matches = SECTION_CATALOGUE.filter((meta) => {
    if (!needle) return true;
    return (
      meta.label[lang].toLocaleLowerCase().includes(needle) ||
      meta.description[lang].toLocaleLowerCase().includes(needle)
    );
  });

  const handleAdd = (kind: SectionKind) => {
    // addSection focuses the new section, so the inspector opens on its own.
    if (addSection(kind)) onClose();
  };

  return (
    <div className="lp-tab-content">
      <button type="button" className="lp-back" onClick={onClose}>
        <ChevronLeft />
        <span>{t('inspectorBack')}</span>
      </button>

      <div className="lp-drill-head">
        <h2 className="lp-drill-title">{t('paletteTitle')}</h2>
        <p className="lp-hint lp-hint--tight">{t('paletteHint')}</p>
      </div>

      <div className="lp-search">
        <SearchIcon />
        <input
          type="search"
          className="lp-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('paletteSearch')}
          aria-label={t('paletteSearch')}
        />
      </div>

      <div className="lp-palette" role="group" aria-label={t('paletteTitle')}>
        {matches.length === 0 && <p className="lp-hint">{t('paletteNoMatch')}</p>}
        {matches.map((meta) => {
          const blocked = meta.singleton && usedKinds.has(meta.kind);
          return (
            <button
              key={meta.kind}
              type="button"
              className={`lp-palette-item ${blocked ? 'is-blocked' : ''}`}
              disabled={blocked}
              onClick={() => handleAdd(meta.kind)}
              title={blocked ? t('paletteOnlyOne') : meta.description[lang]}
            >
              <span className="lp-palette-icon">
                <EventIcon id={meta.icon} size={18} />
              </span>
              <span className="lp-palette-text">
                <span className="lp-palette-name">
                  {meta.label[lang]}
                  {blocked && <em> — {t('paletteAlreadyAdded')}</em>}
                </span>
                <span className="lp-palette-desc">{meta.description[lang]}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── One row ──────────────────────────────────────────────────────────────────

interface RowProps {
  section: InvitationSection;
  index: number;
  total: number;
  isDragging: boolean;
  isDropTarget: boolean;
  onGripDown: (e: React.PointerEvent, index: number) => void;
  rowRef: (el: HTMLLIElement | null) => void;
}

function SectionRow({ section, index, total, isDragging, isDropTarget, onGripDown, rowRef }: RowProps) {
  const focusInspector = useSigilStore((s) => s.focusInspector);
  const toggleSection = useSigilStore((s) => s.toggleSection);
  const moveSection = useSigilStore((s) => s.moveSection);
  const updateSection = useSigilStore((s) => s.updateSection);
  const { t, lang } = usePanelStrings();
  const [isRenaming, setIsRenaming] = useState(false);

  const meta = getSectionMeta(section.kind);
  const label = section.title || meta.label[lang];

  return (
    <li
      ref={rowRef}
      className={[
        'lp-row',
        section.enabled ? '' : 'is-hidden',
        isDragging ? 'is-dragging' : '',
        isDropTarget ? 'is-drop-target' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-section-kind={section.kind}
    >
      <span
        className="lp-row-grip"
        role="button"
        tabIndex={-1}
        aria-label={t('rowDrag')}
        onPointerDown={(e) => onGripDown(e, index)}
      >
        <GripIcon />
      </span>

      <span className="lp-row-icon">
        <EventIcon id={meta.icon} size={16} />
      </span>

      {isRenaming ? (
        <input
          className="lp-input lp-row-rename"
          autoFocus
          defaultValue={section.title || ''}
          placeholder={meta.label[lang]}
          aria-label={t('rowRenameLabel')}
          onBlur={(e) => {
            updateSection(section.id, { title: e.target.value.trim() || undefined });
            setIsRenaming(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Escape') setIsRenaming(false);
          }}
        />
      ) : (
        <button
          type="button"
          className="lp-row-label"
          title={t('rowOpen')}
          onClick={() => focusInspector({ type: 'SECTION', sectionId: section.id })}
          onDoubleClick={() => setIsRenaming(true)}
        >
          {label}
        </button>
      )}

      {meta.singleton && <span className="lp-row-cap">1 / 1</span>}
      {!section.enabled && <span className="lp-row-cap">{t('rowHiddenBadge')}</span>}

      <span className="lp-row-actions">
        {/* Kept for keyboard users, who cannot drag. Hidden until the row is
            focused or hovered so the row stays visually calm. */}
        <button
          type="button"
          className="lp-row-move"
          aria-label={t('rowMoveUp')}
          disabled={index === 0}
          onClick={() => moveSection(section.id, 'up')}
        >
          ▲
        </button>
        <button
          type="button"
          className="lp-row-move"
          aria-label={t('rowMoveDown')}
          disabled={index === total - 1}
          onClick={() => moveSection(section.id, 'down')}
        >
          ▼
        </button>
        <button
          type="button"
          aria-label={section.enabled ? t('rowHide') : t('rowShow')}
          aria-pressed={!section.enabled}
          onClick={() => toggleSection(section.id)}
        >
          <EventIcon id={section.enabled ? 'eye' : 'eyeOff'} size={15} />
        </button>
        <button
          type="button"
          className="lp-row-enter"
          aria-label={t('rowOpen')}
          onClick={() => focusInspector({ type: 'SECTION', sectionId: section.id })}
        >
          <ChevronRight />
        </button>
      </span>
    </li>
  );
}

// ── The list ─────────────────────────────────────────────────────────────────

function SectionList({ onAdd }: { onAdd: () => void }) {
  const design = useSigilStore((s) => s.design);
  const reorderSections = useSigilStore((s) => s.reorderSections);
  const { t } = usePanelStrings();

  const sections = design.sections ?? [];
  const rowEls = useRef<(HTMLLIElement | null)[]>([]);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragTo, setDragTo] = useState<number | null>(null);

  const rsvpCount = sections.filter((s) => s.kind === 'RSVP' && s.enabled).length;
  const visibleCount = sections.filter((s) => s.enabled).length;

  // Pointer events rather than mouse events, so one code path covers mouse,
  // touch and stylus. The grip captures the pointer, so the gesture survives
  // the cursor leaving the row it started on.
  const handleGripDown = (e: React.PointerEvent, index: number) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragFrom(index);
    setDragTo(index);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragFrom === null) return;
    const y = e.clientY;
    let next = rowEls.current.length - 1;
    for (let i = 0; i < rowEls.current.length; i += 1) {
      const el = rowEls.current[i];
      if (!el) continue;
      const box = el.getBoundingClientRect();
      if (y < box.top + box.height / 2) {
        next = i;
        break;
      }
    }
    setDragTo(next);
  };

  const handlePointerUp = () => {
    if (dragFrom !== null && dragTo !== null && dragFrom !== dragTo) {
      const ids = sections.map((s) => s.id);
      const [moved] = ids.splice(dragFrom, 1);
      ids.splice(dragTo, 0, moved);
      reorderSections(ids);
    }
    setDragFrom(null);
    setDragTo(null);
  };

  return (
    <div className="lp-tab-content">
      <div className="lp-list-header">
        <span className="lp-block-label">
          {sections.length} {t('sectionsWord')} · {visibleCount} {t('visibleWord')}
        </span>
        <button type="button" className="lp-add-btn" onClick={onAdd}>
          <EventIcon id="plus" size={13} />
          {t('addSection')}
        </button>
      </div>

      {rsvpCount > 1 && <p className="lp-warning" role="status">{t('warnRsvpMany')}</p>}
      {rsvpCount === 0 && <p className="lp-warning" role="status">{t('warnRsvpNone')}</p>}

      <ul
        className="lp-list"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {sections.length === 0 && <li className="lp-list-empty">{t('sectionsEmpty')}</li>}
        {sections.map((section, idx) => (
          <SectionRow
            key={section.id}
            section={section}
            index={idx}
            total={sections.length}
            isDragging={dragFrom === idx}
            isDropTarget={dragFrom !== null && dragTo === idx && dragFrom !== idx}
            onGripDown={handleGripDown}
            rowRef={(el) => {
              rowEls.current[idx] = el;
            }}
          />
        ))}
      </ul>

      {sections.length > 0 && <p className="lp-hint">{t('sectionsHint')}</p>}
    </div>
  );
}

// ── The tab ──────────────────────────────────────────────────────────────────

export function SectionsTab() {
  const design = useSigilStore((s) => s.design);
  const inspectorFocus = useSigilStore((s) => s.inspectorFocus);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const focused =
    inspectorFocus.type === 'SECTION'
      ? (design.sections ?? []).find((s) => s.id === inspectorFocus.sectionId)
      : undefined;

  if (focused) return <SectionInspector section={focused} />;
  if (isPaletteOpen) return <SectionPalette onClose={() => setIsPaletteOpen(false)} />;
  return <SectionList onAdd={() => setIsPaletteOpen(true)} />;
}
