import { test, expect } from "@playwright/test";

test("login page loads", async ({ page }) => {
  const response = await page.goto("http://localhost:5173/login");
  console.log("Status:", response?.status());
  await expect(page).toHaveTitle(/Piekarnia/);
});

test("login with demo credentials", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Login").fill("admin");
  await page.getByLabel("Hasło").fill("demo");
  await page.getByRole("button", { name: /Zaloguj/ }).click();
  await expect(page.getByRole("heading", { name: /Pulpit/ })).toBeVisible({ timeout: 15000 });
});