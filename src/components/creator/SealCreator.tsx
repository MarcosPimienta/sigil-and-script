// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Inline Dynamic Seal & Sticker Creator
// Interactive Canvas 2D engine for creating 3D wax seals and custom stickers.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react';
import { apiFetch } from '../../utils/api';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from './LeftPanel';

interface SealCreatorProps {
  onApply: (imageUrl: string) => void;
  onCancel: () => void;
  initialImage?: string;
}

export type SealType = 'WAX_SEAL' | 'STICKER';
export type SealFinish = 'MATTE' | 'METALLIC';
export type StickerShape = 'CIRCLE' | 'ROUNDED_RECT' | 'SHIELD';

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

export function SealCreator({
  onApply,
  onCancel,
  initialImage,
}: SealCreatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [sealType, setSealType] = useState<SealType>('WAX_SEAL');
  const [maskImage, setMaskImage] = useState<string>(initialImage || '');
  const [loadedImgElement, setLoadedImgElement] = useState<HTMLImageElement | null>(null);

  // Wax Seal Parameters
  const [waxColor, setWaxColor] = useState<string>('#991b1b');
  const [bevelDepth, setBevelDepth] = useState<number>(5);
  const [finish, setFinish] = useState<SealFinish>('MATTE');

  // Sticker Parameters
  const [stickerBg, setStickerBg] = useState<string>('#ffffff');
  const [stickerBorderColor, setStickerBorderColor] = useState<string>('#d4af37');
  const [stickerBorderWidth, setStickerBorderWidth] = useState<number>(4);
  const [stickerShape, setStickerShape] = useState<StickerShape>('CIRCLE');

  const [isApplying, setIsApplying] = useState(false);

  // Load mask image element whenever maskImage URL changes
  useEffect(() => {
    if (!maskImage) {
      setLoadedImgElement(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLoadedImgElement(img);
    img.onerror = () => setLoadedImgElement(null);
    img.src = maskImage;
  }, [maskImage]);

  // Generate deterministic points for organic wax edge
  const getWaxEdgePoints = useCallback((cx: number, cy: number, radius: number) => {
    const points: { x: number; y: number }[] = [];
    const count = 36;
    // Deterministic pseudo-random offset array
    const offsets = [
      0, 2, -1, 3, 1, -2, 4, 1, -3, 2, 0, -2,
      3, 1, -1, 4, 2, -3, 1, 0, -2, 3, 1, -1,
      2, 4, -2, 1, 0, -3, 2, 1, -1, 3, 0, -2,
    ];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = radius + offsets[i % offsets.length] * 1.5;
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }
    return points;
  }, []);

  // Main Canvas Redraw Function
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    if (sealType === 'WAX_SEAL') {
      const radius = 210;

      // 1. Organic Wax Base
      const edgePoints = getWaxEdgePoints(cx, cy, radius);

      // Drop Shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 10;

      ctx.beginPath();
      ctx.moveTo(edgePoints[0].x, edgePoints[0].y);
      for (let i = 1; i < edgePoints.length; i++) {
        const xc = (edgePoints[i].x + edgePoints[(i + 1) % edgePoints.length].x) / 2;
        const yc = (edgePoints[i].y + edgePoints[(i + 1) % edgePoints.length].y) / 2;
        ctx.quadraticCurveTo(edgePoints[i].x, edgePoints[i].y, xc, yc);
      }
      ctx.closePath();

      // Base Fill Radial Gradient
      const baseGrad = ctx.createRadialGradient(cx - 60, cy - 60, 20, cx, cy, radius + 20);
      baseGrad.addColorStop(0, lightenColor(waxColor, 35));
      baseGrad.addColorStop(0.5, waxColor);
      baseGrad.addColorStop(1, darkenColor(waxColor, 40));

      ctx.fillStyle = baseGrad;
      ctx.fill();
      ctx.restore();

      // 2. Center Pressed Area & Inner Rim Wall
      ctx.save();
      const innerRadius = radius * 0.82;

      // Fill the pressed center. 
      // Top-left is darker (in shadow of the thick outer rim), bottom-right catches ambient light.
      const centerGrad = ctx.createLinearGradient(cx - innerRadius, cy - innerRadius, cx + innerRadius, cy + innerRadius);
      centerGrad.addColorStop(0, darkenColor(waxColor, 15));
      centerGrad.addColorStop(1, lightenColor(waxColor, 5));

      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
      ctx.fillStyle = centerGrad;
      ctx.fill();

      // Draw the inner wall of the rim (the transition between the pressed center and the raised outer rim)
      // Shadow on the top-left inner wall
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, Math.PI * 0.75, Math.PI * 1.75);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.lineWidth = 10;
      ctx.stroke();

      // Highlight on the bottom-right inner wall
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, Math.PI * 1.75, Math.PI * 0.75);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 10;
      ctx.stroke();
      
      // Soften the transition slightly with a thin blend ring
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = darkenColor(waxColor, 15);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // 4. Emblem / Monogram (Bevel & Emboss)
      const emblemSize = 220;
      const emblemX = cx - emblemSize / 2;
      const emblemY = cy - emblemSize / 2;

      ctx.save();
      if (loadedImgElement) {
        // Render Bevel Shadow (bottom-right offset)
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = width;
        shadowCanvas.height = height;
        const sCtx = shadowCanvas.getContext('2d');
        if (sCtx) {
          sCtx.drawImage(
            loadedImgElement,
            emblemX + bevelDepth,
            emblemY + bevelDepth,
            emblemSize,
            emblemSize
          );
          sCtx.globalCompositeOperation = 'source-in';
          sCtx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          sCtx.fillRect(0, 0, width, height);
          ctx.drawImage(shadowCanvas, 0, 0);
        }

        // Render Bevel Highlight (top-left offset)
        const highlightCanvas = document.createElement('canvas');
        highlightCanvas.width = width;
        highlightCanvas.height = height;
        const hCtx = highlightCanvas.getContext('2d');
        if (hCtx) {
          hCtx.drawImage(
            loadedImgElement,
            emblemX - bevelDepth,
            emblemY - bevelDepth,
            emblemSize,
            emblemSize
          );
          hCtx.globalCompositeOperation = 'source-in';
          hCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          hCtx.fillRect(0, 0, width, height);
          ctx.drawImage(highlightCanvas, 0, 0);
        }

        // Render Main Emblem Fill Tinted with Wax Color
        const mainCanvas = document.createElement('canvas');
        mainCanvas.width = width;
        mainCanvas.height = height;
        const mCtx = mainCanvas.getContext('2d');
        if (mCtx) {
          mCtx.drawImage(loadedImgElement, emblemX, emblemY, emblemSize, emblemSize);
          mCtx.globalCompositeOperation = 'source-in';
          const mainGrad = mCtx.createLinearGradient(0, emblemY, 0, emblemY + emblemSize);
          mainGrad.addColorStop(0, lightenColor(waxColor, 20));
          mainGrad.addColorStop(1, darkenColor(waxColor, 25));
          mCtx.fillStyle = mainGrad;
          mCtx.fillRect(0, 0, width, height);
          ctx.drawImage(mainCanvas, 0, 0);
        }
      } else {
        // Fallback Monogram Emblem ("S")
        ctx.font = '300 130px "Cormorant Garamond", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillText('S', cx + bevelDepth, cy + bevelDepth + 6);

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText('S', cx - bevelDepth, cy - bevelDepth + 6);

        // Face
        const textGrad = ctx.createLinearGradient(0, cy - 60, 0, cy + 60);
        textGrad.addColorStop(0, lightenColor(waxColor, 25));
        textGrad.addColorStop(1, darkenColor(waxColor, 20));
        ctx.fillStyle = textGrad;
        ctx.fillText('S', cx, cy + 6);
      }
      ctx.restore();

      // 5. Metallic Finish Specular Overlay
      if (finish === 'METALLIC') {
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        const shineGrad = ctx.createLinearGradient(0, 0, width, height);
        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        shineGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.0)');
        shineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        shineGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.0)');
        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0.3)');

        ctx.fillStyle = shineGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else {
      // ── STICKER LABEL Rendering ──────────────────────────────────────────────
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
    }
  }, [
    sealType,
    waxColor,
    bevelDepth,
    finish,
    stickerBg,
    stickerBorderColor,
    stickerBorderWidth,
    stickerShape,
    loadedImgElement,
    getWaxEdgePoints,
  ]);

  // Redraw when parameters update
  useEffect(() => {
    redrawCanvas();
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

  return (
    <div className="seal-creator-inline">
      {/* Preview Section */}
      <div className="sc-inline-preview">
        <canvas
          ref={canvasRef}
          width={512}
          height={512}
          className="sc-inline-canvas"
        />
        <p className="sc-inline-hint">Live Preview (512x512 PNG)</p>
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
                onClick={() => setMaskImage('')}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {sealType === 'WAX_SEAL' ? (
          <>
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
              <div className="scm-slider-header">
                <label className="lp-field-label">Bevel & Emboss Depth</label>
                <span className="scm-slider-val">{bevelDepth}px</span>
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
            disabled={isApplying}
          >
            {isApplying ? 'Generating...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Color Utilities ────────────────────────────────────────────────────────────

function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  if (isNaN(num)) return color;
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  if (isNaN(num)) return color;
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
