import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  use: { baseURL: "http://localhost:5173" },
  webServer: [
    {
      command: "cd server && node server.js",
      url: "http://localhost:5000/api/health",
      reuseExistingServer: true,
      env: { PORT: "5000", JWT_SECRET: "dev", NODE_ENV: "test", CLIENT_ORIGIN: "http://localhost:5173" },
    },
    {
      command: "cd client && npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: true,
    },
  ],
});
