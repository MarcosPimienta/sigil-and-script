// ─────────────────────────────────────────────────────────────────────────────
// Sigil — Application Root
// ─────────────────────────────────────────────────────────────────────────────

import { SigilProvider } from './context/SigilContext';
import { CreatorCanvas } from './components/creator/CreatorCanvas';
import './index.css';

export default function App() {
  return (
    <SigilProvider>
      <CreatorCanvas />
    </SigilProvider>
  );
}
