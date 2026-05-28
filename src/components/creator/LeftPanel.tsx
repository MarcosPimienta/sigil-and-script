// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Left Control Panel
// INVITATION STUDIO sidebar with all design controls.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, type ChangeEvent } from 'react';
import { useSigil } from '../../context/SigilContext';
import type { EnvelopeStyle, PaperTexture, WaxSealConfig } from '../../types/sigil.types';
import {
  getAllowedWaxOptions,
  PAPER_CSS_VAR,
} from '../../utils/luminanceGuards';
import { WaxSeal } from './WaxSeal';

// ── Wax colour option map ──────────────────────────────────────────────────────

const WAX_OPTIONS: Array<{
  id: string;
  label: string;
  color: string;
  colorLight: string;
  colorSheen: string;
  swatch: string; // resolved hex for the clickable swatch UI
}> = [
  { id: 'crimson',  label: 'Crimson',  color: 'var(--wax-crimson)',  colorLight: 'var(--wax-crimson-light)',  colorSheen: 'var(--wax-crimson-sheen)',  swatch: '#6b1b28' },
  { id: 'forest',   label: 'Forest',   color: 'var(--wax-forest)',   colorLight: 'var(--wax-forest-light)',   colorSheen: 'var(--wax-forest-sheen)',   swatch: '#183e2b' },
  { id: 'midnight', label: 'Midnight', color: 'var(--wax-midnight)', colorLight: 'var(--wax-midnight-light)', colorSheen: 'var(--wax-midnight-sheen)', swatch: '#1a2540' },
  { id: 'amethyst', label: 'Amethyst', color: 'var(--wax-amethyst)', colorLight: 'var(--wax-amethyst-light)', colorSheen: 'var(--wax-amethyst-sheen)', swatch: '#3d1e5c' },
  { id: 'obsidian', label: 'Obsidian', color: 'var(--wax-obsidian)', colorLight: 'var(--wax-obsidian-light)', colorSheen: 'var(--wax-obsidian-sheen)', swatch: '#1a1e26' },
  { id: 'ivory',    label: 'Ivory',    color: 'var(--wax-ivory)',    colorLight: 'var(--wax-ivory-light)',    colorSheen: 'var(--wax-ivory-sheen)',    swatch: '#d4c89a' },
];

// ── Motif presets ──────────────────────────────────────────────────────────────

const MOTIF_PRESETS: Array<{
  motif: WaxSealConfig['motif'];
  monogramText: string;
  label: string;
}> = [
  { motif: 'monogram',    monogramText: 'M&A', label: 'M&A' },
  { motif: 'monogram',    monogramText: 'S&S', label: 'S&S' },
  { motif: 'sigil-s',     monogramText: '𝒮',   label: 'Script S' },
  { motif: 'fleur-de-lis',monogramText: '⚜',   label: 'Fleur' },
  { motif: 'botanical',   monogramText: '',    label: 'Botanical' },
  { motif: 'geometric',   monogramText: '',    label: 'Geometric' },
];

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

// ── Divider ────────────────────────────────────────────────────────────────────

