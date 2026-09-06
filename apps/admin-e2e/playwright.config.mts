import { defineConfig, devices } from "@playwright/test";
import { nxE2EPreset } from "@nx/playwright/preset";
import { workspaceRoot } from "@nx/devkit";

const baseURL = process.env["BASE_URL"] || "http://localhost:3001";

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: "./src" }),
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm exec nx run admin:dev",
    url: baseURL,
    reuseExistingServer: !process.env["CI"],
    cwd: workspaceRoot,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
