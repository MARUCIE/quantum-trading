/**
 * Auth Layout
 *
 * Clean, centered layout for authentication pages.
 * Provides consistent branding and styling for login/register flows.
 */

import { type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4">
      {/* Logo / Branding */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
          Q
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Quantum X</h1>
        <p className="text-sm text-muted-foreground">
          AI-Native Quantitative Trading Platform
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
