// ─────────────────────────────────────────────────────────────────────────────
// The handful of structural icons the panel chrome needs. Content icons still
// come from EventIcon; these are navigation affordances, not event vocabulary.
// ─────────────────────────────────────────────────────────────────────────────

interface IconProps {
  size?: number;
}

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function ChevronRight({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function ChevronLeft({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function ChevronDown({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function SearchIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}

export function UploadIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={1.8}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

/** Six dots — the universal "pick this row up" affordance. */
export function GripIcon({ size = 16 }: IconProps) {
  return (
    <svg width={(size * 3) / 4} height={size} viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
      <circle cx="4" cy="4" r="1.3" />
      <circle cx="8" cy="4" r="1.3" />
      <circle cx="4" cy="8" r="1.3" />
      <circle cx="8" cy="8" r="1.3" />
      <circle cx="4" cy="12" r="1.3" />
      <circle cx="8" cy="12" r="1.3" />
    </svg>
  );
}
