import { defineConfig, devices } from "@playwright/test";
import { nxE2EPreset } from "@nx/playwright/preset";
import { workspaceRoot } from "@nx/devkit";

// Point BASE_URL at a deployed environment to run the suite against it.
const baseURL = process.env["BASE_URL"] || "http://localhost:3000";

export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: "./src" }),
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm exec nx run web:dev",
    url: baseURL,
    reuseExistingServer: !process.env["CI"],
    cwd: workspaceRoot,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
