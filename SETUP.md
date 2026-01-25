# Setting Up Homestay Haven Builder with Supabase Data

This guide will help you connect the user-facing application (`homestay-haven-builder`) to your Supabase database that's been populated from the admin interface.

## Prerequisites

1. ✅ Property data has been imported into Supabase via the admin interface
2. ✅ You have your Supabase project URL and anon key

## Step 1: Set Up Environment Variables

Create a `.env` file in the `homestay-haven-builder` directory:

```bash
cd homestay-haven-builder
touch .env
```

Add the following environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to find these values:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** → use as `VITE_SUPABASE_URL`
4. Copy the **anon/public** key → use as `VITE_SUPABASE_ANON_KEY`

## Step 2: Publish Your Property

In the admin interface:
1. Navigate to the property you want to display
2. Make sure the property has `is_published = true` (you can check/edit this in the Basic Info tab)

## Step 3: Set Up Domain Mapping

The end-user application determines which tenant's website to display based on the **hostname** (domain) used to access it. The app looks up the hostname in the `domains` table to find the corresponding property.

### How It Works:

1. **Hostname Detection**: The app reads `window.location.hostname` (e.g., `example.com`, `localhost`, `www.example.com`)
2. **Domain Lookup**: It queries the `domains` table to find a matching `hostname`
3. **Property Resolution**: The matching domain entry points to a `property_id`, which determines which property/tenant website to display

### Setting Up Domain Mappings:

**Option 1: Via Admin Interface (Agency Admin Only)**
1. Go to **Agency** → **Tenants** → **[Select Tenant]** → Find the property → Click **"Manage domains"**
2. Or go directly to: **Agency** → **Properties** → **[Your Property]** → **Domains** tab
3. Add domain entries:
   - Enter the hostname (e.g., `example.com`, `www.example.com`, `localhost`)
   - Check "Primary" if this is the main domain
   - Click "Add domain"

**Option 2: Direct Database Entry (SQL)**
```sql
INSERT INTO domains (tenant_id, property_id, hostname, is_primary, verified_at)
VALUES (
  'your-tenant-id',
  'your-property-id',
  'example.com',  -- or 'localhost' for local dev
  true,
  NOW()
);
```

### Examples:

**For Local Development:**
- Add hostname: `localhost`
- This allows you to test at `http://localhost:5173` (or your dev server port)

**For Production:**
- Add hostname: `example.com` (apex domain)
- Add hostname: `www.example.com` (www subdomain)
- Set one as "Primary"
- Point your DNS to your hosting provider
- The app will automatically show the correct property based on which domain is accessed

### Multiple Properties/Tenants:

Each property can have multiple domain entries. When a user visits:
- `tenant1.com` → Shows Property A's website
- `tenant2.com` → Shows Property B's website
- `localhost` → Shows whatever property has `localhost` in the domains table

**Important**: Each hostname must be unique across all properties (enforced by database constraint).

## Step 4: Install Dependencies and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will:
1. Detect the current hostname (from `window.location.hostname`)
2. Look up the property in the `domains` table
3. Fetch the published property data from Supabase
4. Display it in the UI

## Step 5: Set Up Public Read Policies (IMPORTANT!)

The database needs public read policies to allow the user-facing app to read published property data. Run this migration:

```sql
-- Run the migration file: migrations/009-add-public-read-policies.sql
```

Or manually run the SQL in your Supabase SQL editor:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `homestay-architecture/migrations/009-add-public-read-policies.sql`
3. Execute the SQL

This creates policies that allow **anyone** (including unauthenticated users) to read:
- Published properties (`is_published = true`)
- Active rooms, media, hosts, reviews, etc. for published properties
- Reference data (amenities, tags, domains)

**Security Note**: These policies only allow **reading** published data. They do NOT allow creating, updating, or deleting. All write operations still require authentication and admin permissions.

## Step 6: Verify Data Loading

1. Open the browser console (F12)
2. Check for any errors related to Supabase connection
3. The app should load property data from Supabase instead of the hardcoded `propertyData`

## Troubleshooting

### "No property found for hostname"
- Make sure you've added a domain entry in the `domains` table for your hostname
- For localhost, add `hostname = "localhost"`

### "Property not found or not published"
- Check that `is_published = true` in the properties table
- Verify the property_id in the domains table matches an existing property

### "Missing Supabase environment variables"
- Make sure `.env` file exists in the `homestay-haven-builder` directory
- Verify the variable names start with `VITE_` (required for Vite)
- Restart the dev server after adding/changing environment variables

### Data not showing up
- Check browser console for errors
- Verify the property has all required data (rooms, media, etc.)
- Make sure RLS (Row Level Security) policies allow public read access to published properties

## Next Steps

Once the app is loading data from Supabase:
1. The components will automatically use the `property` from `PropertyContext`
2. You can customize themes and styling as needed
3. Deploy the app to your hosting platform (Vercel, Netlify, etc.)
4. Make sure to set environment variables in your hosting platform as well

## Notes

- The app uses the same Supabase instance as the admin interface
- Only published properties (`is_published = true`) will be displayed
- The app fetches: rooms, media, reviews, hosts, attractions, proximity info, features, and booking settings
