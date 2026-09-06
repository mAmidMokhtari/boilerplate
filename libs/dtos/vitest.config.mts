import { defineConfig } from "vitest/config";

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: "../../node_modules/.vite/libs/dtos",
  test: {
    name: "@repo/dtos",
    watch: false,
    passWithNoTests: true,
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    reporters: ["default"],
    coverage: { reportsDirectory: "./test-output/vitest/coverage", provider: "v8" as const },
  },
}));
