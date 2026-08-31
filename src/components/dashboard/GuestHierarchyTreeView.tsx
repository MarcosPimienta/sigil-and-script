import { useState, useCallback } from 'react';
import type { InviteeRecord, InvitationStatus, Dependent } from '../../types/sigil.types';

export interface GuestHierarchyTreeViewProps {
  invitees: InviteeRecord[];
}

export type StatusFilterOption = 'ALL' | InvitationStatus;

export const STATUS_FILTER_OPTIONS: { value: StatusFilterOption; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'RSVP_YES', label: '✅ Confirmed' },
  { value: 'PENDING', label: '⏳ Pending' },
  { value: 'OPENED', label: '📬 Opened' },
  { value: 'SENT', label: '📤 Sent' },
  { value: 'RSVP_NO', label: '❌ Declined' },
];

/**
 * Strictly verifies whether a dependent has confirmed attendance (included: true).
 */
export function isDependentIncluded(d: Dependent | any): boolean {
  if (!d) return false;
  return d.included === true || d.included === 'true';
}

/**
 * Formats the invitees and dependents into an ASCII / plaintext tree representation.
 * When filterIncludedOnly is true (e.g. for Confirmed RSVP_YES), only checked dependents (included === true) are output.
 */
export function formatGuestHierarchyText(invitees: InviteeRecord[], filterIncludedOnly = false): string {
  if (!invitees || invitees.length === 0) {
    return 'No guests in roster.';
  }

  const lines: string[] = [];

  invitees.forEach((inv) => {
    lines.push('|');
    lines.push(`|_ ${inv.name}`);
    const deps = inv.dependents
      ? (filterIncludedOnly ? inv.dependents.filter((d) => isDependentIncluded(d)) : inv.dependents)
      : [];
    if (deps.length > 0) {
      deps.forEach((dep) => {
        lines.push(`         |_ ${dep.name}`);
      });
    }
  });

  return lines.join('\n');
}

export function GuestHierarchyTreeView({ invitees }: GuestHierarchyTreeViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('ALL');
  const [copied, setCopied] = useState(false);

  const filteredInvitees = statusFilter === 'ALL'
    ? invitees
    : invitees.filter((i) => i.status === statusFilter);

  const getVisibleDependents = useCallback(
    (inv: InviteeRecord) => {
      if (!inv.dependents) return [];
      if (statusFilter === 'RSVP_YES') {
        return inv.dependents.filter((d) => isDependentIncluded(d));
      }
      return inv.dependents;
    },
    [statusFilter]
  );

  const handleCopyText = useCallback(async () => {
    const text = formatGuestHierarchyText(filteredInvitees, statusFilter === 'RSVP_YES');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy guest tree hierarchy:', text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [filteredInvitees, statusFilter]);

  const totalPrimary = invitees.length;
  const totalDependents = invitees.reduce((acc, i) => acc + (i.dependents?.length || 0), 0);
  const totalCount = totalPrimary + totalDependents;

  const filteredPrimary = filteredInvitees.length;
  const filteredDependents = filteredInvitees.reduce((acc, i) => acc + getVisibleDependents(i).length, 0);
  const filteredTotal = filteredPrimary + filteredDependents;

  if (invitees.length === 0) {
    return (
      <div className="guest-tree-view guest-tree-view--empty">
        <p>No guests added yet. Click "+ Add Guest" above to populate the tree.</p>
      </div>
    );
  }

  const activeFilterLabel = STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)?.label || statusFilter;

  return (
    <div className="guest-tree-container">
      {/* Top Header: Filters, Count & Copy Action */}
      <div className="guest-tree-header">
        <div className="guest-tree-filter-group" role="group" aria-label="Filter guest tree by status">
          <span className="guest-tree-filter-label">Filter:</span>
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`guest-tree-filter-pill ${statusFilter === opt.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(opt.value)}
              aria-pressed={statusFilter === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="guest-tree-actions-group">
          <span className="guest-tree-count-badge">
            {statusFilter === 'ALL' ? (
              `${totalPrimary} primary • ${totalDependents} ${totalDependents === 1 ? 'dependent' : 'dependents'} (${totalCount} total)`
            ) : (
              `Showing ${filteredPrimary} of ${totalPrimary} primary (${filteredTotal} total attending)`
            )}
          </span>
          <button
            type="button"
            className="dashboard-action-btn guest-tree-copy-btn"
            onClick={handleCopyText}
            disabled={filteredInvitees.length === 0}
            title={statusFilter === 'ALL' ? 'Copy entire tree hierarchy' : `Copy filtered (${activeFilterLabel}) hierarchy`}
          >
            {copied ? '✓ Copied Tree!' : '📋 Copy as Text'}
          </button>
        </div>
      </div>

      {/* Tree Content / Filtered Empty State */}
      {filteredInvitees.length === 0 ? (
        <div className="guest-tree-paper guest-tree-empty-filter" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <p style={{ margin: '0 0 12px 0', color: 'var(--ui-text-muted, #8c7d73)' }}>
            No guests found with status <strong>{activeFilterLabel}</strong>.
          </p>
          <button
            type="button"
            className="dashboard-action-btn"
            onClick={() => setStatusFilter('ALL')}
            style={{
              backgroundColor: '#4A5D23',
              color: '#ffffff',
              borderColor: 'transparent',
              fontWeight: 600,
              padding: '6px 14px',
            }}
          >
            Show All Guests ({totalCount})
          </button>
        </div>
      ) : (
        <div className="guest-tree-paper" role="region" aria-label="Guest hierarchy tree">
          <div className="guest-tree-content">
            {filteredInvitees.map((inv) => {
              const visibleDeps = getVisibleDependents(inv);

              return (
                <div key={inv.id} className="guest-tree-group">
                  <div className="guest-tree-stem-line">|</div>
                  <div className="guest-tree-primary">
                    <span className="guest-tree-branch">|_</span>
                    <span className="guest-tree-primary-name">{inv.name}</span>
                  </div>

                  {visibleDeps.length > 0 && (
                    <div className="guest-tree-dependents-group">
                      {visibleDeps.map((dep) => (
                        <div key={dep.id} className="guest-tree-dependent">
                          <span className="guest-tree-dep-indent">
                            <span className="guest-tree-dep-branch">|_</span>
                          </span>
                          <span className="guest-tree-dep-name">{dep.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
