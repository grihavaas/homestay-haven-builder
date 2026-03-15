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
        const desc = property.description;
        const truncated = desc.length <= 160 ? desc : desc.substring(0, desc.lastIndexOf(' ', 160)) + '…';
        metaDescription.setAttribute('content', truncated);
      }

      // Update OG tags if present
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', property.name);

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription && property.description) {
        const desc = property.description;
        const truncated = desc.length <= 160 ? desc : desc.substring(0, desc.lastIndexOf(' ', 160)) + '…';
        ogDescription.setAttribute('content', truncated);
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
