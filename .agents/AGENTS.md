# Agent Rules for Sigil & Script

This repository follows the OpenSpec **Spec-Driven Development (SDD)** framework.
When working in this project, you must adhere to the Spec-Driven Development workflow.

## OpenSpec Workflow Commands

The user will run commands prefixed with `/opsx` or `/opsx-` to control the workflow. When you see these commands (or when they are matched to skills), follow the respective instructions:

1. **`opsx-explore`** (or `/opsx-explore` / `/opsx:explore`):
   - Act as a thinking partner to investigate the codebase, explore options, or clarify requirements.
   - Do NOT modify code or create proposals.
   
2. **`opsx-propose`** (or `/opsx-propose` / `/opsx:propose`):
   - Initialize a new change under `openspec/changes/<change-id>/`.
   - Create `.openspec.yaml`, `proposal.md`, `design.md`, and `tasks.md`.
   - Wait for user approval before modifying code.

3. **`opsx-apply`** (or `/opsx-apply` / `/opsx:apply`):
   - Read the tasks list in `openspec/changes/<active-change-id>/tasks.md`.
   - Sequentially implement each task from the list.
   - Compile and run tests to verify each step.

4. **`opsx-archive`** (or `/opsx-archive` / `/opsx:archive`):
   - Verify that all tasks are completed.
   - Merge delta specifications into `openspec/specs/`.
   - Move the active change directory to `openspec/changes/archive/`.

Always direct the user to follow this structured workflow, rather than "vibe coding" directly on source code without a specification.
