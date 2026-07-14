## 1. Update Types & State Defaults
- [x] 1.1 Add `'EVENTS_HUB'` to the `AppMode` type union in [sigil.types.ts](file:///home/fenix3819/sigil-and-script/src/types/sigil.types.ts#L8).
- [x] 1.2 Update store defaults in [sigilStore.ts](file:///home/fenix3819/sigil-and-script/src/state/sigilStore.ts#L140) to initialize in `'EVENTS_HUB'` if `user` is logged in.

## 2. Develop Events Hub View
- [x] 2.1 Create [eventsHub.css](file:///home/fenix3819/sigil-and-script/src/styles/eventsHub.css) for glassmorphic cards and layout styles.
- [x] 2.2 Create [EventsHubView.tsx](file:///home/fenix3819/sigil-and-script/src/components/events/EventsHubView.tsx) to list events and trigger load, create, and delete actions.

## 3. Update Toolbar & Navigation
- [x] 3.1 Add the "← My Events" back button to [Toolbar.tsx](file:///home/fenix3819/sigil-and-script/src/components/creator/Toolbar.tsx#L81) for studio and dashboard views.

## 4. Integrate App Router
- [x] 4.1 Update the page dispatcher in [App.tsx](file:///home/fenix3819/sigil-and-script/src/App.tsx#L97) to render the Events Hub view.

## 5. Verification
- [x] 5.1 Execute the unit test suites with `npm test`.
- [x] 5.2 Run the production bundling script `npm run build`.
