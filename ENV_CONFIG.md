# Environment Variables Configuration

This document describes all environment variables needed for the Homestay Haven Builder application.

## Required Variables

### Supabase Configuration

These are **required** for the application to work:

```bash
# Supabase Project URL
# Get this from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
VITE_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous/Public Key (also called "anon key" or "publishable key")
# Get this from the same API settings page
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** → `VITE_SUPABASE_URL`
4. Copy the **anon/public key** → `VITE_SUPABASE_ANON_KEY`

## Optional Variables

### Admin Host Configuration

```bash
# The hostname that should be treated as the admin interface
# Defaults to "localhost" for local development
# In production, set this to your admin domain
VITE_ADMIN_HOST=localhost
```

**When to set:**
- **Local development**: Leave as `localhost` or omit (defaults to `localhost`)
- **Production**: Set to your admin subdomain (e.g., `admin.yourdomain.com`)

This is used to determine if the current request is accessing the admin interface vs. the public site.

### Service Role Key (Advanced - Optional)

```bash
# ⚠️ SECURITY WARNING: This key has full admin access!
# Only use in server-side code (backend API routes), NEVER expose to client
# Currently optional since we're using client-side only
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
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
VITE_BACKEND_SERVICE_URL=http://localhost:3001
```

**When to set:**
- Only if you're using the OTA (Online Travel Agency) import feature
- Local development: `http://localhost:3001`
- Production: Your backend service URL (e.g., `https://your-backend.railway.app`)

## Example .env File

Create a `.env` file in the root of `homestay-haven-builder/`:

```bash
# Required
VITE_SUPABASE_URL=https://jrlrosxqrftbyeumhusb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional
VITE_ADMIN_HOST=localhost
# VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# VITE_BACKEND_SERVICE_URL=http://localhost:3001
```

## Current Configuration Status

Based on your existing `.env` file, you have:
- ✅ `VITE_SUPABASE_URL` - Configured
- ✅ `VITE_SUPABASE_ANON_KEY` - Configured
- ⚠️ `VITE_ADMIN_HOST` - Not set (will default to "localhost")
- ⚠️ `VITE_SUPABASE_SERVICE_ROLE_KEY` - Not set (optional, only for backend APIs)
- ⚠️ `VITE_BACKEND_SERVICE_URL` - Not set (optional, only for OTA import)

## Notes

1. **Vite Environment Variables**: All variables must be prefixed with `VITE_` to be accessible in the browser
2. **Security**: Never commit `.env` files to git (they should be in `.gitignore`)
3. **Restart Required**: After changing `.env` file, restart your dev server (`npm run dev`)
4. **Production**: Set these in your hosting platform's environment variables (Vercel, Netlify, etc.)

## Getting Your Supabase Credentials

1. Go to: https://supabase.com/dashboard/project/jrlrosxqrftbyeumhusb/settings/api
2. Copy the values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - (Optional) **service_role** key → `VITE_SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
