---
name: commit
description: Create focused commits and pull requests following repository standards.
author: LIDR.co
version: 1.0.0
---
# commit Skill

Use it when this workflow is required in the project.

## Instructions

# Role

You are an expert in version control and release workflows. You create clear, comprehensive commits and Pull Requests that align with project standards and make review and traceability straightforward.

# Arguments

**Optional.** `$ARGUMENTS` may contain:

- **Nothing (empty)**: Stage and commit all relevant changes in the working tree, then open a single PR.
- **Feature/ticket identifiers**: e.g. branch names or short feature labels. When provided, stage and PR **only** the changes that belong to those features; leave all other changes unstaged and uncommitted.
- **Description-only / no-git mode**: If the user **explicitly** says something like "no PR", "only commit" (meaning only produce the commit text), "only description", "don't touch git", "just the message", or "dry run", then do **not** run any git commands or create a PR. Only determine scope, list what would be staged, and output the proposed commit message (subject + body). The user can copy and run git commands themselves.

# Goal

1. Produce a **single, comprehensive commit** that accurately describes the relevant changes.
2. **Push** the branch and **create (or update) a Pull Request** for review.
3. If arguments were given: **stage and commit only** the changes tied to those features; do not touch other modified files.

# Process and Rules

## 0. Description-only / no-git mode (check first)

If the user **explicitly** requested no git operations, perform **only** steps 1–3: inspect state, resolve scope, and write the full commit message. Do **not** run `git add`, `git commit`, `git push`, or `gh pr create`. Output the list of files to be staged and the proposed commit message, then stop.

## 1. Inspect current state

- Run `git status` and `git diff` (and `git diff --staged` if needed)
- Identify the current branch. If not on a feature branch, decide whether to create one from `master`

## 2. Resolve scope

- **If `$ARGUMENTS` is empty**: treat all relevant changes as the scope.
- **If `$ARGUMENTS` is provided**: stage only files/hunks that clearly belong to those features.

## 3. Commit message

- Write in **English** (per `docs/base-standards.md`)
- **Subject line**: Short, imperative summary under 72 chars (e.g. "Add monogram text input to wax seal inspector")
- **Body** (if needed): Bullet points describing what changed and why
- Do not commit secrets, `.env`, or generated/build artifacts

## 4. Commit and push

- Create the commit
- Push to remote; if branch has no upstream, push with `-u`

## 5. Pull Request

- Use **GitHub CLI (`gh`)** for all GitHub operations
- **Title**: Clear, aligned with the commit
- **Description**: Summarize the change set and note any testing or follow-ups

## 6. Summary

- Report what was committed
- Provide the PR URL

# Notes

- **Description-only**: When the user asks for no PR or only the commit text, output the staging plan and message only; do not run git or `gh` commands.
- Do not run destructive git commands (e.g. `git push --force`) without explicit user request.
- If there are conflicts or the push is rejected, report the situation and suggest next steps; do not force-push unless the user asks.
