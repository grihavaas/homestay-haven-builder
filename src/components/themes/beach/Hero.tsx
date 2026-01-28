import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { HeroEditor } from "@/components/edit-mode/editors/HeroEditor";
import heroImage from "@/assets/hero-homestay.jpg";

export function BeachHero() {
  const { property, loading } = useProperty();
  const { isEditMode } = useEditMode();
  const [showEditor, setShowEditor] = useState(false);

  if (loading || !property) {
    return null;
  }
  
  const heroMedia = property.media?.find((m: any) => m.media_type === 'hero' || m.media_type === 'gallery')?.s3_url || heroImage;
  const avgRating = property.review_sources?.length > 0
    ? property.review_sources.reduce((sum: number, r: any) => sum + (r.stars || 0), 0) / property.review_sources.length
    : 0;
  const totalReviews = property.review_sources?.reduce((sum: number, r: any) => sum + (r.total_reviews || 0), 0) || 0;
  
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen">
      {/* Full-width horizontal hero - Beach style */}
      <div className="absolute inset-0">
        <img
          src={heroMedia}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        {/* Minimal overlay for text readability */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Content positioned at bottom - horizontal flow */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 pb-16">
          <div className="bg-background/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-elevated max-w-4xl">
            <div className="relative inline-block">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-serif font-semibold text-foreground mb-3"
              >
                {property.name}
              </motion.h1>
              {isEditMode && (
                <div className="absolute -right-12 top-1/2 -translate-y-1/2">
                  <EditButton onClick={() => setShowEditor(true)} label="Edit" />
                </div>
              )}
            </div>

            {property.tagline && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-muted-foreground mb-6"
              >
                {property.tagline}
              </motion.p>
            )}

            {/* Horizontal info strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 mb-8"
            >
              {avgRating > 0 && (
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-secondary fill-current" />
                  <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                  {totalReviews > 0 && (
                    <span className="text-sm text-muted-foreground">({totalReviews} reviews)</span>
                  )}
                </span>
              )}
              {(property.city || property.state) && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{[property.city, property.state].filter(Boolean).join(", ")}</span>
                </span>
              )}
            </motion.div>

            {/* CTAs - horizontal layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" onClick={() => scrollToSection("#booking")}>
                Book Your Stay
              </Button>
              <Button variant="outline" size="lg" onClick={() => scrollToSection("#rooms")}>
                View Rooms
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hero Editor Bottom Sheet */}
      <HeroEditor isOpen={showEditor} onClose={() => setShowEditor(false)} />
    </section>
  );
}
