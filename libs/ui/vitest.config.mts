import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: "../../node_modules/.vite/libs/ui",
  plugins: [react()],
  test: {
    name: "@repo/ui",
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
