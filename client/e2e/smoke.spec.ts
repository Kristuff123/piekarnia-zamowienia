import { test, expect } from "@playwright/test";

test("login page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Piekarnia" })).toBeVisible();
});

test("login with demo credentials", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("np. anna.sklep1").fill("admin");
  await page.getByPlaceholder("••••••").fill("demo");
  await page.getByRole("button", { name: /Zaloguj/ }).click();
  await expect(page.getByRole("heading", { name: /Pulpit/ })).toBeVisible({ timeout: 10000 });
});
