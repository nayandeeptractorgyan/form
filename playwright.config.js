import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60000, // max timeout for each test
  use: {
    baseURL: "https://frontend-qu5vhbip7-nayandeeps-projects-77fe608c.vercel.app/",
    headless: true,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 30000,
    navigationTimeout: 45000,
    ignoreHTTPSErrors: true
  }
});
