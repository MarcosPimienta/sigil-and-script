// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Left Control Panel
// INVITATION STUDIO sidebar with all design controls.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useState, type ChangeEvent } from 'react';
import { useSigil } from '../../context/SigilContext';
import type { InvitationDesign } from '../../types/sigil.types';
import { GuestRosterPanel } from './GuestRosterPanel';
import { FormConfiguratorPanel } from './FormConfiguratorPanel';
import { SectionEditor } from './SectionEditor';
import { apiFetch } from '../../utils/api';

// ── Custom artwork uploads ───────────────────────────────────────────────────
// Rendered exclusively via <img src> / CSS background-image (see
// InvitationStage) — never inlined into the DOM — so even a malicious SVG
// upload can't execute script; browsers don't run scripts embedded in an
// SVG loaded that way. Raster-only allow-list closes the remaining gap
// (an SVG can still reference external resources like a tracking pixel).
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

function compressImage(
  base64Str: string,
  format = 'image/jpeg',
  quality = 0.8,
  maxWidth = 1000,
  maxHeight = 1000
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.clearRect(0, 0, width, height); // Ensure background is transparent
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL(format, format === 'image/jpeg' ? quality : undefined);
      resolve(compressed);
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
}

type ImageField = keyof Pick<
  InvitationDesign,
  'headerImage' | 'frameImage' | 'paperImage' | 'closedEnvelopeImage' | 'openedEnvelopeImage' | 'stickerImage' | 'registryImage'
>;



// ── Section header ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="lp-section-label">{children}</p>;
}

// ── Custom artwork upload slot ───────────────────────────────────────────────

