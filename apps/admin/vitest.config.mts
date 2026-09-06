import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { join } from "node:path";

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: "../../node_modules/.vite/apps/admin",
  plugins: [react()],
  resolve: {
    alias: { "@": join(import.meta.dirname, "./src") },
  },
  test: {
    name: "@repo/admin",
    watch: false,
    passWithNoTests: true,
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./src/test-setup.ts"],
    reporters: ["default"],
    coverage: { reportsDirectory: "./test-output/vitest/coverage", provider: "v8" as const },
  },
}));
