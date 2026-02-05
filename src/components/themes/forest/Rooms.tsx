import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Users, Maximize, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { RoomEditor } from "@/components/edit-mode/editors/RoomEditor";
import { RoomFeaturesSection } from "@/components/homestay/RoomFeaturesSection";
import { RoomImageCarousel } from "@/components/homestay/RoomImageCarousel";

import roomDeluxe from "@/assets/room-deluxe.jpg";

export function ForestRooms() {
  const { property, loading } = useProperty();
  const { isEditMode } = useEditMode();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [editingRoom, setEditingRoom] = useState<any>(null);

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
    <section id="rooms" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Forest-style header: asymmetric, editorial */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
          >
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="text-sm uppercase tracking-wider text-primary font-medium">
                Accommodations
              </span>
            </div>
            {property.room_section_header && (
              <h2 className="text-4xl md:text-5xl font-serif font-semibold text-foreground leading-tight">
                {property.room_section_header}
              </h2>
            )}
            {property.room_section_tagline && (
              <p className="text-lg text-muted-foreground mt-2">
                {property.room_section_tagline}
              </p>
            )}
          </motion.div>
          {/* Empty second column for layout balance - can be removed if not needed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="flex items-end"
          >
            {/* Optional: Add additional content here if needed */}
          </motion.div>
        </div>

        {/* Asymmetric masonry grid - Forest editorial style */}
        <div className="grid md:grid-cols-2 gap-8">
          {property.rooms.map((room: any, index: number) => {
            const roomImages = (property.media?.filter((m: any) => m.room_id === room.id && m.media_type === "room_image") ?? [])
              .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((m: any) => m.s3_url);
            const allRoomImages = roomImages.length > 0 ? roomImages : [roomDeluxe];
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
              className={`group ${index === 0 ? 'md:row-span-2' : ''}`}
            >
              <div className={`relative rounded-2xl overflow-hidden ${index === 0 ? 'h-full' : ''}`}>
                {/* Image with organic border */}
                <div className={`relative ${index === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
                  <RoomImageCarousel
                    images={allRoomImages}
                    alt={room.name}
                    className="w-full h-full"
                    imageClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                </div>

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  {/* View tag */}
                  {room.view_type && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 backdrop-blur-sm text-primary-foreground text-xs rounded-full mb-4">
                      <Leaf className="w-3 h-3" />
                      {room.view_type}
                    </span>
                  )}

                  <div className="relative inline-block">
                    <h3 className="text-2xl md:text-3xl font-serif font-semibold text-primary-foreground mb-2">
                      {room.name}
                    </h3>
                    {isEditMode && (
                      <div className="absolute -right-10 top-1/2 -translate-y-1/2">
                        <EditButton onClick={() => setEditingRoom(room)} label="Edit" />
                      </div>
                    )}
                  </div>

                  {/* Description with Room Features/USP integrated */}
                  {(room.description || room.room_features) && (
                    <div className="mb-4">
                      {room.description && (
                        <p className="text-primary-foreground/80 text-sm mb-2 line-clamp-2">
                          {room.description}
                        </p>
                      )}
                      {room.room_features && (
                        <p className="text-xs text-primary-foreground/70">
                          <span className="font-medium text-primary-foreground/90">Features: </span>
                          {room.room_features}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 text-primary-foreground/70 text-sm mb-4">
                    {room.max_guests && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {room.adults_capacity && room.children_capacity && 
                         (room.adults_capacity + room.children_capacity <= room.max_guests) ? (
                          <>{room.max_guests} guests ({room.adults_capacity}A, {room.children_capacity}C)</>
                        ) : (
                          <>{room.max_guests} guests</>
                        )}
                      </span>
                    )}
                    {room.room_size_sqft && (
                      <span className="flex items-center gap-1">
                        <Maximize className="w-4 h-4" />
                        {room.room_size_sqft} sq ft
                      </span>
                    )}
                  </div>

                  {/* Room Amenities - Separate section */}
                  {room.room_amenities && room.room_amenities.length > 0 && (
                    <div className="mb-4">
                      <RoomFeaturesSection 
                        roomFeatures={null}
                        roomAmenities={room.room_amenities}
                        variant="compact"
                      />
                    </div>
                  )}

                  {/* Price and CTA */}
                  {price && (
                    <div className="flex items-center justify-between pt-4 border-t border-primary-foreground/20">
                      <div>
                        {originalPrice && originalPrice > price && (
                          <span className="text-xs text-primary-foreground/60 line-through">
                            ₹{Number(originalPrice).toLocaleString()}
                          </span>
                        )}
                        <div className="text-xl font-serif font-semibold text-primary-foreground">
                          ₹{Number(price).toLocaleString()}
                          <span className="text-xs font-normal opacity-70">/night</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                        onClick={scrollToBooking}
                      >
                        Book <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>

      {/* Room Editor Bottom Sheet */}
      <RoomEditor
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        room={editingRoom}
      />
    </section>
  );
}
