# Proposal — Milestone M3: Zustand Creator Studio V2 & Dynamic Forms Configurator

## Problem
The current application architecture relies on React Context + `useReducer` to manage the designer's state. When modifying single text fields or canvas alignments, the entire React component tree re-renders, impacting performance. Additionally, there is no way for hosts to:
1. Batch ingest guest lists from a CSV file (they must add guests one by one).
2. Configure dynamic RSVP forms (e.g., custom dietary requirements, lodging checkboxes, or text responses).

## Proposed Solution
Introduce Creator Studio V2 by implementing the following components:
1. **Zustand State Store**: Migrate the state from `SigilContext` to a decoupled Zustand state store (`src/state/sigilStore.ts`), which enables selective selector rendering.
2. **CSV Batch Processing Roster Ingest**: Create a drag-and-drop or file selector CSV ingestion button in the host panel. Implement an RFC-compliant CSV parser mapping rows to `InviteeRecord` objects and appending them to the guest roster.
3. **Adaptive Form Configurator**: Allow hosts to toggle custom form fields (e.g., Attendance, Meal Preference, Dietary Restrictions, Plus-One Name) that dynamically render on the recipient's RSVP form.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/state/sigilStore.ts` | Central Zustand state store coordinating AppMode, CanvasDesign, and GuestRoster. |
| `src/components/creator/CsvIngestionButton.tsx` | UI button to upload, parse, and ingest guest lists from CSV. |
| `src/components/creator/FormConfiguratorPanel.tsx` | Controls for hosts to enable/disable specific fields in the dynamic guest RSVP form. |

## Files to Modify

| File | Change |
|---|---|
| `src/types/sigil.types.ts` | Add new interfaces for CSV schema mapping and `RsvpFormConfig` settings. |
| `src/App.tsx` | Hydrate views using selectors from the new Zustand store instead of React Context. |
| `src/components/creator/LeftPanel.tsx` | Integrate the CSV Ingestion Button and Form Configurator panels into the host layout. |

---

## Scope Constraints

- **In-Scope**:
  - Full migration of application state to Zustand.
  - Client-side CSV file parsing and roster injection.
  - Adding form configuration options (toggling dynamic RSVP form fields).

- **Out-of-Scope**:
  - Multi-phase envelope animations and Framer Motion visual timelines (reserved for Phase 4).
  - Ambient audio triggers (reserved for Phase 4).
