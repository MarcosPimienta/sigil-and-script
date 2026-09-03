// ─────────────────────────────────────────────────────────────────────────────
// Per-section typography — two pickers shown for every section kind.
// "Predeterminada" clears the override so the section returns to the
// invitation's default fonts.
// ─────────────────────────────────────────────────────────────────────────────

import { useSigilStore } from '../../../state/sigilStore';
import type { InvitationSection } from '../../../types/sigil.types';
import { FONT_CHOICES, DEFAULT_HEADING_FONT, DEFAULT_BODY_FONT } from '../../../utils/fonts';

const DEFAULT_VALUE = '';

function FontSelect({
  id,
  label,
  hint,
  value,
  fallback,
  onChange,
  lang,
}: {
  id: string;
  label: string;
  hint: string;
  value: string | undefined;
  fallback: string;
  onChange: (next: string | undefined) => void;
  lang: 'ES' | 'EN';
}) {
  const fallbackName =
    FONT_CHOICES.find((f) => f.value === fallback)?.label ?? fallback.split(',')[0].replace(/'/g, '');

  return (
    <div className="lp-field">
      <label className="lp-field-label" htmlFor={id}>{label}</label>
      <select
        id={id}
        className="lp-input"
        value={value ?? DEFAULT_VALUE}
        onChange={(e) => onChange(e.target.value === DEFAULT_VALUE ? undefined : e.target.value)}
        style={{ fontFamily: value || fallback }}
      >
        <option value={DEFAULT_VALUE}>
          {lang === 'EN' ? `Default (${fallbackName})` : `Predeterminada (${fallbackName})`}
        </option>
        {FONT_CHOICES.map((choice) => (
          <option key={choice.value} value={choice.value} style={{ fontFamily: choice.value }}>
            {choice.label} — {choice.note}
          </option>
        ))}
      </select>
      <p className="scm-field-hint">{hint}</p>
    </div>
  );
}

export function SectionFontFields({ section }: { section: InvitationSection }) {
  const updateSection = useSigilStore((s) => s.updateSection);
  const language = useSigilStore((s) => s.design.language);
  const lang: 'ES' | 'EN' = language === 'EN' ? 'EN' : 'ES';
  const t = (es: string, en: string) => (lang === 'EN' ? en : es);

  const fonts = section.fonts ?? {};
  const setFont = (key: 'heading' | 'body', next: string | undefined) => {
    const merged = { ...fonts, [key]: next };
    const cleaned = Object.fromEntries(Object.entries(merged).filter(([, v]) => !!v));
    updateSection(section.id, {
      fonts: Object.keys(cleaned).length ? (cleaned as typeof fonts) : undefined,
    });
  };

  // A TEXT block's own legacy font is what its paragraph currently shows.
  const bodyFallback =
    section.props.kind === 'TEXT' ? section.props.fontFamily || DEFAULT_BODY_FONT : DEFAULT_BODY_FONT;

  return (
    <div className="section-fonts-group">
      <p className="lp-section-label" style={{ margin: '0 0 6px' }}>
        {t('Tipografía de esta sección', 'Typography for this section')}
      </p>

      <FontSelect
        id={`sec-font-heading-${section.id}`}
        label={t('Títulos', 'Headings')}
        hint={t('Se aplica a los títulos dentro de esta sección.', 'Applies to headings inside this section.')}
        value={fonts.heading}
        fallback={DEFAULT_HEADING_FONT}
        onChange={(next) => setFont('heading', next)}
        lang={lang}
      />

      <FontSelect
        id={`sec-font-body-${section.id}`}
        label={t('Texto', 'Body text')}
        hint={t('Se aplica al resto del texto de esta sección.', 'Applies to the rest of this section’s text.')}
        value={fonts.body}
        fallback={bodyFallback}
        onChange={(next) => setFont('body', next)}
        lang={lang}
      />
    </div>
  );
}
