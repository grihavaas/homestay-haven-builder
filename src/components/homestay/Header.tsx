import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/contexts/PropertyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEditMode } from "@/contexts/EditModeContext";

const navLinks = [
  { name: "Home", href: "#hero" },
  { name: "Rooms", href: "#rooms" },
  { name: "Amenities", href: "#amenities" },
  { name: "Gallery", href: "#gallery" },
  { name: "Reviews", href: "#reviews" },
  { name: "Contact", href: "#contact" },
];

export function Header() {
  const { property, loading } = useProperty();
  const { user } = useAuth();
  const { canEdit, toggleEditMode } = useEditMode();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading || !property) {
    return null; // Or a loading skeleton
  }

  const handleManageClick = () => {
    if (user && canEdit) {
      toggleEditMode();
    } else {
      window.location.href = "/admin/login";
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-soft"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span
                className={`font-serif text-xl md:text-2xl font-semibold transition-colors ${
                  isScrolled ? "text-foreground" : "text-primary-foreground"
                }`}
              >
                {property.name}
              </span>
              <span
                className={`text-xs tracking-wider uppercase transition-colors ${
                  isScrolled ? "text-muted-foreground" : "text-primary-foreground/80"
                }`}
              >
                {property.tagline || ""}
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => scrollToSection(link.href)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isScrolled ? "text-foreground" : "text-primary-foreground"
                  }`}
                >
                  {link.name}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                onClick={handleManageClick}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isScrolled ? "text-foreground" : "text-primary-foreground"
                }`}
              >
                Manage
              </motion.button>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              {property.phone && (
                <a
                  href={`tel:${property.phone}`}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    isScrolled ? "text-muted-foreground" : "text-primary-foreground/80"
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden xl:inline">{property.phone}</span>
                </a>
              )}
              <Button
                variant={isScrolled ? "warm" : "heroOutline"}
                size="sm"
                onClick={() => scrollToSection("#booking")}
              >
                Book Now
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className={`w-6 h-6 ${isScrolled ? "text-foreground" : "text-primary-foreground"}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isScrolled ? "text-foreground" : "text-primary-foreground"}`} />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-20"
          >
            <nav className="container mx-auto px-4 py-8">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="text-xl font-serif text-foreground py-3 border-b border-border"
                  >
                    {link.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleManageClick();
                  }}
                  className="text-xl font-serif text-foreground py-3 border-b border-border"
                >
                  Manage
                </button>
                <div className="mt-6 flex flex-col gap-4">
                  {property.phone && (
                    <a
                      href={`tel:${property.phone}`}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <Phone className="w-5 h-5" />
                      {property.phone}
                    </a>
                  )}
                  {property.email && (
                    <a
                      href={`mailto:${property.email}`}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <Mail className="w-5 h-5" />
                      {property.email}
                    </a>
                  )}
                  <Button
                    variant="warm"
                    size="lg"
                    onClick={() => scrollToSection("#booking")}
                    className="mt-4"
                  >
                    Book Your Stay
                  </Button>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
