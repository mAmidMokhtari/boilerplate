# ADR 0001 — Cookie-based auth with a BFF proxy

**Status:** accepted · **Date:** 2026-09-06

## Context

The backend issues JWT access/refresh pairs. Storing them in `localStorage`
exposes them to any XSS; sending them from client code also forces every app
to reimplement refresh logic.

## Decision

Each app owns route handlers that exchange credentials with the backend and
store the pair in httpOnly cookies. Authenticated API calls are proxied
through the app (`/api/backend/[...path]`), which attaches the token,
refreshes once on 401 (single-flight) and rotates the cookies. Client JS
never sees a token. Implementation lives in `@repo/auth/server` and is
instantiated per app with `createAuth()`.

## Consequences

- Public endpoints still go straight to the backend (no proxy hop).
- Server Components cannot refresh; they render anonymously on an expired
  access token and the next client call heals the session.
- Two apps on one domain need distinct cookie names (`<appId>_access`).
- Proxy adds one hop per authenticated request; acceptable for admin-style
  traffic, and the public app keeps most traffic on `/general/*`.
