// ─────────────────────────────────────────────────────────────────────────────
// Event type picker — shown when creating a new invitation. Each type seeds a
// full template (copy, itinerary, sections, dress code, RSVP defaults).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import type { EventType } from '../../types/sigil.types';
import type { TemplateLang } from '../../templates';
import { EVENT_TEMPLATE_ORDER } from '../../templates';
import { getPhrasing } from '../../utils/eventPhrasing';
import { EventIcon } from '../icons/eventIcons';
import { EVENT_TYPE_ICON } from '../icons/iconMaps';

interface EventTypePickerProps {
  onCancel: () => void;
  onSelect: (eventType: EventType, lang: TemplateLang) => void;
  isCreating?: boolean;
}

export function EventTypePicker({ onCancel, onSelect, isCreating }: EventTypePickerProps) {
  const [lang, setLang] = useState<TemplateLang>('ES');
  const [selected, setSelected] = useState<EventType>('WEDDING');

  return (
    <div className="etp-backdrop" role="dialog" aria-modal="true" aria-labelledby="etp-title">
      <div className="etp-panel">
        <h2 id="etp-title" className="etp-title">
          {lang === 'EN' ? 'What are you celebrating?' : '¿Qué vas a celebrar?'}
        </h2>
        <p className="etp-subtitle">
          {lang === 'EN'
            ? 'Pick a starting point — you can change every word afterwards.'
            : 'Elige un punto de partida — después puedes cambiar todo el contenido.'}
        </p>

        <div className="etp-lang-row" role="group" aria-label={lang === 'EN' ? 'Language' : 'Idioma'}>
          {(['ES', 'EN'] as TemplateLang[]).map((code) => (
            <button
              key={code}
              type="button"
              className={`etp-lang-btn ${lang === code ? 'selected' : ''}`}
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
            >
              {code === 'ES' ? 'Español' : 'English'}
            </button>
          ))}
        </div>

        <div className="etp-grid">
          {EVENT_TEMPLATE_ORDER.map((type) => {
            const phrasing = getPhrasing(type, lang);
            return (
              <button
                key={type}
                type="button"
                className={`etp-card ${selected === type ? 'selected' : ''}`}
                aria-pressed={selected === type}
                onClick={() => setSelected(type)}
                onDoubleClick={() => onSelect(type, lang)}
              >
                <span className="etp-card-icon">
                  <EventIcon id={EVENT_TYPE_ICON[type]} size={28} />
                </span>
                <span className="etp-card-name">{phrasing.typeLabel}</span>
                <span className="etp-card-desc">{phrasing.typeDescription}</span>
              </button>
            );
          })}
        </div>

        <div className="etp-actions">
          <button type="button" className="etp-cancel" onClick={onCancel} disabled={isCreating}>
            {lang === 'EN' ? 'Cancel' : 'Cancelar'}
          </button>
          <button
            type="button"
            className="etp-confirm"
            onClick={() => onSelect(selected, lang)}
            disabled={isCreating}
          >
            {isCreating
              ? (lang === 'EN' ? 'Creating…' : 'Creando…')
              : (lang === 'EN' ? 'Create invitation' : 'Crear invitación')}
          </button>
        </div>
      </div>
    </div>
  );
}
