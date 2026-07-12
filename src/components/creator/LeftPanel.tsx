// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Left Control Panel
// INVITATION STUDIO sidebar with all design controls.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, type ChangeEvent } from 'react';
import { useSigil } from '../../context/SigilContext';
import type { EnvelopeStyle, InvitationDesign, PaperTexture } from '../../types/sigil.types';
import { GuestRosterPanel } from './GuestRosterPanel';
import { PAPER_CSS_VAR } from '../../utils/luminanceGuards';

// ── Custom artwork uploads ───────────────────────────────────────────────────
// Rendered exclusively via <img src> / CSS background-image (see
// InvitationStage) — never inlined into the DOM — so even a malicious SVG
// upload can't execute script; browsers don't run scripts embedded in an
// SVG loaded that way. Raster-only allow-list closes the remaining gap
// (an SVG can still reference external resources like a tracking pixel).
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

type ImageField = keyof Pick<InvitationDesign, 'headerImage' | 'frameImage' | 'paperImage'>;

// ── Paper textures ─────────────────────────────────────────────────────────────

const PAPER_OPTIONS: Array<{ id: PaperTexture; label: string }> = [
  { id: 'parchment',  label: 'Parchment' },
  { id: 'linen',      label: 'Linen' },
  { id: 'cotton-rag', label: 'Cotton Rag' },
  { id: 'vellum',     label: 'Vellum' },
];

// ── Border / ornament presets ──────────────────────────────────────────────────

