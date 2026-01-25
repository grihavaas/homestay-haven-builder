import { useEffect } from "react";
import { useProperty } from "@/contexts/PropertyContext";

export function DocumentHead() {
  const { property, loading } = useProperty();

  useEffect(() => {
    if (!loading && property) {
      // Update document title
      document.title = property.name || "Homestay";
    } else if (!loading && !property) {
      document.title = "Homestay";
    }

    // Update favicon dynamically to ensure it's loaded
    const updateFavicon = () => {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach(link => link.remove());

      // Add new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = '/favicon.svg?v=' + Date.now(); // Cache bust
      document.head.appendChild(link);
    };

    updateFavicon();
  }, [property, loading]);

  return null; // This component doesn't render anything
}
