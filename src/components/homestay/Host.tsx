import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageCircle, Clock, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyData } from "@/lib/propertyData";
import hostPortrait from "@/assets/host-portrait.jpg";

export function Host() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="host" className="py-20 md:py-32 bg-cream-dark">
      <div className="container mx-auto px-4">
        <div ref={ref} className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={hostPortrait}
                alt={propertyData.host.name}
                className="w-full aspect-square object-cover"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-sage/10 rounded-2xl -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <span className="text-sm uppercase tracking-wider text-primary font-medium">
              Meet Your Hosts
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mt-3 mb-2">
              {propertyData.host.name}
            </h2>
            <p className="text-muted-foreground italic mb-6">
              {propertyData.host.title}
            </p>

            <div className="prose text-muted-foreground mb-6">
              <p className="leading-relaxed">{propertyData.host.bio}</p>
              <p className="leading-relaxed mt-4">{propertyData.host.writeUp}</p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Response Time</div>
                  <div className="text-sm font-medium text-foreground">
                    {propertyData.host.responseTime}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Languages className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Languages</div>
                  <div className="text-sm font-medium text-foreground">
                    {propertyData.host.languages.slice(0, 2).join(", ")}
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="warm"
              size="lg"
              asChild
            >
              <a
                href={`https://wa.me/${propertyData.host.contact.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Message the Hosts
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