const BORDER_OPTIONS: Array<{ id: 'deckled' | 'torn' | 'clean' | 'scalloped'; label: string }> = [
  { id: 'deckled',   label: 'Deckled' },
  { id: 'scalloped', label: 'Scalloped' },
  { id: 'clean',     label: 'Clean' },
  { id: 'torn',      label: 'Torn' },
];

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
}: {
  id: string;
  label: string;
  hint: string;
  value?: string;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className="lp-field">
      <label className="lp-field-label" htmlFor={id}>
        {label}
      </label>
      {value ? (
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

// ── Divider ────────────────────────────────────────────────────────────────────

function Divider() {
  return <hr className="lp-divider" />;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function LeftPanel() {
  const { state, updateDesign, setGuest } = useSigil();
  const { design, guest } = state;

  // ── Format (envelope style) ───────────────────────────────────────────────
  const handleFormat = useCallback(
    (style: EnvelopeStyle) => updateDesign({ envelopeStyle: style }),
    [updateDesign],
  );

  // ── Paper texture ─────────────────────────────────────────────────────────
  const handlePaper = useCallback(
    (id: PaperTexture) => {
      updateDesign({
        paperTexture: id,
        backgroundColor: `var(${PAPER_CSS_VAR[id].replace('var(', '').replace(')', '')})`,
      });
    },
    [updateDesign],
  );

  // ── Border style ──────────────────────────────────────────────────────────
  const handleBorder = useCallback(
    (id: (typeof BORDER_OPTIONS)[0]['id']) => updateDesign({ borderStyle: id }),
    [updateDesign],
  );

  // ── Custom artwork uploads ─────────────────────────────────────────────────
  const handleImageUpload = useCallback(
    (field: ImageField) => (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // allow re-selecting the same file later
      if (!file) return;
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
      if (file.size > MAX_IMAGE_BYTES) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateDesign({ [field]: reader.result });
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
        <div className="lp-header">
          <h1 className="lp-title">Invitation Studio</h1>
        </div>

        {/* ══ FORMAT ═══════════════════════════════════════════════════════ */}
        <section className="lp-section" aria-labelledby="section-format">
          <SectionLabel>Format</SectionLabel>
          <div className="lp-toggle-group" role="group" aria-label="Invitation format">
            {([ 'CLASSIC', 'SCROLL', 'BOOKLET' ] as EnvelopeStyle[]).map((f) => (
              <button
                key={f}
                id={`format-${f.toLowerCase()}`}
                className={`lp-toggle-btn${design.envelopeStyle === f ? ' is-active' : ''}`}
                onClick={() => handleFormat(f)}
                aria-pressed={design.envelopeStyle === f}
              >
                {f === 'CLASSIC' ? 'Letter' : f === 'SCROLL' ? 'Scroll' : 'Booklet'}
              </button>
            ))}
          </div>
        </section>

        <Divider />

        {/* ══ PAPER TEXTURE ════════════════════════════════════════════════ */}
        <section className="lp-section" aria-labelledby="section-paper">
          <SectionLabel>Paper Texture</SectionLabel>
          <div className="lp-toggle-group lp-toggle-group--wrap" role="group" aria-label="Paper texture">
            {PAPER_OPTIONS.map((p) => (
              <button
                key={p.id}
                id={`paper-${p.id}`}
                className={`lp-toggle-btn${design.paperTexture === p.id ? ' is-active' : ''}`}
                onClick={() => handlePaper(p.id)}
                aria-pressed={design.paperTexture === p.id}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        <Divider />

        {/* ══ ORNAMENTS & BORDERS ══════════════════════════════════════════ */}
        <section className="lp-section" aria-labelledby="section-ornaments">
          <SectionLabel>Ornaments &amp; Borders</SectionLabel>
          <div className="lp-border-grid">
            {BORDER_OPTIONS.map((b) => (
              <button
                key={b.id}
                id={`border-${b.id}`}
                className={`lp-border-thumb${design.borderStyle === b.id ? ' is-active' : ''}`}
                onClick={() => handleBorder(b.id)}
                aria-pressed={design.borderStyle === b.id}
                aria-label={`Border style: ${b.label}`}
              >
                <svg viewBox="0 0 52 36" width="52" height="36" aria-hidden="true">
                  {b.id === 'deckled' && (
                    <path
                      d="M2,2 L2,34 L50,34 L50,2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeDasharray="1.5,1.5"
                    />
                  )}
                  {b.id === 'clean' && (
                    <rect x="2" y="2" width="48" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  )}
                  {b.id === 'scalloped' && (
                    <>
                      <path d="M2,4 Q6,0 10,4 Q14,0 18,4 Q22,0 26,4 Q30,0 34,4 Q38,0 42,4 Q46,0 50,4" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M2,32 Q6,36 10,32 Q14,36 18,32 Q22,36 26,32 Q30,36 34,32 Q38,36 42,32 Q46,36 50,32" fill="none" stroke="currentColor" strokeWidth="1.2" />
                      <line x1="2" y1="4" x2="2" y2="32" stroke="currentColor" strokeWidth="1.2" />
                      <line x1="50" y1="4" x2="50" y2="32" stroke="currentColor" strokeWidth="1.2" />
                    </>
                  )}
                  {b.id === 'torn' && (
                    <path
                      d="M2,5 L3,2 L5,4 L7,1 L9,3 L11,1 L13,4 L15,2 L17,3 L50,3 L50,33 L2,33 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  )}
                </svg>
                <span>{b.label}</span>
              </button>
            ))}
          </div>
        </section>

        <Divider />

        {/* ══ CUSTOM ARTWORK ═══════════════════════════════════════════════ */}
        <section className="lp-section" aria-labelledby="section-artwork">
          <SectionLabel>Custom Artwork</SectionLabel>
          <p className="lp-hint">
            Upload your own imagery to replace the procedural design below.
          </p>

          <ImageUploadSlot
            id="upload-header-image"
            label="Header Image"
            hint="Icon or illustration shown above the headline"
            value={design.headerImage}
            onUpload={handleImageUpload('headerImage')}
            onClear={handleImageClear('headerImage')}
          />

          <ImageUploadSlot
            id="upload-frame-image"
            label="Frame Border"
            hint="Full decorative frame — replaces the border style above"
            value={design.frameImage}
            onUpload={handleImageUpload('frameImage')}
            onClear={handleImageClear('frameImage')}
          />

          <ImageUploadSlot
            id="upload-paper-image"
            label="Paper Pattern"
            hint="Background texture — replaces the paper texture above"
            value={design.paperImage}
            onUpload={handleImageUpload('paperImage')}
            onClear={handleImageClear('paperImage')}
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
              placeholder="e.g. The Grand Atelier"
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

        {/* ══ GUEST LIST ═══════════════════════════════════════════════════ */}
        <section className="lp-section" aria-labelledby="section-guestlist">
          <SectionLabel>Guest List</SectionLabel>
          <p className="lp-hint">
            Upload a CSV to send personalized invitations to multiple guests.
          </p>
          <button
            id="btn-upload-csv"
            className="lp-btn-outline"
            type="button"
            aria-label="Upload guest list CSV"
            onClick={() => {
              // TODO(security): When implemented, validate CSV server-side.
              // Never trust filename or content from the client.
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload CSV
          </button>
        </section>

        <GuestRosterPanel />

        {/* Bottom spacer */}
        <div style={{ height: 40 }} />
      </div>
    </aside>
  );
}
