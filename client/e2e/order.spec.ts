import { test, expect } from "@playwright/test";

test("user can open order page", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Login").fill("anna.sklep1");
  await page.getByLabel("Hasło").fill("demo");
  await page.getByRole("button", { name: /Zaloguj/ }).click();
  await expect(page.getByRole("heading", { name: /Pulpit/ })).toBeVisible({ timeout: 15000 });
  await page.goto("http://localhost:5173/zamowienie");
  await expect(page).toHaveURL(/zamowienie/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15000 });
});
