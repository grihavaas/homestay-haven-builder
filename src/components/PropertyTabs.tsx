"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const tabs = [
  { id: "basic", label: "Basic Info" },
  { id: "rooms", label: "Rooms" },
  { id: "pricing", label: "Pricing" },
  { id: "booking", label: "Booking Settings" },
  { id: "amenities", label: "Amenities & Tags" },
  { id: "media", label: "Media" },
  { id: "hosts", label: "Hosts" },
  { id: "reviews", label: "Reviews" },
  { id: "rules", label: "Rules & Policies" },
  { id: "attractions", label: "Nearby Attractions" },
  { id: "promotions", label: "Promotions" },
  { id: "additional", label: "Additional Info" },
];

export function PropertyTabs({ propertyId }: { propertyId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "basic";

  return (
    <div className="border-b">
      <nav className="-mb-px flex gap-4 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`${pathname}?tab=${tab.id}`}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                isActive
                  ? "border-black text-zinc-600 font-semibold"
                  : "border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
