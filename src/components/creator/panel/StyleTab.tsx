// ─────────────────────────────────────────────────────────────────────────────
// Estilo — what is global about how the invitation looks.
//
// Everything here used to live in one "Custom Artwork" block that mixed the
// envelope, the seal, the paper and the gifts-registry image together. The
// registry image has gone to its section; the rest is grouped by the object it
// belongs to, and each group says what it is currently set to while collapsed
// so the host does not have to open all four to find one.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useSigilStore } from '../../../state/sigilStore';
import type { SectionFonts } from '../../../types/sigil.types';
import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT, FONT_CHOICES } from '../../../utils/fonts';
import { useImageUploader } from '../uploadHelpers';
import { ImageUploadSlot } from '../uploads';
import { SealCreator } from '../SealCreator';
import { CollapsibleGroup } from './CollapsibleGroup';
import { SliderField } from './sectionFields';
import { usePanelStrings } from './panelStrings';

/** The font's friendly name, for a collapsed group's summary. */
function fontName(value: string | undefined, fallback: string): string {
  const stack = value || fallback;
  return FONT_CHOICES.find((f) => f.value === stack)?.label ?? stack.split(',')[0].replace(/'/g, '');
}

function FontSelect({
  id,
  label,
  value,
  fallback,
  onChange,
}: {
  id: string;
  label: string;
  value: string | undefined;
  fallback: string;
  onChange: (next: string | undefined) => void;
}) {
  const { t } = usePanelStrings();
  return (
    <div className="lp-field">
      <label className="lp-field-label" htmlFor={id}>{label}</label>
      <select
        id={id}
        className="lp-input"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        style={{ fontFamily: value || fallback }}
      >
        <option value="">{`${t('defaultOption')} (${fontName(undefined, fallback)})`}</option>
        {FONT_CHOICES.map((choice) => (
          <option key={choice.value} value={choice.value} style={{ fontFamily: choice.value }}>
            {choice.label} — {choice.note}
          </option>
        ))}
      </select>
    </div>
  );
}

export function StyleTab() {
  const design = useSigilStore((s) => s.design);
  const updateDesign = useSigilStore((s) => s.updateDesign);
  const { t } = usePanelStrings();
  const [isSealOpen, setIsSealOpen] = useState(false);

  const { upload, uploading } = useImageUploader((field, value) => updateDesign({ [field]: value }));
  const fonts = design.defaultFonts ?? {};

  const setDefaultFont = (key: keyof SectionFonts, next: string | undefined) => {
    const merged: SectionFonts = { ...fonts, [key]: next };
    const cleaned = Object.fromEntries(Object.entries(merged).filter(([, v]) => !!v)) as SectionFonts;
    updateDesign({ defaultFonts: Object.keys(cleaned).length ? cleaned : undefined });
  };

  return (
    <div className="lp-tab-content">
      {/* ── Default typography ─────────────────────────────────────────────── */}
      <CollapsibleGroup
        title={t('styleTypographyGroup')}
        defaultOpen
        summary={fontName(fonts.heading, DEFAULT_HEADING_FONT)}
      >
        <FontSelect
          id="style-font-heading"
          label={t('styleHeadingFont')}
          value={fonts.heading}
          fallback={DEFAULT_HEADING_FONT}
          onChange={(next) => setDefaultFont('heading', next)}
        />
        <FontSelect
          id="style-font-body"
          label={t('styleBodyFont')}
          value={fonts.body}
          fallback={DEFAULT_BODY_FONT}
          onChange={(next) => setDefaultFont('body', next)}
        />
        <p className="lp-hint lp-hint--tight">{t('styleTypographyHint')}</p>
      </CollapsibleGroup>

      {/* ── Envelope and seal ──────────────────────────────────────────────── */}
      <CollapsibleGroup
        title={t('styleEnvelopeGroup')}
        defaultOpen
        summary={design.stickerImage || design.openedEnvelopeImage ? '●' : t('none')}
      >
        <ImageUploadSlot
          id="upload-opened-envelope"
          label={t('styleEnvelopeLogo')}
          hint={t('styleEnvelopeLogoHint')}
          value={design.openedEnvelopeImage}
          onUpload={upload('openedEnvelopeImage')}
          onClear={() => updateDesign({ openedEnvelopeImage: undefined })}
          isUploading={uploading.openedEnvelopeImage}
          removeLabel={t('remove')}
          uploadingLabel={t('uploading')}
        />

        {design.openedEnvelopeImage && (
          <SliderField
            id="slider-opened-envelope-scale"
            label={t('styleLogoScale')}
            value={design.openedEnvelopeImageScale ?? 100}
            min={20}
            max={200}
            suffix="%"
            onChange={(v) => updateDesign({ openedEnvelopeImageScale: v })}
          />
        )}

        {isSealOpen ? (
          <SealCreator
            onApply={(imgUrl) => {
              updateDesign({ stickerImage: imgUrl });
              setIsSealOpen(false);
            }}
            onCancel={() => setIsSealOpen(false)}
            initialImage={design.stickerImage}
          />
        ) : (
          <>
            <button type="button" className="lp-seal-modal-trigger" onClick={() => setIsSealOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{t('styleSealCreate')}</span>
            </button>

            <ImageUploadSlot
              id="upload-sticker-image"
              label={t('styleSealImage')}
              hint={t('styleSealImageHint')}
              value={design.stickerImage}
              onUpload={upload('stickerImage')}
              onClear={() => updateDesign({ stickerImage: undefined })}
              isUploading={uploading.stickerImage}
              removeLabel={t('remove')}
              uploadingLabel={t('uploading')}
            />
          </>
        )}

        <SliderField
          id="slider-seal-size"
          label={t('styleSealSize')}
          value={design.sealSize ?? 75}
          min={40}
          max={150}
          suffix="px"
          onChange={(v) => updateDesign({ sealSize: v })}
        />
      </CollapsibleGroup>

      {/* ── Paper ──────────────────────────────────────────────────────────── */}
      <CollapsibleGroup
        title={t('stylePaperGroup')}
        summary={design.paperImage ? '●' : t('none')}
      >
        <ImageUploadSlot
          id="upload-paper-image"
          label={t('stylePaperImage')}
          hint={t('stylePaperImageHint')}
          value={design.paperImage}
          onUpload={upload('paperImage')}
          onClear={() => updateDesign({ paperImage: undefined })}
          isUploading={uploading.paperImage}
          removeLabel={t('remove')}
          uploadingLabel={t('uploading')}
        />

        {design.paperImage && (
          <>
            <SliderField
              id="slider-paper-brightness"
              label={t('stylePaperBrightness')}
              value={design.paperBrightness ?? 1}
              min={0}
              max={2}
              step={0.05}
              onChange={(v) => updateDesign({ paperBrightness: v })}
            />
            <SliderField
              id="slider-paper-contrast"
              label={t('stylePaperContrast')}
              value={design.paperContrast ?? 1}
              min={0}
              max={2}
              step={0.05}
              onChange={(v) => updateDesign({ paperContrast: v })}
            />
            <SliderField
              id="slider-paper-saturate"
              label={t('stylePaperSaturate')}
              value={design.paperSaturate ?? 1}
              min={0}
              max={3}
              step={0.05}
              onChange={(v) => updateDesign({ paperSaturate: v })}
            />
          </>
        )}
      </CollapsibleGroup>

      {/* ── Frame and title artwork ────────────────────────────────────────── */}
      <CollapsibleGroup
        title={t('styleFrameGroup')}
        summary={design.frameImage || design.headerImage ? '●' : t('none')}
      >
        <ImageUploadSlot
          id="upload-frame-image"
          label={t('styleFrameImage')}
          hint={t('styleFrameImageHint')}
          value={design.frameImage}
          onUpload={upload('frameImage')}
          onClear={() => updateDesign({ frameImage: undefined })}
          isUploading={uploading.frameImage}
          removeLabel={t('remove')}
          uploadingLabel={t('uploading')}
        />

        <ImageUploadSlot
          id="upload-section-title-image"
          label={t('styleTitleImage')}
          hint={t('styleTitleImageHint')}
          value={design.headerImage}
          onUpload={upload('headerImage')}
          onClear={() => updateDesign({ headerImage: '' })}
          isUploading={uploading.headerImage}
          removeLabel={t('remove')}
          uploadingLabel={t('uploading')}
        />

        {design.headerImage && (
          <SliderField
            id="section-title-image-scale"
            label={t('styleTitleImageScale')}
            value={design.headerImageScale ?? 100}
            min={20}
            max={200}
            suffix="%"
            onChange={(v) => updateDesign({ headerImageScale: v })}
          />
        )}
      </CollapsibleGroup>

      <p className="lp-hint">{t('styleGlobalHint')}</p>
    </div>
  );
}
