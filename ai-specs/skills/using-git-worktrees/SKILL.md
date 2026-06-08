---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - ensures an isolated workspace exists via native tools or git worktree fallback
author: LIDR.co
version: 1.0.0
---

# Using Git Worktrees

## Overview

Ensure work happens in an isolated workspace. Prefer your platform's native worktree tools. Fall back to manual git worktrees only when no native tool is available.

**Core principle:** Detect existing isolation first. Then use native tools. Then fall back to git. Never fight the harness.

**Announce at start:** "I'm using the using-git-worktrees skill to set up an isolated workspace."

## Step 0: Detect Existing Isolation

**Before creating anything, check if you are already in an isolated workspace.**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule guard:** `GIT_DIR != GIT_COMMON` is also true inside git submodules. Before concluding "already in a worktree," verify you are not in a submodule:

```bash
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**If `GIT_DIR != GIT_COMMON` (and not a submodule):** You are already in a linked worktree. Skip to Step 3 (Project Setup).

**If `GIT_DIR == GIT_COMMON`:** You are in a normal repo checkout. Ask for consent before creating a worktree:

> "Would you like me to set up an isolated worktree? It protects your current branch from changes."

If the user declines, work in place and skip to Step 3.

## Step 1: Create Isolated Workspace

### 1a. Native Worktree Tools (preferred)

If you have a native tool (`EnterWorktree`, `WorktreeCreate`, `/worktree` command, or a `--worktree` flag), use it and skip to Step 3.

### 1b. Git Worktree Fallback

Use `<repo>/.worktrees/<branch>` as the location:

```bash
SOURCE_ROOT=$(git rev-parse --show-toplevel)
LOCATION="$SOURCE_ROOT/.worktrees"
mkdir -p "$LOCATION"
```

**MUST verify `.worktrees/` is ignored before creating worktree:**

```bash
git check-ignore -q .worktrees 2>/dev/null
```

**If NOT ignored:** Add `.worktrees/` to `.gitignore`, commit the change, then proceed.

```bash
git worktree add "$LOCATION/$BRANCH_NAME" -b "$BRANCH_NAME"
cd "$LOCATION/$BRANCH_NAME"
```

Copy Claude settings from the main checkout:

```bash
for claude_settings in ".claude/settings.json" ".claude/settings.local.json"; do
    if [ -f "$SOURCE_ROOT/$claude_settings" ]; then
        mkdir -p ".claude"
        cp -p "$SOURCE_ROOT/$claude_settings" "./$claude_settings"
    fi
done
```

## Step 3: Project Setup

```bash
if [ -f package.json ]; then npm install; fi
```

## Step 4: Verify Clean Baseline

```bash
npm run build
```

If build fails, report failures and ask whether to proceed or investigate.

## Step 5: Cleanup

Once work is complete (branch merged, PR closed, or experiment discarded):

1. Verify no unsaved work: `git status --porcelain` and `git log @{u}..` must be empty
2. Use native cleanup tool if available; otherwise:

```bash
WORKTREE_PATH=$(git rev-parse --show-toplevel)
BRANCH_NAME=$(git branch --show-current)
cd "$GIT_COMMON/.."
git worktree remove "$WORKTREE_PATH"
git branch -d "$BRANCH_NAME"
git worktree prune
```

**Never remove a worktree with uncommitted or unpushed changes without explicit user confirmation.**
