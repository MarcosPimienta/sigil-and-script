import { useState, useCallback } from 'react';
import type { InviteeRecord } from '../../types/sigil.types';

export interface GuestHierarchyTreeViewProps {
  invitees: InviteeRecord[];
}

/**
 * Formats the invitees and dependents into an ASCII / plaintext tree representation:
 * |
 * |_ Guest 00
 *          |_ Dependent
 *          |_ Dependent
 * |
 * |_ Guest 01
 */
export function formatGuestHierarchyText(invitees: InviteeRecord[]): string {
  if (!invitees || invitees.length === 0) {
    return 'No guests in roster.';
  }

  const lines: string[] = [];

  invitees.forEach((inv) => {
    lines.push('|');
    lines.push(`|_ ${inv.name}`);
    if (inv.dependents && inv.dependents.length > 0) {
      inv.dependents.forEach((dep) => {
        lines.push(`         |_ ${dep.name}`);
      });
    }
  });

  return lines.join('\n');
}

export function GuestHierarchyTreeView({ invitees }: GuestHierarchyTreeViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyText = useCallback(async () => {
    const text = formatGuestHierarchyText(invitees);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy guest tree hierarchy:', text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [invitees]);

  const totalDependents = invitees.reduce((acc, i) => acc + (i.dependents?.length || 0), 0);
  const totalCount = invitees.length + totalDependents;

  if (invitees.length === 0) {
    return (
      <div className="guest-tree-view guest-tree-view--empty">
        <p>No guests added yet. Click "+ Add Guest" above to populate the tree.</p>
      </div>
    );
  }

  return (
    <div className="guest-tree-container">
      <div className="guest-tree-header">
        <div className="guest-tree-summary">
          <span className="guest-tree-count-badge">
            {invitees.length} primary {invitees.length === 1 ? 'guest' : 'guests'} • {totalDependents} {totalDependents === 1 ? 'dependent' : 'dependents'} ({totalCount} total)
          </span>
        </div>
        <button
          type="button"
          className="dashboard-action-btn guest-tree-copy-btn"
          onClick={handleCopyText}
          title="Copy tree hierarchy as plain text"
        >
          {copied ? '✓ Copied Tree!' : '📋 Copy as Text'}
        </button>
      </div>

      <div className="guest-tree-paper" role="region" aria-label="Guest hierarchy tree">
        <div className="guest-tree-content">
          {invitees.map((inv) => (
            <div key={inv.id} className="guest-tree-group">
              <div className="guest-tree-stem-line">|</div>
              <div className="guest-tree-primary">
                <span className="guest-tree-branch">|_</span>
                <span className="guest-tree-primary-name">{inv.name}</span>
              </div>

              {inv.dependents && inv.dependents.length > 0 && (
                <div className="guest-tree-dependents-group">
                  {inv.dependents.map((dep) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
