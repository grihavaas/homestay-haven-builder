import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Users, Maximize, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { RoomEditor } from "@/components/edit-mode/editors/RoomEditor";
import { RoomFeaturesSection } from "@/components/homestay/RoomFeaturesSection";
import { RoomImageCarousel } from "@/components/homestay/RoomImageCarousel";

import roomDeluxe from "@/assets/room-deluxe.jpg";

export function AdventureRooms() {
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
              Accommodations
            </span>
          </div>
          {property.room_section_header && (
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-foreground leading-none mb-4">
              {property.room_section_header}
            </h2>
          )}
          {property.room_section_tagline && (
            <p className="text-muted-foreground text-lg mb-4">
              {property.room_section_tagline}
            </p>
          )}
          <div className="w-20 h-1 bg-primary" />
        </motion.div>

        {/* Dynamic staggered grid with accent borders - Adventure style */}
        <div className="space-y-6">
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
                    <RoomImageCarousel
                      images={allRoomImages}
                      alt={room.name}
                      className="w-full h-48 md:h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
                    {/* Price badge - bold */}
                    {price && (
                      <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded">
                        {originalPrice && originalPrice > price && (
                          <span className="text-xs block line-through opacity-70">
                            ₹{Number(originalPrice).toLocaleString()}
                          </span>
                        )}
                        <span className="text-lg font-bold">
                          ₹{Number(price).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content - energetic layout */}
                  <div className={`p-6 md:col-span-2 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        {room.view_type && (
                          <span className="text-xs uppercase tracking-wider text-primary font-bold">
                            {room.view_type}
                          </span>
                        )}
                        <div className="relative inline-block">
                          <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                            {room.name}
                          </h3>
                          {isEditMode && (
                            <div className="absolute -right-10 top-1/2 -translate-y-1/2">
                              <EditButton onClick={() => setEditingRoom(room)} label="Edit" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description with Room Features/USP integrated */}
                    {(room.description || room.room_features) && (
                      <div className="mb-6">
                        {room.description && (
                          <p className="text-muted-foreground mb-2">
                            {room.description}
                          </p>
                        )}
                        {room.room_features && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Features: </span>
                            {room.room_features}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Stats in bold strip */}
                    <div className="flex gap-6 mb-6 py-3 border-y border-border">
                      {room.max_guests && (
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          <span className="font-bold">{room.max_guests}</span>
                          <span className="text-muted-foreground text-sm">
                            {room.adults_capacity && room.children_capacity && 
                             (room.adults_capacity + room.children_capacity <= room.max_guests) ? (
                              <>guests ({room.adults_capacity}A, {room.children_capacity}C)</>
                            ) : (
                              <>guests</>
                            )}
                          </span>
                        </div>
                      )}
                      {room.room_size_sqft && (
                        <div className="flex items-center gap-2">
                          <Maximize className="w-5 h-5 text-primary" />
                          <span className="font-bold">{room.room_size_sqft} sq ft</span>
                        </div>
                      )}
                    </div>

                    {/* Room Amenities - Separate section */}
                    {room.room_amenities && room.room_amenities.length > 0 && (
                      <div className="mb-6">
                        <RoomFeaturesSection 
                          roomFeatures={null}
                          roomAmenities={room.room_amenities}
                        />
                      </div>
                    )}

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
