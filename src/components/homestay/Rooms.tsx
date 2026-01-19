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

export function Rooms() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const scrollToBooking = () => {
    const element = document.querySelector("#booking");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="rooms" className="py-20 md:py-32 bg-cream-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm uppercase tracking-wider text-primary font-medium">
            Accommodations
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mt-3 mb-4">
            Your Home Amidst the Hills
          </h2>
          <p className="text-muted-foreground">
            Each of our thoughtfully designed rooms blends traditional Coorgi charm with modern comfort, 
            offering stunning views and a peaceful retreat.
          </p>
        </motion.div>

        {/* Rooms Grid */}
        <div className="space-y-12">
          {propertyData.rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2 }}
              className={`grid lg:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image */}
              <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="relative rounded-2xl overflow-hidden shadow-elevated group">
                  <img
                    src={roomImages[room.id]}
                    alt={room.name}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-soft">
                    <div className="text-xs text-muted-foreground line-through">
                      ₹{room.basePrice.toLocaleString()}
                    </div>
                    <div className="text-xl font-serif font-semibold text-primary">
                      ₹{room.discountedPrice.toLocaleString()}
                      <span className="text-xs text-muted-foreground font-normal">/night</span>
                    </div>
                  </div>
                  {/* View Badge */}
                  <div className="absolute bottom-4 left-4 bg-charcoal/80 backdrop-blur-sm rounded-full px-3 py-1 text-primary-foreground text-sm">
                    {room.view}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <h3 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-3">
                  {room.name}
                </h3>
                <p className="text-muted-foreground mb-6">{room.description}</p>

                {/* Room Details */}
                <div className="flex flex-wrap gap-6 mb-6">
                  <div className="flex items-center gap-2 text-foreground">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm">
                      Up to {room.capacity.maxGuests} guests
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Maximize className="w-5 h-5 text-primary" />
                    <span className="text-sm">{room.size}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Bed className="w-5 h-5 text-primary" />
                    <span className="text-sm">
                      {room.beds.map((b) => `${b.count} ${b.type}`).join(", ")} Bed
                    </span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {room.amenities.slice(0, 6).map((amenity) => (
                    <span
                      key={amenity}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-muted rounded-full text-muted-foreground"
                    >
                      <Check className="w-3 h-3" />
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 6 && (
                    <span className="text-xs px-3 py-1.5 bg-muted rounded-full text-muted-foreground">
                      +{room.amenities.length - 6} more
                    </span>
                  )}
                </div>

                <Button variant="warm" size="lg" onClick={scrollToBooking}>
                  Book This Room
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
