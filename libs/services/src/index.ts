// Shared infrastructure
export * from "./lib/shared/api-client";
export * from "./lib/shared/api-error";
export * from "./lib/shared/endpoints";
export * from "./lib/shared/types";
export * from "./lib/shared/query-client";
export * from "./lib/shared/hooks";

// Domains — one folder each: <x>.api.ts, <x>.hooks.ts, <x>.query-keys.ts
export * from "./lib/auth";
export * from "./lib/users";
export * from "./lib/roles";
export * from "./lib/permissions";
export * from "./lib/posts";
export * from "./lib/media";
