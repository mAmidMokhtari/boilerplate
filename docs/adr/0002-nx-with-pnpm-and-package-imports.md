# ADR 0002 — Nx + pnpm workspaces with package-name imports

**Status:** accepted · **Date:** 2026-09-06

## Context

We need affected-only CI, a dependency graph, code generators and enforced
boundaries across several apps and libs.

## Decision

Nx 23 on pnpm workspaces. Libraries are real workspace packages
(`@repo/<name>`) with `exports` maps and TypeScript project references,
imported by package name. Boundaries are enforced with
`@nx/enforce-module-boundaries` keyed on `type:*` / `scope:*` tags.

## Consequences

- No `tsconfig` path aliases to maintain; `pnpm nx sync` keeps references correct.
- Deep imports are impossible unless a subpath is declared in `exports`.
- Turborepo was considered: simpler, but no generators or graph-based lint.
