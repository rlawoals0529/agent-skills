import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  timeout: 30_000,
  // Served from a subdirectory, the way Pages serves it.
  use: { baseURL: "http://127.0.0.1:4181/site/", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Static files off disk. The host is bound explicitly because "localhost" resolves to
    // ::1 on some machines and the health check then waits out its timeout against a server
    // that is up and listening somewhere else.
    command: "npm run build && npx --yes http-server -p 4181 -a 127.0.0.1 -s .",
    url: "http://127.0.0.1:4181/site/index.html",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
