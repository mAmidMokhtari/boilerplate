import { expect, test } from "@playwright/test";

test.describe("auth guard", () => {
  test("anonymous visitors are sent to login with a return path", async ({ page }) => {
    await page.goto("/posts");
    await expect(page).toHaveURL(/\/login\?next=%2Fposts/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/sign in/i);
  });

  test("login form validates before submitting", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });
});
