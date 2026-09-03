// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Event Icon Registry
// Inline SVG (currentColor, 24-unit viewBox) so icons can never 404 and follow
// the surrounding text colour. Used by itinerary kinds, dress-code groups,
// the event-type picker and (Phase B) the section palette.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties, SVGProps } from 'react';
import type { IconId } from '../../types/sigil.types';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  size?: number;
  style?: CSSProperties;
  title?: string;
}

function base(props: IconProps, children: React.ReactNode) {
  const { size = 24, title, style, ...rest } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      style={{ display: 'block', ...style }}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

const ICONS: Record<IconId, (p: IconProps) => React.JSX.Element> = {
  church: (p) =>
    base(p, <>
      <path d="M12 2v4M10 4h4" />
      <path d="M12 6l-3 3.5V12h6V9.5L12 6z" />
      <path d="M5 21v-7l7-2 7 2v7H5z" />
      <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
    </>),
  rings: (p) =>
    base(p, <>
      <circle cx="9" cy="13" r="5.5" />
      <circle cx="15" cy="13" r="5.5" />
      <path d="M9 7.5l1.5-2.5h3L15 7.5" />
    </>),
  toast: (p) =>
    base(p, <>
      <path d="M6 3h5l-.6 7.2A2.5 2.5 0 0 1 7.9 12.5H8.6A2.5 2.5 0 0 1 6.1 10.2L6 3z" />
      <path d="M13 3h5l-.1 7.2a2.5 2.5 0 0 1-2.5 2.3h.6a2.5 2.5 0 0 1-2.5-2.3L13 3z" />
      <path d="M8.3 12.5V19M15.7 12.5V19M6 19h4.5M13.5 19H18" />
    </>),
  cake: (p) =>
    base(p, <>
      <path d="M4 20h16M5 20v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6" />
      <path d="M5 15c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0" />
      <path d="M12 8v4M9 8v4M15 8v4" />
      <path d="M12 8c-1-1-1-2.5 0-3.5 1 1 1 2.5 0 3.5zM9 8c-1-1-1-2 0-3 1 1 1 2 0 3zM15 8c-1-1-1-2 0-3 1 1 1 2 0 3z" />
    </>),
  balloon: (p) =>
    base(p, <>
      <ellipse cx="12" cy="9" rx="5.5" ry="7" />
      <path d="M11 16.5l1 1.5 1-1.5" />
      <path d="M12 18c-1.5 1.5-.5 3 0 4" />
    </>),
  gift: (p) =>
    base(p, <>
      <rect x="3" y="9" width="18" height="4" rx="1" />
      <path d="M5 13v8h14v-8M12 9v12" />
      <path d="M12 9c-2-4-6-4-6-1.5S10 9 12 9zM12 9c2-4 6-4 6-1.5S14 9 12 9z" />
    </>),
  dinner: (p) =>
    base(p, <>
      <path d="M6 3v7a2 2 0 0 0 2 2v9M8 3v6M10 3v6" />
      <path d="M17 3c-2 0-3 2.5-3 5.5S15 12 17 12v9" />
    </>),
  podium: (p) =>
    base(p, <>
      <path d="M7 21V9h10v12M4 21h16M9 9V6a3 3 0 0 1 6 0v3" />
      <path d="M12 3v1" />
    </>),
  briefcase: (p) =>
    base(p, <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
    </>),
  dove: (p) =>
    base(p, <>
      <path d="M3 12c4 0 7-2 9-6 1 3 3 4 6 4l3-1-2 3c-1 4-5 7-10 7-2 0-4-1-6-3l4-1c-1-1-3-2-4-3z" />
    </>),
  candle: (p) =>
    base(p, <>
      <path d="M9 10h6v11H9z" />
      <path d="M12 10V7" />
      <path d="M12 7c-1.5-1-1.5-3 0-4.5 1.5 1.5 1.5 3.5 0 4.5z" />
    </>),
  music: (p) =>
    base(p, <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>),
  pin: (p) =>
    base(p, <>
      <path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>),
  suit: (p) =>
    base(p, <>
      <path d="M8 3l4 4 4-4 4 2-2 16H6L4 5l4-2z" />
      <path d="M12 7v14M10 11l2 2 2-2" />
    </>),
  dress: (p) =>
    base(p, <>
      <path d="M9 3l3 3 3-3 1 5-2 3 4 10H6l4-10-2-3 1-5z" />
    </>),
  tie: (p) =>
    base(p, <>
      <path d="M10 3h4l-1 3 2 10-3 5-3-5 2-10-1-3z" />
    </>),
  badge: (p) =>
    base(p, <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2M8 12h8M8 16h5" />
      <circle cx="12" cy="8.5" r="1.5" />
    </>),
  play: (p) =>
    base(p, <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="M10 9.2l5 2.8-5 2.8V9.2z" />
    </>),
  eye: (p) =>
    base(p, <>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>),
  eyeOff: (p) =>
    base(p, <>
      <path d="M4 4l16 16" />
      <path d="M9.6 5.7A9.9 9.9 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.3 4.1M6.4 7.9A17 17 0 0 0 2 12s3.6 6.5 10 6.5a9.7 9.7 0 0 0 3.6-.7" />
      <path d="M9.6 9.8a2.8 2.8 0 0 0 3.9 3.9" />
    </>),
  trash: (p) =>
    base(p, <>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </>),
  plus: (p) =>
    base(p, <>
      <path d="M12 5v14M5 12h14" />
    </>),
  sparkle: (p) =>
    base(p, <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
    </>),
};

export function EventIcon({ id, ...props }: IconProps & { id: IconId }) {
  const Cmp = ICONS[id] ?? ICONS.pin;
  return Cmp(props);
}
