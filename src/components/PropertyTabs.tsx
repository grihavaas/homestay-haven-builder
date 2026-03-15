"use client";

import { useState, useTransition } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
  { id: "seo", label: "SEO" },
];

export function PropertyTabs({ propertyId }: { propertyId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "basic";
  const [isPending, startTransition] = useTransition();
  const [navigatingTab, setNavigatingTab] = useState<string | null>(null);

  function handleTabClick(tabId: string) {
    if (tabId === currentTab) return;
    setNavigatingTab(tabId);
    startTransition(() => {
      router.push(`${pathname}?tab=${tabId}`);
    });
  }

  // Clear navigating state when transition completes
  const activeNavigating = isPending ? navigatingTab : null;

  return (
    <div className="border-b">
      <nav className="-mb-px flex gap-4 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const isLoading = activeNavigating === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive
                  ? "border-black text-zinc-600 font-semibold"
                  : "border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
