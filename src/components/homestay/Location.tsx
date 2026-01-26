import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, Car, Plane, Clock, Mountain } from "lucide-react";
import { useProperty } from "@/contexts/PropertyContext";

export function Location() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { property, loading } = useProperty();
  
  if (loading || !property) {
    return null;
  }
  
  const showAttractions = property?.feature_nearby_attractions ?? false;

  return (
    <section id="location" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm uppercase tracking-wider text-primary font-medium">
            Location & Nearby
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mt-3 mb-4">
            Discover the Surroundings
          </h2>
          {property.location_description && (
            <p className="text-muted-foreground">
              {property.location_description}
            </p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            className="relative rounded-2xl overflow-hidden shadow-card bg-muted h-[400px]"
          >
            {property.latitude && property.longitude && (
              <iframe
                title="Location Map"
                src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&hl=en&z=14&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            )}
            {(property.street_address || property.city || property.state) && (
              <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    {property.street_address && (
                      <div className="font-medium text-foreground">
                        {property.street_address}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {[property.city, property.state, property.postal_code].filter(Boolean).join(", ")}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Distances & Attractions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* How to Reach */}
            <div className="bg-card rounded-xl p-6 shadow-soft">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                How to Reach
              </h3>
              <div className="space-y-4">
                {property.proximity_info && property.proximity_info.slice(0, 3).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.point_of_interest?.toLowerCase().includes("airport") ? (
                        <Plane className="w-5 h-5 text-primary" />
                      ) : (
                        <Car className="w-5 h-5 text-primary" />
                      )}
                      <span className="text-foreground">{item.point_of_interest}</span>
                    </div>
                    <div className="text-right">
                      {item.distance && (
                        <div className="text-sm font-medium text-foreground">
                          {item.distance} {item.distance_unit || 'km'}
                        </div>
                      )}
                      {item.description && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Attractions */}
            {showAttractions && (
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                  Things to Do Nearby
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {property.nearby_attractions && property.nearby_attractions.slice(0, 4).map((attraction: any) => (
                    <div
                      key={attraction.id}
                      className="bg-muted rounded-lg p-4"
                    >
                      {attraction.type && (
                        <div className="flex items-center gap-2 mb-1">
                          <Mountain className="w-4 h-4 text-sage" />
                          <span className="text-xs text-sage uppercase tracking-wider">
                            {attraction.type}
                          </span>
                        </div>
                      )}
                      <div className="font-medium text-foreground text-sm">
                        {attraction.name}
                      </div>
                      {attraction.distance && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {attraction.distance} {attraction.distance_unit || 'km'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
