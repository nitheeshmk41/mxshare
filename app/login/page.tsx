"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-[-10%] h-72 w-72 rounded-full bg-primary/25 blur-3xl opacity-70" />
        <div className="absolute right-[-10%] top-1/3 h-80 w-80 rounded-full bg-[rgba(56,189,248,0.28)] blur-3xl opacity-80" />
        <div className="absolute bottom-[-20%] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[rgba(94,234,212,0.25)] blur-3xl opacity-80" />
        <div className="absolute inset-0 opacity-[0.16] mix-blend-soft-light [background-image:linear-gradient(to_right,rgba(148,163,184,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.35)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="w-full max-w-md mx-4">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-4 animate-pulse-glow">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            MCA Department <span className="text-primary">•</span> MXShare
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-2xl shadow-2xl overflow-hidden"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: "0 20px 80px rgba(0,0,0,0.3)",
          }}
        >
          <div className="p-8">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-6">
                Sign in with your college Google account
              </p>
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Signing in..." : "Continue with College Google"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