function Divider() {
  return <hr className="lp-divider" />;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function LeftPanel() {
  const { state, updateDesign, updateWaxSeal, setGuest } = useSigil();
  const { design, guest } = state;
  const { waxSeal } = design;

  const allowedWax = getAllowedWaxOptions(design.paperLuminance);

  // ── Wax colour selection ──────────────────────────────────────────────────
  const handleWaxColor = useCallback(
    (opt: (typeof WAX_OPTIONS)[0]) => {
      updateWaxSeal({
        color: opt.color,
        colorLight: opt.colorLight,
        colorSheen: opt.colorSheen,
      });
    },
    [updateWaxSeal],
  );

  // ── Motif selection ───────────────────────────────────────────────────────
  const handleMotif = useCallback(
    (preset: (typeof MOTIF_PRESETS)[0]) => {
      updateWaxSeal({ motif: preset.motif, monogramText: preset.monogramText });
    },
    [updateWaxSeal],
  );

  // ── Monogram text (custom) ────────────────────────────────────────────────
  const handleMonogramText = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      // Limit to 6 characters to prevent overflow on the seal
      const val = e.target.value.slice(0, 6);
      updateWaxSeal({ monogramText: val });
    },
    [updateWaxSeal],
  );

  // ── Format (envelope style) ───────────────────────────────────────────────
  const handleFormat = useCallback(
    (style: EnvelopeStyle) => updateDesign({ envelopeStyle: style }),
    [updateDesign],
  );

  // ── Seal depth (3D lighting) ──────────────────────────────────────────────
  const handleDepth = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateWaxSeal({ depth: Number(e.target.value) });
    },
    [updateWaxSeal],
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

  // ── Determine currently active wax option id ──────────────────────────────
  const activeWaxId =
    WAX_OPTIONS.find((o) => o.color === waxSeal.color)?.id ?? 'crimson';

  return (
    <aside className="left-panel">
      <div className="lp-inner">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="lp-header">
          <h1 className="lp-title">Invitation Studio</h1>
        </div>

        {/* ══ SIGIL ART ════════════════════════════════════════════════════ */}
        <section className="lp-section" aria-labelledby="section-sigil-art">
          <SectionLabel>Sigil Art</SectionLabel>

          {/* Upload zone + preset thumbnails */}
          <div className="lp-motif-grid">
            {/* Drop zone */}
            <label
              className="lp-upload-zone"
              htmlFor="sigil-upload"
              aria-label="Upload custom sigil art"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Drop here</span>
              <input
                id="sigil-upload"
                type="file"
                accept="image/svg+xml,image/png"
                style={{ display: 'none' }}
                // TODO(security): If file upload is enabled in production,
                // validate file content server-side (magic bytes + allow-list).
                readOnly
                aria-hidden="true"
              />
            </label>

            {/* Preset motif thumbnails */}
            {MOTIF_PRESETS.map((preset) => {
              const isActive =
                waxSeal.motif === preset.motif &&
                waxSeal.monogramText === preset.monogramText;
              return (
                <button
                  key={`${preset.motif}-${preset.monogramText}`}
                  id={`motif-${preset.motif}-${preset.monogramText}`}
                  className={`lp-motif-thumb${isActive ? ' is-active' : ''}`}
                  onClick={() => handleMotif(preset)}
                  aria-pressed={isActive}
                  aria-label={`Motif: ${preset.label}`}
                  title={preset.label}
                >
                  <WaxSeal
                    config={{ ...waxSeal, motif: preset.motif, monogramText: preset.monogramText }}
                    size={52}
                  />
                </button>
              );
            })}
          </div>

          {/* Custom monogram text input (only shown when motif is monogram) */}
          {waxSeal.motif === 'monogram' && (
            <div className="lp-field" style={{ marginTop: 10 }}>
              <label className="lp-field-label" htmlFor="monogram-text">
                Monogram Text
              </label>
              <input
                id="monogram-text"
                className="lp-input"
                type="text"
                maxLength={6}
                value={waxSeal.monogramText}
                onChange={handleMonogramText}
                placeholder="e.g. M&A"
                autoComplete="off"
              />
            </div>
          )}
        </section>

        <Divider />

        {/* ══ WAX SEAL COLOUR ══════════════════════════════════════════════ */}
        <section className="lp-section" aria-labelledby="section-wax-color">
          <SectionLabel>Wax Seal Color</SectionLabel>
          <div className="lp-swatch-row">
            {WAX_OPTIONS.filter((o) =>
              allowedWax.some((a) => a.id === o.id),
            ).map((opt) => (
              <button
                key={opt.id}
                id={`wax-${opt.id}`}
                className={`lp-swatch${activeWaxId === opt.id ? ' is-active' : ''}`}
                style={{ background: opt.swatch }}
                onClick={() => handleWaxColor(opt)}
                aria-pressed={activeWaxId === opt.id}
                aria-label={`Wax color: ${opt.label}`}
                title={opt.label}
              />
            ))}
          </div>
        </section>

        <Divider />

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

        {/* ══ 3D SEAL DEPTH ════════════════════════════════════════════════ */}
        <section className="lp-section" aria-labelledby="section-depth">
          <div className="lp-section-header-row">
            <SectionLabel>3D Seal Depth</SectionLabel>
            <span className="lp-value-badge">{waxSeal.depth}</span>
          </div>
          <input
            id="seal-depth"
            className="lp-range"
            type="range"
            min={0}
            max={100}
            step={1}
            value={waxSeal.depth}
            onChange={handleDepth}
            aria-label="3D seal depth — higher values flatten the lighting"
            style={{
              '--range-fill': `${waxSeal.depth}%`,
            } as React.CSSProperties}
          />
          <div className="lp-range-labels">
            <span>Dramatic</span>
            <span>Flat</span>
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

        {/* Bottom spacer */}
        <div style={{ height: 40 }} />
      </div>
    </aside>
  );
}
