import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Auth Store
 *
 * Handles user authentication state with persistence.
 * Manages login, logout, and session management.
 */

export type UserRole = "user" | "trader" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

interface AuthState {
  // User state
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  loginWithProvider: (provider: "google" | "github") => Promise<boolean>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;

  // State setters
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Mock user for development
const mockUser: User = {
  id: "user-1",
  email: "trader@quantumx.com",
  name: "Alex Trader",
  avatar: undefined,
  role: "trader",
  emailVerified: true,
  twoFactorEnabled: false,
  createdAt: new Date("2025-01-01"),
  lastLoginAt: new Date(),
};

const mockSession: Session = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  expiresAt: new Date(Date.now() + 3600000 * 24), // 24 hours
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Validate credentials (mock)
          if (!email.includes("@")) {
            throw new Error("Invalid email format");
          }

          if (password.length < 6) {
            throw new Error("Password must be at least 6 characters");
          }

          // Mock successful login
          const user = { ...mockUser, email, lastLoginAt: new Date() };
          const session = {
            ...mockSession,
            expiresAt: new Date(Date.now() + 3600000 * 24),
          };

          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
          });
          return false;
        }
      },

      loginWithProvider: async (provider) => {
        set({ isLoading: true, error: null });

        try {
          // Simulate OAuth flow
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Mock successful OAuth login
          const user = {
            ...mockUser,
            email: `user@${provider}.com`,
            name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
            lastLoginAt: new Date(),
          };

          set({
            user,
            session: mockSession,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : `${provider} login failed`,
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          // Simulate API call to invalidate session
          await new Promise((resolve) => setTimeout(resolve, 500));

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Validate
          if (!email.includes("@")) {
            throw new Error("Invalid email format");
          }

          if (password.length < 8) {
            throw new Error("Password must be at least 8 characters");
          }

          // Mock successful registration (don't auto-login)
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Registration failed",
          });
          return false;
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));

          if (!email.includes("@")) {
            throw new Error("Invalid email format");
          }

          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to send reset email",
          });
          return false;
        }
      },

      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));

          if (password.length < 8) {
            throw new Error("Password must be at least 8 characters");
          }

          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Password reset failed",
          });
          return false;
        }
      },

      updateProfile: async (updates) => {
        set({ isLoading: true, error: null });

        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const currentUser = get().user;
          if (!currentUser) {
            throw new Error("Not authenticated");
          }

          set({
            user: { ...currentUser, ...updates },
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Profile update failed",
          });
          return false;
        }
      },

      refreshSession: async () => {
        const session = get().session;
        if (!session) return false;

        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Mock token refresh
          set({
            session: {
              ...session,
              accessToken: `refreshed-${Date.now()}`,
              expiresAt: new Date(Date.now() + 3600000 * 24),
            },
          });

          return true;
        } catch {
          // If refresh fails, log out
          set({
            user: null,
            session: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      setUser: (user) =>
        set({ user, isAuthenticated: user !== null }),

      setSession: (session) => set({ session }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "quantum-x-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectAuthError = (state: AuthState) => state.error;

// Helper hooks
export const useUser = () => useAuthStore(selectUser);
export const useIsAuthenticated = () => useAuthStore(selectIsAuthenticated);
