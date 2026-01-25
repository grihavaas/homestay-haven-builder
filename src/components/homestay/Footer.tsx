import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { useProperty } from "@/contexts/PropertyContext";

export function Footer() {
  const { property, loading } = useProperty();
  
  if (loading || !property) {
    return null;
  }
  
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  // Get social media links
  const instagramLink = property.social_media_links?.find((s: any) => s.platform === 'instagram');
  const facebookLink = property.social_media_links?.find((s: any) => s.platform === 'facebook');

  return (
    <footer id="contact" className="bg-charcoal text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="font-serif text-2xl font-semibold mb-2">
              {property.name}
            </h3>
            {property.tagline && (
              <p className="text-primary-foreground/60 italic mb-4">
                {property.tagline}
              </p>
            )}
            {property.description && (
              <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-md">
                {property.description.split('\n\n')[0]}
              </p>
            )}
            
            {/* Social Links */}
            {(instagramLink || facebookLink) && (
              <div className="flex gap-4 mt-6">
                {instagramLink && (
                  <a
                    href={instagramLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {facebookLink && (
                  <a
                    href={facebookLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: "Rooms", href: "#rooms" },
                { name: "Amenities", href: "#amenities" },
                { name: "Gallery", href: "#gallery" },
                { name: "Reviews", href: "#reviews" },
                { name: "Book Now", href: "#booking" },
              ].map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4">Contact Us</h4>
            <ul className="space-y-4">
              {property.phone && (
                <li>
                  <a
                    href={`tel:${property.phone}`}
                    className="flex items-start gap-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4 mt-0.5" />
                    {property.phone}
                  </a>
                </li>
              )}
              {property.email && (
                <li>
                  <a
                    href={`mailto:${property.email}`}
                    className="flex items-start gap-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4 mt-0.5" />
                    {property.email}
                  </a>
                </li>
              )}
              {(property.street_address || property.city) && (
                <li className="flex items-start gap-3 text-primary-foreground/70 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{[property.street_address, property.city, property.state].filter(Boolean).join(", ")}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Property Tags as Badges */}
        {property.property_tags && property.property_tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 py-8 border-t border-primary-foreground/10">
            {property.property_tags.slice(0, 6).map((tag: string) => (
              <div
                key={tag}
                className="px-4 py-2 bg-primary-foreground/5 rounded-full text-xs text-primary-foreground/60"
              >
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* Copyright */}
        <div className="pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} {property.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
