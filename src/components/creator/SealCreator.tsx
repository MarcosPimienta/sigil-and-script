// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Inline Dynamic Seal & Sticker Creator
// Wax seals are rendered by the relief shader (height map → normals → light);
// stickers are drawn with plain Canvas 2D. Both export a 512×512 PNG.
// See openspec/changes/physically-shaded-wax-seal/design.md
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback, useMemo, type ChangeEvent } from 'react';
import { apiFetch } from '../../utils/api';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from './LeftPanel';
import {
  shade,
  prepareGeometry,
  boxBlur,
  circularMask,
  alphaToHeight,
  bevelDepthToRelief,
  hexToRgb01,
  MATERIALS,
  LIGHT_PRESETS,
  DEFAULT_AO_STRENGTH,
  DEFAULT_NORMAL_STRENGTH,
  type BlankBuffers,
  type ReliefMode,
  type LightPresetId,
} from '../../utils/reliefShader';
import { SEAL_BLANKS, getSealBlank, loadBlank } from '../../utils/sealBlanks';

interface SealCreatorProps {
  onApply: (imageUrl: string) => void;
  onCancel: () => void;
  initialImage?: string;
}

export type SealType = 'WAX_SEAL' | 'STICKER';
export type SealFinish = 'MATTE' | 'METALLIC';
export type StickerShape = 'CIRCLE' | 'ROUNDED_RECT' | 'SHIELD';

const CANVAS_SIZE = 512;

const WAX_PRESET_COLORS = [
  { name: 'Classic Red', hex: '#991b1b' },
  { name: 'Burgundy', hex: '#6b1d2f' },
  { name: 'Royal Gold', hex: '#d4af37' },
  { name: 'Rose Gold', hex: '#b76e79' },
  { name: 'Midnight Navy', hex: '#1e293b' },
  { name: 'Forest Green', hex: '#14532d' },
  { name: 'Sage Green', hex: '#6b8e23' },
  { name: 'Alabaster White', hex: '#e2e8f0' },
  { name: 'Charcoal Black', hex: '#18181b' },
];

const LIGHT_OPTIONS: { id: LightPresetId; label: string }[] = [
  { id: 'TOP_LEFT', label: 'Top-left' },
  { id: 'TOP', label: 'Top' },
  { id: 'TOP_RIGHT', label: 'Top-right' },
];

interface SigilHeightResult {
  height: Float32Array;
  source: 'alpha' | 'luminance' | 'glyph';
}

/**
 * Rasterises the emblem (or the fallback "S" glyph) into the blank's pressed
 * floor and converts it to a blurred height field.
 */
