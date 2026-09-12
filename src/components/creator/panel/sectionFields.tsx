// ─────────────────────────────────────────────────────────────────────────────
// The per-kind field groups the section inspector composes.
//
// Lifted verbatim from SectionEditor (countdown, gifts, itinerary) and from
// LeftPanel (the song upload), so the markup and handlers that already worked
// are unchanged — only their home is new. Two things did change, deliberately:
//
//   • The gifts registry image moved here from the global "Custom Artwork"
//     block, because it only ever affected this section.
//   • The countdown no longer carries its own date field. The date is the
//     event's, it lives in Evento, and duplicating it gave the host two places
//     to set one value.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useState, type ChangeEvent } from 'react';
import { useSigilStore } from '../../../state/sigilStore';
import type { ItineraryItem } from '../../../types/sigil.types';
import { ITINERARY_KINDS } from '../../../types/sigil.types';
import { getPhrasing } from '../../../utils/eventPhrasing';
import { apiFetch } from '../../../utils/api';
import { EventIcon } from '../../icons/eventIcons';
import { ITINERARY_KIND_ICON, ITINERARY_KIND_LABEL } from '../../icons/iconMaps';
import { ACCEPTED_AUDIO_TYPES, MAX_AUDIO_BYTES, useImageUploader } from '../uploadHelpers';
import { AudioUploadSlot, ImageUploadSlot } from '../uploads';
import { usePanelStrings } from './panelStrings';
import { ChevronRight } from './PanelIcons';

// ── Countdown ────────────────────────────────────────────────────────────────

