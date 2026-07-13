# Design — Persist and Load Invitation Configurations

## Architectural Decisions

### Decision 1: Serialized JSON Blob Storage in `designData`
**Choice**: Store the full `InvitationDesign` object as a serialized JSON string in a single `designData` text column rather than breaking out fields like `textBlocks`, `registryText`, or `sealSize` into individual database tables.
**Why**:
- The design state has complex nested objects (e.g., list of text blocks with positioning margins, font weights, and alignments). Mapping these would require multiple joined relational tables and high schema overhead.
- Serializing to a JSON blob makes it extremely easy to read, write, and extend. Any new design parameters added in the future (like custom seal sliders or borders) will automatically be saved without requiring database migrations.

### Decision 2: Upsert Pattern for Save API
**Choice**: Express the `POST /canvas` endpoint as a unified upsert function:
- If the payload includes a valid UUID `id` and it matches a database record, perform an `update`.
- Otherwise, generate a new UUID and perform a `create`.
**Why**:
- Simplifies client-side calling: the save action doesn't need to distinguish between "Save New" and "Save Edit". It just runs `saveCurrentDesign()`.
- Updates are handled automatically: once a layout is saved for the first time, its frontend `design.id` is updated, and subsequent clicks overwrite the same record.

### Decision 3: Simple Overlay Modal for Configurations List
**Choice**: Implement the listing and loading UI as a local state overlay (`isLoadModalOpen`) within `Toolbar.tsx`.
**Why**:
- Keeps the UI compact and eliminates the need to import router packages.
- Localized state avoids polluting the global Zustand store with modal open/close states.

---

## Risks & Mitigations

### Risk 1: Corrupt or Missing JSON on Legacy Records
- **Risk**: Existing database records (e.g. from unit tests) won't have `designData` populated, causing JSON parsing to crash.
- **Mitigation**: Add a schema default (`default("{}")`) and wrap the parsing block in a try-catch block. When loading a record, merge the parsed data with `DEFAULT_DESIGN` so any missing values fall back to defaults safely.
