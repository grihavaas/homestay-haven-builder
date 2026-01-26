# Supabase Redirect URL Configuration

## Password Reset & Invitation Setup

### 1. Configure Supabase Dashboard

Go to your Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs (add these):**
```
http://localhost:3000/admin/reset-password
http://localhost:3000/admin/login
```

For production, add:
```
https://yourdomain.com/admin/reset-password
https://yourdomain.com/admin/login
```

### 2. How It Works

#### Password Reset Flow:
1. User clicks "Forgot password?" on `/admin/login`
2. Enters email and receives reset link
3. Email contains link like: `http://localhost:3000/admin/reset-password#access_token=...&refresh_token=...&type=recovery`
4. User clicks link → redirected to `/admin/reset-password`
5. Page extracts tokens from URL hash and creates session
6. User sets new password
7. Redirected back to login

#### Invitation Flow:
1. Admin creates user via `/admin/agency/users`
2. Supabase sends invitation email
3. Email contains link like: `http://localhost:3000/admin/reset-password#access_token=...&refresh_token=...&type=invite`
4. User clicks link → redirected to `/admin/reset-password`
5. Page extracts tokens and user sets their password
6. User can then log in

### 3. Current Implementation

The reset password page (`/admin/reset-password`) now:
- ✅ Handles tokens from URL hash
- ✅ Exchanges tokens for session
- ✅ Allows password reset
- ✅ Works for both password reset and invitations

### 4. Testing

1. **Test Password Reset:**
   - Go to `/admin/login`
   - Click "Forgot password?"
   - Enter your email
   - Check email and click link
   - Should redirect to `/admin/reset-password` and allow password change

2. **Test Invitation:**
   - Admin creates user via `/admin/agency/users`
   - User receives invitation email
   - Clicks link → should go to `/admin/reset-password`
   - User sets password and can log in

### 5. Troubleshooting

If redirects don't work:
- ✅ Check Supabase Dashboard → Authentication → URL Configuration
- ✅ Make sure redirect URLs are added (no trailing slashes)
- ✅ Verify the redirect URL in code matches Supabase settings
- ✅ Check browser console for errors
- ✅ Ensure tokens are in URL hash (after `#`)
