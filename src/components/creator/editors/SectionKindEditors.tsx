// ─────────────────────────────────────────────────────────────────────────────
// Per-kind editors for the free-form sections (TEXT, IMAGE, VIDEO, DIVIDER).
// Rendered by SectionEditor when a section is focused in the Sections panel.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type ChangeEvent } from 'react';
import { useSigilStore } from '../../../state/sigilStore';
import type { InvitationSection, InkColor } from '../../../types/sigil.types';
import {
  ACCEPTED_VIDEO_TYPES,
  MAX_VIDEO_BYTES,
  parseVideoUrl,
} from '../../../utils/sectionDefaults';
import { apiFetch } from '../../../utils/api';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, compressImage, ImageUploadSlot } from '../LeftPanel';

type Lang = 'ES' | 'EN';

function useLang(): [Lang, (es: string, en: string) => string] {
  const language = useSigilStore((s) => s.design.language);
  const lang: Lang = language === 'EN' ? 'EN' : 'ES';
  return [lang, (es, en) => (lang === 'EN' ? en : es)];
}

const INK_CHOICES: { id: InkColor; label: string }[] = [
  { id: 'DARK_INK', label: 'Oscura' },
  { id: 'LIGHT_INK', label: 'Clara' },
  { id: 'SEPIA_INK', label: 'Sepia' },
  { id: 'METALLIC_GOLD', label: 'Oro' },
  { id: 'METALLIC_SILVER', label: 'Plata' },
];

