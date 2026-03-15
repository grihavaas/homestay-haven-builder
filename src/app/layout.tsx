import type { Metadata } from "next";
import { cache } from "react";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";
import { normalizeHostname, isAdminHost } from "@/lib/tenant";
import { fetchPropertyMetadataByHostname } from "@/lib/propertyQueries";
import "./globals.css";

// Deduplicate the DB call across generateMetadata and RootLayout in the same request
const getPropertyMeta = cache(async (hostname: string) =>
  fetchPropertyMetadataByHostname(hostname)
);

function truncateDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  return text.substring(0, text.lastIndexOf(" ", max)) + "…";
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = normalizeHostname(headersList.get("host"));

  if (isAdminHost(hostname)) {
    return {
      title: "Homestay CMS",
      description: "Manage your homestay property and content.",
      icons: { icon: "/favicon.svg" },
    };
  }

  const meta = hostname ? await getPropertyMeta(hostname) : null;
  if (meta) {
    const title = meta.meta_title
      ? meta.meta_title
      : meta.tagline
        ? `${meta.name} | ${meta.tagline}`
        : meta.name;
    const description = meta.meta_description
      ? truncateDescription(meta.meta_description)
      : meta.description
        ? truncateDescription(meta.description)
        : `Book your stay at ${meta.name}`;
    const ogTitle = meta.og_title ?? meta.name;
    const ogDescription = meta.og_description
      ? truncateDescription(meta.og_description)
      : description;
    const ogImage = meta.og_image_url;
    const canonicalUrl = `https://${hostname}/`;

    return {
      title,
      description,
      icons: { icon: "/favicon.svg" },
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        type: "website",
        url: canonicalUrl,
        ...(ogImage && {
          images: [{ url: ogImage, width: 1200, height: 630, alt: meta.name }],
        }),
      },
      twitter: {
        card: "summary_large_image",
        title: ogTitle,
        description: ogDescription,
        ...(ogImage && { images: [ogImage] }),
      },
    };
  }

  return {
    title: "Homestay",
    description: "Experience authentic hospitality",
    icons: { icon: "/favicon.svg" },
  };
}

function buildJsonLd(
  meta: NonNullable<Awaited<ReturnType<typeof getPropertyMeta>>>,
  hostname: string
) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: meta.name,
    url: `https://${hostname}/`,
    ...(meta.description && { description: meta.description }),
    ...(meta.og_image_url && { image: meta.og_image_url }),
    address: {
      "@type": "PostalAddress",
      ...(meta.street_address && { streetAddress: meta.street_address }),
      ...(meta.city && { addressLocality: meta.city }),
      ...(meta.state && { addressRegion: meta.state }),
      ...(meta.postal_code && { postalCode: meta.postal_code }),
      addressCountry: meta.country,
    },
    ...(meta.latitude != null &&
      meta.longitude != null && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: meta.latitude,
          longitude: meta.longitude,
        },
      }),
    ...(meta.classification && { starRating: { "@type": "Rating", ratingValue: meta.classification } }),
  };
  return JSON.stringify(schema);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const hostname = normalizeHostname(headersList.get("host"));
  const isAdmin = isAdminHost(hostname);
  const meta = !isAdmin && hostname ? await getPropertyMeta(hostname) : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {meta && hostname && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: buildJsonLd(meta, hostname) }}
          />
        )}
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
