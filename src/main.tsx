// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Entry Point
// main.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  // Fail fast with a clear message — never silently swallow mount failures
  throw new Error(
    '[Sigil] Fatal: #root element not found in the document. ' +
    'Ensure index.html contains <div id="root"></div>.',
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
