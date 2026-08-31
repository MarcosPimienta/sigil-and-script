# Design: Guest Hierarchy Tree View

## Architectural Decisions

### 1. View Mode Switching in `DashboardView`
- **Decision**: Manage local view state (`viewMode: 'table' | 'tree'`) with a toggle switch positioned next to existing action buttons (Save, Sync, Add Guest).
- **Reasoning**: Keeps existing table workflows intact without breaking any current features, sorting, or pagination while allowing seamless 1-click toggling to the hierarchical tree view.

### 2. Hierarchical Tree Structure & Layout
- **Decision**: Represent each primary guest as a root node with a vertical stem and right angle branch (`|_ Guest Name`), with child dependents indented underneath with secondary branches (`|_ Dependent Name`).
- **CSS Styling**:
  - Use clean CSS pseudo-elements / borders or ASCII prefix connectors to render the tree stems reliably across different browser viewports and print modes.
  - Apply warm serif/sans typography (`var(--ui-text-primary)` / `#2d2a26`) matching Sigil's stationery theme.

### 3. Copy Plain Text Hierarchy Utility
- **Decision**: Include a helper function and button to serialize the roster into plain text format:
  ```text
  |
  |_ Juan Pérez
           |_ María Pérez
           |_ Lucas Pérez
  |
  |_ Ana Gómez
  ```
- **Reasoning**: Provides immediate utility for copying into WhatsApp, catering emails, or spreadsheets without extra steps.

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Guests with no dependents look uneven or clutter tree lines | Render clean single-line stems for guests without dependents, clearly demarcating root nodes |
| Empty roster state | Display friendly empty message directing user to add guests |
| Large roster rendering performance | Pure read-only React component rendering plain list elements without heavy overhead |
