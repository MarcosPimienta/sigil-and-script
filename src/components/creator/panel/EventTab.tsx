// ─────────────────────────────────────────────────────────────────────────────
// Evento — the facts about the event, which used to be scattered: the language
// switch lived in SectionEditor, the hosts field beside it, and the date and
// deadline sat 1800px down the panel under "Guest Details".
//
// Two of those old fields (date, RSVP deadline) only ever edited the preview
// guest payload, which is rebuilt from the design every time an invitation
// loads — so what the host typed was silently discarded. Here they write the
// design fields that guests actually receive, and mirror into the preview so
// the stage still updates as you type.
// ─────────────────────────────────────────────────────────────────────────────

import { useSigilStore, formatEventDateForGuest } from '../../../state/sigilStore';
import type { EventType } from '../../../types/sigil.types';
import { EVENT_TEMPLATE_ORDER } from '../../../templates';
import { getPhrasing } from '../../../utils/eventPhrasing';
import { EventIcon } from '../../icons/eventIcons';
import { EVENT_TYPE_ICON } from '../../icons/iconMaps';
import { usePanelStrings } from './panelStrings';

export function EventTab() {
  const design = useSigilStore((s) => s.design);
  const guest = useSigilStore((s) => s.guest);
  const updateDesign = useSigilStore((s) => s.updateDesign);
  const updateTextBlock = useSigilStore((s) => s.updateTextBlock);
  const setGuest = useSigilStore((s) => s.setGuest);
  const { t, lang } = usePanelStrings();

  const phrasing = getPhrasing(design.eventType, lang);
  const hostNames = design.textBlocks?.find((b) => b.id === 'tb-headline')?.content ?? '';
  const currentType: EventType = design.eventType ?? 'WEDDING';

  // The countdown target is the one durable date. Changing it re-derives the
  // human-readable date the preview shows, exactly as loading an invitation does.
  const handleCountdown = (value: string) => {
    updateDesign({ countdownTarget: value });
    setGuest({ eventDate: formatEventDateForGuest(value, guest.language || design.language) });
  };

  const handleRsvpDeadline = (value: string) => {
    updateDesign({ rsvpDeadline: value });
    setGuest({ rsvpBy: value });
  };

  return (
    <div className="lp-tab-content">
      {/* ── Event type ─────────────────────────────────────────────────────── */}
      <section className="lp-block">
        <p className="lp-block-label">{t('eventTypeGroup')}</p>
        <div className="lp-type-grid" role="radiogroup" aria-label={t('eventTypeGroup')}>
          {EVENT_TEMPLATE_ORDER.map((type) => {
            const typePhrasing = getPhrasing(type, lang);
            const selected = currentType === type;
            return (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`lp-type-card ${selected ? 'is-selected' : ''}`}
                title={typePhrasing.typeDescription}
                onClick={() => updateDesign({ eventType: type })}
              >
                <EventIcon id={EVENT_TYPE_ICON[type]} size={18} />
                <span>{typePhrasing.typeLabel}</span>
              </button>
            );
          })}
        </div>
        <p className="lp-hint">{t('eventTypeHint')}</p>
      </section>

      {/* ── Details ────────────────────────────────────────────────────────── */}
      <section className="lp-block">
        <p className="lp-block-label">{t('eventDetailsGroup')}</p>

        <div className="lp-field">
          <label className="lp-field-label" htmlFor="host-names-input">
            {phrasing.hostsLabel}
          </label>
          <input
            id="host-names-input"
            type="text"
            className="lp-input"
            placeholder={phrasing.hostsPlaceholder}
            value={hostNames}
            onChange={(e) => updateTextBlock('tb-headline', { content: e.target.value })}
          />
        </div>

        <div className="lp-field">
          <label className="lp-field-label" htmlFor="countdown-input">
            {t('dateTimeLabel')}
          </label>
          <input
            id="countdown-input"
            type="datetime-local"
            className="lp-input"
            value={design.countdownTarget ? design.countdownTarget.substring(0, 16) : ''}
            onChange={(e) => handleCountdown(e.target.value)}
          />
          <p className="lp-hint lp-hint--tight">{t('dateTimeHint')}</p>
        </div>

        <div className="lp-field">
          <label className="lp-field-label" htmlFor="rsvp-by">
            {t('rsvpByLabel')}
          </label>
          <input
            id="rsvp-by"
            type="text"
            className="lp-input"
            value={design.rsvpDeadline ?? ''}
            onChange={(e) => handleRsvpDeadline(e.target.value)}
            placeholder={t('rsvpByPlaceholder')}
            autoComplete="off"
            maxLength={80}
          />
          <p className="lp-hint lp-hint--tight">{t('rsvpByHint')}</p>
        </div>
      </section>

      {/* ── Language ───────────────────────────────────────────────────────── */}
      <section className="lp-block">
        <p className="lp-block-label">{t('languageGroup')}</p>
        <div className="lp-segmented" role="group" aria-label={t('languageGroup')}>
          <button
            type="button"
            id="editor-lang-es-btn"
            className={`lp-segment ${lang === 'ES' ? 'is-active' : ''}`}
            aria-pressed={lang === 'ES'}
            onClick={() => updateDesign({ language: 'ES' })}
          >
            {t('languageEs')}
          </button>
          <button
            type="button"
            id="editor-lang-en-btn"
            className={`lp-segment ${lang === 'EN' ? 'is-active' : ''}`}
            aria-pressed={lang === 'EN'}
            onClick={() => updateDesign({ language: 'EN' })}
          >
            {t('languageEn')}
          </button>
        </div>
      </section>

      {/* ── Preview-only ───────────────────────────────────────────────────── */}
      <section className="lp-block">
        <p className="lp-block-label">{t('previewGroup')}</p>

        <div className="lp-field">
          <label className="lp-field-label" htmlFor="guest-name">
            {t('previewGuestLabel')}
          </label>
          <input
            id="guest-name"
            className="lp-input"
            type="text"
            value={guest.guestName}
            onChange={(e) => setGuest({ guestName: e.target.value })}
            placeholder={t('previewGuestPlaceholder')}
            autoComplete="off"
            maxLength={120}
          />
        </div>

        <div className="lp-field">
          <label className="lp-field-label" htmlFor="event-location">
            {t('venueLabel')}
          </label>
          <input
            id="event-location"
            className="lp-input"
            type="text"
            value={guest.eventLocation ?? ''}
            onChange={(e) => setGuest({ eventLocation: e.target.value })}
            placeholder={t('venuePlaceholder')}
            autoComplete="off"
            maxLength={120}
          />
          <p className="lp-hint lp-hint--tight">{t('venueHint')}</p>
        </div>

        <p className="lp-hint">{t('previewHint')}</p>
      </section>
    </div>
  );
}
