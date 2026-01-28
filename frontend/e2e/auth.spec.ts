import { test, expect } from "@playwright/test";

/**
 * Authentication E2E Tests
 *
 * Tests login, register, and password reset flows.
 */

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login form", async ({ page }) => {
    // Check page elements
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("should show password visibility toggle", async ({ page }) => {
    // Use textbox role for password input to avoid matching aria-label
    const passwordInput = page.getByRole("textbox", { name: "Password" });
    // Toggle button uses short aria-label to avoid "Password" conflict
    const toggleButton = page.getByRole("button", { name: "Show" });

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click toggle to show password
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Now button label changes to "Hide"
    const hideButton = page.getByRole("button", { name: "Hide" });
    await hideButton.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("should show error for empty form submission", async ({ page }) => {
    // Click sign in without filling form
    await page.getByRole("button", { name: "Sign in" }).click();

    // Browser validation should prevent submission (required fields)
    const emailInput = page.getByLabel("Email");
    await expect(emailInput).toHaveAttribute("required", "");
  });

  test("should show error for invalid email", async ({ page }) => {
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByRole("textbox", { name: "Password" }).fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Wait for error message (custom validation with noValidate)
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();
  });

  test("should have forgot password link", async ({ page }) => {
    const forgotLink = page.getByRole("link", { name: "Forgot password?" });
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute("href", "/forgot-password");
  });

  test("should have register link", async ({ page }) => {
    const registerLink = page.getByRole("link", { name: "Create one" });
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL("/register");
  });

  test("should have social login buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /github/i })).toBeVisible();
  });

  test("should have remember me checkbox", async ({ page }) => {
    const checkbox = page.getByLabel("Remember me for 30 days");
    await expect(checkbox).toBeVisible();

    // Toggle checkbox
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });
});

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("should display registration form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();
    await expect(page.getByLabel("Full Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });

  test("should show password strength indicator", async ({ page }) => {
    const passwordInput = page.getByLabel("Password", { exact: true });

    // Type a weak password
    await passwordInput.fill("abc");

    // Strength indicator should appear
    await expect(page.getByText("At least 8 characters")).toBeVisible();
    await expect(page.getByText("Contains uppercase letter")).toBeVisible();
  });

  test("should validate password requirements", async ({ page }) => {
    const passwordInput = page.getByLabel("Password", { exact: true });

    // Type a strong password
    await passwordInput.fill("StrongP@ss1");

    // All requirements should be checked
    const requirements = [
      "At least 8 characters",
      "Contains uppercase letter",
      "Contains lowercase letter",
      "Contains a number",
      "Contains special character",
    ];

    for (const req of requirements) {
      await expect(page.getByText(req)).toBeVisible();
    }
  });

  test("should show password mismatch error", async ({ page }) => {
    await page.getByLabel("Password", { exact: true }).fill("StrongP@ss1");
    await page.getByLabel("Confirm Password").fill("DifferentP@ss1");

    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("should require terms acceptance", async ({ page }) => {
    // Fill all fields
    await page.getByLabel("Full Name").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password", { exact: true }).fill("StrongP@ss1");
    await page.getByLabel("Confirm Password").fill("StrongP@ss1");

    // Try to submit without accepting terms
    await page.getByRole("button", { name: "Create account" }).click();

    // Should show error
    await expect(page.getByText("Please accept the terms")).toBeVisible();
  });

  test("should have login link", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: "Sign in" });
    await expect(loginLink).toBeVisible();

    await loginLink.click();
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Forgot Password Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/forgot-password");
  });

  test("should display forgot password form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Forgot your password?" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
  });

  test("should show error for invalid email", async ({ page }) => {
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByRole("button", { name: "Send reset link" }).click();

    // Custom validation message (form has noValidate)
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();
  });

  test("should show success message after submission", async ({ page }) => {
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();

    // Wait for loading to complete
    await expect(page.getByText("Check your email")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("test@example.com")).toBeVisible();
  });

  test("should have back to login link", async ({ page }) => {
    const backLink = page.getByRole("link", { name: "Back to login" });
    await expect(backLink).toBeVisible();

    await backLink.click();
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Auth Navigation", () => {
  test("should navigate from login to register and back", async ({ page }) => {
    await page.goto("/login");

    // Go to register
    await page.getByRole("link", { name: "Create one" }).click();
    await expect(page).toHaveURL("/register");
    await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();

    // Go back to login
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("should navigate to forgot password from login", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL("/forgot-password");
    await expect(page.getByRole("heading", { name: "Forgot your password?" })).toBeVisible();
  });
});

test.describe("Auth Layout", () => {
  test("should display branding on auth pages", async ({ page }) => {
    await page.goto("/login");

    // Check logo/branding (use heading role to be specific)
    await expect(page.getByRole("heading", { name: "Quantum X" })).toBeVisible();
    await expect(page.getByText("AI-Native Quantitative Trading Platform")).toBeVisible();
  });

  test("should display footer links", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("link", { name: "Terms of Service" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
  });
});
