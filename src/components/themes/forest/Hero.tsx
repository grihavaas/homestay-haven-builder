import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, TreePine, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { HeroEditor } from "@/components/edit-mode/editors/HeroEditor";
import heroImage from "@/assets/hero-homestay.jpg";

const HERO_ROTATE_MS = 5000;

export function ForestHero() {
  const { property, loading } = useProperty();
  const { isEditMode } = useEditMode();
  const [showEditor, setShowEditor] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (loading || !property) {
    return null;
  }

  const heroImages = property.media?.filter((m: any) => m.media_type === "hero").map((m: any) => m.s3_url) || [];
  const galleryImages = property.media?.filter((m: any) => m.media_type === "gallery").map((m: any) => m.s3_url) || [];
  const allImages =
    heroImages.length > 0 ? heroImages : galleryImages.length > 0 ? galleryImages : [heroImage];

  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, HERO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [allImages.length]);
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
      {/* Asymmetric split layout - Forest editorial style */}
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left: Content with organic shapes */}
        <div className="relative flex items-center order-2 lg:order-1 bg-background">
          {/* Organic decorative elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="container px-8 lg:px-16 py-20 relative z-10">
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-foreground mb-6 leading-tight"
            >
              {property.name}
            </motion.h1>

            {property.tagline && (
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-muted-foreground mb-6 max-w-md"
              >
                {property.tagline}
              </motion.p>
            )}

            {/* Location with organic border */}
            {(property.city || property.state) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-primary/30 rounded-full mb-8"
              >
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">{[property.city, property.state].filter(Boolean).join(", ")}</span>
              </motion.div>
            )}

            {/* Rating */}
            {avgRating > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-4 mb-10"
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(avgRating)
                          ? "text-secondary fill-current"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {avgRating.toFixed(1)} {totalReviews > 0 && `· ${totalReviews} reviews`}
                </span>
              </motion.div>
            )}

            {isEditMode && (
              <div className="mb-6">
                <EditButton onClick={() => setShowEditor(true)} label="Edit hero" />
              </div>
            )}

            {/* CTAs - same width on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" className="flex-1 min-w-0 basis-0" onClick={() => scrollToSection("#booking")}>
                <TreePine className="w-4 h-4 mr-2" />
                Book Your Escape
              </Button>
              <Button variant="warmOutline" size="lg" className="flex-1 min-w-0 basis-0" onClick={() => scrollToSection("#rooms")}>
                Discover Rooms
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Right: Full-height image carousel */}
        <div className="relative order-1 lg:order-2 min-h-[50vh] lg:min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute inset-0"
          >
            {allImages.map((image: string, index: number) => (
              <motion.img
                key={image}
                src={image}
                alt={property.name}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: index === currentImageIndex ? 1 : 0,
                  scale: index === currentImageIndex ? 1 : 1.05,
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/20" />
            {allImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {allImages.map((_: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? "w-8 bg-primary" : "w-2 bg-primary/40 hover:bg-primary/60"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Hero Editor Bottom Sheet */}
      <HeroEditor isOpen={showEditor} onClose={() => setShowEditor(false)} />
    </section>
  );
}
