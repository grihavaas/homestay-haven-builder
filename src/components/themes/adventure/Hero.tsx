import { motion } from "framer-motion";
import { Star, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import heroImage from "@/assets/hero-homestay.jpg";

export function AdventureHero() {
  const { property, loading } = useProperty();
  
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
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* Dynamic diagonal layout - Adventure style */}
      <div className="absolute inset-0">
        <img
          src={heroMedia}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        {/* Lighter diagonal gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-background/30 to-transparent" />
        {/* Diagonal accent stripe */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-secondary/5" />
      </div>

      {/* Content with diagonal energy */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            {/* Bold headline */}
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-4 leading-none drop-shadow-lg"
            >
              {property.name.split(' ').map((word: string, i: number) => (
                <span key={i} className="block">
                  {word}
                </span>
              ))}
            </motion.h1>

            {/* Tagline with accent */}
            {property.tagline && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 mb-6"
              >
                <div className="w-12 h-1 bg-white" />
                <p className="text-xl text-white/90 font-medium drop-shadow-md">
                  {property.tagline}
                </p>
              </motion.div>
            )}

            {/* Quick stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6 mb-8 py-4 border-y border-white/30"
            >
              {avgRating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-white fill-current" />
                  <span className="font-bold text-white">{avgRating.toFixed(1)}</span>
                  <span className="text-white/70">rating</span>
                </div>
              )}
              {totalReviews > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{totalReviews}+</span>
                  <span className="text-white/70">reviews</span>
                </div>
              )}
              {property.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-white/90">{property.city}</span>
                </div>
              )}
            </motion.div>

            {/* Action-oriented CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Button 
                size="lg" 
                className="group"
                onClick={() => scrollToSection("#booking")}
              >
                Start Your Adventure
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/50 text-white hover:bg-white/20 hover:border-white"
                onClick={() => scrollToSection("#rooms")}
              >
                Explore Rooms
              </Button>
            </motion.div>

            {/* Tags with energy */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-2 mt-10"
            >
              {property.property_tags && property.property_tags.slice(0, 3).map((tag: string, index: number) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="px-3 py-1 text-xs font-bold uppercase bg-white/20 text-white rounded backdrop-blur-sm"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dynamic scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 right-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-white">Scroll</span>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
