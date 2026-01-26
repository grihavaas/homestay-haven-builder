# Environment Variables Configuration

This document describes all environment variables needed for the Homestay Haven Builder application.

## Required Variables

### Supabase Configuration

These are **required** for the application to work:

```bash
# Supabase Project URL
# Get this from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase Anonymous/Public Key (also called "anon key" or "publishable key")
# Get this from the same API settings page
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Optional Variables

### Admin Host Configuration

```bash
# The hostname that should be treated as the admin interface
# Defaults to "localhost" for local development
# In production, set this to your admin domain
NEXT_PUBLIC_ADMIN_HOST=localhost
```

**When to set:**
- **Local development**: Leave as `localhost` or omit (defaults to `localhost`)
- **Production**: Set to your admin subdomain (e.g., `admin.yourdomain.com`)

This is used to determine if the current request is accessing the admin interface vs. the public site.

### Service Role Key (Advanced - Optional)

```bash
# ⚠️ SECURITY WARNING: This key has full admin access!
# Only use in server-side code (Server Actions/API routes), NEVER expose to client
# Note: This does NOT use NEXT_PUBLIC_ prefix because it's server-only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important Notes:**
- This key bypasses Row Level Security (RLS) and has full database access
- **NEVER** expose this in client-side code
- Only needed if you're building backend API endpoints that require admin operations
- For now, this is optional since admin features work client-side

**Where to find:**
- Supabase Dashboard → **Settings** → **API** → **service_role key** (keep this secret!)

### Backend Service URL (Optional)

```bash
# Backend service URL for OTA import feature
# Only needed if you're using the OTA import feature
# Note: This does NOT use NEXT_PUBLIC_ prefix because it's server-only
BACKEND_SERVICE_URL=http://localhost:3001
```

**When to set:**
- Only if you're using the OTA (Online Travel Agency) import feature
- Local development: `http://localhost:3001`
- Production: Your backend service URL (e.g., `https://your-backend.railway.app`)

## Example .env File

Create a `.env` file in the root of `homestay-haven-builder/`:

```bash
# Required (client-side accessible)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional (client-side accessible)
NEXT_PUBLIC_ADMIN_HOST=localhost

# Optional (server-side only - no NEXT_PUBLIC_ prefix)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# BACKEND_SERVICE_URL=http://localhost:3001
```

## Current Configuration Status

Based on your existing `.env` file, you should have:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Required
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Required
- ⚠️ `NEXT_PUBLIC_ADMIN_HOST` - Optional (defaults to "localhost")
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` - Optional (server-side only, for admin operations)
- ⚠️ `BACKEND_SERVICE_URL` - Optional (only for OTA import feature)

## Notes

1. **Next.js Environment Variables**: 
   - Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser (client-side)
   - Variables without `NEXT_PUBLIC_` are server-side only and never exposed to the client
   - This is a security feature - sensitive keys should NOT use `NEXT_PUBLIC_` prefix
2. **Security**: Never commit `.env` files to git (they should be in `.gitignore`)
3. **Restart Required**: After changing `.env` file, restart your dev server (`npm run dev`)
4. **Production**: Set these in your hosting platform's environment variables (Vercel, Netlify, etc.)

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/settings/api
2. Copy the values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` (client-side accessible)
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-side accessible)
   - (Optional) **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-side only, keep secret!)
