"use client";

import { useTheme } from "@/contexts/ThemeContext";

// Beach theme components
import { BeachHero } from "./themes/beach/Hero";
import { BeachRooms } from "./themes/beach/Rooms";

// Mountain theme components
import { MountainHero } from "./themes/mountain/Hero";
import { MountainRooms } from "./themes/mountain/Rooms";

// Forest theme components
import { ForestHero } from "./themes/forest/Hero";
import { ForestRooms } from "./themes/forest/Rooms";

// Backwater theme components
import { BackwaterHero } from "./themes/backwater/Hero";
import { BackwaterRooms } from "./themes/backwater/Rooms";

// Adventure theme components
import { AdventureHero } from "./themes/adventure/Hero";
import { AdventureRooms } from "./themes/adventure/Rooms";

// Shared components (same across themes)
import { Header } from "./homestay/Header";
import { About } from "./homestay/About";
import { Amenities } from "./homestay/Amenities";
import { Gallery } from "./homestay/Gallery";
import { Reviews } from "./homestay/Reviews";
import { Host } from "./homestay/Host";
import { Location } from "./homestay/Location";
import { Booking } from "./homestay/Booking";
import { HouseRules } from "./homestay/HouseRules";
import { Footer } from "./homestay/Footer";
import { useProperty } from "@/contexts/PropertyContext";
import { DocumentHead } from "./DocumentHead";

export function ThemedContent() {
  const { currentTheme } = useTheme();
  const { property, loading, error } = useProperty();
  
  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Hero Skeleton */}
        <div className="relative min-h-screen bg-muted animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-muted-foreground/10 to-transparent" />
          <div className="container mx-auto px-4 pt-32 relative z-10">
            <div className="max-w-3xl space-y-6">
              {/* Badge skeleton */}
              <div className="h-8 w-32 bg-muted-foreground/20 rounded-full" />
              {/* Title skeleton */}
              <div className="h-16 w-3/4 bg-muted-foreground/20 rounded-lg" />
              {/* Tagline skeleton */}
              <div className="h-8 w-1/2 bg-muted-foreground/20 rounded-lg" />
              {/* Location skeleton */}
              <div className="h-6 w-40 bg-muted-foreground/20 rounded-lg" />
              {/* Buttons skeleton */}
              <div className="flex gap-4 pt-4">
                <div className="h-14 w-40 bg-muted-foreground/20 rounded-lg" />
                <div className="h-14 w-40 bg-muted-foreground/20 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* About Section Skeleton */}
        <div className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="h-4 w-24 bg-muted animate-pulse rounded mx-auto" />
              <div className="h-10 w-2/3 bg-muted animate-pulse rounded mx-auto" />
              <div className="space-y-2 pt-4">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Section Skeleton */}
        <div className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-3">
              <div className="h-4 w-32 bg-muted animate-pulse rounded mx-auto" />
              <div className="h-10 w-64 bg-muted animate-pulse rounded mx-auto" />
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="aspect-[4/3] bg-muted animate-pulse rounded-2xl" />
              <div className="space-y-4 py-8">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-12 w-36 bg-muted animate-pulse rounded mt-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load property</p>
          <p className="text-muted-foreground text-sm">{error || "Property not found"}</p>
        </div>
      </div>
    );
  }

  // Render theme-specific Hero
  const renderHero = () => {
    switch (currentTheme) {
      case 'beach': return <BeachHero />;
      case 'mountain': return <MountainHero />;
      case 'forest': return <ForestHero />;
      case 'backwater': return <BackwaterHero />;
      case 'adventure': return <AdventureHero />;
      default: return <BeachHero />;
    }
  };

  // Render theme-specific Rooms
  const renderRooms = () => {
    switch (currentTheme) {
      case 'beach': return <BeachRooms />;
      case 'mountain': return <MountainRooms />;
      case 'forest': return <ForestRooms />;
      case 'backwater': return <BackwaterRooms />;
      case 'adventure': return <AdventureRooms />;
      default: return <BeachRooms />;
    }
  };

  return (
    <>
      <DocumentHead />
      <Header />
      {renderHero()}
      <About />
      {renderRooms()}
      <Amenities />
      <Gallery />
      <Reviews />
      <Host />
      <Location />
      <Booking />
      <HouseRules />
      <Footer />
    </>
  );
}
