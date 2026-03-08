"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Role } from "@/lib/authz";
import {
  LayoutDashboard,
  Users,
  Building2,
  Compass,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";

type Membership = { tenant_id: string; role: Role };

type Tenant = { id: string; name: string };

type Discovery = { id: string; name: string };

type Props = {
  role: Role;
  memberships: Membership[];
  userEmail: string;
  /** For agency_rm: the tenants they manage. For tenant roles: their single tenant. */
  tenants: Tenant[];
  /** Crawl job discoveries for sidebar listing */
  discoveries?: Discovery[];
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
};

function getNavItems(
  role: Role,
  tenants: Tenant[],
  discoveries: Discovery[],
): NavItem[] {
  const discoveryChildren = discoveries.map((d) => ({
    label: d.name,
    href: `/admin/agency/discoveries/${d.id}`,
  }));

  if (role === "agency_admin") {
    return [
      {
        label: "Dashboard",
        href: "/admin/agency",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        label: "Customers",
        href: "/admin/agency/tenants",
        icon: <Building2 className="w-4 h-4" />,
      },
      {
        label: "Users",
        href: "/admin/agency/users",
        icon: <Users className="w-4 h-4" />,
      },
      {
        label: "My Discoveries",
        href: "/admin/agency/discoveries",
        icon: <Compass className="w-4 h-4" />,
        children: discoveryChildren,
      },
    ];
  }

  if (role === "agency_rm") {
    return [
      {
        label: "My Customers",
        href: "/admin/rm",
        icon: <Building2 className="w-4 h-4" />,
        children: tenants.map((t) => ({
          label: t.name,
          href: `/admin/agency/tenants/${t.id}`,
        })),
      },
      {
        label: "My Discoveries",
        href: "/admin/agency/discoveries",
        icon: <Compass className="w-4 h-4" />,
        children: discoveryChildren,
      },
    ];
  }

  // tenant_admin or tenant_editor
  const items: NavItem[] = [
    {
      label: "Properties",
      href: "/admin/properties",
      icon: <Building2 className="w-4 h-4" />,
    },
  ];
  if (role === "tenant_admin") {
    items.push({
      label: "Members",
      href: "/admin/tenant/members",
      icon: <Users className="w-4 h-4" />,
    });
  }
  return items;
}

function NavLink({
  item,
  pathname,
  onNavigate,
  navigatingHref,
}: {
  item: NavItem;
  pathname: string;
  onNavigate: (href: string) => void;
  navigatingHref: string | null;
}) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = hasChildren && item.children!.some(
    (c) => pathname === c.href || pathname.startsWith(c.href + "/"),
  );
  const isNavigating = navigatingHref === item.href;

  function handleClick(e: React.MouseEvent, href: string) {
    if (pathname === href) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    onNavigate(href);
  }

  return (
    <div>
      <Link
        href={item.href}
        onClick={(e) => handleClick(e, item.href)}
        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          isActive || isChildActive
            ? "bg-zinc-100 text-zinc-900"
            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
        }`}
      >
        {isNavigating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          item.icon
        )}
        {item.label}
      </Link>
      {hasChildren && (
        <div
          className="ml-7 mt-1 space-y-0.5 overflow-y-auto"
          style={item.children!.length > 20 ? { maxHeight: "28rem" } : undefined}
        >
          {item.children!.map((child) => {
            const childActive =
              pathname === child.href ||
              pathname.startsWith(child.href + "/");
            const isChildNavigating = navigatingHref === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={(e) => handleClick(e, child.href)}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  childActive
                    ? "bg-zinc-100 text-zinc-900 font-medium"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                }`}
              >
                {isChildNavigating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({ role, memberships, userEmail, tenants, discoveries = [] }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);
  const navItems = getNavItems(role, tenants, discoveries);

  // Clear navigating state when transition completes
  if (!isPending && navigatingHref) {
    setNavigatingHref(null);
  }

  function handleNavigate(href: string) {
    setNavigatingHref(href);
    setMobileOpen(false);
    startTransition(() => {
      router.push(href);
    });
  }

  const title =
    role === "agency_admin" || role === "agency_rm"
      ? "Homestay Admin"
      : tenants[0]?.name ?? "Dashboard";

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-zinc-200">
        <h2 className="text-base font-semibold text-zinc-900 truncate">
          {title}
        </h2>
        {role === "agency_admin" && (
          <p className="text-xs text-zinc-500 mt-0.5">Agency Admin</p>
        )}
        {role === "agency_rm" && (
          <p className="text-xs text-zinc-500 mt-0.5">Relationship Manager</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={handleNavigate}
            navigatingHref={isPending ? navigatingHref : null}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-200 px-4 py-3">
        <p className="text-xs text-zinc-500 truncate" title={userEmail}>
          {userEmail}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">{role.replace("_", " ")}</p>
        <form action="/admin/logout" method="POST" className="mt-2">
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-40 rounded-md bg-white p-2 shadow-md border border-zinc-200 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-zinc-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 rounded-md p-1 text-zinc-500 hover:text-zinc-700"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-zinc-200">
        {sidebarContent}
      </aside>
    </>
  );
}
