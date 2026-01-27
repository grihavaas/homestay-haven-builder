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
    <footer id="contact" className="bg-charcoal text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="font-serif text-2xl font-semibold mb-2">
              {property.name}
            </h3>
            {property.tagline && (
              <p className="text-white/60 italic mb-4">
                {property.tagline}
              </p>
            )}
            {property.description && (
              <p className="text-white/80 text-sm leading-relaxed max-w-md">
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
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {facebookLink && (
                  <a
                    href={facebookLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
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
                    className="text-white/70 hover:text-white transition-colors text-sm"
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
                    className="flex items-start gap-3 text-white/70 hover:text-white transition-colors text-sm"
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
                    className="flex items-start gap-3 text-white/70 hover:text-white transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4 mt-0.5" />
                    {property.email}
                  </a>
                </li>
              )}
              {(property.street_address || property.city) && (
                <li className="flex items-start gap-3 text-white/70 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{[property.street_address, property.city, property.state].filter(Boolean).join(", ")}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Property Tags as Badges */}
        {property.property_tags && property.property_tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 py-8 border-t border-white/10">
            {property.property_tags.slice(0, 6).map((tag: string) => (
              <div
                key={tag}
                className="px-4 py-2 bg-white/5 rounded-full text-xs text-white/60"
              >
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 text-center space-y-2">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} {property.name}. All rights reserved.
          </p>
          <p className="text-[10px] text-white/15">
            Website by Das Technologies
          </p>
        </div>
      </div>
    </footer>
  );
}
