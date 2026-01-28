"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAuth } from "@/contexts/AuthContext";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type AuthMethod = "email" | "phone";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const { refresh } = useAuth();

  // Auth method toggle
  const [authMethod, setAuthMethod] = useState<AuthMethod>("phone");

  // Email/password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone/OTP state
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // Common state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // Format phone number for display
  const formatPhoneDisplay = (value: string) => {
    // Remove all non-digits except leading +
    const cleaned = value.replace(/[^\d+]/g, "");
    return cleaned;
  };

  // Ensure phone has country code
  const formatPhoneForApi = (phoneNumber: string) => {
    let formatted = phoneNumber.replace(/[^\d+]/g, "");
    // If doesn't start with +, assume India (+91)
    if (!formatted.startsWith("+")) {
      // Remove leading 0 if present
      if (formatted.startsWith("0")) {
        formatted = formatted.substring(1);
      }
      formatted = "+91" + formatted;
    }
    return formatted;
  };

  async function handleLoginSuccess() {
    // Wait for session to be established in cookies
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verify session is available before navigating
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      throw new Error("Session not established after login");
    }

    // Force a router refresh to ensure server components get the new session
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 100));
    router.push("/admin");

    // Reset submitting after a short delay to allow navigation
    setTimeout(() => {
      setSubmitting(false);
    }, 500);
  }

  // Email/password login
  async function onEmailSubmit(e: React.FormEvent) {
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

      await handleLoginSuccess();
    } catch (e: any) {
      // Ignore abort errors - they're usually from navigation
      if (e?.name === "AbortError" || e?.message?.includes("aborted")) {
        router.push("/admin");
        setSubmitting(false);
        return;
      }

      const errorMessage =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
            ? String(e.message)
            : "Login failed";
      setError(errorMessage);
      console.error("Login error:", e);
      setSubmitting(false);
    }
  }

  // Send OTP to phone
  async function onSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formattedPhone = formatPhoneForApi(phone);
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;
      setOtpSent(true);
    } catch (e: any) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
            ? String(e.message)
            : "Failed to send OTP";
      setError(errorMessage);
      console.error("OTP send error:", e);
    } finally {
      setSubmitting(false);
    }
  }

  // Verify OTP
  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formattedPhone = formatPhoneForApi(phone);
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });
      if (error) throw error;

      if (!data.user) {
        throw new Error("OTP verification succeeded but no user data returned");
      }

      await handleLoginSuccess();
    } catch (e: any) {
      if (e?.name === "AbortError" || e?.message?.includes("aborted")) {
        router.push("/admin");
        setSubmitting(false);
        return;
      }

      const errorMessage =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
            ? String(e.message)
            : "OTP verification failed";
      setError(errorMessage);
      console.error("OTP verify error:", e);
      setSubmitting(false);
    }
  }

  // Resend OTP
  async function onResendOtp() {
    setSubmitting(true);
    setError(null);
    setOtp("");
    try {
      const formattedPhone = formatPhoneForApi(phone);
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;
    } catch (e: any) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
            ? String(e.message)
            : "Failed to resend OTP";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  // Password reset
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
      const errorMessage =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
            ? String(e.message)
            : "Password reset failed";
      setError(errorMessage);
      console.error("Reset error:", e);
    } finally {
      setSubmitting(false);
    }
  }

  // Reset phone form state when switching methods
  const handleMethodChange = (method: AuthMethod) => {
    setAuthMethod(method);
    setError(null);
    setOtpSent(false);
    setOtp("");
    setShowReset(false);
    setResetSent(false);
  };

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

      {/* Auth Method Toggle */}
      <div className="mt-6 flex rounded-lg border p-1">
        <button
          type="button"
          onClick={() => handleMethodChange("phone")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            authMethod === "phone"
              ? "bg-black text-white"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          Phone
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange("email")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            authMethod === "email"
              ? "bg-black text-white"
              : "text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          Email
        </button>
      </div>

      {/* Phone/OTP Form */}
      {authMethod === "phone" && (
        <>
          {!otpSent ? (
            <form onSubmit={onSendOtp} className="mt-6 space-y-4">
              <label className="block">
                <div className="text-sm font-medium">Phone Number</div>
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneDisplay(e.target.value))}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  required
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Include country code (e.g., +91 for India)
                </p>
              </label>

              <button
                type="submit"
                disabled={submitting || !phone.trim()}
                className="w-full rounded-md bg-black px-3 py-2 text-white disabled:opacity-50"
              >
                {submitting ? "Sending OTP…" : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={onVerifyOtp} className="mt-6 space-y-4">
              <div>
                <div className="text-sm font-medium">Enter OTP</div>
                <p className="mt-1 text-sm text-zinc-600">
                  We sent a 6-digit code to {formatPhoneForApi(phone)}
                </p>
              </div>

              <div className="flex justify-center py-2">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <button
                type="submit"
                disabled={submitting || otp.length !== 6}
                className="w-full rounded-md bg-black px-3 py-2 text-white disabled:opacity-50"
              >
                {submitting ? "Verifying…" : "Verify & Sign In"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setError(null);
                  }}
                  className="text-zinc-600 hover:underline"
                >
                  Change number
                </button>
                <button
                  type="button"
                  onClick={onResendOtp}
                  disabled={submitting}
                  className="text-zinc-600 hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Email/Password Form */}
      {authMethod === "email" && (
        <>
          <form onSubmit={onEmailSubmit} className="mt-6 space-y-4">
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
            <form
              onSubmit={onResetPassword}
              className="mt-4 space-y-4 rounded-lg border p-4"
            >
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
        </>
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
