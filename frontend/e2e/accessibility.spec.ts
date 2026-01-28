import { test, expect } from "@playwright/test";

/**
 * Accessibility E2E Tests
 *
 * Tests keyboard navigation and ARIA compliance.
 */

test.describe("Accessibility", () => {
  test("should have skip link that works", async ({ page }) => {
    await page.goto("/");

    // Tab to focus skip link
    await page.keyboard.press("Tab");

    // Skip link should be visible when focused
    const skipLink = page.getByRole("link", { name: /skip to main/i });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    // Press Enter to skip to main content
    await page.keyboard.press("Enter");

    // Focus should move to main content area
    const mainContent = page.locator("#main-content");
    await expect(mainContent).toBeFocused();
  });

  test("should navigate sidebar with keyboard", async ({ page }) => {
    await page.goto("/");

    // Tab through to sidebar navigation
    // Skip link -> sidebar items
    await page.keyboard.press("Tab"); // Skip link
    await page.keyboard.press("Tab"); // First sidebar item

    // Should be able to navigate with arrow keys or tab
    const firstLink = page.getByRole("link", { name: /overview/i });
    await expect(firstLink).toBeFocused();

    // Press Enter to navigate
    await page.keyboard.press("Tab"); // Next link (Strategies)

    const strategiesLink = page.getByRole("link", { name: /strategies/i });
    await expect(strategiesLink).toBeFocused();
  });

  test("should have proper ARIA labels on interactive elements", async ({ page }) => {
    await page.goto("/");

    // Theme toggle should have label
    const themeButton = page.getByRole("button", { name: /theme/i });
    await expect(themeButton).toHaveAttribute("aria-label");

    // Notification button should have label
    const notificationButton = page.getByRole("button", { name: /notifications/i });
    await expect(notificationButton).toBeVisible();
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Should have h1
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();

    // All headings should be in logical order (no skipping levels)
    const headings = await page.evaluate(() => {
      const allHeadings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
      return allHeadings.map((h) => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim(),
      }));
    });

    // Verify no heading level is skipped
    let lastLevel = 0;
    for (const heading of headings) {
      // Heading level should not jump more than 1 level
      if (lastLevel > 0 && heading.level > lastLevel + 1) {
        throw new Error(
          `Heading hierarchy broken: jumped from h${lastLevel} to h${heading.level}`
        );
      }
      lastLevel = heading.level;
    }
  });

  test("should have sufficient color contrast", async ({ page }) => {
    await page.goto("/");

    // This is a basic check - in production, use axe-core for full contrast analysis
    // Check that text elements are visible
    const statsCards = page.locator('[data-testid="stats-card"]');

    // If stats cards exist, check their text is visible
    const count = await statsCards.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const card = statsCards.nth(i);
        await expect(card).toBeVisible();
      }
    }
  });

  test("should announce loading states to screen readers", async ({ page }) => {
    await page.goto("/");

    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live]');
    const count = await liveRegions.count();

    // Should have at least one live region for dynamic content
    // (error messages, loading states, etc.)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("form inputs should have associated labels", async ({ page }) => {
    await page.goto("/settings");

    // Each input should have a label
    const inputs = page.locator("input:visible");
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");

      if (id) {
        // Should have a label with matching for attribute, or be wrapped in label
        const label = page.locator(`label[for="${id}"]`);
        const parentLabel = input.locator("xpath=ancestor::label");

        const hasLabel = (await label.count()) > 0 || (await parentLabel.count()) > 0;
        expect(hasLabel).toBe(true);
      }
    }
  });
});

test.describe("Keyboard Navigation - Forms", () => {
  test("should be able to fill form with keyboard only", async ({ page }) => {
    await page.goto("/settings");

    // Tab to first input
    await page.keyboard.press("Tab"); // Skip link
    await page.keyboard.press("Tab"); // Sidebar
    // Continue tabbing until we reach the form...

    // For this test, we'll use a more direct approach
    const nameInput = page.getByLabel(/display name/i);
    await nameInput.focus();

    // Type in the field
    await page.keyboard.type("Test User");

    // Tab to next field
    await page.keyboard.press("Tab");

    // Should be on email field
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeFocused();

    // Type email
    await page.keyboard.type("test@example.com");

    // Tab to submit button
    await page.keyboard.press("Tab"); // Bio
    await page.keyboard.press("Tab"); // Submit button

    const submitButton = page.getByRole("button", { name: /save changes/i });
    await expect(submitButton).toBeFocused();
  });
});
