// ─────────────────────────────────────────────────────────────────────────────
// Sections panel — the builder: reorder, show/hide, rename, remove, and an
// "Add section" palette. Music is the only kind capped at one per invitation.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useSigilStore } from '../../state/sigilStore';
import type { SectionKind } from '../../types/sigil.types';
import { SECTION_CATALOGUE, getSectionMeta } from '../../utils/sectionDefaults';
import { EventIcon } from '../icons/eventIcons';

export function SectionsPanel() {
  const design = useSigilStore((s) => s.design);
  const inspectorFocus = useSigilStore((s) => s.inspectorFocus);
  const focusInspector = useSigilStore((s) => s.focusInspector);
  const addSection = useSigilStore((s) => s.addSection);
  const removeSection = useSigilStore((s) => s.removeSection);
  const moveSection = useSigilStore((s) => s.moveSection);
  const toggleSection = useSigilStore((s) => s.toggleSection);
  const updateSection = useSigilStore((s) => s.updateSection);

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const sections = design.sections ?? [];
  const lang: 'ES' | 'EN' = design.language === 'EN' ? 'EN' : 'ES';
  const t = (es: string, en: string) => (lang === 'EN' ? en : es);

  const rsvpCount = sections.filter((s) => s.kind === 'RSVP' && s.enabled).length;
  const usedKinds = new Set(sections.map((s) => s.kind));

  const handleAdd = (kind: SectionKind) => {
    const id = addSection(kind);
    if (id) setIsPaletteOpen(false);
  };

  return (
    <section className="lp-section sections-panel" aria-labelledby="sections-panel-label">
      <div className="sections-panel-header">
        <p className="lp-section-label" id="sections-panel-label" style={{ margin: 0 }}>
          {t('Secciones', 'Sections')}
        </p>
        <button
          type="button"
          className="sections-add-btn"
          onClick={() => setIsPaletteOpen((v) => !v)}
          aria-expanded={isPaletteOpen}
        >
          <EventIcon id="plus" size={13} />
          {t('Agregar', 'Add')}
        </button>
      </div>

      {isPaletteOpen && (
        <div className="sections-palette" role="group" aria-label={t('Tipos de sección', 'Section types')}>
          {SECTION_CATALOGUE.map((meta) => {
            const blocked = meta.singleton && usedKinds.has(meta.kind);
            return (
              <button
                key={meta.kind}
                type="button"
                className={`sections-palette-item ${blocked ? 'blocked' : ''}`}
                disabled={blocked}
                onClick={() => handleAdd(meta.kind)}
                title={blocked ? t('Ya existe — solo se permite una', 'Already added — only one allowed') : undefined}
              >
                <span className="sections-palette-icon">
                  <EventIcon id={meta.icon} size={18} />
                </span>
                <span className="sections-palette-text">
                  <span className="sections-palette-name">
                    {meta.label[lang]}
                    {blocked && <em> — {t('ya agregada', 'already added')}</em>}
                  </span>
                  <span className="sections-palette-desc">{meta.description[lang]}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {rsvpCount > 1 && (
        <p className="sections-warning" role="status">
          {t(
            'Hay más de un formulario de confirmación: tus invitados verán dos.',
            'More than one RSVP form is enabled — guests will see two.',
          )}
        </p>
      )}
      {rsvpCount === 0 && (
        <p className="sections-warning" role="status">
          {t(
            'No hay formulario de confirmación visible. Tus invitados no podrán responder.',
            'No RSVP form is visible — guests will not be able to reply.',
          )}
        </p>
      )}

      <ul className="sections-list">
        {sections.length === 0 && (
          <li className="sections-empty">{t('Sin secciones todavía.', 'No sections yet.')}</li>
        )}
        {sections.map((section, idx) => {
          const meta = getSectionMeta(section.kind);
          const isFocused = inspectorFocus.type === 'SECTION' && inspectorFocus.sectionId === section.id;
          const label = section.title || meta.label[lang];
          return (
            <li
              key={section.id}
              className={`sections-row ${isFocused ? 'focused' : ''} ${section.enabled ? '' : 'disabled'}`}
            >
              <span className="sections-row-icon"><EventIcon id={meta.icon} size={16} /></span>

              {renamingId === section.id ? (
                <input
                  className="lp-input sections-rename-input"
                  autoFocus
                  defaultValue={section.title || ''}
                  placeholder={meta.label[lang]}
                  aria-label={t('Nombre de la sección', 'Section name')}
                  onBlur={(e) => {
                    updateSection(section.id, { title: e.target.value.trim() || undefined });
                    setRenamingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="sections-row-label"
                  onClick={() => focusInspector({ type: 'SECTION', sectionId: section.id })}
                  onDoubleClick={() => setRenamingId(section.id)}
                  title={t('Clic para editar, doble clic para renombrar', 'Click to edit, double-click to rename')}
                >
                  {label}
                </button>
              )}

              <div className="sections-row-actions">
                <button
                  type="button"
                  aria-label={section.enabled ? t('Ocultar', 'Hide') : t('Mostrar', 'Show')}
                  aria-pressed={!section.enabled}
                  onClick={() => toggleSection(section.id)}
                >
                  <EventIcon id={section.enabled ? 'eye' : 'eyeOff'} size={15} />
                </button>
                <button
                  type="button"
                  aria-label={t('Subir', 'Move up')}
                  disabled={idx === 0}
                  onClick={() => moveSection(section.id, 'up')}
                >
                  ▲
                </button>
                <button
                  type="button"
                  aria-label={t('Bajar', 'Move down')}
                  disabled={idx === sections.length - 1}
                  onClick={() => moveSection(section.id, 'down')}
                >
                  ▼
                </button>
                <button
                  type="button"
                  className="sections-row-remove"
                  aria-label={t('Quitar', 'Remove')}
                  onClick={() => removeSection(section.id)}
                >
                  <EventIcon id="trash" size={15} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
