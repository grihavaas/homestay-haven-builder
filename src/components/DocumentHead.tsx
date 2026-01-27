"use client";

import { useEffect } from "react";
import { useProperty } from "@/contexts/PropertyContext";

export function DocumentHead() {
  const { property, loading } = useProperty();

  useEffect(() => {
    if (!loading && property) {
      // Update document title
      const title = property.tagline
        ? `${property.name} | ${property.tagline}`
        : property.name;
      document.title = title || "Homestay";

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && property.description) {
        metaDescription.setAttribute('content', property.description.substring(0, 160));
      }

      // Update OG tags if present
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', property.name);

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription && property.description) {
        ogDescription.setAttribute('content', property.description.substring(0, 160));
      }
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
