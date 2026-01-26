# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Next.js dev server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run vitest tests
npm run test:watch  # Run tests in watch mode
```

## Architecture

### Multi-Tenant Homestay Platform

This is a multi-tenant SaaS application for creating and hosting homestay websites. Each tenant (property owner) gets their own customizable property site.

**Host Resolution:**
- Middleware (`src/middleware.ts`) inspects the incoming hostname
- Admin hosts (configured via `NEXT_PUBLIC_ADMIN_HOST`) route to `/admin/*` pages
- Customer domains resolve to their specific property via `PropertyContext`
- The `x-homestay-host` and `x-homestay-is-admin` headers are set by middleware

### Key Directories

- `src/app/` - Next.js App Router pages
  - `src/app/admin/` - Admin dashboard (agency & tenant management, property editing)
  - `src/app/api/` - API routes
- `src/components/homestay/` - Public-facing property display components (Hero, Rooms, Amenities, etc.)
- `src/components/themes/` - Theme-specific component variants (beach, mountain, forest, backwater, adventure)
- `src/components/ui/` - shadcn/ui components (do not modify directly)
- `src/lib/` - Utilities and business logic
- `src/contexts/` - React contexts (PropertyContext, ThemeContext, AuthContext)

### Authentication & Authorization

- Uses Supabase Auth
- Server-side auth helpers in `src/lib/authz.ts`:
  - `requireUser()` - Ensures user is authenticated, redirects to login if not
  - `requireMembership()` - Returns user's tenant membership and role
- Roles: `agency_admin`, `tenant_admin`, `tenant_editor`
- Supabase clients:
  - `src/lib/supabase/browser.ts` - Client-side
  - `src/lib/supabase/server.ts` - Server-side (SSR)
  - `src/lib/supabase/admin.ts` - Admin operations (uses service role key)

### Theming System

Five environment themes defined in `src/lib/themes.ts`: beach, mountain, forest, backwater, adventure. Each theme has:
- Unique color palette and typography
- Layout style (classic, bold, minimal, editorial, dynamic)
- Theme-specific component variants in `src/components/themes/[theme]/`

The `ThemeContext` manages theme selection; `ThemedContent` renders the appropriate components.

### Data Flow

1. Property data flows through `PropertyContext` (loads based on hostname)
2. Admin pages use server components with direct Supabase queries
3. JSON import feature allows bulk property data import via `src/lib/json-import.ts`

## Environment Variables

Required (prefix with `NEXT_PUBLIC_` for client-side):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- `NEXT_PUBLIC_ADMIN_HOST` - Admin domain (defaults to "localhost")

Server-only (no prefix):
- `SUPABASE_SERVICE_ROLE_KEY` - For admin operations (never expose to client)

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui (Radix primitives)
- Supabase (auth, database, storage)
- TanStack Query for data fetching
- Zod for schema validation