function ImageUploadSlot({
  id,
  label,
  hint,
  value,
  onUpload,
  onClear,
  isUploading,
}: {
  id: string;
  label: string;
  hint: string;
  value?: string;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  isUploading?: boolean;
}) {
  return (
    <div className="lp-field">
      <label className="lp-field-label" htmlFor={id}>
        {label}
      </label>
      {isUploading ? (
        <div className="lp-upload-zone lp-upload-zone--wide" style={{ pointerEvents: 'none', opacity: 0.7, minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--cr-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="animate-pulse">Uploading image...</span>
          </span>
        </div>
      ) : value ? (
        <div className="lp-image-slot">
          <img src={value} alt="" className="lp-image-slot-preview" />
          <button
            type="button"
            className="lp-image-slot-remove"
            onClick={onClear}
            aria-label={`Remove ${label}`}
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="lp-upload-zone lp-upload-zone--wide" htmlFor={id}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>{hint}</span>
        </label>
      )}
      <input
        id={id}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        style={{ display: 'none' }}
        onChange={onUpload}
      />
    </div>
  );
}

function getCleanFileName(url: string): string {
  if (!url) return '';
  const lastSegment = url.split('/').pop() || url;
  let decoded = decodeURIComponent(lastSegment);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;
  return decoded.replace(uuidRegex, '');
}

// ── Background music upload slot ──────────────────────────────────────────────

function AudioUploadSlot({
  id,
  label,
  hint,
  value,
  onUpload,
  onClear,
  isUploading,
}: {
  id: string;
  label: string;
  hint: string;
  value?: string;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  isUploading?: boolean;
}) {
  const isDataUrl = value?.startsWith('data:');
  const displayName = isDataUrl ? 'Local Audio File' : (value ? getCleanFileName(value) : '');

  return (
    <div className="lp-field">
      <label className="lp-field-label" htmlFor={id}>
        {label}
      </label>
      {isUploading ? (
        <div className="lp-upload-zone lp-upload-zone--wide" style={{ minHeight: '60px', padding: '12px', pointerEvents: 'none', opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--cr-text-secondary)' }}>
            <span className="animate-pulse">Uploading audio...</span>
          </span>
        </div>
      ) : value ? (
        <div className="lp-image-slot" style={{ height: 'auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cr-text)" strokeWidth="2">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
            <span style={{ fontSize: '0.85rem', color: 'var(--cr-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
              {displayName}
            </span>
          </div>
          <button
            type="button"
            className="lp-image-slot-remove"
            onClick={onClear}
            aria-label={`Remove ${label}`}
            style={{ margin: 0 }}
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="lp-upload-zone lp-upload-zone--wide" htmlFor={id} style={{ minHeight: '60px', padding: '12px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span style={{ fontSize: '0.8rem' }}>{hint}</span>
        </label>
      )}
      <input
        id={id}
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={onUpload}
      />
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────

function Divider() {
  return <hr className="lp-divider" />;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function LeftPanel() {
  const { state, updateDesign, setGuest } = useSigil();
  const { design, guest } = state;

  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});

  // ── Custom artwork uploads ─────────────────────────────────────────────────
  const handleImageUpload = useCallback(
    (field: ImageField) => (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // allow re-selecting the same file later
      if (!file) return;
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
      if (file.size > MAX_IMAGE_BYTES) return;

      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          try {
            setUploadingFields((prev) => ({ ...prev, [field]: true }));
            const format = (field === 'stickerImage' || field === 'openedEnvelopeImage' || field === 'registryImage') ? 'image/png' : 'image/jpeg';
            const compressed = await compressImage(reader.result, format, 0.85);

            // Upload compressed file to Supabase Storage via backend REST API
            const response = await apiFetch('/upload/media', {
              method: 'POST',
              body: JSON.stringify({
                fileData: compressed,
                fileName: file.name,
                fileType: format,
                bucket: 'invitation-images',
              }),
            });

            updateDesign({ [field]: response.publicUrl });
          } catch (err: any) {
            console.error('Failed to upload image, using original locally', err);
            alert(err.message || 'Image upload failed. Storing locally for preview.');
            updateDesign({ [field]: reader.result });
          } finally {
            setUploadingFields((prev) => ({ ...prev, [field]: false }));
          }
        }
      };
      reader.readAsDataURL(file);
    },
    [updateDesign],
  );

  const handleImageClear = useCallback(
    (field: ImageField) => () => updateDesign({ [field]: undefined }),
    [updateDesign],
  );

  const handleAudioUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // allow re-selecting the same file later
      if (!file) return;

      const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a'];
      const MAX_AUDIO_BYTES = 3 * 1024 * 1024; // 3MB

      if (!ACCEPTED_AUDIO_TYPES.includes(file.type) && !file.name.endsWith('.mp3') && !file.name.endsWith('.m4a')) {
        alert('Unsupported file type. Please upload MP3, WAV, or M4A audio files.');
        return;
      }
      if (file.size > MAX_AUDIO_BYTES) {
        alert('File size exceeds the 3MB limit. Please upload a smaller or compressed audio file to satisfy deployment constraints.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          try {
            setUploadingFields((prev) => ({ ...prev, musicUrl: true }));

            // Upload file to Supabase Storage via backend REST API
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
          } catch (err: any) {
            console.error('Failed to upload audio, using original locally', err);
            alert(err.message || 'Audio upload failed. Storing locally for preview.');
            updateDesign({ musicUrl: reader.result });
          } finally {
            setUploadingFields((prev) => ({ ...prev, musicUrl: false }));
          }
        }
      };
      reader.readAsDataURL(file);
    },
    [updateDesign]
  );

  const handleAudioClear = useCallback(() => {
    updateDesign({ musicUrl: '' });
  }, [updateDesign]);

  // ── Guest name (message body token) ──────────────────────────────────────
  const handleGuestName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setGuest({ guestName: e.target.value });
    },
    [setGuest],
  );

  // ── Event details ─────────────────────────────────────────────────────────
  const handleEventDate = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setGuest({ eventDate: e.target.value }),
    [setGuest],
  );

  const handleEventLocation = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setGuest({ eventLocation: e.target.value }),
    [setGuest],
  );

  const handleRsvp = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setGuest({ rsvpBy: e.target.value }),
    [setGuest],
  );

  return (
    <aside className="left-panel">
      <div className="lp-inner">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="lp-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <h1 className="lp-title" style={{ margin: 0 }}>Invitation Studio</h1>
          <input
            id="input-design-title"
            type="text"
            className="lp-input"
            value={design.title || ''}
            onChange={(e) => updateDesign({ title: e.target.value })}
            placeholder="Invitation Title (e.g. Oscar & Rocio)"
            style={{
              width: '100%',
              fontSize: '0.85rem',
              padding: '6px 10px',
              backgroundColor: 'var(--cr-input-bg)',
              border: '1px solid var(--cr-input-border)',
              borderRadius: '4px',
              color: 'var(--cr-text)',
            }}
          />
        </div>



        {/* ══ CUSTOM ARTWORK ═══════════════════════════════════════════════ */}
        <section className="lp-section" aria-labelledby="section-artwork">
          <SectionLabel>Custom Artwork</SectionLabel>
          <p className="lp-hint">
            Upload your own imagery to replace the procedural design below.
          </p>

          <ImageUploadSlot
            id="upload-opened-envelope"
            label="Event Logo Image"
            hint="Couple photo, monogram or initials stamp rendered at the top"
            value={design.openedEnvelopeImage}
            onUpload={handleImageUpload('openedEnvelopeImage')}
            onClear={handleImageClear('openedEnvelopeImage')}
            isUploading={uploadingFields['openedEnvelopeImage']}
          />

          <ImageUploadSlot
            id="upload-sticker-image"
            label="Sticker Label / Seal"
            hint="Custom PNG image to keep the invitation sealed"
            value={design.stickerImage}
            onUpload={handleImageUpload('stickerImage')}
            onClear={handleImageClear('stickerImage')}
            isUploading={uploadingFields['stickerImage']}
          />

          <ImageUploadSlot
            id="upload-registry-image"
            label="Gifts Registry Image"
            hint="Optional SVG or PNG image displayed below the registry text"
            value={design.registryImage}
            onUpload={handleImageUpload('registryImage')}
            onClear={handleImageClear('registryImage')}
            isUploading={uploadingFields['registryImage']}
          />

          <ImageUploadSlot
            id="upload-paper-image"
            label="Textura de Fondo (Seamless Texture)"
            hint="Sube una textura para el pergamino (JPG/PNG)"
            value={design.paperImage}
            onUpload={handleImageUpload('paperImage')}
            onClear={handleImageClear('paperImage')}
            isUploading={uploadingFields['paperImage']}
          />

          <div className="lp-field" style={{ marginTop: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="lp-field-label" htmlFor="slider-seal-size">
                Tamaño del Sello (Seal Size)
              </label>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                {design.sealSize ?? 75}px
              </span>
            </div>
            <input
              id="slider-seal-size"
              type="range"
              min="40"
              max="150"
              value={design.sealSize ?? 75}
              onChange={(e) => updateDesign({ sealSize: parseInt(e.target.value, 10) })}
              style={{
                width: '100%',
                marginTop: '4px',
                accentColor: 'var(--cr-accent)',
                cursor: 'pointer',
              }}
            />
          </div>
        </section>

        <Divider />

        <FormConfiguratorPanel />

        <Divider />

        {/* ══ RESPONSIVE SECTIONS ═══════════════════════════════════════════ */}
        <section className="lp-section" aria-labelledby="section-responsive">
          <SectionLabel>Event Sections</SectionLabel>
          <SectionEditor />
        </section>

        <Divider />

        {/* ══ BACKGROUND MUSIC ═════════════════════════════════════════════ */}
        <section className="lp-section" aria-labelledby="section-music">
          <SectionLabel>Background Music</SectionLabel>
          <AudioUploadSlot
            id="upload-music-url"
            label="Background Song"
            hint="Upload MP3, WAV or M4A audio file"
            value={design.musicUrl}
            onUpload={handleAudioUpload}
            onClear={handleAudioClear}
            isUploading={uploadingFields.musicUrl}
          />
        </section>

        <Divider />

        {/* ══ GUEST DETAILS ════════════════════════════════════════════════ */}
        <section className="lp-section" aria-labelledby="section-guest">
          <SectionLabel>Guest Details</SectionLabel>

          <div className="lp-field">
            <label className="lp-field-label" htmlFor="guest-name">
              Guest Name
            </label>
            <input
              id="guest-name"
              className="lp-input"
              type="text"
              value={guest.guestName}
              onChange={handleGuestName}
              placeholder="e.g. The Smith Family"
              autoComplete="off"
              maxLength={120}
            />
          </div>

          <div className="lp-field">
            <label className="lp-field-label" htmlFor="event-date">
              Event Date
            </label>
            <input
              id="event-date"
              className="lp-input"
              type="text"
              value={guest.eventDate ?? ''}
              onChange={handleEventDate}
              placeholder="e.g. February 14th, 2027"
              autoComplete="off"
              maxLength={80}
            />
          </div>

          <div className="lp-field">
            <label className="lp-field-label" htmlFor="event-location">
              Event Location
            </label>
            <input
              id="event-location"
              className="lp-input"
              type="text"
              value={guest.eventLocation ?? ''}
              onChange={handleEventLocation}
              placeholder="Ej: Lugar o Dirección"
              autoComplete="off"
              maxLength={120}
            />
          </div>

          <div className="lp-field">
            <label className="lp-field-label" htmlFor="rsvp-by">
              RSVP Deadline
            </label>
            <input
              id="rsvp-by"
              className="lp-input"
              type="text"
              value={guest.rsvpBy ?? ''}
              onChange={handleRsvp}
              placeholder="e.g. January 31st"
              autoComplete="off"
              maxLength={80}
            />
          </div>
        </section>

        <Divider />
 
        <GuestRosterPanel />

        {/* Bottom spacer */}
        <div style={{ height: 40 }} />
      </div>
    </aside>
  );
}
