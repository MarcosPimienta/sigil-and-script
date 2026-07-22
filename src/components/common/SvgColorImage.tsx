import type { CSSProperties } from 'react';

interface SvgColorImageProps {
  src: string;
  alt: string;
  color?: string;
  maxWidth: number;
  maxHeight: number;
  style?: CSSProperties;
}

export function SvgColorImage({
  src,
  alt,
  color = 'currentColor',
  maxWidth,
  maxHeight,
  style = {},
}: SvgColorImageProps) {
  if (!src) return null;

  const isSvg =
    src.startsWith('data:image/svg+xml') ||
    src.toLowerCase().endsWith('.svg') ||
    src.includes('image/svg+xml');

  if (isSvg) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{
          width: `${maxWidth}px`,
          height: `${maxHeight}px`,
          backgroundColor: color,
          WebkitMaskImage: `url("${src}")`,
          WebkitMaskSize: 'contain',
          WebkitMaskPosition: 'center',
          WebkitMaskRepeat: 'no-repeat',
          maskImage: `url("${src}")`,
          maskSize: 'contain',
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          display: 'block',
          margin: '0 auto',
          ...style,
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        maxWidth: `${maxWidth}px`,
        maxHeight: `${maxHeight}px`,
        objectFit: 'contain',
        display: 'block',
        margin: '0 auto',
        ...style,
      }}
    />
  );
}
