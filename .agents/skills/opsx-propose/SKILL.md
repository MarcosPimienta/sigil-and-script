---
name: opsx-propose
description: Propose a new change, generating proposal.md, design.md, tasks.md, and specs under openspec/changes/<change-id>/.
---

# `opsx-propose` Skill

Use this skill when you run or receive an `/opsx-propose` or `/opsx:propose` request from the user to formalize a new feature or change.

## Purpose

Transition from an explored concept into a formal proposal with clear specifications, technical design, and sequential task checklists.

## Guidelines

1. **PROPOSAL FOLDER**: Create a directory `openspec/changes/<change-id>/` (kebab-case identifier matching the feature name).
2. **META FILE**: Create `.openspec.yaml` containing:
   ```yaml
   schema: spec-driven
   created: YYYY-MM-DD
   ```
3. **PROPOSAL FILE**: Create `proposal.md` detailing:
   - **Problem**: The issue or gap being solved.
   - **Proposed Solution**: High-level explanation of the solution.
   - **Files to Create & Modify**: A table of affected files and their purposes.
   - **Scope Constraints**: What is explicit in-scope versus out-of-scope.
4. **DESIGN FILE**: Create `design.md` detailing:
   - **Architectural Decisions**: Key choices made and the reasoning/trade-offs.
   - **Risks & Mitigations**: List of potential regressions or edge cases and how they are addressed.
5. **TASKS CHECKLIST**: Create `tasks.md` with:
   - A step-by-step checklist of implementation tasks (e.g., `1. Types`, `2. Reducer`, `3. Components`, `4. Verification`).
   - Standard task list syntax: `- [ ] 1.1 Task Description`.
6. **DELTA SPECIFICATIONS**: If applicable, create specification files under `openspec/changes/<change-id>/specs/<spec-id>/spec.md` with detailed requirements/scenarios using BDD-style (WHEN/THEN) format.
7. **ALIGNMENT**: Once the files are generated, summarize the proposed change to the user and await their feedback and approval before proceeding with implementation.
