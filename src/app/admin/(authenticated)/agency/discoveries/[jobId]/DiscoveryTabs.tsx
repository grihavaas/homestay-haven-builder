"use client";

const tabs = [
  { id: "basic", label: "Basic Info" },
  { id: "rooms", label: "Rooms" },
  { id: "images", label: "Images" },
  { id: "pricing", label: "Pricing" },
  { id: "booking", label: "Booking Settings" },
  { id: "amenities", label: "Amenities & Tags" },
  { id: "hosts", label: "Hosts" },
  { id: "reviews", label: "Reviews" },
  { id: "rules", label: "Rules & Policies" },
  { id: "attractions", label: "Nearby Attractions" },
  { id: "promotions", label: "Promotions" },
  { id: "additional", label: "Additional Info" },
  { id: "vision-debug", label: "Vision Debug" },
];

export function DiscoveryTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="border-b">
      <nav className="-mb-px flex gap-4 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                isActive
                  ? "border-black text-zinc-600 font-semibold"
                  : "border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
