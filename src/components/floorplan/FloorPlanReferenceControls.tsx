import React, { useState, useRef, useCallback } from 'react';
import type { FloorPlanReferenceLayer } from '../../types/sigil.types';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, compressImage } from '../creator/uploadHelpers';
import { apiFetch } from '../../utils/api';

interface FloorPlanReferenceControlsProps {
  isOpen: boolean;
  onClose: () => void;
  referenceLayer?: FloorPlanReferenceLayer;
  onUpdateLayer: (patch: Partial<FloorPlanReferenceLayer>) => void;
  onSetLayer: (layer: FloorPlanReferenceLayer) => void;
  onClearLayer: () => void;
}

export function FloorPlanReferenceControls({
  isOpen,
  onClose,
  referenceLayer,
  onUpdateLayer,
  onSetLayer,
  onClearLayer,
}: FloorPlanReferenceControlsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setUploadError('Unsupported image format. Please use PNG, JPEG, WebP, or SVG.');
        return;
      }

      if (file.size > MAX_IMAGE_BYTES) {
        setUploadError('File size exceeds 8MB limit.');
        return;
      }

      setUploadError(null);
      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const rawData = reader.result as string;
          const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
          const format = isSvg ? 'image/svg+xml' : file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const fileData = isSvg ? rawData : await compressImage(rawData, format, 0.88, 2400, 2400);

          let publicUrl: string | undefined;
          try {
            const response = await apiFetch('/upload/media', {
              method: 'POST',
              body: JSON.stringify({
                fileData,
                fileName: file.name,
                fileType: format,
                bucket: 'invitation-images',
              }),
            });
            if (response && response.publicUrl) {
              publicUrl = response.publicUrl;
            }
          } catch (apiErr) {
            console.warn('Storage upload API unavailable, using local data URL fallback', apiErr);
          }

          const newLayer: FloorPlanReferenceLayer = {
            url: publicUrl || rawData,
            opacity: referenceLayer?.opacity ?? 0.45,
            scale: referenceLayer?.scale ?? 1.0,
            x: referenceLayer?.x ?? 0,
            y: referenceLayer?.y ?? 0,
            visible: true,
            locked: true,
            fileName: file.name,
          };

          onSetLayer(newLayer);
        } catch (err: any) {
          console.error('Failed to process image upload', err);
          setUploadError('Failed to process image. Please try another file.');
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.onerror = () => {
        setUploadError('Failed to read selected file.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    },
    [onSetLayer, referenceLayer]
  );

  if (!isOpen) return null;

  return (
    <div className="fp-reference-controls-panel" data-testid="blueprint-controls-panel">
      <div className="fp-reference-controls-header">
        <div className="fp-reference-title">
          <span style={{ fontSize: '1.2rem' }}>📐</span>
          <strong>Venue Blueprint Reference</strong>
        </div>
        <button
          type="button"
          className="fp-reference-close-btn"
          onClick={onClose}
          aria-label="Close Blueprint Controls"
          data-testid="close-blueprint-panel-btn"
        >
          &times;
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        id="fp-blueprint-file-input"
        data-testid="blueprint-file-input"
      />

      {uploadError && (
        <div className="fp-reference-error" data-testid="blueprint-upload-error">
          {uploadError}
        </div>
      )}

      {isUploading ? (
        <div className="fp-reference-uploading" data-testid="blueprint-uploading-state">
          <span className="animate-pulse">Uploading and optimizing blueprint...</span>
        </div>
      ) : !referenceLayer ? (
        <div className="fp-reference-empty">
          <p className="fp-reference-empty-desc">
            Overlay an architectural blueprint, venue sketch, or seating schematic behind your tables to accurately match the room.
          </p>
          <label
            htmlFor="fp-blueprint-file-input"
            className="floorplan-btn floorplan-btn--primary fp-reference-upload-btn"
            data-testid="upload-blueprint-btn"
          >
            + Upload Blueprint Image
          </label>
          <span className="fp-reference-empty-hints">PNG, JPEG, WebP, SVG up to 8MB</span>
        </div>
      ) : (
        <div className="fp-reference-body">
          {/* File Info and Quick Actions */}
          <div className="fp-reference-info-row">
            <div className="fp-reference-filename" title={referenceLayer.fileName || 'Blueprint'}>
              📄 {referenceLayer.fileName || 'Venue Blueprint'}
            </div>
            <div className="fp-reference-toggle-group">
              <button
                type="button"
                className={`fp-reference-icon-btn ${referenceLayer.visible ? 'active' : ''}`}
                onClick={() => onUpdateLayer({ visible: !referenceLayer.visible })}
                title={referenceLayer.visible ? 'Hide Blueprint' : 'Show Blueprint'}
                data-testid="toggle-blueprint-visibility"
              >
                {referenceLayer.visible ? '👁️ Visible' : '👁️‍🗨️ Hidden'}
              </button>
              <button
                type="button"
                className={`fp-reference-icon-btn ${!referenceLayer.locked ? 'active-warning' : ''}`}
                onClick={() => onUpdateLayer({ locked: !referenceLayer.locked })}
                title={referenceLayer.locked ? 'Unlock to Reposition' : 'Lock in Place'}
                data-testid="toggle-blueprint-lock"
              >
                {referenceLayer.locked ? '🔒 Locked' : '✋ Align Mode'}
              </button>
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="fp-reference-control-group">
            <div className="fp-reference-label-row">
              <label htmlFor="fp-blueprint-opacity">Opacity</label>
              <span className="fp-reference-val">{Math.round(referenceLayer.opacity * 100)}%</span>
            </div>
            <input
              id="fp-blueprint-opacity"
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={referenceLayer.opacity}
              onChange={(e) => onUpdateLayer({ opacity: parseFloat(e.target.value) })}
              className="fp-reference-slider"
              data-testid="blueprint-opacity-slider"
            />
          </div>

          {/* Scale Slider */}
          <div className="fp-reference-control-group">
            <div className="fp-reference-label-row">
              <label htmlFor="fp-blueprint-scale">Scale / Zoom</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="fp-reference-val">{Math.round(referenceLayer.scale * 100)}%</span>
                {referenceLayer.scale !== 1 && (
                  <button
                    type="button"
                    className="fp-reference-sub-btn"
                    onClick={() => onUpdateLayer({ scale: 1.0 })}
                    title="Reset scale to 100%"
                    data-testid="reset-blueprint-scale"
                  >
                    100%
                  </button>
                )}
              </div>
            </div>
            <input
              id="fp-blueprint-scale"
              type="range"
              min="0.2"
              max="3"
              step="0.05"
              value={referenceLayer.scale}
              onChange={(e) => onUpdateLayer({ scale: parseFloat(e.target.value) })}
              className="fp-reference-slider"
              data-testid="blueprint-scale-slider"
            />
          </div>

          {/* Position Offsets */}
          <div className="fp-reference-control-group">
            <div className="fp-reference-label-row">
              <label>Alignment Offsets</label>
              {(referenceLayer.x !== 0 || referenceLayer.y !== 0) && (
                <button
                  type="button"
                  className="fp-reference-sub-btn"
                  onClick={() => onUpdateLayer({ x: 0, y: 0 })}
                  title="Reset position to (0, 0)"
                  data-testid="reset-blueprint-pos"
                >
                  Reset Position
                </button>
              )}
            </div>
            <div className="fp-reference-offsets-row">
              <span className="fp-reference-offset-tag">X: {referenceLayer.x}px</span>
              <span className="fp-reference-offset-tag">Y: {referenceLayer.y}px</span>
              {!referenceLayer.locked && (
                <span className="fp-reference-drag-hint">
                  (Drag blueprint directly on canvas)
                </span>
              )}
            </div>
          </div>

          {/* ── Image Adjustments & Filters ── */}
          <div className="fp-reference-adjustments-section">
            <div className="fp-reference-label-row" style={{ marginBottom: '6px' }}>
              <label style={{ fontWeight: 700, color: '#3a322c' }}>Image Adjustments</label>
              {(referenceLayer.brightness !== undefined ||
                referenceLayer.contrast !== undefined ||
                referenceLayer.invert ||
                referenceLayer.rotation) && (
                <button
                  type="button"
                  className="fp-reference-sub-btn"
                  onClick={() =>
                    onUpdateLayer({
                      brightness: 1.0,
                      contrast: 1.0,
                      saturate: 1.0,
                      invert: false,
                      rotation: 0,
                    })
                  }
                  title="Reset image adjustments"
                  data-testid="reset-blueprint-filters"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Invert & 90deg Rotation Row */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                type="button"
                className={`fp-reference-icon-btn ${referenceLayer.invert ? 'active-warning' : ''}`}
                onClick={() => onUpdateLayer({ invert: !referenceLayer.invert })}
                style={{ flex: 1 }}
                title="Invert colors for CAD drawings with dark backgrounds"
                data-testid="toggle-blueprint-invert"
              >
                {referenceLayer.invert ? '🌓 Invert: ON' : '🌓 Invert: OFF'}
              </button>
              <button
                type="button"
                className="fp-reference-icon-btn"
                onClick={() => {
                  const nextRot = ((referenceLayer.rotation || 0) + 90) % 360;
                  onUpdateLayer({ rotation: nextRot });
                }}
                style={{ flex: 1 }}
                title="Rotate blueprint clockwise by 90°"
                data-testid="rotate-blueprint-btn"
              >
                ↻ Rotate 90° ({referenceLayer.rotation || 0}°)
              </button>
            </div>

            {/* Brightness Slider */}
            <div className="fp-reference-control-group" style={{ marginBottom: '6px' }}>
              <div className="fp-reference-label-row">
                <label htmlFor="fp-blueprint-brightness">Brightness</label>
                <span className="fp-reference-val">
                  {Math.round((referenceLayer.brightness ?? 1.0) * 100)}%
                </span>
              </div>
              <input
                id="fp-blueprint-brightness"
                type="range"
                min="0.4"
                max="2"
                step="0.05"
                value={referenceLayer.brightness ?? 1.0}
                onChange={(e) => onUpdateLayer({ brightness: parseFloat(e.target.value) })}
                className="fp-reference-slider"
                data-testid="blueprint-brightness-slider"
              />
            </div>

            {/* Contrast Slider */}
            <div className="fp-reference-control-group">
              <div className="fp-reference-label-row">
                <label htmlFor="fp-blueprint-contrast">Contrast</label>
                <span className="fp-reference-val">
                  {Math.round((referenceLayer.contrast ?? 1.0) * 100)}%
                </span>
              </div>
              <input
                id="fp-blueprint-contrast"
                type="range"
                min="0.4"
                max="2.5"
                step="0.05"
                value={referenceLayer.contrast ?? 1.0}
                onChange={(e) => onUpdateLayer({ contrast: parseFloat(e.target.value) })}
                className="fp-reference-slider"
                data-testid="blueprint-contrast-slider"
              />
            </div>
          </div>

          {/* Action Row: Replace / Remove */}
          <div className="fp-reference-footer-actions">
            <label
              htmlFor="fp-blueprint-file-input"
              className="floorplan-btn floorplan-btn--secondary fp-reference-action-btn"
              data-testid="change-blueprint-btn"
            >
              🔄 Change Image
            </label>
            <button
              type="button"
              className="fp-reference-delete-btn"
              onClick={onClearLayer}
              data-testid="remove-blueprint-btn"
            >
              🗑️ Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
