// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Left Control Panel
// INVITATION STUDIO sidebar with all design controls.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, type ChangeEvent } from 'react';
import { useSigil } from '../../context/SigilContext';
import type { InvitationDesign } from '../../types/sigil.types';
import { GuestRosterPanel } from './GuestRosterPanel';
import { FormConfiguratorPanel } from './FormConfiguratorPanel';
import { SectionEditor } from './SectionEditor';

// ── Custom artwork uploads ───────────────────────────────────────────────────
// Rendered exclusively via <img src> / CSS background-image (see
// InvitationStage) — never inlined into the DOM — so even a malicious SVG
// upload can't execute script; browsers don't run scripts embedded in an
// SVG loaded that way. Raster-only allow-list closes the remaining gap
// (an SVG can still reference external resources like a tracking pixel).
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

type ImageField = keyof Pick<
  InvitationDesign,
  'headerImage' | 'frameImage' | 'paperImage' | 'closedEnvelopeImage' | 'openedEnvelopeImage'
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

          <ImageUploadSlot
            id="upload-closed-envelope"
            label="Envelope Decoration (Closed)"
            hint="Floral or corner art overlay draped over the sealed cover"
            value={design.closedEnvelopeImage}
            onUpload={handleImageUpload('closedEnvelopeImage')}
            onClear={handleImageClear('closedEnvelopeImage')}
          />

          <ImageUploadSlot
            id="upload-opened-envelope"
            label="Envelope Polaroid Image (Opened)"
            hint="Couple photo or focus picture inside the envelope"
            value={design.openedEnvelopeImage}
            onUpload={handleImageUpload('openedEnvelopeImage')}
            onClear={handleImageClear('openedEnvelopeImage')}
          />
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
 
        <GuestRosterPanel />

        {/* Bottom spacer */}
        <div style={{ height: 40 }} />
      </div>
    </aside>
  );
}
