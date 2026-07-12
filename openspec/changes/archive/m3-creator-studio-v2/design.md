# Design — Milestone M3: Zustand Creator Studio V2 & Dynamic Forms Configurator

## Architectural Decisions

### Decision 1: Transition to Zustand for Selective State Subscription
**Choice**: Replace React Context reducer with a single Zustand store `useSigilStore` defined in `src/state/sigilStore.ts`.
**Why**:
- Context re-renders the entire app whenever any small canvas coordinate shifts. Zustand selectors (e.g., `useSigilStore(state => state.design.textBlocks)`) ensure components only re-render when their observed slice of state changes.
- Simplifies action dispatches by replacing `dispatch({ type: 'UPDATE_DESIGN', payload: ... })` with direct, type-safe method invocations like `updateDesign(...)`.

---

### Decision 2: Custom Client-side RFC-compliant CSV Parser
**Choice**: Implement a custom lightweight CSV parser function `parseGuestCsv(text: string)` inside `src/utils/csvParser.ts` rather than importing external libraries.
**Why**:
- Retains small bundle sizes and complies with project dependency boundaries.
- The parser handles header matching (`name`, `email`, `dependents`) and handles comma escaping and double-quoted string values.
- Automatically assigns statuses (`PENDING`) and generates UUIDs (`crypto.randomUUID()`) for each ingested invitee.

---

### Decision 3: Schema-driven RSVP Form Rendering
**Choice**: Define `RsvpFormConfig` settings on the `InvitationDesign` schema.
**Why**:
- Couples form options with the invitation design so that form properties are synchronized and saved.
- Allows hosts to toggle options dynamically (dietary requirement text inputs, plus-one names, or custom attendance confirmations).

```typescript
export interface RsvpFormConfig {
  requireMealPreference: boolean;
  requireDietaryRestrictions: boolean;
  allowPlusOnes: boolean;
  customNotesLabel: string | null; // Null disables custom text box
}
```

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Processing very large guest lists hangs the browser UI | Impose a strict boundary threshold: reject files larger than 1 MB or containing > 500 records. |
| CSV files with missing headers | Read headers case-insensitively; fallback to default configurations or display a modal: "Missing required column 'name'." |
| Zustand state hydration discrepancies | Hydrate initial Zustand store state synchronously from `localStorage` on construction to prevent flash of empty layouts. |
