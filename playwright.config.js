import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "https://frontend-qu5vhbip7-nayandeeps-projects-77fe608c.vercel.app/", // 🔴 replace this
    headless: true, // show browser (good for learning)
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  }
});