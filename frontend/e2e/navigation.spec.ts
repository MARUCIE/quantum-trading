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

    // Click on Strategies in sidebar
    await page.getByRole("link", { name: /strategies/i }).click();

    // Verify URL changed
    await expect(page).toHaveURL("/strategies");

    // Verify page content
    await expect(page.getByRole("heading", { name: "Strategies" })).toBeVisible();
  });

  test("should navigate to Trading page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /trading/i }).click();

    await expect(page).toHaveURL("/trading");
    await expect(page.getByRole("heading", { name: "Trading" })).toBeVisible();
  });

  test("should navigate to Risk page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /risk/i }).click();

    await expect(page).toHaveURL("/risk");
    await expect(page.getByRole("heading", { name: "Risk Management" })).toBeVisible();
  });

  test("should navigate to Backtest page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /backtest/i }).click();

    await expect(page).toHaveURL("/backtest");
    await expect(page.getByRole("heading", { name: "Backtest" })).toBeVisible();
  });

  test("should navigate to Copy Trading page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /copy/i }).click();

    await expect(page).toHaveURL("/copy");
    await expect(page.getByRole("heading", { name: "Copy Trading" })).toBeVisible();
  });

  test("should navigate to Settings page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /settings/i }).click();

    await expect(page).toHaveURL("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });

  test("should navigate to Alerts page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /alerts/i }).click();

    await expect(page).toHaveURL("/alerts");
    await expect(page.getByRole("heading", { name: "Alerts" })).toBeVisible();
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

    // Navigation drawer should be visible
    await expect(page.getByRole("navigation", { name: /mobile/i })).toBeVisible();

    // Click a link to close
    await page.getByRole("link", { name: /strategies/i }).click();

    // Verify navigation
    await expect(page).toHaveURL("/strategies");
  });
});
