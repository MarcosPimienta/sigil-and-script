# Implementation Tasks

- [x] 1. Component & Styling
  - [x] 1.1 Create `src/components/creator/PreviewBackButton.tsx` with bilingual label support, aria attributes, and `id="btn-preview-back-to-studio"`.
  - [x] 1.2 Add `.creator-preview-back-btn` styling to `src/styles/creator.css` with luxury glassmorphic theme, `z-index: 10000`, safe-area insets, and mobile responsive compactness.

- [x] 2. Canvas Integration
  - [x] 2.1 Integrate `PreviewBackButton` into `src/components/creator/CreatorCanvas.tsx` with host preview guard (`isRecipient && isPreviewHost`, or `envelopePhase !== 'CLOSED'`).
  - [x] 2.2 Wire up the exit callback to transition `appMode` to `'CREATOR'`, reset `envelopePhase` to `'CLOSED'`, and silence preview audio.

- [x] 3. Testing & Verification
  - [x] 3.1 Create unit tests in `src/components/creator/PreviewBackButton.test.tsx` testing label rendering (EN/ES), click trigger, and accessible attributes.
  - [x] 3.2 Run test suite (`npm run test`) and production build check (`npm run build`) to ensure zero regressions.
