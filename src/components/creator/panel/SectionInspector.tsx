// ─────────────────────────────────────────────────────────────────────────────
// The section inspector — a drill-down that REPLACES the list.
//
// Every control that only affects one section now lives here: the RSVP form
// configuration (which used to be a root-level block called "RSVP Form
// Controls"), the song (a root-level "Background Music" block that duplicated
// the AUDIO section), and the registry image (filed under global artwork).
//
// Delete sits alone in a footer. In the old panel it was a trash icon one
// pixel from the visibility eye, which is a bad place for the only
// irreversible control in the list.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useSigilStore } from '../../../state/sigilStore';
import type { InvitationSection } from '../../../types/sigil.types';
import { getSectionMeta } from '../../../utils/sectionDefaults';
import { EventIcon } from '../../icons/eventIcons';
import { FormConfiguratorPanel } from '../FormConfiguratorPanel';
import { DressCodeEditor } from '../editors/DressCodeEditor';
import {
  TextSectionEditor,
  ImageSectionEditor,
  VideoSectionEditor,
  DividerSectionEditor,
} from '../editors/SectionKindEditors';
import { SectionFontFields } from '../editors/SectionFontFields';
import { ChevronLeft } from './PanelIcons';
import { usePanelStrings } from './panelStrings';
import { CountdownFields, GiftsFields, ItineraryFields, MusicFields } from './sectionFields';

type InspectorTab = 'CONTENT' | 'TYPE';

/**
 * Kinds whose renderer actually prints `section.title`. For every other kind
 * the field is just the row's name in the panel, and calling it a "heading"
 * would promise the host something the invitation never shows.
 */
const TITLE_IS_RENDERED = new Set(['TEXT', 'IMAGE', 'VIDEO', 'RSVP']);

function ContentFor({ section }: { section: InvitationSection }) {
  switch (section.kind) {
    case 'TEXT':
      return <TextSectionEditor section={section} />;
    case 'IMAGE':
      return <ImageSectionEditor section={section} />;
    case 'VIDEO':
      return <VideoSectionEditor section={section} />;
    case 'DIVIDER':
      return <DividerSectionEditor section={section} />;
    case 'COUNTDOWN':
      return <CountdownFields />;
    case 'ITINERARY':
      return <ItineraryFields />;
    case 'DRESS_CODE':
      return <DressCodeEditor />;
    case 'GIFTS':
      return <GiftsFields />;
    case 'AUDIO':
      return <MusicFields />;
    case 'RSVP':
      return <FormConfiguratorPanel />;
    default:
      return null;
  }
}

export function SectionInspector({ section }: { section: InvitationSection }) {
  const focusInspector = useSigilStore((s) => s.focusInspector);
  const updateSection = useSigilStore((s) => s.updateSection);
  const toggleSection = useSigilStore((s) => s.toggleSection);
  const removeSection = useSigilStore((s) => s.removeSection);
  const { t, lang } = usePanelStrings();
  const [tab, setTab] = useState<InspectorTab>('CONTENT');

  const meta = getSectionMeta(section.kind);
  const body = <ContentFor section={section} />;
  const showsTitle = TITLE_IS_RENDERED.has(section.kind);

  const handleDelete = () => {
    if (!window.confirm(t('inspectorDeleteConfirm'))) return;
    removeSection(section.id);
    focusInspector({ type: 'NONE' });
  };

  return (
    <div className="lp-tab-content lp-inspector">
      <button type="button" className="lp-back" onClick={() => focusInspector({ type: 'NONE' })}>
        <ChevronLeft />
        <span>{t('inspectorBack')}</span>
      </button>

      <div className="lp-drill-head">
        <h2 className="lp-drill-title">
          <span className="lp-drill-icon">
            <EventIcon id={meta.icon} size={18} />
          </span>
          {section.title || meta.label[lang]}
        </h2>
        <p className="lp-hint lp-hint--tight">
          {meta.description[lang]}
          {meta.singleton && ` · ${t('inspectorSingleton')}`}
        </p>
      </div>

      <div className="lp-subtabs" role="tablist" aria-label={meta.label[lang]}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'CONTENT'}
          className={`lp-subtab ${tab === 'CONTENT' ? 'is-active' : ''}`}
          onClick={() => setTab('CONTENT')}
        >
          {t('inspectorContent')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'TYPE'}
          className={`lp-subtab ${tab === 'TYPE' ? 'is-active' : ''}`}
          onClick={() => setTab('TYPE')}
        >
          {t('inspectorType')}
        </button>
      </div>

      <div className="lp-inspector-body">
        {tab === 'CONTENT' ? (
          <>
            <div className="lp-field">
              <label className="lp-field-label" htmlFor={`sec-title-${section.id}`}>
                {showsTitle ? t('inspectorTitleLabel') : t('inspectorNameLabel')}
              </label>
              <input
                id={`sec-title-${section.id}`}
                className="lp-input"
                type="text"
                value={section.title || ''}
                placeholder={meta.label[lang]}
                onChange={(e) => updateSection(section.id, { title: e.target.value || undefined })}
              />
              {!showsTitle && <p className="lp-hint lp-hint--tight">{t('inspectorNameHint')}</p>}
            </div>
            {body ?? <p className="lp-hint">{t('inspectorNoFields')}</p>}
          </>
        ) : (
          <SectionFontFields section={section} />
        )}
      </div>

      <footer className="lp-inspector-footer">
        <button
          type="button"
          className="lp-foot-toggle"
          aria-pressed={!section.enabled}
          onClick={() => toggleSection(section.id)}
        >
          <EventIcon id={section.enabled ? 'eye' : 'eyeOff'} size={15} />
          {section.enabled ? t('inspectorVisible') : t('inspectorHidden')}
        </button>
        <button type="button" className="lp-foot-delete" onClick={handleDelete}>
          <EventIcon id="trash" size={14} />
          {t('inspectorDelete')}
        </button>
      </footer>
    </div>
  );
}
