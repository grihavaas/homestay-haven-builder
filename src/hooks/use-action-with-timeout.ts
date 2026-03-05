import { useCallback, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

const DEFAULT_TIMEOUT_MS = 30_000;

export function useActionWithTimeout(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const execute = useCallback(
    async (fn: () => Promise<void>) => {
      setIsSubmitting(true);

      timerRef.current = setTimeout(() => {
        setIsSubmitting(false);
        toast({
          title: "Request timeout",
          description: "This is taking longer than expected. You can try again.",
          variant: "destructive",
        });
      }, timeoutMs);

      try {
        await fn();
      } finally {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setIsSubmitting(false);
      }
    },
    [timeoutMs],
  );

  return { isSubmitting, execute };
}
