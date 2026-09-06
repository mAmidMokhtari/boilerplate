/**
 * shadcn's CLI imports `cn` from `@/lib/utils` inside generated components.
 * `components.json` maps that alias here so every primitive shares the one
 * implementation in `@repo/utils`.
 */
export { cn } from "@repo/utils";
