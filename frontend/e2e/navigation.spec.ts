import { test, expect } from "@playwright/test";

/**
 * Navigation E2E Tests
 *
 * Tests critical navigation flows and page loads.
 */

test.describe("Navigation", () => {
  test("should load the dashboard page", async ({ page }) => {
    await page.goto("/");

    // Check page title
    await expect(page).toHaveTitle(/Quantum X/);

    // Check dashboard header (page title is "Dashboard" from translations)
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    // Check stats cards are visible
    await expect(page.locator('[data-testid="stats-card"]').first()).toBeVisible();
  });

  test("should navigate to Strategies page", async ({ page }) => {
    await page.goto("/");

    // Click on Strategies in sidebar (use first to avoid mobile nav duplicate)
    await page.getByRole("link", { name: /strategies/i }).first().click();

    // Verify URL changed
    await expect(page).toHaveURL("/strategies");

    // Wait for page title (h1) to be visible - use level: 1 to target main heading
    await expect(page.getByRole("heading", { level: 1, name: /strategies/i })).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to Trading page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /trading/i }).first().click();

    await expect(page).toHaveURL("/trading");
    // Wait for page title (h1) to be visible
    await expect(page.getByRole("heading", { level: 1, name: /trading/i })).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to Risk page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /risk/i }).first().click();

    await expect(page).toHaveURL("/risk");
    await expect(page.getByRole("heading", { level: 1, name: /risk/i })).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to Backtest page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /backtest/i }).first().click();

    await expect(page).toHaveURL("/backtest");
    // Wait for page title (h1) to be visible
    await expect(page.getByRole("heading", { level: 1, name: /backtest/i })).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to Copy Trading page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /copy/i }).first().click();

    await expect(page).toHaveURL("/copy");
    await expect(page.getByRole("heading", { level: 1, name: /copy/i })).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to Settings page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /settings/i }).first().click();

    await expect(page).toHaveURL("/settings");
    await expect(page.getByRole("heading", { level: 1, name: /settings/i })).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to Alerts page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /alerts/i }).first().click();

    await expect(page).toHaveURL("/alerts");
    await expect(page.getByRole("heading", { level: 1, name: /alerts/i })).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should show mobile menu button on small screens", async ({ page }) => {
    await page.goto("/");

    // Mobile menu button should be visible
    await expect(page.getByRole("button", { name: /menu/i })).toBeVisible();
  });

  test("should open and close mobile navigation drawer", async ({ page }) => {
    await page.goto("/");

    // Open mobile menu
    await page.getByRole("button", { name: /menu/i }).click();

    // Wait for navigation drawer to animate open
    const mobileNav = page.getByRole("navigation", { name: /mobile navigation/i });
    await expect(mobileNav).toBeVisible({ timeout: 5000 });

    // Click a link to close - use locator within mobile nav context
    const strategiesLink = mobileNav.getByRole("link", { name: /strategies/i });
    await expect(strategiesLink).toBeVisible({ timeout: 5000 });
    await strategiesLink.click();

    // Verify navigation
    await expect(page).toHaveURL("/strategies", { timeout: 10000 });
  });
});
