import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  use: { baseURL: "http://127.0.0.1:3100", browserName: "chromium" },
  webServer: { command: "npm run serve", url: "http://127.0.0.1:3100", reuseExistingServer: !process.env.CI },
});