---
name: enrich-us
description: Analyze and enhance user stories with complete, implementation-ready technical detail from direct ticket input.
author: LIDR.co
version: 1.0.0
---
# enrich-us Skill

Use it when this workflow is required in the project.

## Instructions

Please analyze and enrich the ticket: $ARGUMENTS.

Follow these steps:

1. Determine the ticket input source:
   - **Direct input mode (default when ticket text is provided):** Use the ticket content shared by the user in the prompt/chat.
   - **Jira mode (optional):** If the user provides a Jira id/key, or asks to use Jira (including references like "the one in progress"), use Jira MCP to fetch the ticket details.
2. Act as a product expert with technical knowledge of the Sigil & Script invitation creator (React 19, TypeScript, useReducer + Context, CSS design tokens, Vite).
3. Understand the problem described in the ticket.
4. Decide whether or not the User Story is completely detailed according to product best practices. Validate that it includes:
   - Full functionality description
   - Components and files to create or modify
   - New state / actions required in `SigilContext`
   - New design tokens required in `tokens.css`
   - New types required in `sigil.types.ts`
   - Definition of done (implementation and delivery steps)
   - Documentation and unit test updates
   - Non-functional requirements (accessibility, performance, security)
5. If the story lacks enough technical detail for autonomous implementation, provide an improved version that is clearer, more specific, and concise. Use project technical context from `docs/`. Return the result in Markdown.
6. Output format must always include:
   - `## Original`
   - `## Enhanced`

## Notes

- Do not require Jira when the user already provided full ticket content directly.
- If input is ambiguous (for example, user gives a short reference without content), ask whether to resolve via Jira or request the full ticket text.
- This skill must run with **Opus high reasoning** (see CLAUDE.md §5).
