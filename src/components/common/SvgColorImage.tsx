import { useEffect, useState, type CSSProperties } from 'react';

interface SvgColorImageProps {
  src: string;
  alt: string;
  color?: string;
  maxWidth: number;
  maxHeight: number;
  style?: CSSProperties;
}

function recolorSvg(svgString: string, targetColor: string): string {
  let recolored = svgString;

  // Replace fill="anything-except-none" with fill="targetColor"
  recolored = recolored.replace(/fill="(?!none")[^"]*"/gi, `fill="${targetColor}"`);
  recolored = recolored.replace(/fill='(?!none')[^']*'/gi, `fill="${targetColor}"`);

  // Replace stroke="anything-except-none" with stroke="targetColor"
  recolored = recolored.replace(/stroke="(?!none")[^"]*"/gi, `stroke="${targetColor}"`);
  recolored = recolored.replace(/stroke='(?!none')[^']*'/gi, `stroke="${targetColor}"`);

  // Replace inline fill / stroke styles
  recolored = recolored.replace(/fill\s*:\s*(?!none)[^;"]+/gi, `fill:${targetColor}`);
  recolored = recolored.replace(/stroke\s*:\s*(?!none)[^;"]+/gi, `stroke:${targetColor}`);

  // If root <svg> has no explicit fill attribute, add fill="targetColor"
  if (!/fill=/i.test(recolored) && !/style="[^"]*fill/i.test(recolored)) {
    recolored = recolored.replace(/<svg/i, `<svg fill="${targetColor}"`);
  }

  return recolored;
}

export function SvgColorImage({
  src,
  alt,
  color = 'currentColor',
  maxWidth,
  maxHeight,
  style = {},
}: SvgColorImageProps) {
  const [recoloredSrc, setRecoloredSrc] = useState<string>(src);
  const isSvg =
    src.startsWith('data:image/svg+xml') ||
    src.toLowerCase().endsWith('.svg') ||
    src.includes('image/svg+xml');

  useEffect(() => {
    if (!src || !isSvg) {
      setRecoloredSrc(src);
      return;
    }

    if (src.startsWith('data:image/svg+xml')) {
      try {
        let svgContent = '';
        if (src.includes(';base64,')) {
          const base64Str = src.split(';base64,')[1];
          svgContent = atob(base64Str);
        } else {
          const raw = src.split(',')[1] || src.split('data:image/svg+xml;')[1];
          svgContent = decodeURIComponent(raw);
        }

        const recolored = recolorSvg(svgContent, color);
        const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(recolored)}`;
        setRecoloredSrc(encoded);
        return;
      } catch (err) {
        console.error('Failed to parse and recolor data URL SVG', err);
      }
    }

    if (src.startsWith('http') || src.startsWith('/')) {
      fetch(src)
        .then((res) => res.text())
        .then((text) => {
          if (text.includes('<svg')) {
            const recolored = recolorSvg(text, color);
            const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(recolored)}`;
            setRecoloredSrc(encoded);
          } else {
            setRecoloredSrc(src);
          }
        })
        .catch(() => setRecoloredSrc(src));
      return;
    }

    setRecoloredSrc(src);
  }, [src, color, isSvg]);

  if (!src) return null;

  if (isSvg) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{
          width: `${maxWidth}px`,
          height: `${maxHeight}px`,
          backgroundColor: color,
          WebkitMaskImage: `url("${recoloredSrc}")`,
          WebkitMaskSize: 'contain',
          WebkitMaskPosition: 'center',
          WebkitMaskRepeat: 'no-repeat',
          maskImage: `url("${recoloredSrc}")`,
          maskSize: 'contain',
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          display: 'block',
          margin: '0 auto',
          ...style,
        }}
      >
        <img
          src={recoloredSrc}
          alt={alt}
          style={{
            maxWidth: `${maxWidth}px`,
            maxHeight: `${maxHeight}px`,
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto',
            opacity: 0, // Fallback image for screen readers & layout calculations
          }}
        />
      </div>
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