export function TextSectionEditor({ section }: { section: InvitationSection }) {
  const updateSection = useSigilStore((s) => s.updateSection);
  const [, t] = useLang();
  if (section.props.kind !== 'TEXT') return null;
  const props = section.props;
  const patch = (changes: Partial<typeof props>) =>
    updateSection(section.id, { props: { ...props, ...changes } });

  return (
    <>
      <div className="lp-field">
        <label className="lp-field-label" htmlFor={`sec-text-${section.id}`}>
          {t('Texto', 'Text')}
        </label>
        <textarea
          id={`sec-text-${section.id}`}
          className="lp-input"
          style={{ height: '110px', resize: 'vertical' }}
          value={props.content}
          onChange={(e) => patch({ content: e.target.value })}
          placeholder={t('Escribe tu mensaje…', 'Write your message…')}
        />
        <p className="scm-field-hint">
          {t('Puedes usar {{guest_name}}, {{event_date}} y {{event_location}}.', 'You can use {{guest_name}}, {{event_date}} and {{event_location}}.')}
        </p>
      </div>

      <div className="lp-field">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="lp-field-label" htmlFor={`sec-text-size-${section.id}`}>
            {t('Tamaño', 'Size')}
          </label>
          <span style={{ fontSize: '0.8rem', color: 'var(--cr-text-secondary)' }}>{props.fontSize.toFixed(2)}rem</span>
        </div>
        <input
          id={`sec-text-size-${section.id}`}
          type="range"
          min="0.7"
          max="3"
          step="0.05"
          value={props.fontSize}
          onChange={(e) => patch({ fontSize: parseFloat(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--cr-accent)' }}
        />
      </div>

      <div className="lp-field">
        <label className="lp-field-label">{t('Alineación', 'Alignment')}</label>
        <div className="scm-segmented">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              type="button"
              className={props.textAlign === align ? 'active' : ''}
              onClick={() => patch({ textAlign: align })}
            >
              {align === 'left' ? t('Izq.', 'Left') : align === 'center' ? t('Centro', 'Center') : t('Der.', 'Right')}
            </button>
          ))}
        </div>
      </div>

      <div className="lp-field">
        <label className="lp-field-label">{t('Estilo', 'Style')}</label>
        <div className="scm-segmented">
          {(['normal', 'italic'] as const).map((style) => (
            <button
              key={style}
              type="button"
              className={props.fontStyle === style ? 'active' : ''}
              onClick={() => patch({ fontStyle: style })}
            >
              {style === 'normal' ? t('Normal', 'Normal') : t('Cursiva', 'Italic')}
            </button>
          ))}
        </div>
      </div>

      <div className="lp-field">
        <label className="lp-field-label" htmlFor={`sec-text-ink-${section.id}`}>
          {t('Color de tinta', 'Ink colour')}
        </label>
        <select
          id={`sec-text-ink-${section.id}`}
          className="lp-input"
          value={props.color}
          onChange={(e) => patch({ color: e.target.value as InkColor })}
        >
          {INK_CHOICES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>
    </>
  );
}

export function ImageSectionEditor({ section }: { section: InvitationSection }) {
  const updateSection = useSigilStore((s) => s.updateSection);
  const [, t] = useLang();
  const [isUploading, setIsUploading] = useState(false);
  if (section.props.kind !== 'IMAGE') return null;
  const props = section.props;
  const patch = (changes: Partial<typeof props>) =>
    updateSection(section.id, { props: { ...props, ...changes } });

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      setIsUploading(true);
      try {
        const compressed = file.type === 'image/svg+xml' ? reader.result : await compressImage(reader.result);
        const res = await apiFetch('/upload/media', {
          method: 'POST',
          body: JSON.stringify({
            fileData: compressed,
            fileName: file.name,
            fileType: file.type,
            bucket: 'invitation-images',
          }),
        });
        patch({ src: res?.publicUrl || compressed });
      } catch {
        patch({ src: reader.result });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <ImageUploadSlot
        id={`sec-image-${section.id}`}
        label={t('Imagen', 'Image')}
        hint={t('PNG, JPG, WEBP o SVG (máx. 8MB)', 'PNG, JPG, WEBP or SVG (max 8MB)')}
        value={props.src}
        onUpload={handleUpload}
        onClear={() => patch({ src: '' })}
        isUploading={isUploading}
      />

      <div className="lp-field">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="lp-field-label" htmlFor={`sec-image-scale-${section.id}`}>
            {t('Escala', 'Scale')}
          </label>
          <span style={{ fontSize: '0.8rem', color: 'var(--cr-text-secondary)' }}>{props.scale}%</span>
        </div>
        <input
          id={`sec-image-scale-${section.id}`}
          type="range"
          min="20"
          max="200"
          value={props.scale}
          onChange={(e) => patch({ scale: parseInt(e.target.value, 10) })}
          style={{ width: '100%', accentColor: 'var(--cr-accent)' }}
        />
      </div>

      <div className="lp-field">
        <label className="lp-field-label" htmlFor={`sec-image-caption-${section.id}`}>
          {t('Pie de imagen (opcional)', 'Caption (optional)')}
        </label>
        <input
          id={`sec-image-caption-${section.id}`}
          className="lp-input"
          type="text"
          value={props.caption || ''}
          onChange={(e) => patch({ caption: e.target.value || undefined })}
        />
      </div>
    </>
  );
}

export function VideoSectionEditor({ section }: { section: InvitationSection }) {
  const updateSection = useSigilStore((s) => s.updateSection);
  const [, t] = useLang();
  const [isUploading, setIsUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (section.props.kind !== 'VIDEO') return null;
  const props = section.props;
  const patch = (changes: Partial<typeof props>) =>
    updateSection(section.id, { props: { ...props, ...changes } });

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setError(null);
    if (!file) return;
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setError(t('Formato no soportado. Usa MP4 o WEBM, o pega un enlace.', 'Unsupported format. Use MP4 or WEBM, or paste a link.'));
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError(
        t(
          `El archivo pesa ${(file.size / 1048576).toFixed(1)} MB. El máximo para subir es 7 MB — súbelo a YouTube o Vimeo y pega el enlace.`,
          `That file is ${(file.size / 1048576).toFixed(1)} MB. The upload limit is 7 MB — put it on YouTube or Vimeo and paste the link instead.`,
        ),
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      setIsUploading(true);
      try {
        const res = await apiFetch('/upload/media', {
          method: 'POST',
          body: JSON.stringify({
            fileData: reader.result,
            fileName: file.name,
            fileType: file.type,
            bucket: 'invitation-images',
          }),
        });
        if (!res?.publicUrl) throw new Error('no url');
        patch({ src: res.publicUrl, provider: 'FILE' });
      } catch {
        setError(t('No se pudo subir el video. Intenta con un enlace.', 'Could not upload the video. Try a link instead.'));
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyUrl = () => {
    const parsed = parseVideoUrl(urlDraft);
    if (!parsed) {
      setError(t('Enlace no reconocido. Usa YouTube, Vimeo o un enlace directo .mp4/.webm.', 'Link not recognised. Use YouTube, Vimeo, or a direct .mp4/.webm link.'));
      return;
    }
    setError(null);
    setUrlDraft('');
    patch({ src: parsed.src, provider: parsed.provider });
  };

  const providerLabel =
    props.provider === 'YOUTUBE' ? 'YouTube' : props.provider === 'VIMEO' ? 'Vimeo' : t('Archivo', 'File');

  return (
    <>
      <div className="lp-field">
        <label className="lp-field-label">{t('Video actual', 'Current video')}</label>
        {props.src ? (
          <div className="sec-video-current">
            <span className="sec-video-provider">{providerLabel}</span>
            <span className="sec-video-src" title={props.src}>{props.src}</span>
            <button type="button" className="scm-clear-btn" onClick={() => patch({ src: '', provider: 'FILE' })}>
              {t('Quitar', 'Clear')}
            </button>
          </div>
        ) : (
          <p className="scm-field-hint">{t('Aún no hay video.', 'No video yet.')}</p>
        )}
      </div>

      {error && <p className="sections-warning" role="alert">{error}</p>}

      <div className="lp-field">
        <label className="lp-field-label" htmlFor={`sec-video-url-${section.id}`}>
          {t('Pegar enlace (YouTube, Vimeo o .mp4)', 'Paste a link (YouTube, Vimeo or .mp4)')}
        </label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            id={`sec-video-url-${section.id}`}
            className="lp-input"
            type="url"
            value={urlDraft}
            placeholder="https://…"
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyUrl();
              }
            }}
          />
          <button type="button" className="lp-add-invitee-btn" onClick={applyUrl} style={{ padding: '2px 10px', fontSize: '0.75rem' }}>
            {t('Usar', 'Use')}
          </button>
        </div>
      </div>

      <div className="lp-field">
        <label className="lp-field-label" htmlFor={`sec-video-file-${section.id}`}>
          {t('…o subir un clip corto (máx. 7 MB)', '…or upload a short clip (max 7 MB)')}
        </label>
        <label className="scm-upload-btn" htmlFor={`sec-video-file-${section.id}`} style={{ display: 'inline-block' }}>
          {isUploading ? t('Subiendo…', 'Uploading…') : t('Elegir archivo MP4 / WEBM', 'Choose MP4 / WEBM file')}
        </label>
        <input
          id={`sec-video-file-${section.id}`}
          type="file"
          accept={ACCEPTED_VIDEO_TYPES.join(',')}
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
      </div>

      <div className="lp-field">
        <label className="lp-field-label" htmlFor={`sec-video-caption-${section.id}`}>
          {t('Pie de video (opcional)', 'Caption (optional)')}
        </label>
        <input
          id={`sec-video-caption-${section.id}`}
          className="lp-input"
          type="text"
          value={props.caption || ''}
          onChange={(e) => patch({ caption: e.target.value || undefined })}
        />
      </div>

      <p className="scm-field-hint">
        {t(
          'El video nunca se reproduce solo. Al darle play, la música de fondo se silencia.',
          'Video never autoplays. Starting it mutes the background music.',
        )}
      </p>
    </>
  );
}

export function DividerSectionEditor({ section }: { section: InvitationSection }) {
  const updateSection = useSigilStore((s) => s.updateSection);
  const [, t] = useLang();
  if (section.props.kind !== 'DIVIDER') return null;
  const props = section.props;

  return (
    <div className="lp-field">
      <label className="lp-field-label">{t('Adorno', 'Ornament')}</label>
      <div className="scm-segmented">
        {(['flourish', 'line', 'dots'] as const).map((ornament) => (
          <button
            key={ornament}
            type="button"
            className={props.ornament === ornament ? 'active' : ''}
            onClick={() => updateSection(section.id, { props: { ...props, ornament } })}
          >
            {ornament === 'flourish' ? t('Filigrana', 'Flourish') : ornament === 'line' ? t('Línea', 'Line') : t('Puntos', 'Dots')}
          </button>
        ))}
      </div>
    </div>
  );
}
