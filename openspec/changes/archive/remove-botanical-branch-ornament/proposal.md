# Proposal — Remove Botanical Branch Ornament

## Problem
In the countdown timer section, there is a decorative botanical branch SVG overlay behind/next to the circular countdown badge. The user wants to remove this botanical ornament entirely to achieve a cleaner, more minimalist design.

## Proposed Solution
1. **Remove SVG Markup**: Locate the SVG tag with className `countdown-botanical-branch` in [CountdownTimer.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/CountdownTimer.tsx) and delete it.

---

## Files to Modify

| File | Change |
|---|---|
| `src/components/creator/CountdownTimer.tsx` | Remove the decorative botanical branch SVG overlay block. |

---

## Scope Constraints

- **In-Scope**:
  - Removing the `<svg className="countdown-botanical-branch" ...>` element from the countdown component.
- **Out-of-Scope**:
  - Removing other ornaments or design borders from other sections (e.g. deckled border frames or timeline flourishes).
  - Removing CSS styles associated with the branch (to avoid unused CSS compilation warnings, we can check if they are needed or simply keep them for safety).
