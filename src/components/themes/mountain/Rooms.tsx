import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Maximize, Bed, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyData } from "@/lib/propertyData";

import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import roomCottage from "@/assets/room-cottage.jpg";

const roomImages: Record<string, string> = {
  "deluxe-room": roomDeluxe,
  "family-suite": roomSuite,
  "garden-cottage": roomCottage,
};

export function MountainRooms() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const scrollToBooking = () => {
    const element = document.querySelector("#booking");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="rooms" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        {/* Mountain-style header: centered, bold */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <span className="text-sm uppercase tracking-widest text-primary font-bold">
            Accommodations
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground mt-4 mb-4">
            Mountain Lodges
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-6" />
          <p className="text-muted-foreground">
            Rustic elegance meets modern comfort in our carefully crafted retreats.
          </p>
        </motion.div>

        {/* Stacked vertical cards with layered effect - Mountain style */}
        <div className="space-y-8">
          {propertyData.rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <div className="bg-background rounded-lg overflow-hidden shadow-elevated">
                <div className="grid md:grid-cols-5 gap-0">
                  {/* Large image - 3 columns */}
                  <div className="md:col-span-3 relative">
                    <img
                      src={roomImages[room.id]}
                      alt={room.name}
                      className="w-full h-64 md:h-80 object-cover"
                    />
                    {/* Overlay with view type */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase rounded">
                      {room.view}
                    </div>
                  </div>

                  {/* Content - 2 columns */}
                  <div className="md:col-span-2 p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
                        {room.name}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {room.description}
                      </p>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-3 bg-muted rounded">
                          <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground block">Guests</span>
                          <span className="font-semibold">{room.capacity.maxGuests}</span>
                        </div>
                        <div className="text-center p-3 bg-muted rounded">
                          <Maximize className="w-5 h-5 text-primary mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground block">Size</span>
                          <span className="font-semibold text-sm">{room.size}</span>
                        </div>
                        <div className="text-center p-3 bg-muted rounded">
                          <Bed className="w-5 h-5 text-primary mx-auto mb-1" />
                          <span className="text-xs text-muted-foreground block">Bed</span>
                          <span className="font-semibold">{room.beds[0].type}</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {room.amenities.slice(0, 4).map((amenity) => (
                          <span
                            key={amenity}
                            className="flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded text-muted-foreground"
                          >
                            <Check className="w-3 h-3" />
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{room.basePrice.toLocaleString()}
                        </span>
                        <div className="text-2xl font-serif font-bold text-primary">
                          ₹{room.discountedPrice.toLocaleString()}
                          <span className="text-sm font-normal text-muted-foreground">/night</span>
                        </div>
                      </div>
                      <Button size="lg" onClick={scrollToBooking}>
                        Reserve Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
