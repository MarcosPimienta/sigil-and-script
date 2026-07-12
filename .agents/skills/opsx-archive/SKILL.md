---
name: opsx-archive
description: Archive a completed change and merge delta specs into the master specifications.
---

# `opsx-archive` Skill

Use this skill when you run or receive an `/opsx-archive` or `/opsx:archive` request from the user to finalize and clean up a completed change.

## Purpose

Finalize the lifecycle of a change by updating the master specifications list and moving the planning artifacts to the archive directory.

## Guidelines

1. **VERIFY COMPLETENESS**: Ensure that all items in the active change's `tasks.md` are fully marked as `[x]`.
2. **MERGE SPECS**:
   - If the active change folder contains a `specs/` directory (e.g. `openspec/changes/<change-id>/specs/`), copy or merge those specification files into the master specs directory `openspec/specs/`.
   - Update `openspec/project.md` or any master blueprint document to reflect the new system behavior.
3. **ARCHIVE CHANGE**:
   - Move the change directory from `openspec/changes/<change-id>/` to `openspec/changes/archive/<change-id>/`.
   - Ensure the `archive/` directory is structured logically.
4. **FINAL TESTING & VERIFICATION**: Run the full test suite (`npm test`) and code quality scripts to confirm the archived codebase is fully stable.
5. **SUMMARY REPORT**: Provide a concise summary of the archived changes, what tests passed, and reference the new location of the specification.
