// Next.js requires direct access to process.env.NEXT_PUBLIC_* for static replacement at build time
// Dynamic access like process.env[name] won't work for client-side bundles

export const env = {
  get supabaseUrl(): string {
    const v = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!v) {
      throw new Error(
        "Missing env var: NEXT_PUBLIC_SUPABASE_URL\n\nMake sure it's in your .env file and restart the dev server."
      );
    }
    return v;
  },
  get supabaseAnonKey(): string {
    const v = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!v) {
      throw new Error(
        "Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY\n\nMake sure it's in your .env file and restart the dev server."
      );
    }
    return v;
  },
  get adminHost(): string {
    return process.env.NEXT_PUBLIC_ADMIN_HOST || "localhost";
  },
  // Service role key for admin operations (server-side only, never expose to client)
  // ⚠️ SECURITY: This key has full admin access. Only use in server actions/API routes.
  get supabaseServiceRoleKey(): string {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  },
  // Backend service URL for OTA import feature
  get backendServiceUrl(): string {
    return process.env.BACKEND_SERVICE_URL || "http://localhost:3001";
  },
};
