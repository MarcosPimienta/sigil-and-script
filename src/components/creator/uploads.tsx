// ─────────────────────────────────────────────────────────────────────────────
// Upload slots — the two components. Their plumbing lives in ./uploadHelpers
// so this file exports components only (React Fast Refresh).
// ─────────────────────────────────────────────────────────────────────────────

import type { ChangeEvent } from 'react';
import { UploadIcon } from './panel/PanelIcons';
import { ACCEPTED_IMAGE_TYPES, getCleanFileName } from './uploadHelpers';

export function ImageUploadSlot({
  id,
  label,
  hint,
  value,
  onUpload,
  onClear,
  isUploading,
  removeLabel = 'Remove',
  uploadingLabel = 'Uploading image...',
}: {
  id: string;
  label: string;
  hint: string;
  value?: string;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  isUploading?: boolean;
  removeLabel?: string;
  uploadingLabel?: string;
}) {
  return (
    <div className="lp-field">
      <label className="lp-field-label" htmlFor={id}>
        {label}
      </label>
      {isUploading ? (
        <div className="lp-upload-zone lp-upload-zone--wide lp-upload-zone--busy">
          <span className="animate-pulse">{uploadingLabel}</span>
        </div>
      ) : value ? (
        <div className="lp-image-slot">
          <img src={value} alt="" className="lp-image-slot-preview" />
          <button type="button" className="lp-image-slot-remove" onClick={onClear} aria-label={`${removeLabel} — ${label}`}>
            {removeLabel}
          </button>
        </div>
      ) : (
        <label className="lp-upload-zone lp-upload-zone--wide" htmlFor={id}>
          <UploadIcon />
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

export function AudioUploadSlot({
  id,
  label,
  hint,
  value,
  onUpload,
  onClear,
  isUploading,
  removeLabel,
  uploadingLabel,
  localFileLabel,
}: {
  id: string;
  label: string;
  hint: string;
  value?: string;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  isUploading?: boolean;
  removeLabel: string;
  uploadingLabel: string;
  localFileLabel: string;
}) {
  const isDataUrl = value?.startsWith('data:');
  const displayName = isDataUrl ? localFileLabel : value ? getCleanFileName(value) : '';

  return (
    <div className="lp-field">
      <label className="lp-field-label" htmlFor={id}>
        {label}
      </label>
      {isUploading ? (
        <div className="lp-upload-zone lp-upload-zone--wide lp-upload-zone--busy">
          <span className="animate-pulse">{uploadingLabel}</span>
        </div>
      ) : value ? (
        <div className="lp-image-slot lp-image-slot--audio">
          <span className="lp-audio-name">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <span className="lp-audio-file">{displayName}</span>
          </span>
          <button type="button" className="lp-image-slot-remove" onClick={onClear} aria-label={`${removeLabel} — ${label}`}>
            {removeLabel}
          </button>
        </div>
      ) : (
        <label className="lp-upload-zone lp-upload-zone--wide" htmlFor={id}>
          <UploadIcon />
          <span>{hint}</span>
        </label>
      )}
      <input id={id} type="file" accept="audio/*" style={{ display: 'none' }} onChange={onUpload} />
    </div>
  );
}
