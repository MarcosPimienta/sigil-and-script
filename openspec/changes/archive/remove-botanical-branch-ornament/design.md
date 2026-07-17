# Design — Remove Botanical Branch Ornament

## Architectural Decisions

### Decision 1: Pure Component Clean Up
**Choice**: Directly delete the `<svg>` node representing the botanical branch from the JSX.
**Why**:
- Deleting the SVG node is the most direct and clean approach. It prevents loading or processing these SVG paths entirely and removes them from the DOM.
- No database changes or state structure changes are required, keeping it extremely safe.

---

## Risks & Mitigations

### Risk 1: Unused CSS styles
- **Risk**: Deleting the SVG might leave `.countdown-botanical-branch` styles in the CSS file.
- **Mitigation**: We can leave the CSS styles alone to avoid any potential regressions in layout classes, as unused classes have no performance or visual impact on the page.
