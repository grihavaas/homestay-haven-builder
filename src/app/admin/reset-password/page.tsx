"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInvitation, setIsInvitation] = useState(false);

  // Handle Supabase redirect with tokens in URL hash
  useEffect(() => {
    async function handleResetToken() {
      try {
        // Check if there are tokens in the URL hash (Supabase redirect)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken && (type === 'recovery' || type === 'invite')) {
          // Exchange the tokens for a session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setError("Invalid or expired reset link. Please request a new password reset.");
            setLoading(false);
            return;
          }

          if (data.user) {
            setUserEmail(data.user.email || null);
            setIsInvitation(type === 'invite');
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else {
          // Check if we already have a valid session (might be from a previous visit)
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setUserEmail(user.email || null);
            // Check if this is an invitation by checking user metadata or session
            const isInvite = user.app_metadata?.invite_token || false;
            setIsInvitation(isInvite);
          } else {
            setError("Invalid or expired reset link. Please request a new password reset.");
          }
        }
      } catch (err) {
        console.error("Error handling reset token:", err);
        setError("Failed to process reset link. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    handleResetToken();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // Verify we still have a valid session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Session expired. Please request a new password reset link.");
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;
      
      // For invitations, don't sign out - user can continue
      // For password resets, sign out to force re-login
      if (!isInvitation) {
        await supabase.auth.signOut();
        router.push("/admin/login?message=password_reset");
      } else {
        // For invitations, redirect to admin page after setting password
        router.push("/admin?message=password_set");
        router.refresh();
      }
    } catch (e) {
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

  if (loading) {
    return (
      <div className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-semibold">Reset Password</h1>
        <p className="mt-2 text-sm text-zinc-600">Verifying reset link...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="text-2xl font-semibold">
        {isInvitation ? "Set Your Password" : "Reset Password"}
      </h1>

      {userEmail && (
        <p className="mt-2 text-sm text-zinc-600">
          {isInvitation ? "Setting password for: " : "Resetting password for: "}
          <span className="font-mono">{userEmail}</span>
        </p>
      )}

      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <div className="text-sm font-medium">New Password</div>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={6}
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Confirm Password</div>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            required
            minLength={6}
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Resetting…" : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-semibold">Reset Password</h1>
        <p className="mt-2 text-sm text-zinc-600">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