function buildSigilHeight(
  blank: BlankBuffers,
  floor: { cx: number; cy: number; r: number },
  emblem: HTMLImageElement | null,
  blurRadius: number,
): SigilHeightResult | null {
  const { width: w, height: h } = blank;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) return null;

  const cx = floor.cx * w;
  const cy = floor.cy * h;
  const box = floor.r * 2 * w * 0.9; // emblem bounding box inside the floor

  let source: SigilHeightResult['source'];
  if (emblem) {
    const iw = emblem.naturalWidth || emblem.width || 1;
    const ih = emblem.naturalHeight || emblem.height || 1;
    const scale = Math.min(box / iw, box / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(emblem, cx - dw / 2, cy - dh / 2, dw, dh);
    const raster = ctx.getImageData(0, 0, w, h);
    const res = alphaToHeight(raster);
    source = res.source;
    return { height: boxBlur(res.height, w, h, blurRadius, 2), source };
  }

  // Fallback monogram
  ctx.font = `300 ${Math.round(box * 0.78)}px "Cormorant Garamond", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000';
  ctx.fillText('S', cx, cy + box * 0.03);
  const raster = ctx.getImageData(0, 0, w, h);
  const res = alphaToHeight(raster);
  return { height: boxBlur(res.height, w, h, blurRadius, 2), source: 'glyph' };
}

export function SealCreator({
  onApply,
  onCancel,
  initialImage,
}: SealCreatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [sealType, setSealType] = useState<SealType>('WAX_SEAL');
  const [maskImage, setMaskImage] = useState<string>(initialImage || '');
  const [loadedImgElement, setLoadedImgElement] = useState<HTMLImageElement | null>(null);

  // Wax Seal Parameters
  const [blankId, setBlankId] = useState<string>(SEAL_BLANKS[0].id);
  const [waxColor, setWaxColor] = useState<string>('#991b1b');
  const [bevelDepth, setBevelDepth] = useState<number>(5);
  const [finish, setFinish] = useState<SealFinish>('MATTE');
  const [reliefMode, setReliefMode] = useState<ReliefMode>('EMBOSS');
  const [lightPreset, setLightPreset] = useState<LightPresetId>('TOP_LEFT');
  const [blank, setBlank] = useState<BlankBuffers | null>(null);

  // Sticker Parameters
  const [stickerBg, setStickerBg] = useState<string>('#ffffff');
  const [stickerBorderColor, setStickerBorderColor] = useState<string>('#d4af37');
  const [stickerBorderWidth, setStickerBorderWidth] = useState<number>(4);
  const [stickerShape, setStickerShape] = useState<StickerShape>('CIRCLE');

  const [isApplying, setIsApplying] = useState(false);

  // Load mask image element whenever maskImage URL changes
  useEffect(() => {
    if (!maskImage) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!cancelled) setLoadedImgElement(img);
    };
    img.onerror = () => {
      if (!cancelled) setLoadedImgElement(null);
    };
    img.src = maskImage;
    return () => {
      cancelled = true;
    };
  }, [maskImage]);

  const clearMaskImage = () => {
    setMaskImage('');
    setLoadedImgElement(null);
  };

  // Load the selected wax blank (decoded once per id, cached in sealBlanks)
  useEffect(() => {
    let cancelled = false;
    loadBlank(blankId)
      .then((b) => {
        if (!cancelled) setBlank(b);
      })
      .catch((err) => console.error('Failed to load wax blank', err));
    return () => {
      cancelled = true;
    };
  }, [blankId]);

  const blankMeta = getSealBlank(blankId);

  const floorMask = useMemo(() => {
    if (!blank) return null;
    const r = blankMeta.floor.r * blank.width;
    return circularMask(
      blank.width,
      blank.height,
      blankMeta.floor.cx * blank.width,
      blankMeta.floor.cy * blank.height,
      r - 4,
      8,
    );
  }, [blank, blankMeta]);

  const relief = useMemo(() => bevelDepthToRelief(bevelDepth, reliefMode), [bevelDepth, reliefMode]);

  const sigil = useMemo(() => {
    if (!blank) return null;
    return buildSigilHeight(blank, blankMeta.floor, loadedImgElement, relief.blurRadius * (blank.width / 512));
  }, [blank, blankMeta, loadedImgElement, relief.blurRadius]);

  // Height field + AO blur: cached across colour / light / finish changes
  const geometry = useMemo(() => {
    if (!blank || !floorMask) return null;
    return prepareGeometry(blank, sigil?.height ?? null, floorMask, relief.reliefGain);
  }, [blank, floorMask, sigil, relief.reliefGain]);

  // ── Wax seal render (relief shader) ──────────────────────────────────────────
  const drawWaxSeal = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!blank || !floorMask || !geometry) return;

      const result = shade(
        {
          blank,
          sigilHeight: sigil?.height ?? null,
          floorMask,
          reliefGain: relief.reliefGain,
          normalStrength: DEFAULT_NORMAL_STRENGTH,
          waxColor: hexToRgb01(waxColor),
          light: LIGHT_PRESETS[lightPreset],
          material: MATERIALS[finish],
          aoStrength: DEFAULT_AO_STRENGTH,
        },
        geometry,
      );

      // Blit through an intermediate canvas so the drop shadow follows the alpha.
      const tmp = document.createElement('canvas');
      tmp.width = result.width;
      tmp.height = result.height;
      const tctx = tmp.getContext('2d');
      if (!tctx) return;
      tctx.putImageData(new ImageData(result.data, result.width, result.height), 0, 0);

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 10;
      ctx.drawImage(tmp, 0, 0, width, height);
      ctx.restore();
    },
    [blank, floorMask, geometry, sigil, relief.reliefGain, waxColor, lightPreset, finish],
  );

  // ── Sticker render (unchanged) ───────────────────────────────────────────────
  const drawSticker = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const cx = width / 2;
      const cy = height / 2;
      const size = 380;
      const x = cx - size / 2;
      const y = cy - size / 2;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;

      ctx.fillStyle = stickerBg;
      ctx.strokeStyle = stickerBorderColor;
      ctx.lineWidth = stickerBorderWidth * 2;

      if (stickerShape === 'CIRCLE') {
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
        ctx.fill();
        if (stickerBorderWidth > 0) ctx.stroke();
      } else if (stickerShape === 'ROUNDED_RECT') {
        const radius = 32;
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, radius);
        ctx.fill();
        if (stickerBorderWidth > 0) ctx.stroke();
      } else if (stickerShape === 'SHIELD') {
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(x + size, y + size * 0.3);
        ctx.lineTo(x + size * 0.8, y + size);
        ctx.lineTo(cx, y + size * 1.1);
        ctx.lineTo(x + size * 0.2, y + size);
        ctx.lineTo(x, y + size * 0.3);
        ctx.closePath();
        ctx.fill();
        if (stickerBorderWidth > 0) ctx.stroke();
      }
      ctx.restore();

      // Render Emblem / Monogram inside sticker
      if (loadedImgElement) {
        const emblemSize = size * 0.65;
        ctx.drawImage(
          loadedImgElement,
          cx - emblemSize / 2,
          cy - emblemSize / 2,
          emblemSize,
          emblemSize
        );
      } else {
        ctx.font = '300 120px "Cormorant Garamond", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = stickerBorderColor || '#333333';
        ctx.fillText('S', cx, cy + 6);
      }
    },
    [stickerBg, stickerBorderColor, stickerBorderWidth, stickerShape, loadedImgElement],
  );

  // Main Canvas Redraw Function
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (sealType === 'WAX_SEAL') {
      drawWaxSeal(ctx, width, height);
    } else {
      drawSticker(ctx, width, height);
    }
  }, [sealType, drawWaxSeal, drawSticker]);

  // Redraw at most once per animation frame when parameters update
  useEffect(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      redrawCanvas();
    });
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [redrawCanvas]);

  // Handle mask image file upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
    if (file.size > MAX_IMAGE_BYTES) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMaskImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Export generated canvas to URL and call onApply
  const handleApply = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsApplying(true);
      // Make sure the last parameter change is painted before exporting.
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      redrawCanvas();
      const dataUrl = canvas.toDataURL('image/png');

      let publicUrl: string | undefined;
      try {
        const response = await apiFetch('/upload/media', {
          method: 'POST',
          body: JSON.stringify({
            fileData: dataUrl,
            fileName: `custom-seal-${Date.now()}.png`,
            fileType: 'image/png',
            bucket: 'invitation-images',
          }),
        });
        if (response && response.publicUrl) {
          publicUrl = response.publicUrl;
        }
      } catch (err) {
        console.warn('Backend storage upload failed, saving data URL locally', err);
      }

      onApply(publicUrl || dataUrl);
    } catch (err) {
      console.error('Failed to generate seal image', err);
    } finally {
      setIsApplying(false);
    }
  };

  const showLuminanceHint = sealType === 'WAX_SEAL' && sigil?.source === 'luminance';

  return (
    <div className="seal-creator-inline">
      {/* Preview Section */}
      <div className="sc-inline-preview">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="sc-inline-canvas"
        />
        <p className="sc-inline-hint">Live Preview ({CANVAS_SIZE}x{CANVAS_SIZE} PNG)</p>
      </div>

      {/* Controls Section */}
      <div className="sc-inline-controls">
        <div className="scm-group">
          <label className="lp-field-label">Type</label>
          <div className="scm-segmented">
            <button
              type="button"
              className={sealType === 'WAX_SEAL' ? 'active' : ''}
              onClick={() => setSealType('WAX_SEAL')}
            >
              3D Wax Seal
            </button>
            <button
              type="button"
              className={sealType === 'STICKER' ? 'active' : ''}
              onClick={() => setSealType('STICKER')}
            >
              Sticker Label
            </button>
          </div>
        </div>

        <div className="scm-group">
          <label className="lp-field-label">Monogram / Emblem Image (PNG/SVG)</label>
          <div className="scm-upload-row">
            <label className="scm-upload-btn" htmlFor="sc-inline-file-input">
              {maskImage ? 'Change Image' : 'Upload Image'}
            </label>
            <input
              id="sc-inline-file-input"
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            {maskImage && (
              <button
                type="button"
                className="scm-clear-btn"
                onClick={clearMaskImage}
              >
                Clear
              </button>
            )}
          </div>
          {sealType === 'WAX_SEAL' && (
            <p className="scm-field-hint">
              {showLuminanceHint
                ? 'This image has no transparency — dark areas are treated as raised. A transparent PNG or SVG gives the cleanest relief.'
                : 'Best results with a transparent PNG or SVG: opaque areas become the raised relief.'}
            </p>
          )}
        </div>

        {sealType === 'WAX_SEAL' ? (
          <>
            <div className="scm-group">
              <label className="lp-field-label">Wax Shape</label>
              <div className="scm-blank-picker">
                {SEAL_BLANKS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={`scm-blank-thumb ${blankId === b.id ? 'selected' : ''}`}
                    title={b.name}
                    onClick={() => setBlankId(b.id)}
                  >
                    <img src={b.height} alt={b.name} />
                    <span>{b.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="scm-group">
              <label className="lp-field-label">Wax Color</label>
              <div className="scm-color-presets" style={{ flexWrap: 'wrap' }}>
                {WAX_PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    className={`scm-color-swatch ${waxColor === c.hex ? 'selected' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    onClick={() => setWaxColor(c.hex)}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input
                  type="color"
                  value={waxColor}
                  onChange={(e) => setWaxColor(e.target.value)}
                  style={{ cursor: 'pointer', width: '32px', height: '32px', border: 'none', background: 'none' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--cr-text-secondary)' }}>Custom Hex: {waxColor}</span>
              </div>
            </div>

            <div className="scm-group">
              <label className="lp-field-label">Relief</label>
              <div className="scm-segmented">
                <button
                  type="button"
                  className={reliefMode === 'EMBOSS' ? 'active' : ''}
                  onClick={() => setReliefMode('EMBOSS')}
                >
                  Embossed
                </button>
                <button
                  type="button"
                  className={reliefMode === 'DEBOSS' ? 'active' : ''}
                  onClick={() => setReliefMode('DEBOSS')}
                >
                  Debossed
                </button>
              </div>
            </div>

            <div className="scm-group">
              <div className="scm-slider-header">
                <label className="lp-field-label">Bevel & Emboss Depth</label>
                <span className="scm-slider-val">{bevelDepth} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={bevelDepth}
                onChange={(e) => setBevelDepth(parseInt(e.target.value, 10))}
                className="scm-range"
                style={{ width: '100%' }}
              />
            </div>

            <div className="scm-group">
              <label className="lp-field-label">Light</label>
              <div className="scm-segmented">
                {LIGHT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={lightPreset === opt.id ? 'active' : ''}
                    onClick={() => setLightPreset(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="scm-group">
              <label className="lp-field-label">Finish</label>
              <div className="scm-segmented">
                <button
                  type="button"
                  className={finish === 'MATTE' ? 'active' : ''}
                  onClick={() => setFinish('MATTE')}
                >
                  Matte Wax
                </button>
                <button
                  type="button"
                  className={finish === 'METALLIC' ? 'active' : ''}
                  onClick={() => setFinish('METALLIC')}
                >
                  Metallic Gloss
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="scm-group">
              <label className="lp-field-label">Badge Shape</label>
              <div className="scm-segmented">
                <button
                  type="button"
                  className={stickerShape === 'CIRCLE' ? 'active' : ''}
                  onClick={() => setStickerShape('CIRCLE')}
                >
                  Circle
                </button>
                <button
                  type="button"
                  className={stickerShape === 'ROUNDED_RECT' ? 'active' : ''}
                  onClick={() => setStickerShape('ROUNDED_RECT')}
                >
                  Rounded
                </button>
                <button
                  type="button"
                  className={stickerShape === 'SHIELD' ? 'active' : ''}
                  onClick={() => setStickerShape('SHIELD')}
                >
                  Shield
                </button>
              </div>
            </div>

            <div className="scm-group">
              <label className="lp-field-label">Background Color</label>
              <input
                type="color"
                value={stickerBg}
                onChange={(e) => setStickerBg(e.target.value)}
                style={{ cursor: 'pointer', width: '40px', height: '32px', border: 'none', background: 'none' }}
              />
            </div>

            <div className="scm-group">
              <label className="lp-field-label">Border Color</label>
              <input
                type="color"
                value={stickerBorderColor}
                onChange={(e) => setStickerBorderColor(e.target.value)}
                style={{ cursor: 'pointer', width: '40px', height: '32px', border: 'none', background: 'none' }}
              />
            </div>

            <div className="scm-group">
              <div className="scm-slider-header">
                <label className="lp-field-label">Border Thickness</label>
                <span className="scm-slider-val">{stickerBorderWidth}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={stickerBorderWidth}
                onChange={(e) => setStickerBorderWidth(parseInt(e.target.value, 10))}
                className="scm-range"
                style={{ width: '100%' }}
              />
            </div>
          </>
        )}

        <div className="sc-inline-footer">
          <button type="button" className="scm-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="scm-apply-btn"
            onClick={handleApply}
            disabled={isApplying || (sealType === 'WAX_SEAL' && !blank)}
          >
            {isApplying ? 'Generating...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
