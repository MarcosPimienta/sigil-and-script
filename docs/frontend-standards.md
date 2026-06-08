---
description: Frontend development standards, best practices, and conventions for the Sigil & Script React application — component patterns, state management via useReducer + Context, CSS design tokens, and Vite configuration.
globs: ["src/**/*.{ts,tsx}", "src/styles/**/*.css", "vite.config.ts", "tsconfig*.json"]
alwaysApply: true
---

# Frontend Standards — Sigil & Script

## Technology Stack

### Core Technologies
- **React 19**: Functional components and hooks throughout; no class components
- **TypeScript 6**: Strict mode, no `any`, all code fully typed
- **Vite 8**: Build tooling and dev server (not Create React App)

### State Management
- **useReducer + Context**: Central `SigilContext` holds all app state via a typed reducer
- **No external state library** (no Redux, Zustand, MobX)
- Custom hooks (`useSigil`, `useSigilSelector`) abstract context consumption

### Styling
- **CSS custom properties (design tokens)**: All colors, spacing, and typography defined in `src/styles/tokens.css`
- **No CSS-in-JS, no Bootstrap, no Tailwind** — scoped CSS files per feature area
- Token naming: `--token-name` kebab-case (e.g. `--wax-crimson`, `--paper-parchment`)

### Testing
- **Vitest** for unit and component tests (preferred over Jest)
- **React Testing Library** for component rendering
- Test files co-located with source: `ComponentName.test.tsx` next to `ComponentName.tsx`

---

## Project Structure

```
src/
├── components/
│   ├── creator/         # Creator-mode UI (canvas, panels, toolbar)
│   └── shared/          # Reusable cross-feature components
├── context/
│   └── SigilContext.tsx # Single context + reducer + action creators
├── styles/
│   ├── tokens.css       # Design tokens (CSS custom properties)
│   └── creator.css      # Creator-specific layout styles
├── types/
│   └── sigil.types.ts   # All shared TypeScript types and interfaces
├── utils/
│   ├── luminanceGuards.ts
│   └── tokenResolver.ts
├── assets/
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

---

## Coding Standards

### Naming Conventions

| Category | Convention | Example |
|---|---|---|
| Components | PascalCase | `CreatorCanvas`, `WaxSeal` |
| Variables / functions | camelCase | `handleSealClick`, `resolveToken` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_SCALE`, `MAX_TEXT_BLOCKS` |
| Types / Interfaces | PascalCase | `WaxSealConfig`, `InspectorFocus` |
| Component files | PascalCase `.tsx` | `InvitationStage.tsx` |
| Utility files | camelCase `.ts` | `tokenResolver.ts` |
| CSS classes | kebab-case | `creator-canvas`, `text-block` |
| CSS tokens | `--kebab-case` | `--wax-crimson`, `--ink-dark` |
| Hooks | camelCase `use` prefix | `useSigil`, `useSigilSelector` |

### Component Conventions

- **Always use functional components** with hooks
- **Define TypeScript types** for every component's props — never use implicit `any`
- **Destructure props** at the parameter level
- Components read state via `useSigil()` or `useSigilSelector()`; they do **not** accept raw state objects as props unless presenting pure/display data

```typescript
// Good
interface WaxSealProps {
  config: WaxSealConfig;
  onSealClick: () => void;
}

const WaxSeal: React.FC<WaxSealProps> = ({ config, onSealClick }) => {
  // ...
};

// Avoid
const WaxSeal = (props: any) => { ... };
```

### State Management

All global state lives in `SigilContext`. The pattern is:
1. Dispatch a typed action (`SigilAction`) via `dispatch` or a pre-wired action creator
2. The reducer in `SigilContext.tsx` applies the state transition
3. Components read slices via `useSigilSelector`

For component-local ephemeral state (hover, focus, animation flags), use `useState`.

```typescript
// Reading from global state
const { startReveal, updateWaxSeal } = useSigil();
const sealConfig = useSigilSelector((s) => s.design.waxSeal);

// Component-local state
const [isHovered, setIsHovered] = useState(false);
```

