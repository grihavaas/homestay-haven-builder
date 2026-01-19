import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Calendar, Users, Phone, Mail, MessageCircle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { propertyData } from "@/lib/propertyData";
import { toast } from "@/hooks/use-toast";

export function Booking() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Inquiry Sent!",
        description: "We'll get back to you within 24 hours.",
      });
    }, 1500);
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
                  <Select defaultValue="2">
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
                  <Select defaultValue="0">
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
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyData.rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} - ₹{room.discountedPrice.toLocaleString()}/night
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+91 98765 43210" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <Textarea
                  id="requests"
                  placeholder="Any special requirements or questions..."
                  rows={3}
                />
              </div>

              <Button variant="warm" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Inquiry"}
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
            <div className="bg-primary rounded-2xl p-8 text-primary-foreground">
              <h3 className="font-serif text-xl font-semibold mb-4">
                Prefer to Call?
              </h3>
              <p className="text-primary-foreground/80 mb-6">
                Our team is available from 8 AM to 10 PM to assist you with bookings and inquiries.
              </p>
              <div className="space-y-4">
                <a
                  href={`tel:${propertyData.contact.phone}`}
                  className="flex items-center gap-3 text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {propertyData.contact.phone}
                </a>
                <a
                  href={`mailto:${propertyData.contact.email}`}
                  className="flex items-center gap-3 text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  {propertyData.contact.email}
                </a>
                <a
                  href={`https://wa.me/${propertyData.contact.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Us
                </a>
              </div>
            </div>

            {/* Check-in Info */}
            <div className="bg-card rounded-xl p-6 shadow-soft">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Check-in & Check-out
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium text-foreground">{propertyData.booking.checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium text-foreground">{propertyData.booking.checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minimum Stay</span>
                  <span className="font-medium text-foreground">{propertyData.booking.minStay} night</span>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-card rounded-xl p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                    Cancellation Policy
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {propertyData.booking.policies.cancellation}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-card rounded-xl p-6 shadow-soft">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                We Accept
              </h3>
              <div className="flex flex-wrap gap-2">
                {propertyData.booking.policies.methods.map((method) => (
                  <span
                    key={method}
                    className="flex items-center gap-1 text-sm px-3 py-1.5 bg-muted rounded-full text-muted-foreground"
                  >
                    <CheckCircle className="w-3 h-3" />
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
