// ─────────────────────────────────────────────────────────────────────────────
// A disclosure whose collapsed state still answers "what is this set to?".
//
// A collapsed group that says nothing forces the host to open every group to
// find the one they want, which is the scrolling problem again in miniature.
// ─────────────────────────────────────────────────────────────────────────────

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from './PanelIcons';

export function CollapsibleGroup({
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  title: string;
  /** Shown on the right when collapsed — the group's current value, in a word. */
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <section className={`lp-group ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="lp-group-header"
        aria-expanded={isOpen}
        aria-controls={bodyId}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="lp-group-chevron">{isOpen ? <ChevronDown /> : <ChevronRight />}</span>
        <span className="lp-group-title">{title}</span>
        {!isOpen && summary != null && <span className="lp-group-summary">{summary}</span>}
      </button>
      {isOpen && (
        <div className="lp-group-body" id={bodyId}>
          {children}
        </div>
      )}
    </section>
  );
}
