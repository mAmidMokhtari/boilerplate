# ADR 0003 — Models as getter classes, DTOs as Zod schemas

**Status:** accepted · **Date:** 2026-09-06

## Context

Backend payloads are snake_case with many nullable fields. Consumers need a
stable, null-safe surface; forms and route handlers need runtime validation.

## Decision

- Read side: `IXModel` mirrors the raw payload; `XModel extends BaseModel`
  exposes getters and wraps nested entities. No field renaming, no I/O.
- Write side: Zod schemas in `@repo/dtos`; types are `z.infer` / `z.input`.

## Consequences

- One shape per direction; no camelCase mirror to keep in sync.
- Models are cheap to construct on every render; memoize only when profiling says so.
- Schemas double as form resolvers and route-handler validators.
