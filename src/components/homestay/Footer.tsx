import { MapPin, Phone, Mail, Instagram, Facebook } from "lucide-react";
import { propertyData } from "@/lib/propertyData";

export function Footer() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="contact" className="bg-charcoal text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="font-serif text-2xl font-semibold mb-2">
              {propertyData.name}
            </h3>
            <p className="text-primary-foreground/60 italic mb-4">
              {propertyData.tagline}
            </p>
            <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-md">
              Experience the warmth of Coorgi hospitality in our 80-year heritage estate. 
              Where every sunrise brings new adventures and every sunset invites peaceful reflection.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a
                href={`https://instagram.com/${propertyData.contact.social.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={`https://facebook.com/${propertyData.contact.social.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
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
              <li>
                <a
                  href={`tel:${propertyData.contact.phone}`}
                  className="flex items-start gap-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                >
                  <Phone className="w-4 h-4 mt-0.5" />
                  {propertyData.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${propertyData.contact.email}`}
                  className="flex items-start gap-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                >
                  <Mail className="w-4 h-4 mt-0.5" />
                  {propertyData.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/70 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{propertyData.contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-4 py-8 border-t border-primary-foreground/10">
          {propertyData.badges.map((badge) => (
            <div
              key={badge.name}
              className="px-4 py-2 bg-primary-foreground/5 rounded-full text-xs text-primary-foreground/60"
            >
              {badge.name}
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} {propertyData.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
