"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

const TIMEOUT_MS = 30_000;

const variantStyles = {
  primary: "rounded-md bg-black px-4 py-2 text-white disabled:opacity-50",
  small: "rounded-md bg-zinc-800 px-3 py-1 text-xs text-white disabled:opacity-50",
  destructive: "rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50",
  ghost: "text-xs text-red-600 hover:underline disabled:opacity-50",
};

function SubmitButtonInner({
  children,
  pendingText,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: keyof typeof variantStyles;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pending) {
      setTimedOut(false);
      timerRef.current = setTimeout(() => {
        setTimedOut(true);
        toast({
          title: "Request timeout",
          description: "This is taking longer than expected. You can try again.",
          variant: "destructive",
        });
      }, TIMEOUT_MS);
    } else {
      setTimedOut(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pending]);

  const isDisabled = pending && !timedOut;
  const showPending = pending && !timedOut && pendingText;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`${variantStyles[variant]} ${className ?? ""}`.trim()}
    >
      {showPending ? (
        <>
          <Loader2 className="inline w-4 h-4 animate-spin mr-1 align-text-bottom" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function SubmitButton(props: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: keyof typeof variantStyles;
  className?: string;
}) {
  return <SubmitButtonInner {...props} />;
}
