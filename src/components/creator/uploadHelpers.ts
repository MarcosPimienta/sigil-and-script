// ─────────────────────────────────────────────────────────────────────────────
// Shared upload plumbing for the editor panels — the non-component half.
//
// Extracted from LeftPanel so the panel can import the section editors without
// those editors importing the panel back — the old arrangement (helpers living
// in LeftPanel.tsx) becomes an import cycle the moment the panel composes them.
//
// Custom artwork is rendered exclusively via <img src> / CSS background-image
// (see InvitationStage) — never inlined into the DOM — so even a malicious SVG
// upload can't execute script; browsers don't run scripts embedded in an SVG
// loaded that way.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useState, type ChangeEvent } from 'react';
import { apiFetch } from '../../utils/api';

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

export const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a',
];
export const MAX_AUDIO_BYTES = 3 * 1024 * 1024; // 3MB — deployment constraint

export function compressImage(
  base64Str: string,
  format = 'image/jpeg',
  quality = 0.8,
  maxWidth = 1000,
  maxHeight = 1000,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.clearRect(0, 0, width, height); // keep transparency
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL(format, format === 'image/jpeg' ? quality : undefined));
    };
    img.onerror = () => resolve(base64Str);
  });
}

export function getCleanFileName(url: string): string {
  if (!url) return '';
  const lastSegment = url.split('/').pop() || url;
  const decoded = decodeURIComponent(lastSegment);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;
  return decoded.replace(uuidRegex, '');
}

/** Which formats get PNG (transparency matters) rather than JPEG. */
const TRANSPARENT_FIELDS = new Set(['stickerImage', 'openedEnvelopeImage', 'registryImage', 'headerImage']);

/**
 * Reads a picked image, compresses it, pushes it to storage and hands back the
 * public URL — falling back to the local data URL so the preview still works
 * when the upload API is unreachable.
 */
export function useImageUploader(onDone: (field: string, value: string) => void) {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const upload = useCallback(
    (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ''; // allow re-selecting the same file later
      if (!file) return;
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
      if (file.size > MAX_IMAGE_BYTES) return;

      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result !== 'string') return;
        try {
          setUploading((prev) => ({ ...prev, [field]: true }));
          const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
          const format = isSvg
            ? 'image/svg+xml'
            : TRANSPARENT_FIELDS.has(field)
              ? 'image/png'
              : 'image/jpeg';
          const fileData = isSvg ? reader.result : await compressImage(reader.result, format, 0.85);

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
            if (response?.publicUrl) publicUrl = response.publicUrl;
          } catch (apiErr) {
            console.warn('Storage upload API failed, storing data URL locally for preview', apiErr);
          }

          onDone(field, publicUrl || reader.result);
        } catch (err) {
          console.error('Failed to upload image, using original locally', err);
          onDone(field, reader.result);
        } finally {
          setUploading((prev) => ({ ...prev, [field]: false }));
        }
      };
      reader.readAsDataURL(file);
    },
    [onDone],
  );

  return { upload, uploading };
}
