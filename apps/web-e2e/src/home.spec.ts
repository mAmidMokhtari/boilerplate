import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("redirects to the default locale and renders the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en(\/|$)/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("serves the Persian locale right-to-left", async ({ page }) => {
    await page.goto("/fa");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("guards the account area", async ({ page }) => {
    await page.goto("/en/account");
    await expect(page).toHaveURL(/\/en\/login/);
  });
});
