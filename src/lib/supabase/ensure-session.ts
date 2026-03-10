import { createSupabaseBrowserClient } from "./browser";
import { toast } from "@/hooks/use-toast";

/**
 * Returns a Supabase client with a guaranteed valid session.
 *
 * After a long idle period (e.g., overnight), the access token expires and
 * the Supabase JS client's auto-refresh can deadlock on navigator.locks,
 * causing requests to hang with no network traffic.
 *
 * This function explicitly checks and refreshes the session with a timeout.
 * If the session is gone or refresh hangs, it toasts + redirects to login.
 */
export async function ensureSession(
  timeoutMs = 5000
): Promise<ReturnType<typeof createSupabaseBrowserClient>> {
  const supabase = createSupabaseBrowserClient();

  const refreshPromise = supabase.auth.getSession().then(async ({ data }) => {
    if (!data.session) {
      return null;
    }

    // Proactively refresh if token expires within 60s
    const expiresAt = data.session.expires_at;
    const now = Math.floor(Date.now() / 1000);

    if (expiresAt && expiresAt - now < 60) {
      const { error } = await supabase.auth.refreshSession();
      if (error) return null;
    }

    return supabase;
  });

  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), timeoutMs);
  });

  const result = await Promise.race([refreshPromise, timeoutPromise]);

  if (!result) {
    toast({
      title: "Session expired",
      description: "Please sign in again to save changes.",
      variant: "destructive",
    });
    window.location.href = "/admin/login";
    // Throw so the caller's save flow stops; the page is already navigating away
    throw new Error("Session expired");
  }

  return result;
}
