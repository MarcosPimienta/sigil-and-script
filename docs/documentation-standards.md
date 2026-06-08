---
description: Standards and best practices for technical documentation in this project, including documentation structure, update processes, and language rules.
alwaysApply: true
---

# Rules and Patterns for Documentation and AI Specs

## Introduction

Technical documentation covers all docs relative to the project: data model, README, development guide, and other Markdown files describing how the project is structured and operates.

AI specs refers to documents that explain AI agents how to behave, document, plan, and code — this includes team agreements, standards, and conventions in `docs/` and `ai-specs/`.

## General Rules

- **ALWAYS WRITE IN ENGLISH**, including comments and any explanation in files. This applies to creating new documentation and updating existing docs, and to documentation within the code (comments, explanations of functions or fields).

## Technical Documentation

Before making any commit or git push, or if asked to document a commit, you MUST always review which technical documentation should be updated.

When updating documentation:
1. Review all recent changes in the codebase
2. Identify which documentation files need updates based on the changes:
   - For domain model changes: update `docs/data-model.md`
   - For stack or tooling changes: update `docs/frontend-standards.md` and `docs/development_guide.md`
   - For state management changes: update `docs/data-model.md` (action types / state shape)
   - For new design tokens: update the token inventory in `docs/frontend-standards.md`
3. Update each affected file in English, maintaining consistency with existing documentation
4. Ensure all documentation is properly formatted and follows the established structure
5. Verify that all changes are accurately reflected in the documentation
6. Report which files were updated and what changes were made

## AI Specs

This rule establishes a mandatory process for the AI to:
- Learn from user feedback, guidance, and suggestions during interactions.
- Identify opportunities to improve existing development rules based on these learnings proactively.
- Keep the AI's assistance aligned with evolving project needs and user expectations.
- Incorporate user feedback into the AI's operational framework to maximize its value.

This rule is applicable after any interaction where the user provides explicit or implicit feedback, suggestions, corrections, new information, or expresses preferences. **The AI MUST actively analyze all user interactions for such learning opportunities, not only passively waiting for direct feedback.**

### Common Pitfalls to Avoid

- **Skipping Approval Process**: Applying rule modifications without obtaining explicit user review and approval first.
- **Unlinked Proposals**: Proposing rule changes without clearly connecting them to specific user feedback or insights.
- **Imprecise Modifications**: Suggesting modifications without precisely identifying which rule or section to change.
- **Unaddressed Feedback**: Not initiating the learning and review process when the user provides relevant feedback.
- **Scope Creep**: Updating multiple unrelated rules simultaneously or making changes beyond the feedback scope.
- **Unprompted Rule Changes**: Modifying rules with no direct connection to user feedback.
- **Missing Update Confirmation**: Failing to notify the user after a rule modification is implemented.
