import Link from "next/link";

export function AdminHeader({ title }: { title?: string }) {
  return (
    <header className="mb-6 -mx-8 -mt-8 bg-zinc-900 text-white">
      <div className="mx-auto max-w-6xl px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="rounded bg-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-600"
            >
              Logout
            </button>
          </form>
          <Link
            href="/admin"
            className="text-sm text-zinc-300 hover:text-white"
          >
            Admin Home
          </Link>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/admin/agency"
            className="text-zinc-300 hover:text-white"
          >
            Agency
          </Link>
          <Link
            href="/admin/agency/tenants"
            className="text-zinc-300 hover:text-white"
          >
            Tenants
          </Link>
          <Link
            href="/admin/agency/users"
            className="text-zinc-300 hover:text-white"
          >
            Users
          </Link>
        </div>
      </div>
      {title && (
        <div className="bg-zinc-800 px-8 py-4">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
        </div>
      )}
    </header>
  );
}
