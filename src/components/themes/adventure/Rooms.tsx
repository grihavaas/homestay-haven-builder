import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Maximize, Bed, Zap, ChevronRight } from "lucide-react";
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

export function AdventureRooms() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const scrollToBooking = () => {
    const element = document.querySelector("#booking");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="rooms" className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Diagonal accent background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary/5 to-transparent -skew-x-12 origin-top-right" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Adventure-style header: bold, dynamic */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="max-w-xl mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary rounded">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm uppercase tracking-wider text-primary font-bold">
              Base Camps
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground leading-none mb-4">
            Your Adventure<br />Headquarters
          </h2>
          <div className="w-20 h-1 bg-primary" />
        </motion.div>

        {/* Dynamic staggered grid with accent borders - Adventure style */}
        <div className="space-y-6">
          {propertyData.rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.15 }}
              className="group"
            >
              <div className={`
                relative bg-card rounded overflow-hidden border-l-4 border-primary
                ${index % 2 === 1 ? 'ml-0 md:ml-12' : ''}
              `}>
                <div className="grid md:grid-cols-3 gap-0">
                  {/* Image with diagonal overlay */}
                  <div className={`relative md:col-span-1 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                    <img
                      src={roomImages[room.id]}
                      alt={room.name}
                      className="w-full h-48 md:h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
                    {/* Price badge - bold */}
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded">
                      <span className="text-xs block line-through opacity-70">
                        ₹{room.basePrice.toLocaleString()}
                      </span>
                      <span className="text-lg font-bold">
                        ₹{room.discountedPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Content - energetic layout */}
                  <div className={`p-6 md:col-span-2 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-primary font-bold">
                          {room.view}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                          {room.name}
                        </h3>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-6">
                      {room.description}
                    </p>

                    {/* Stats in bold strip */}
                    <div className="flex gap-6 mb-6 py-3 border-y border-border">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <span className="font-bold">{room.capacity.maxGuests}</span>
                        <span className="text-muted-foreground text-sm">guests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Maximize className="w-5 h-5 text-primary" />
                        <span className="font-bold">{room.size}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bed className="w-5 h-5 text-primary" />
                        <span className="font-bold">{room.beds[0].type}</span>
                        <span className="text-muted-foreground text-sm">bed</span>
                      </div>
                    </div>

                    {/* Amenity tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {room.amenities.slice(0, 4).map((amenity) => (
                        <span
                          key={amenity}
                          className="px-3 py-1 text-xs font-bold uppercase bg-muted text-muted-foreground rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <Button 
                      size="lg" 
                      className="group/btn"
                      onClick={scrollToBooking}
                    >
                      Book This Room
                      <ChevronRight className="w-5 h-5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
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
