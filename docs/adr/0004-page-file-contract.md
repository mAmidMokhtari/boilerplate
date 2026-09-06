# ADR 0004 — Fixed per-page file contract

**Status:** accepted · **Date:** 2026-09-06

## Context

Without a rule, logic drifts into JSX, fetching drifts into pages, and every
page looks different. Reviews then argue structure instead of behaviour.

## Decision

- web: `page.tsx` (server) + `components/index.tsx` (client, presentational)
  + `components/index.hook.ts` (client, all logic, descriptive hook name).
- admin: the same plus `components/texts.ts`, with the hook named `useData`.
- Hook bodies are sectioned with block-comment dividers in a fixed order.
- `pnpm g:page` produces the contract; reviewers reject deviations.

## Consequences

- A page's logic is testable without rendering.
- Presentational components can be moved to `libs/ui` when they become shared.
- Small pages carry a little ceremony; consistency is worth it.
