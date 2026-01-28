"use client";

import { useState, useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface PhoneLinkFormProps {
  currentPhone?: string | null;
}

export function PhoneLinkForm({ currentPhone }: PhoneLinkFormProps) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  // If user already has phone linked, don't show the form
  if (currentPhone) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm text-green-800">
          Phone linked: <span className="font-mono">{currentPhone}</span>
        </p>
      </div>
    );
  }

  // Format phone number
  const formatPhoneDisplay = (value: string) => {
    return value.replace(/[^\d+]/g, "");
  };

  const formatPhoneForApi = (phoneNumber: string) => {
    let formatted = phoneNumber.replace(/[^\d+]/g, "");
    if (!formatted.startsWith("+")) {
      if (formatted.startsWith("0")) {
        formatted = formatted.substring(1);
      }
      formatted = "+91" + formatted;
    }
    return formatted;
  };

  // Send OTP to link phone
  async function onSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formattedPhone = formatPhoneForApi(phone);

      // Update user with new phone - this sends OTP
      const { error } = await supabase.auth.updateUser({
        phone: formattedPhone,
      });

      if (error) throw error;
      setOtpSent(true);
    } catch (e: any) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to send OTP";
      setError(errorMessage);
      console.error("Phone link OTP error:", e);
    } finally {
      setSubmitting(false);
    }
  }

  // Verify OTP to complete phone linking
  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formattedPhone = formatPhoneForApi(phone);

      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "phone_change",
      });

      if (error) throw error;
      setSuccess(true);
    } catch (e: any) {
      const errorMessage =
        e instanceof Error ? e.message : "OTP verification failed";
      setError(errorMessage);
      console.error("Phone verify error:", e);
    } finally {
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
      const { error } = await supabase.auth.updateUser({
        phone: formattedPhone,
      });
      if (error) throw error;
    } catch (e: any) {
      setError(e instanceof Error ? e.message : "Failed to resend OTP");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm text-green-800">
          Phone number linked successfully! You can now login with OTP.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-medium">Link Phone Number</h3>
      <p className="mt-1 text-sm text-zinc-600">
        Add your phone number to enable OTP login.
      </p>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {!otpSent ? (
        <form onSubmit={onSendOtp} className="mt-4 space-y-3">
          <label className="block">
            <div className="text-sm font-medium">Phone Number</div>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={phone}
              onChange={(e) => setPhone(formatPhoneDisplay(e.target.value))}
              type="tel"
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
            className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {submitting ? "Sending OTP…" : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={onVerifyOtp} className="mt-4 space-y-3">
          <div>
            <div className="text-sm font-medium">Enter OTP</div>
            <p className="mt-1 text-sm text-zinc-600">
              We sent a 6-digit code to {formatPhoneForApi(phone)}
            </p>
          </div>

          <div className="py-2">
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

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || otp.length !== 6}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {submitting ? "Verifying…" : "Verify & Link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError(null);
              }}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Change Number
            </button>
          </div>

          <button
            type="button"
            onClick={onResendOtp}
            disabled={submitting}
            className="text-sm text-zinc-600 hover:underline disabled:opacity-50"
          >
            Resend OTP
          </button>
        </form>
      )}
    </div>
  );
}
