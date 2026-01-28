import { describe, it, expect, beforeEach, vi } from "vitest";
import { act } from "@testing-library/react";
import {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
} from "./auth-store";

/**
 * Auth Store Tests
 *
 * Tests for authentication state management.
 * Covers login, logout, registration, and session management.
 *
 * NOTE: localStorage is mocked globally in src/test/setup.ts
 */

describe("useAuthStore", () => {
  beforeEach(() => {
    // Clear localStorage (mocked in setup.ts)
    localStorage.clear();

    // Reset store state - use merge mode (no second arg) to preserve action methods
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    vi.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should have null user initially", () => {
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("should have null session initially", () => {
      expect(useAuthStore.getState().session).toBeNull();
    });

    it("should not be authenticated initially", () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("should not be loading initially", () => {
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("should have no error initially", () => {
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe("Login", () => {
    it("should set loading state during login", async () => {
      vi.useFakeTimers();

      const loginPromise = useAuthStore
        .getState()
        .login("test@example.com", "password123");

      expect(useAuthStore.getState().isLoading).toBe(true);

      await act(async () => {
        vi.advanceTimersByTime(2000);
        await loginPromise;
      });

      expect(useAuthStore.getState().isLoading).toBe(false);

      vi.useRealTimers();
    });

    it("should authenticate with valid credentials", async () => {
      vi.useFakeTimers();

      const loginPromise = useAuthStore
        .getState()
        .login("test@example.com", "password123");

      await act(async () => {
        vi.advanceTimersByTime(2000);
        await loginPromise;
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user).not.toBeNull();
      expect(useAuthStore.getState().user?.email).toBe("test@example.com");
      expect(useAuthStore.getState().session).not.toBeNull();

      vi.useRealTimers();
    });

    it("should fail with invalid email format", async () => {
      vi.useFakeTimers();

      const loginPromise = useAuthStore
        .getState()
        .login("invalid-email", "password123");

      await act(async () => {
        vi.advanceTimersByTime(2000);
        await loginPromise;
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toBe("Invalid email format");

      vi.useRealTimers();
    });

    it("should fail with short password", async () => {
      vi.useFakeTimers();

      const loginPromise = useAuthStore.getState().login("test@example.com", "12345");

      await act(async () => {
        vi.advanceTimersByTime(2000);
        await loginPromise;
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toBe(
        "Password must be at least 6 characters"
      );

      vi.useRealTimers();
    });

    it("should return true on successful login", async () => {
      vi.useFakeTimers();

      let result: boolean = false;
      const loginPromise = useAuthStore
        .getState()
        .login("test@example.com", "password123");

      await act(async () => {
        vi.advanceTimersByTime(2000);
        result = await loginPromise;
      });

      expect(result).toBe(true);

      vi.useRealTimers();
    });

    it("should return false on failed login", async () => {
      vi.useFakeTimers();

      let result: boolean = true;
      const loginPromise = useAuthStore.getState().login("invalid", "pass");

      await act(async () => {
        vi.advanceTimersByTime(2000);
        result = await loginPromise;
      });

      expect(result).toBe(false);

      vi.useRealTimers();
    });
  });

  describe("OAuth Login", () => {
    it("should login with Google provider", async () => {
      vi.useFakeTimers();

      const loginPromise = useAuthStore.getState().loginWithProvider("google");

      await act(async () => {
        vi.advanceTimersByTime(2500);
        await loginPromise;
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.email).toBe("user@google.com");
      expect(useAuthStore.getState().user?.name).toBe("Google User");

      vi.useRealTimers();
    });

    it("should login with GitHub provider", async () => {
      vi.useFakeTimers();

      const loginPromise = useAuthStore.getState().loginWithProvider("github");

      await act(async () => {
        vi.advanceTimersByTime(2500);
        await loginPromise;
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.email).toBe("user@github.com");

      vi.useRealTimers();
    });
  });

  describe("Logout", () => {
    it("should clear user and session on logout", async () => {
      vi.useFakeTimers();

      // First login
      const loginPromise = useAuthStore
        .getState()
        .login("test@example.com", "password123");
      await act(async () => {
        vi.advanceTimersByTime(2000);
        await loginPromise;
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Then logout
      const logoutPromise = useAuthStore.getState().logout();
      await act(async () => {
        vi.advanceTimersByTime(600);
        await logoutPromise;
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().session).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      vi.useRealTimers();
    });
  });

  describe("Registration", () => {
    it("should succeed with valid data", async () => {
      vi.useFakeTimers();

      const registerPromise = useAuthStore
        .getState()
        .register("Test User", "test@example.com", "StrongPass123");

      await act(async () => {
        vi.advanceTimersByTime(2000);
        await registerPromise;
      });

      // Registration doesn't auto-login
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().error).toBeNull();

      vi.useRealTimers();
    });

    it("should fail with invalid email", async () => {
      vi.useFakeTimers();

      const registerPromise = useAuthStore
        .getState()
        .register("Test User", "invalid-email", "StrongPass123");

      await act(async () => {
        vi.advanceTimersByTime(2000);
        await registerPromise;
      });

      expect(useAuthStore.getState().error).toBe("Invalid email format");

      vi.useRealTimers();
    });

    it("should fail with short password", async () => {
      vi.useFakeTimers();

      const registerPromise = useAuthStore
        .getState()
        .register("Test User", "test@example.com", "short");

      await act(async () => {
        vi.advanceTimersByTime(2000);
        await registerPromise;
      });

      expect(useAuthStore.getState().error).toBe(
        "Password must be at least 8 characters"
      );

      vi.useRealTimers();
    });
  });

  describe("Forgot Password", () => {
    it("should succeed with valid email", async () => {
      vi.useFakeTimers();

      let result: boolean = false;
      const forgotPromise = useAuthStore
        .getState()
        .forgotPassword("test@example.com");

      await act(async () => {
        vi.advanceTimersByTime(2000);
        result = await forgotPromise;
      });

      expect(result).toBe(true);
      expect(useAuthStore.getState().error).toBeNull();

      vi.useRealTimers();
    });

    it("should fail with invalid email", async () => {
      vi.useFakeTimers();

      let result: boolean = true;
      const forgotPromise = useAuthStore.getState().forgotPassword("invalid");

      await act(async () => {
        vi.advanceTimersByTime(2000);
        result = await forgotPromise;
      });

      expect(result).toBe(false);
      expect(useAuthStore.getState().error).toBe("Invalid email format");

      vi.useRealTimers();
    });
  });

  describe("Reset Password", () => {
    it("should succeed with valid password", async () => {
      vi.useFakeTimers();

      let result: boolean = false;
      const resetPromise = useAuthStore
        .getState()
        .resetPassword("token123", "NewPass123!");

      await act(async () => {
        vi.advanceTimersByTime(2000);
        result = await resetPromise;
      });

      expect(result).toBe(true);

      vi.useRealTimers();
    });

    it("should fail with short password", async () => {
      vi.useFakeTimers();

      let result: boolean = true;
      const resetPromise = useAuthStore.getState().resetPassword("token123", "short");

      await act(async () => {
        vi.advanceTimersByTime(2000);
        result = await resetPromise;
      });

      expect(result).toBe(false);
      expect(useAuthStore.getState().error).toBe(
        "Password must be at least 8 characters"
      );

      vi.useRealTimers();
    });
  });

  describe("Update Profile", () => {
    it("should update user profile when authenticated", async () => {
      vi.useFakeTimers();

      // First login
      const loginPromise = useAuthStore
        .getState()
        .login("test@example.com", "password123");
      await act(async () => {
        vi.advanceTimersByTime(2000);
        await loginPromise;
      });

      // Update profile
      const updatePromise = useAuthStore.getState().updateProfile({
        name: "Updated Name",
      });

      await act(async () => {
        vi.advanceTimersByTime(1500);
        await updatePromise;
      });

      expect(useAuthStore.getState().user?.name).toBe("Updated Name");

      vi.useRealTimers();
    });

    it("should fail when not authenticated", async () => {
      vi.useFakeTimers();

      const updatePromise = useAuthStore.getState().updateProfile({
        name: "New Name",
      });

      await act(async () => {
        vi.advanceTimersByTime(1500);
        await updatePromise;
      });

      expect(useAuthStore.getState().error).toBe("Not authenticated");

      vi.useRealTimers();
    });
  });

  describe("Session Refresh", () => {
    it("should refresh session when authenticated", async () => {
      vi.useFakeTimers();

      // First login
      const loginPromise = useAuthStore
        .getState()
        .login("test@example.com", "password123");
      await act(async () => {
        vi.advanceTimersByTime(2000);
        await loginPromise;
      });

      const oldToken = useAuthStore.getState().session?.accessToken;

      // Refresh session
      const refreshPromise = useAuthStore.getState().refreshSession();
      await act(async () => {
        vi.advanceTimersByTime(600);
        await refreshPromise;
      });

      const newToken = useAuthStore.getState().session?.accessToken;
      expect(newToken).not.toBe(oldToken);
      expect(newToken).toContain("refreshed-");

      vi.useRealTimers();
    });

    it("should return false when no session", async () => {
      const result = await useAuthStore.getState().refreshSession();
      expect(result).toBe(false);
    });
  });

  describe("State Setters", () => {
    it("setUser should update user and authentication", () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "user" as const,
        emailVerified: true,
        twoFactorEnabled: false,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("setUser with null should clear authentication", () => {
      act(() => {
        useAuthStore.getState().setUser(null);
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("setSession should update session", () => {
      const mockSession = {
        accessToken: "token123",
        refreshToken: "refresh123",
        expiresAt: new Date(),
      };

      act(() => {
        useAuthStore.getState().setSession(mockSession);
      });

      expect(useAuthStore.getState().session).toEqual(mockSession);
    });

    it("setLoading should update loading state", () => {
      act(() => {
        useAuthStore.getState().setLoading(true);
      });
      expect(useAuthStore.getState().isLoading).toBe(true);

      act(() => {
        useAuthStore.getState().setLoading(false);
      });
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("setError should update error", () => {
      act(() => {
        useAuthStore.getState().setError("Test error");
      });
      expect(useAuthStore.getState().error).toBe("Test error");
    });

    it("clearError should clear error", () => {
      act(() => {
        useAuthStore.getState().setError("Test error");
        useAuthStore.getState().clearError();
      });
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe("Selectors", () => {
    it("selectUser returns user", () => {
      expect(selectUser(useAuthStore.getState())).toBeNull();
    });

    it("selectIsAuthenticated returns authentication status", () => {
      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(false);
    });

    it("selectIsLoading returns loading status", () => {
      expect(selectIsLoading(useAuthStore.getState())).toBe(false);
    });

    it("selectAuthError returns error", () => {
      expect(selectAuthError(useAuthStore.getState())).toBeNull();
    });
  });
});
