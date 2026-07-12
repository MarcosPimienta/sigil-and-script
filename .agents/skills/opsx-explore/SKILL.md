---
name: opsx-explore
description: Explore codebase, research options, or clarify requirements without modifying code.
---

# `opsx-explore` Skill

Use this skill when you run or receive an `/opsx-explore` or `/opsx:explore` request from the user, or when you need to research a new capability before proposing a design.

## Purpose

Act as a thinking partner or "no-stakes conversation" to investigate the codebase, clarify fuzzy requirements, and explore technical options.

## Guidelines

1. **NO CODE MUTATION**: Do NOT write, modify, or delete any source code files during exploration. Do NOT create a change proposal folder.
2. **RESEARCH DEEPLY**: Read related source files, search files, run grep, or read existing specifications to construct a thorough understanding of the domain.
3. **ARCHITECTURE & OPTIONS**: Compare different approaches, discuss trade-offs (e.g., performance, complexity, design patterns), and list pros/cons.
4. **OUTLINE SCOPE**: Help the user narrow down a buildable scope. Define what is in-scope and what is out-of-scope.
5. **NEXT STEPS**: Summarize your findings and recommend initiating a formal proposal using `/opsx-propose` once requirements are clear.
