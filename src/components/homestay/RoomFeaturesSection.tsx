"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getAmenityIcon } from "@/lib/amenityIcons";

interface RoomFeaturesSectionProps {
  roomFeatures?: string | null;
  roomAmenities?: any[] | null;
  variant?: "default" | "compact";
}

export function RoomFeaturesSection({ roomFeatures, roomAmenities, variant = "default" }: RoomFeaturesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Primary: Use room_amenities (structured, with icons) from standard_amenities table
  // Fallback: Use room_features (free-form text) if room_amenities is empty
  const hasStructuredAmenities = roomAmenities && roomAmenities.length > 0;
  
  let allFeatures: Array<{ name: string; icon?: any }> = [];
  
  if (hasStructuredAmenities) {
    // Use structured amenities (preferred - has icons, standardized)
    allFeatures = roomAmenities.map((a: any) => ({
      name: a.name || a,
      icon: a.icon ? getAmenityIcon({ name: a.name || a, icon: a.icon }) : null,
    }));
  } else if (roomFeatures) {
    // Fallback to room_features text field (parse comma-separated)
    const featuresList = roomFeatures.split(',').map(f => f.trim()).filter(Boolean);
    allFeatures = featuresList.map(name => ({ name }));
  }
  
  if (allFeatures.length === 0) {
    return null;
  }

  // Show first 8 features by default, rest when expanded (or 6 for compact)
  const initialCount = variant === "compact" ? 6 : 8;
  const visibleFeatures = isExpanded ? allFeatures : allFeatures.slice(0, initialCount);
  const hasMore = allFeatures.length > initialCount;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
          {hasStructuredAmenities ? "Room Amenities" : "Room Features"}
        </span>
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Show All ({allFeatures.length}) <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {visibleFeatures.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 text-foreground text-xs rounded-md border border-border/50"
            >
              {Icon && <Icon className="w-3 h-3 text-primary flex-shrink-0" />}
              <span>{feature.name}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
