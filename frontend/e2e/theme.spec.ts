import { test, expect } from "@playwright/test";

/**
 * Theme E2E Tests
 *
 * Tests dark/light mode toggle functionality.
 */

test.describe("Theme Toggle", () => {
  test("should toggle between light and dark modes", async ({ page }) => {
    await page.goto("/");

    // Get the html element to check theme class
    const html = page.locator("html");

    // Find and click the theme toggle
    const themeButton = page.getByRole("button", { name: /theme/i });
    await expect(themeButton).toBeVisible();

    // Click to open dropdown
    await themeButton.click();

    // Select dark mode
    await page.getByRole("menuitem", { name: /dark/i }).click();

    // Wait for theme transition
    await page.waitForTimeout(400);

    // Verify dark mode is applied
    await expect(html).toHaveClass(/dark/);

    // Click to open dropdown again
    await themeButton.click();

    // Select light mode
    await page.getByRole("menuitem", { name: /light/i }).click();

    // Wait for theme transition
    await page.waitForTimeout(400);

    // Verify dark mode is removed
    await expect(html).not.toHaveClass(/dark/);
  });

  test("should persist theme preference", async ({ page, context }) => {
    await page.goto("/");

    // Find and click the theme toggle
    const themeButton = page.getByRole("button", { name: /theme/i });
    await themeButton.click();

    // Select dark mode
    await page.getByRole("menuitem", { name: /dark/i }).click();
    await page.waitForTimeout(400);

    // Verify dark mode
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Reload page
    await page.reload();

    // Theme should persist
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("should respect system preference", async ({ page }) => {
    // Emulate dark color scheme
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    // Find and click the theme toggle
    const themeButton = page.getByRole("button", { name: /theme/i });
    await themeButton.click();

    // Select system mode
    await page.getByRole("menuitem", { name: /system/i }).click();
    await page.waitForTimeout(400);

    // Should follow system preference (dark)
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
