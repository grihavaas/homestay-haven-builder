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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading property...</p>
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
