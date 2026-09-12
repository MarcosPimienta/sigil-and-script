// ─────────────────────────────────────────────────────────────────────────────
// The left panel's frame: an editable invitation name, a summary of what this
// event is, three tabs, and one scrolling body.
//
// The header and tabs are deliberately outside the scroll container. The old
// panel scrolled as a single 2000px column, so there was no fixed reference
// point anywhere in it; here the host always knows which tab they are in.
// ─────────────────────────────────────────────────────────────────────────────

import { useSigilStore } from '../../../state/sigilStore';
import { PANEL_TABS, type PanelTab } from '../../../types/sigil.types';
import { getPhrasing } from '../../../utils/eventPhrasing';
import { EventIcon } from '../../icons/eventIcons';
import { EVENT_TYPE_ICON } from '../../icons/iconMaps';
import { usePanelStrings, type PanelStringKey } from './panelStrings';
import { EventTab } from './EventTab';
import { SectionsTab } from './SectionsTab';
import { StyleTab } from './StyleTab';

const TAB_LABEL: Record<PanelTab, PanelStringKey> = {
  EVENT: 'tabEvent',
  SECTIONS: 'tabSections',
  STYLE: 'tabStyle',
};

/** "14 feb 2027" from the countdown target, or nothing if it is unset. */
function formatEventChip(countdownTarget: string | undefined, lang: 'ES' | 'EN'): string | null {
  if (!countdownTarget) return null;
  const date = new Date(countdownTarget);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(lang === 'EN' ? 'en-US' : 'es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function PanelShell() {
  const design = useSigilStore((s) => s.design);
  const panelTab = useSigilStore((s) => s.panelTab);
  const setPanelTab = useSigilStore((s) => s.setPanelTab);
  const updateDesign = useSigilStore((s) => s.updateDesign);
  const { t, lang } = usePanelStrings();

  const phrasing = getPhrasing(design.eventType, lang);
  const dateChip = formatEventChip(design.countdownTarget, lang);

  return (
    <div className="lp-shell">
      <header className="lp-shell-header">
        <input
          id="input-design-title"
          type="text"
          className="lp-shell-name"
          value={design.title || ''}
          onChange={(e) => updateDesign({ title: e.target.value })}
          placeholder={phrasing.hostsPlaceholder}
          aria-label={t('eventTitleLabel')}
          maxLength={120}
        />
        <div className="lp-shell-chips">
          <span className="lp-chip lp-chip--type">
            <EventIcon id={EVENT_TYPE_ICON[design.eventType ?? 'WEDDING']} size={12} />
            {phrasing.typeLabel}
          </span>
          <span className="lp-chip-sep" aria-hidden="true">·</span>
          <span>{lang === 'EN' ? t('languageEn') : t('languageEs')}</span>
          {dateChip && (
            <>
              <span className="lp-chip-sep" aria-hidden="true">·</span>
              <span>{dateChip}</span>
            </>
          )}
        </div>
      </header>

      <nav className="lp-tabs" role="tablist" aria-label={t('tabSections')}>
        {PANEL_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`lp-tab-${tab}`}
            className={`lp-tab ${panelTab === tab ? 'is-active' : ''}`}
            aria-selected={panelTab === tab}
            aria-controls="lp-tab-body"
            onClick={() => setPanelTab(tab)}
          >
            {t(TAB_LABEL[tab])}
          </button>
        ))}
      </nav>

      <div
        className="lp-body"
        id="lp-tab-body"
        role="tabpanel"
        aria-labelledby={`lp-tab-${panelTab}`}
      >
        {panelTab === 'EVENT' && <EventTab />}
        {panelTab === 'SECTIONS' && <SectionsTab />}
        {panelTab === 'STYLE' && <StyleTab />}
      </div>
    </div>
  );
}
