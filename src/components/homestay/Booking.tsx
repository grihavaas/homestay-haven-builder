import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Calendar, Users, Phone, Mail, MessageCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProperty } from "@/contexts/PropertyContext";
import { useEditMode } from "@/contexts/EditModeContext";
import { EditButton } from "@/components/edit-mode/EditableSection";
import { ContactEditor } from "@/components/edit-mode/editors/ContactEditor";
import { toast } from "@/hooks/use-toast";

export function Booking() {
  const { property, loading } = useProperty();
  const { isEditMode } = useEditMode();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  if (loading || !property) {
    return null;
  }

  const bookingSettings = property.booking_settings;

  // Get WhatsApp number from hosts or property
  const whatsappNumber = property.hosts?.[0]?.whatsapp || property.phone || "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Get form values
    const checkin = formData.get("checkin") as string;
    const checkout = formData.get("checkout") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const requests = formData.get("requests") as string;

    // Find room name from selected room ID (using state)
    const roomData = property.rooms?.find((r: any) => r.id === selectedRoom);
    const roomName = roomData?.name || "Not specified";

    // Format the WhatsApp message
    const message = `🏡 *Booking Inquiry - ${property.name}*

📅 *Check-in:* ${checkin}
📅 *Check-out:* ${checkout}
👥 *Guests:* ${adults} Adult${parseInt(adults) > 1 ? "s" : ""}${parseInt(children) > 0 ? `, ${children} Child${parseInt(children) > 1 ? "ren" : ""}` : ""}
🛏️ *Room:* ${roomName}

👤 *Name:* ${name}
📞 *Phone:* ${phone}
✉️ *Email:* ${email}
${requests ? `\n💬 *Special Requests:*\n${requests}` : ""}

_Sent via ${property.name} website_`;

    // Clean phone number (remove non-digits except leading +)
    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, "").replace(/^\+/, "");

    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

    setIsSubmitting(false);
    window.open(whatsappUrl, "_blank");

    toast({
      title: "Opening WhatsApp",
      description: "Complete your inquiry by sending the message.",
    });
  };

  return (
    <section id="booking" className="py-20 md:py-32 bg-cream-dark">
      <div className="container mx-auto px-4">
        <div ref={ref} className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
          >
            <span className="text-sm uppercase tracking-wider text-primary font-medium">
              Book Your Stay
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mt-3 mb-6">
              Reserve Your Escape
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkin">Check-in Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="checkin"
                      name="checkin"
                      type="date"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkout">Check-out Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="checkout"
                      name="checkout"
                      type="date"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adults">Adults</Label>
                  <Select value={adults} onValueChange={setAdults}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select adults" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Adult{num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="children">Children</Label>
                  <Select value={children} onValueChange={setChildren}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select children" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Child{num !== 1 ? "ren" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Room Type</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {property.rooms?.map((room: any) => {
                      const currentPricing = room.pricing?.find((p: any) => {
                        const today = new Date();
                        const validFrom = p.valid_from ? new Date(p.valid_from) : null;
                        const validTo = p.valid_to ? new Date(p.valid_to) : null;
                        return (!validFrom || today >= validFrom) && (!validTo || today <= validTo);
                      }) || room.pricing?.[0];
                      const price = currentPricing?.discounted_rate || currentPricing?.base_rate || room.base_rate;
                      return (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name} - ₹{Number(price || 0).toLocaleString()}/night
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  name="requests"
                  placeholder="Any special requirements or questions..."
                  rows={3}
                />
              </div>

              <Button variant="warm" size="lg" className="w-full" disabled={isSubmitting}>
                <MessageCircle className="w-5 h-5 mr-2" />
                {isSubmitting ? "Opening WhatsApp..." : "Send via WhatsApp"}
              </Button>
            </form>
          </motion.div>

          {/* Policies & Contact */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Contact */}
            <div className="bg-primary rounded-2xl p-8 text-primary-foreground relative">
              {isEditMode && (
                <div className="absolute top-4 right-4">
                  <EditButton onClick={() => setShowEditor(true)} label="Edit" />
                </div>
              )}
              <h3 className="font-serif text-xl font-semibold mb-4">
                Prefer to Call?
              </h3>
              <p className="text-primary-foreground/80 mb-6">
                Our team is available from 8 AM to 10 PM to assist you with bookings and inquiries.
              </p>
              <div className="space-y-4">
                {property.phone && (
                  <a
                    href={`tel:${property.phone}`}
                    className="flex items-center gap-3 text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    {property.phone}
                  </a>
                )}
                {property.email && (
                  <a
                    href={`mailto:${property.email}`}
                    className="flex items-center gap-3 text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    {property.email}
                  </a>
                )}
                {property.hosts?.[0]?.whatsapp && (
                  <a
                    href={`https://wa.me/${property.hosts[0].whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp Us
                  </a>
                )}
              </div>
            </div>

            {/* Check-in Info */}
            <div className="bg-card rounded-xl p-6 shadow-soft">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Check-in & Check-out
              </h3>
              {bookingSettings && (
                <div className="space-y-3 text-sm">
                  {bookingSettings.check_in_time && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in</span>
                      <span className="font-medium text-foreground">{bookingSettings.check_in_time}</span>
                    </div>
                  )}
                  {bookingSettings.check_out_time && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out</span>
                      <span className="font-medium text-foreground">{bookingSettings.check_out_time}</span>
                    </div>
                  )}
                  {bookingSettings.min_stay_nights && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minimum Stay</span>
                      <span className="font-medium text-foreground">{bookingSettings.min_stay_nights} night{bookingSettings.min_stay_nights > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cancellation Policy - 3-Tier System */}
            {(bookingSettings?.cancellation_full_refund_policy || 
              bookingSettings?.cancellation_partial_refund_policy || 
              bookingSettings?.cancellation_no_refund_policy ||
              bookingSettings?.cancellation_policy) && (
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <div className="flex items-start gap-3 mb-4">
                  <Info className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      Cancellation Policy
                    </h3>
                    {/* Legacy single cancellation_policy field */}
                    {bookingSettings?.cancellation_policy && 
                     !bookingSettings?.cancellation_full_refund_policy &&
                     !bookingSettings?.cancellation_partial_refund_policy &&
                     !bookingSettings?.cancellation_no_refund_policy && (
                      <p className="text-sm text-muted-foreground">
                        {bookingSettings.cancellation_policy}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3-Tier Cancellation Policies */}
                {(bookingSettings?.cancellation_full_refund_policy || 
                  bookingSettings?.cancellation_partial_refund_policy || 
                  bookingSettings?.cancellation_no_refund_policy) && (
                  <div className="space-y-3 mt-4">
                    {/* Full Refund Policy */}
                    {bookingSettings?.cancellation_full_refund_policy && (
                      <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50/50 rounded-r">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                            1
                          </div>
                          <span className="text-sm font-semibold text-foreground">Full Refund</span>
                          {bookingSettings?.cancellation_full_refund_hours && (
                            <span className="text-xs text-muted-foreground">
                              (Cancel {bookingSettings.cancellation_full_refund_hours}+ hours before check-in)
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {bookingSettings.cancellation_full_refund_policy}
                        </p>
                      </div>
                    )}

                    {/* Partial Refund Policy */}
                    {bookingSettings?.cancellation_partial_refund_policy && (
                      <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50/50 rounded-r">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 text-xs font-semibold text-yellow-700">
                            2
                          </div>
                          <span className="text-sm font-semibold text-foreground">Partial Refund</span>
                          {bookingSettings?.cancellation_partial_refund_hours && (
                            <span className="text-xs text-muted-foreground">
                              (Cancel {bookingSettings.cancellation_partial_refund_hours}+ hours before check-in)
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {bookingSettings.cancellation_partial_refund_policy}
                        </p>
                      </div>
                    )}

                    {/* No Refund Policy */}
                    {bookingSettings?.cancellation_no_refund_policy && (
                      <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50/50 rounded-r">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-700">
                            3
                          </div>
                          <span className="text-sm font-semibold text-foreground">No Refund</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {bookingSettings.cancellation_no_refund_policy}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Payment Methods */}
            {property.payment_methods && property.payment_methods.length > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                  We Accept
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.payment_methods.map((method: any) => (
                    <span
                      key={method.id}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 bg-muted rounded-full text-muted-foreground"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {method.payment_type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Contact Editor Bottom Sheet */}
      <ContactEditor isOpen={showEditor} onClose={() => setShowEditor(false)} />
    </section>
  );
}
