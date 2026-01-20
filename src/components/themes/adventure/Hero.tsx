import { motion } from "framer-motion";
import { Star, MapPin, Compass, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyData } from "@/lib/propertyData";
import heroImage from "@/assets/hero-homestay.jpg";

export function AdventureHero() {
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
          src={heroImage}
          alt={propertyData.name}
          className="w-full h-full object-cover"
        />
        {/* Bold diagonal gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-transparent" />
        {/* Diagonal accent stripe */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/10" />
      </div>

      {/* Content with diagonal energy */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            {/* Adventure badge */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-2 bg-primary rounded">
                <Compass className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-primary">
                {propertyData.type}
              </span>
              <Zap className="w-4 h-4 text-secondary" />
            </motion.div>

            {/* Bold headline */}
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-primary-foreground mb-4 leading-none"
            >
              {propertyData.name.split(' ').map((word, i) => (
                <span key={i} className="block">
                  {word}
                </span>
              ))}
            </motion.h1>

            {/* Tagline with accent */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-12 h-1 bg-primary" />
              <p className="text-xl text-primary-foreground/80 font-medium">
                {propertyData.tagline}
              </p>
            </motion.div>

            {/* Quick stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6 mb-8 py-4 border-y border-primary-foreground/20"
            >
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-current" />
                <span className="font-bold text-primary-foreground">{propertyData.ratings.overall}</span>
                <span className="text-primary-foreground/60">rating</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary-foreground">{propertyData.ratings.totalReviews}+</span>
                <span className="text-primary-foreground/60">reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-primary-foreground/80">{propertyData.location.city}</span>
              </div>
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
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
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
              {propertyData.tags.slice(0, 3).map((tag, index) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="px-3 py-1 text-xs font-bold uppercase bg-primary/20 text-primary rounded"
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
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Scroll</span>
          <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-primary rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
