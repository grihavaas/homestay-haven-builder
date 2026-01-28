# Supabase Production Configuration

## Critical: Redirect URL Configuration

If users are being redirected back to login after authentication, **this is almost always a Supabase redirect URL configuration issue**.

### Steps to Fix:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project
   - Go to: **Authentication** → **URL Configuration**

2. **Update Site URL**
   ```
   https://homestay.gudcook.me
   ```
   ⚠️ **This must match your production domain exactly**

3. **Add Redirect URLs**
   Add ALL of these (one per line):
   ```
   https://homestay.gudcook.me/admin/reset-password
   https://homestay.gudcook.me/admin/login
   https://homestay.gudcook.me/**
   ```
   
   The `/**` wildcard allows all paths under your domain.

4. **Keep Localhost URLs for Development**
   You can keep localhost URLs for local development:
   ```
   http://localhost:3000/admin/reset-password
   http://localhost:3000/admin/login
   ```

### Why This Matters:

- **Site URL**: Supabase uses this to validate where authentication requests come from
- **Redirect URLs**: Supabase only allows redirects to URLs in this allowlist
- **If mismatched**: Supabase will reject the session, cookies won't be set properly, and users get redirected back to login

### Common Issues:

1. **Site URL is `localhost:3000`** → Change to `https://homestay.gudcook.me`
2. **Production domain not in Redirect URLs** → Add `https://homestay.gudcook.me/**`
3. **Missing trailing slash or protocol mismatch** → Use exact URLs with `https://`

### Testing:

After updating:
1. Clear browser cookies for your production domain
2. Log in again
3. Check browser DevTools → Application → Cookies
4. You should see Supabase auth cookies (names like `sb-*-auth-token`)
5. Navigate to dashboard - should work without redirecting to login

### Environment Variables:

Make sure these are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `NEXT_PUBLIC_ADMIN_HOST` - `homestay.gudcook.me` (for production)
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (server-side only)
