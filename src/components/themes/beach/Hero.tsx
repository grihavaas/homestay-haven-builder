import { motion } from "framer-motion";
import { Star, MapPin, Award, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyData } from "@/lib/propertyData";
import heroImage from "@/assets/hero-homestay.jpg";

export function BeachHero() {
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
          src={heroImage}
          alt={propertyData.name}
          className="w-full h-full object-cover"
        />
        {/* Light, airy overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-background/90" />
      </div>

      {/* Content positioned at bottom - horizontal flow */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 pb-16">
          <div className="bg-background/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-elevated max-w-4xl">
            {/* Wave decoration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mb-4"
            >
              <Waves className="w-5 h-5 text-primary" />
              <span className="text-sm text-primary font-medium tracking-wider uppercase">
                {propertyData.type}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-serif font-semibold text-foreground mb-3"
            >
              {propertyData.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-muted-foreground mb-6"
            >
              {propertyData.tagline}
            </motion.p>

            {/* Horizontal info strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 mb-8"
            >
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm">{propertyData.classification}</span>
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-secondary fill-current" />
                <span className="text-sm font-semibold">{propertyData.ratings.overall}</span>
                <span className="text-sm text-muted-foreground">({propertyData.ratings.totalReviews} reviews)</span>
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{propertyData.location.city}, {propertyData.location.state}</span>
              </span>
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
    </section>
  );
}
