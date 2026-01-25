import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useProperty } from "@/contexts/PropertyContext";
import { getAmenityIcon } from "@/lib/amenityIcons";

export function Amenities() {
  const { property, loading } = useProperty();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  if (loading || !property || !property.amenities || property.amenities.length === 0) {
    return null;
  }

  return (
    <section id="amenities" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm uppercase tracking-wider text-primary font-medium">
            Facilities & Services
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mt-3 mb-4">
            Everything You Need, and More
          </h2>
        </motion.div>

        {/* Core Amenities Grid */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12 max-w-7xl mx-auto">
          {property.amenities.slice(0, 12).map((amenity: any, index: number) => {
            const Icon = getAmenityIcon(amenity);
            return (
              <motion.div
                key={amenity.id || amenity.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-lg px-3 py-2.5 shadow-soft hover:shadow-card transition-all duration-300 group inline-flex"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm whitespace-nowrap">{amenity.name}</h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
