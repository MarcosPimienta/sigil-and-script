// ─────────────────────────────────────────────────────────────────────────────
// Section stack — the single renderer for both the host preview and the guest
// view. Replaces the two hand-maintained JSX stacks that used to live in
// CreatorCanvas, so what the host sees is by construction what guests get.
// ─────────────────────────────────────────────────────────────────────────────

import { useSigil, useSigilSelector } from '../../../context/SigilContext';
import { useSigilStore } from '../../../state/sigilStore';
import type { InvitationSection } from '../../../types/sigil.types';
import { getPhrasing } from '../../../utils/eventPhrasing';
import { sectionFontVars } from '../../../utils/fonts';
import { AudioControls } from '../AudioControls';
import { CountdownTimer } from '../CountdownTimer';
import { ItineraryTimeline } from '../ItineraryTimeline';
import { DressCodePanel } from '../DressCodePanel';
import { GiftsRegistryPanel } from '../GiftsRegistryPanel';
import { RecipientRsvpPanel } from '../RecipientRsvpPanel';
import { TextSection, ImageSection, DividerSection } from './SimpleSections';
import { VideoSection } from './VideoSection';

export type SectionMode = 'host' | 'recipient';

function RsvpSection({ section, headingColor }: { section: InvitationSection; headingColor: string }) {
  const design = useSigilSelector((s) => s.design);
  const guestLang = useSigilSelector((s) => s.guest?.language);
  const phrasing = getPhrasing(design.eventType, guestLang || design.language);

  return (
    <div style={{ marginTop: '1.5rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3
        style={{
          fontSize: '1.8rem',
          fontStyle: 'italic',
          textAlign: 'center',
          margin: '0 0 1rem 0',
          fontFamily: "var(--sec-body-font, 'Cormorant Garamond', serif)",
          color: headingColor,
        }}
      >
        {section.title || phrasing.rsvpHeading}
      </h3>
      {/* Field ids are scoped so duplicate RSVP sections stay valid markup */}
      <RecipientRsvpPanel idPrefix={section.id} />
    </div>
  );
}

function renderSection(section: InvitationSection, mode: SectionMode, musicUrl?: string) {
  switch (section.kind) {
    case 'AUDIO':
      return <AudioControls musicUrl={musicUrl} />;
    case 'VIDEO':
      return <VideoSection section={section} />;
    case 'COUNTDOWN':
      return <CountdownTimer />;
    case 'ITINERARY':
      return <ItineraryTimeline />;
    case 'DRESS_CODE':
      return <DressCodePanel />;
    case 'GIFTS':
      return <GiftsRegistryPanel />;
    case 'RSVP':
      return <RsvpSection section={section} headingColor={mode === 'host' ? '#ffffff' : '#4c4844'} />;
    case 'TEXT':
      return <TextSection section={section} />;
    case 'IMAGE':
      return <ImageSection section={section} />;
    case 'DIVIDER':
      return <DividerSection section={section} />;
    default:
      return null;
  }
}

export function SectionStack({ mode }: { mode: SectionMode }) {
  const { state } = useSigil();
  const design = state.design;
  const focusInspector = useSigilStore((s) => s.focusInspector);
  const inspectorFocus = useSigilStore((s) => s.inspectorFocus);
  const sections = design.sections ?? [];
  const lang = state.guest?.language || design.language;
  const isEn = lang === 'EN';

  const visible = mode === 'recipient' ? sections.filter((s) => s.enabled) : sections;
  if (visible.length === 0) return null;

  return (
    <div
      className="recipient-invite-details state-visible"
      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}
    >
      {visible.map((section) => {
        const body = renderSection(section, mode, design.musicUrl);
        if (!body) return null;

        // Per-section font overrides: unset values simply omit the CSS variable,
        // so each renderer keeps its historical font.
        const fontVars = sectionFontVars(section.fonts);

        if (mode === 'recipient') {
          return (
            <div key={section.id} style={{ width: '100%', ...fontVars }}>
              {body}
            </div>
          );
        }

        const isFocused = inspectorFocus.type === 'SECTION' && inspectorFocus.sectionId === section.id;
        return (
          <div
            key={section.id}
            data-section-id={section.id}
            data-section-kind={section.kind}
            onClick={() => focusInspector({ type: 'SECTION', sectionId: section.id })}
            style={{
              ...fontVars,
              width: '100%',
              position: 'relative',
              cursor: 'pointer',
              opacity: section.enabled ? 1 : 0.4,
              outline: isFocused ? '2px solid var(--cr-accent, #d4af37)' : '2px solid transparent',
              outlineOffset: '6px',
              borderRadius: '4px',
              transition: 'outline-color 0.15s ease, opacity 0.15s ease',
            }}
          >
            {!section.enabled && (
              <span
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: 0,
                  zIndex: 5,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.65rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  pointerEvents: 'none',
                }}
              >
                {isEn ? 'Hidden' : 'Oculta'}
              </span>
            )}
            {body}
          </div>
        );
      })}
    </div>
  );
}