export function CountdownFields() {
  const design = useSigilStore((s) => s.design);
  const setPanelTab = useSigilStore((s) => s.setPanelTab);
  const { t, lang } = usePanelStrings();

  const target = design.countdownTarget ? new Date(design.countdownTarget) : null;
  const readable =
    target && !Number.isNaN(target.getTime())
      ? target.toLocaleString(lang === 'EN' ? 'en-US' : 'es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : t('none');

  return (
    <div className="lp-field">
      <span className="lp-field-label">{t('dateTimeLabel')}</span>
      <button type="button" className="lp-linkout" onClick={() => setPanelTab('EVENT')}>
        <span className="lp-linkout-value">{readable}</span>
        <span className="lp-linkout-go">
          {t('tabEvent')}
          <ChevronRight size={13} />
        </span>
      </button>
      <p className="lp-hint lp-hint--tight">{t('dateTimeHint')}</p>
    </div>
  );
}

// ── Gifts ────────────────────────────────────────────────────────────────────

export function GiftsFields() {
  const design = useSigilStore((s) => s.design);
  const updateDesign = useSigilStore((s) => s.updateDesign);
  const { t, lang } = usePanelStrings();
  const phrasing = getPhrasing(design.eventType, lang);

  const { upload, uploading } = useImageUploader((field, value) => updateDesign({ [field]: value }));

  return (
    <>
      <div className="lp-field">
        <label className="lp-field-label" htmlFor="registry-title-input">
          {t('giftsTitleLabel')}
        </label>
        <input
          id="registry-title-input"
          type="text"
          className="lp-input"
          placeholder={phrasing.giftsHeading}
          value={design.registryTitle || ''}
          onChange={(e) => updateDesign({ registryTitle: e.target.value })}
        />
      </div>

      <div className="lp-field">
        <label className="lp-field-label" htmlFor="registry-text-input">
          {t('giftsTextLabel')}
        </label>
        <textarea
          id="registry-text-input"
          className="lp-input lp-textarea"
          value={design.registryText || ''}
          onChange={(e) => updateDesign({ registryText: e.target.value })}
        />
      </div>

      <div className="lp-field">
        <label className="lp-field-label" htmlFor="registry-symbol-input">
          {t('giftsSymbolLabel')}
        </label>
        <input
          id="registry-symbol-input"
          type="text"
          className="lp-input"
          placeholder="Ej. ༻ 🖂 ༺"
          value={design.registrySymbol || ''}
          onChange={(e) => updateDesign({ registrySymbol: e.target.value })}
        />
      </div>

      <div className="lp-field">
        <label className="lp-field-label" htmlFor="registry-link-input">
          {t('giftsLinkLabel')}
        </label>
        <input
          id="registry-link-input"
          type="url"
          className="lp-input"
          placeholder="https://..."
          value={design.registryLink || ''}
          onChange={(e) => updateDesign({ registryLink: e.target.value })}
        />
      </div>

      <ImageUploadSlot
        id="upload-registry-image"
        label={t('giftsImageLabel')}
        hint={t('giftsImageHint')}
        value={design.registryImage}
        onUpload={upload('registryImage')}
        onClear={() => updateDesign({ registryImage: undefined })}
        isUploading={uploading.registryImage}
        removeLabel={t('remove')}
        uploadingLabel={t('uploading')}
      />

      {design.registryImage && (
        <SliderField
          id="section-registry-image-scale"
          label={t('giftsImageScale')}
          value={design.registryImageScale ?? 100}
          min={20}
          max={200}
          suffix="%"
          onChange={(v) => updateDesign({ registryImageScale: v })}
        />
      )}
    </>
  );
}

// ── Itinerary ────────────────────────────────────────────────────────────────

export function ItineraryFields() {
  const design = useSigilStore((s) => s.design);
  const updateDesign = useSigilStore((s) => s.updateDesign);
  const { t, lang } = usePanelStrings();

  const items = design.itinerary || [];

  const patchItem = (idx: number, patch: Partial<ItineraryItem>) => {
    const list = [...items];
    list[idx] = { ...list[idx], ...patch };
    updateDesign({ itinerary: list });
  };

  const addItem = () =>
    updateDesign({
      itinerary: [
        ...items,
        {
          id: `itin-${Date.now()}`,
          kind: 'CUSTOM',
          title: lang === 'EN' ? 'New item' : 'Nuevo momento',
          locationName: lang === 'EN' ? 'Address or venue' : 'Dirección o lugar',
          time: '12:00',
          mapLink: '',
        },
      ],
    });

  const removeItem = (idx: number) => {
    const list = [...items];
    list.splice(idx, 1);
    updateDesign({ itinerary: list });
  };

  return (
    <div className="lp-field">
      <div className="lp-subhead">
        <span className="lp-field-label">{t('itineraryItems')}</span>
        <button type="button" className="lp-add-btn lp-add-btn--small" onClick={addItem}>
          <EventIcon id="plus" size={12} />
          {t('itineraryAdd')}
        </button>
      </div>

      <div className="lp-cards">
        {items.length === 0 && <p className="lp-hint">{t('itineraryEmpty')}</p>}
        {items.map((item, idx) => (
          <div key={item.id} className="lp-card">
            <button
              type="button"
              className="lp-card-remove"
              onClick={() => removeItem(idx)}
              aria-label={`${t('remove')} — ${item.title}`}
            >
              ✕
            </button>

            <span className="lp-card-label">{t('itineraryKind')}</span>
            <div className="lp-icon-row">
              {ITINERARY_KINDS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  title={ITINERARY_KIND_LABEL[kind][lang]}
                  aria-label={`${ITINERARY_KIND_LABEL[kind][lang]} — ${idx + 1}`}
                  aria-pressed={(item.kind ?? 'CUSTOM') === kind}
                  className={`lp-icon-btn ${(item.kind ?? 'CUSTOM') === kind ? 'is-selected' : ''}`}
                  onClick={() => patchItem(idx, { kind })}
                >
                  <EventIcon id={ITINERARY_KIND_ICON[kind]} size={18} />
                </button>
              ))}
            </div>

            <input
              type="text"
              className="lp-input lp-input--small"
              placeholder={t('itineraryTitlePlaceholder')}
              value={item.title}
              aria-label={`${t('itineraryTitlePlaceholder')} ${idx + 1}`}
              onChange={(e) => patchItem(idx, { title: e.target.value })}
            />
            <input
              type="text"
              className="lp-input lp-input--small"
              placeholder={t('itineraryTimePlaceholder')}
              value={item.time}
              aria-label={`${t('itineraryTimePlaceholder')} ${idx + 1}`}
              onChange={(e) => patchItem(idx, { time: e.target.value })}
            />
            <textarea
              className="lp-input lp-input--small lp-textarea lp-textarea--short"
              placeholder={t('itineraryVenuePlaceholder')}
              value={item.locationName}
              aria-label={`${t('itineraryVenuePlaceholder')} ${idx + 1}`}
              onChange={(e) => patchItem(idx, { locationName: e.target.value })}
            />
            <input
              type="url"
              className="lp-input lp-input--small"
              placeholder={t('itineraryMapPlaceholder')}
              value={item.mapLink || ''}
              aria-label={`${t('itineraryMapPlaceholder')} ${idx + 1}`}
              onChange={(e) => patchItem(idx, { mapLink: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Music ────────────────────────────────────────────────────────────────────

export function MusicFields() {
  const design = useSigilStore((s) => s.design);
  const updateDesign = useSigilStore((s) => s.updateDesign);
  const { t } = usePanelStrings();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setError(null);

      const looksAudio =
        ACCEPTED_AUDIO_TYPES.includes(file.type) ||
        file.name.endsWith('.mp3') ||
        file.name.endsWith('.m4a');
      if (!looksAudio) {
        setError(t('musicBadType'));
        return;
      }
      if (file.size > MAX_AUDIO_BYTES) {
        setError(t('musicTooBig'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result !== 'string') return;
        try {
          setIsUploading(true);
          const response = await apiFetch('/upload/media', {
            method: 'POST',
            body: JSON.stringify({
              fileData: reader.result,
              fileName: file.name,
              fileType: file.type || 'audio/mpeg',
              bucket: 'invitation-music',
            }),
          });
          updateDesign({ musicUrl: response.publicUrl });
        } catch (err) {
          console.error('Failed to upload audio, using original locally', err);
          updateDesign({ musicUrl: reader.result });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    },
    [t, updateDesign],
  );

  return (
    <>
      <AudioUploadSlot
        id="upload-music-url"
        label={t('musicLabel')}
        hint={t('musicHint')}
        value={design.musicUrl}
        onUpload={handleUpload}
        onClear={() => updateDesign({ musicUrl: '' })}
        isUploading={isUploading}
        removeLabel={t('remove')}
        uploadingLabel={t('musicUploading')}
        localFileLabel={t('musicLocalFile')}
      />
      {error && <p className="lp-warning" role="alert">{error}</p>}
      <p className="lp-hint">{t('musicOnlyOne')}</p>
    </>
  );
}

// ── A labelled slider, used by several groups ────────────────────────────────

export function SliderField({
  id,
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="lp-field">
      <div className="lp-slider-head">
        <label className="lp-field-label" htmlFor={id}>{label}</label>
        <span className="lp-slider-value">{value}{suffix}</span>
      </div>
      <input
        id={id}
        type="range"
        className="lp-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(step && step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value, 10))}
      />
    </div>
  );
}
