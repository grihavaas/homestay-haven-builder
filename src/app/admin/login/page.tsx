"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAuth } from "@/contexts/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const { refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      if (!data.user) {
        throw new Error("Login succeeded but no user data returned");
      }
      
      // Login succeeded - navigate immediately
      // The auth context will handle refresh automatically via onAuthStateChange
      router.push("/admin");
      router.refresh();
      
      // Reset submitting after a short delay to allow navigation
      setTimeout(() => {
        setSubmitting(false);
      }, 500);
      
    } catch (e: any) {
      // Ignore abort errors - they're usually from navigation
      if (e?.name === 'AbortError' || e?.message?.includes('aborted')) {
        // If it's an abort error, navigation might have succeeded
        // Try to navigate anyway
        router.push("/admin");
        setSubmitting(false);
        return;
      }
      
      const errorMessage = e instanceof Error 
        ? e.message 
        : typeof e === 'object' && e !== null && 'message' in e
        ? String(e.message)
        : "Login failed";
      setError(errorMessage);
      console.error("Login error:", e);
      setSubmitting(false);
    }
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (e: any) {
      const errorMessage = e instanceof Error 
        ? e.message 
        : typeof e === 'object' && e !== null && 'message' in e
        ? String(e.message)
        : "Password reset failed";
      setError(errorMessage);
      console.error("Reset error:", e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold">Admin login</h1>

      {errorParam === "no_membership" ? (
        <p className="mt-2 text-sm text-red-700">
          Your account does not have a tenant membership yet. Ask the agency
          admin to provision you.
        </p>
      ) : null}

      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <div className="text-sm font-medium">Email</div>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Password</div>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {!showReset ? (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowReset(true)}
            className="text-sm text-zinc-600 hover:underline"
          >
            Forgot password?
          </button>
        </div>
      ) : (
        <form onSubmit={onResetPassword} className="mt-4 space-y-4 rounded-lg border p-4">
          <h3 className="font-medium">Reset Password</h3>
          {resetSent ? (
            <p className="text-sm text-green-700">
              Password reset email sent! Check your inbox.
            </p>
          ) : (
            <>
              <label className="block">
                <div className="text-sm font-medium">Email</div>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-md bg-black px-3 py-2 text-white disabled:opacity-50"
                >
                  Send Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReset(false);
                    setResetSent(false);
                  }}
                  className="rounded-md border px-3 py-2"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md p-8">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
