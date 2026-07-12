---
name: opsx-apply
description: Implement a proposed change by executing tasks from the tasks.md checklist.
---

# `opsx-apply` Skill

Use this skill when you run or receive an `/opsx-apply` or `/opsx:apply` request from the user to execute an approved specification checklist.

## Purpose

Walk through the implementation checklist step-by-step to implement a specification, keeping documentation synced as code evolves.

## Guidelines

1. **FIND ACTIVE CHANGE**: Locate the current active change folder under `openspec/changes/` (ignoring `archive/`).
2. **READ TASKS**: Load `tasks.md` and identify the next uncompleted task (marked with `[ ]`).
3. **STEP-BY-STEP EXECUTION**:
   - Implement the changes specified in the current checklist item.
   - Do NOT rush to implement other tasks out of order.
   - Run tests/lint/build checks to ensure correctness for the current task.
4. **UPDATE TASK STATUS**:
   - Update `tasks.md` by marking the current task as `[/]` (in-progress) or `[x]` (completed) using file editing tools.
   - Make sure you save the updated checklist file to disk.
5. **VERIFY PROGRESS**: Run the project's tests (`npm test`) or build steps (`npm run build`) regularly to prevent regressions.
6. **REPORT**: Show the updated checklist state to the user after completing a significant block of tasks or when blocked by an issue.