**Do not bypass the reducer.** Never mutate state directly or pass setState callbacks as props for shared state.

### Adding New Actions

When a new state shape or transition is needed:
1. Add the type definition to `sigil.types.ts` (if it affects existing interfaces)
2. Add the action union member to `SigilAction` in `SigilContext.tsx`
3. Add the `case` to `sigilReducer`
4. Add a convenience action creator to the context value if it will be called frequently

### Type Safety Rules

- No `any`. Use `unknown` if the type truly cannot be determined at the call site.
- No non-null assertions (`!`) without a guard comment explaining why the value is guaranteed non-null.
- Use discriminated unions for state machines (e.g. `InspectorFocus`, `RevealState`).
- Import types with `import type { ... }` to keep the bundle clean.

---

## CSS / Styling Standards

### Design Token Usage

All colors, sizes, and decorative values must reference design tokens, never raw hex or pixel values.

```css
/* Good */
background: var(--paper-parchment);
color: var(--ink-dark);

/* Avoid */
background: #f5e6c8;
color: #1a1a1a;
```

### Adding New Tokens

Add to `src/styles/tokens.css` under the appropriate group (color, spacing, typography, shadow). Name the token semantically, not by value.

```css
/* Good: semantic */
--seal-shadow-depth: 0 4px 16px rgba(0,0,0,0.35);

/* Avoid: presentational */
--dark-gray-shadow: 0 4px 16px rgba(0,0,0,0.35);
```

### Scoped Styles

- Global resets and base typography → `src/index.css`
- Design tokens → `src/styles/tokens.css`
- Creator layout → `src/styles/creator.css`
- Component-specific styles → co-located `ComponentName.css` imported in the component file

---

## Testing Standards

### When to Write Tests
- All utility functions in `src/utils/` must have unit tests.
- All reducers must have unit tests covering every action type and guard condition.
- Components that carry complex interaction logic should have component tests.

### Test File Placement
Co-locate tests with source:
```
src/utils/tokenResolver.ts
src/utils/tokenResolver.test.ts
```

### Test Naming
Use descriptive `describe` + `it` blocks that read as full sentences:

```typescript
describe('sigilReducer', () => {
  it('transitions from LOCKED to ANIMATING on START_REVEAL_ANIMATION', () => { ... });
  it('ignores START_REVEAL_ANIMATION when not in LOCKED state', () => { ... });
});
```

### Component Tests
Use React Testing Library. Test behavior, not implementation.

```typescript
import { render, fireEvent, screen } from '@testing-library/react';
import { SigilProvider } from '../../context/SigilContext';

test('clicking the seal triggers startReveal', () => {
  render(
    <SigilProvider>
      <WaxSeal />
    </SigilProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: /seal/i }));
  // assert state / UI change
});
```

---

## Performance Best Practices

- Use `useSigilSelector` instead of `useSigil` when a component only needs a slice of state — avoids re-renders from unrelated state changes.
- Wrap expensive child renders in `React.memo` when profiling confirms unnecessary re-renders.
- Memoize derived values with `useMemo` only when the computation is demonstrably expensive.
- Keep SVG filter definitions in `SvgFilterBank` (rendered once at the root) and reference them by `id` in components.

---

## Development Workflow

- **Feature Branches**: `feature/<ticket-or-description>` (e.g. `feature/add-border-styles`)
- **Commit Messages**: Imperative English, concise subject + optional body (see `commit` skill)
- **No direct commits to `master`**: all changes via feature branches and PR

### Development Scripts
```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript compile + production build
npm run lint         # ESLint
npm run preview      # Serve the production build locally
```

---

## Security Notes

- Guest names and all user-supplied strings must only be rendered via React JSX (auto-escaped). Never inject them via `innerHTML` or `dangerouslySetInnerHTML`.
- If a backend is introduced, routing tokens from `GuestPayload` must be validated server-side; never trust client-provided tokens alone.
