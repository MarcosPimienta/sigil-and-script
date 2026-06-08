---
description: Generic agent configuration for Sigil & Script. Applicable to all AI coding copilots (Claude, Cursor, GitHub Copilot, Gemini, etc.).
alwaysApply: true
---

# Agent Configuration — Sigil & Script

## 1. Core Principles

See [docs/base-standards.md](./docs/base-standards.md) — this is the single source of truth for all development rules.

## 2. Tech Stack

- **React 19** + **TypeScript 6** + **Vite 8**
- State: `useReducer` + Context (`src/context/SigilContext.tsx`)
- Styles: CSS custom properties / design tokens (`src/styles/tokens.css`)
- No backend, no external API

## 3. Specific Standards

- [Frontend Standards](./docs/frontend-standards.md)
- [Documentation Standards](./docs/documentation-standards.md)
- [Data Model](./docs/data-model.md)
- [Development Guide](./docs/development_guide.md)

## 4. Project Skills

- Skills live in `ai-specs/skills/`.
- When a request matches a skill name, load and follow the corresponding `SKILL.md` automatically before continuing.
- Available skills: `enrich-us`, `commit`, `code-auditing`, `using-git-worktrees`

## 5. Agent Roles

- For frontend feature work: load and follow `ai-specs/agents/frontend-developer.md`

## 6. Language

All code, comments, documentation, and technical artifacts must be in English.
