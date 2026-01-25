import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Maximize, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { RoomFeaturesSection } from "@/components/homestay/RoomFeaturesSection";

import roomDeluxe from "@/assets/room-deluxe.jpg";

export function MountainRooms() {
  const { property, loading } = useProperty();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  if (loading || !property || !property.rooms || property.rooms.length === 0) {
    return null;
  }

  const scrollToBooking = () => {
    const element = document.querySelector("#booking");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="rooms" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Mountain-style header: centered, bold */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm uppercase tracking-widest text-primary font-bold">
            Accommodations
          </span>
          {property.room_section_header && (
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground mt-4 mb-4">
              {property.room_section_header}
            </h2>
          )}
          <div className="w-16 h-1 bg-primary mx-auto mb-6" />
          {property.room_section_tagline && (
            <p className="text-muted-foreground">
              {property.room_section_tagline}
            </p>
          )}
        </motion.div>

        {/* Stacked vertical cards with layered effect - Mountain style */}
        <div className="space-y-6 md:space-y-8">
          {property.rooms.map((room: any, index: number) => {
            const roomImage = property.media?.find((m: any) => m.room_id === room.id && m.media_type === 'room_image')?.s3_url || roomDeluxe;
            const currentPricing = room.pricing?.find((p: any) => {
              const today = new Date();
              const validFrom = p.valid_from ? new Date(p.valid_from) : null;
              const validTo = p.valid_to ? new Date(p.valid_to) : null;
              return (!validFrom || today >= validFrom) && (!validTo || today <= validTo);
            }) || room.pricing?.[0];
            const price = currentPricing?.discounted_rate || currentPricing?.base_rate || room.base_rate;
            const originalPrice = currentPricing?.original_price || currentPricing?.base_rate;
            
            return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15 }}
              className="group"
            >
              <div className="bg-background rounded-xl overflow-hidden shadow-elevated hover:shadow-card transition-all duration-300">
                <div className="grid md:grid-cols-5 gap-0">
                  {/* Large image - 3 columns */}
                  <div className="md:col-span-3 relative overflow-hidden">
                    <div className="relative w-full h-64 md:h-96 lg:h-[28rem]">
                      <img
                        src={roomImage}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Subtle overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/10" />
                      {/* View type badge */}
                      {room.view_type && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary/95 backdrop-blur-sm text-primary-foreground text-xs font-bold uppercase rounded-md shadow-soft">
                          {room.view_type}
                        </div>
                      )}
                      {/* Price badge on image */}
                      {price && (
                        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-soft">
                          {originalPrice && originalPrice > price && (
                            <span className="text-xs text-muted-foreground line-through block">
                              ₹{Number(originalPrice).toLocaleString()}
                            </span>
                          )}
                          <div className="text-xl font-serif font-bold text-primary">
                            ₹{Number(price).toLocaleString()}
                            <span className="text-xs font-normal text-muted-foreground">/night</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content - 2 columns */}
                  <div className="md:col-span-2 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground mb-3">
                        {room.name}
                      </h3>
                      
                      {/* Description with Room Features/USP integrated */}
                      {(room.description || room.room_features) && (
                        <div className="mb-6">
                          {room.description && (
                            <p className="text-muted-foreground leading-relaxed mb-2">
                              {room.description}
                            </p>
                          )}
                          {room.room_features && (
                            <p className="text-muted-foreground leading-relaxed text-sm">
                              <span className="font-medium text-foreground">Features: </span>
                              {room.room_features}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Quick Stats - Balanced 2-column layout */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {room.max_guests && (
                          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                            <Users className="w-4 h-4 text-primary flex-shrink-0" />
                            <div>
                              <span className="text-xs text-muted-foreground block">Guests</span>
                              <span className="font-bold text-sm text-foreground">
                                {room.adults_capacity && room.children_capacity && 
                                 (room.adults_capacity + room.children_capacity <= room.max_guests) ? (
                                  <>{room.max_guests} ({room.adults_capacity}A, {room.children_capacity}C)</>
                                ) : (
                                  <>{room.max_guests}</>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                        {room.room_size_sqft && (
                          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                            <Maximize className="w-4 h-4 text-primary flex-shrink-0" />
                            <div>
                              <span className="text-xs text-muted-foreground block">Size</span>
                              <span className="font-bold text-sm text-foreground">{room.room_size_sqft} sq ft</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bed Configuration */}
                      {room.bed_configurations && room.bed_configurations.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Bed className="w-4 h-4 text-primary" />
                            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Bed Configuration</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {room.bed_configurations.map((bed: any, bedIdx: number) => (
                              <span
                                key={bedIdx}
                                className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md border border-primary/20"
                              >
                                {bed.bed_count}x {bed.bed_type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Room Amenities - Separate section for better balance */}
                      {room.room_amenities && room.room_amenities.length > 0 && (
                        <RoomFeaturesSection 
                          roomFeatures={null}
                          roomAmenities={room.room_amenities}
                        />
                      )}
                    </div>

                    {/* CTA - improved */}
                    <div className="pt-4 border-t border-border">
                      <Button size="lg" className="w-full" onClick={scrollToBooking}>
                        Reserve Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
