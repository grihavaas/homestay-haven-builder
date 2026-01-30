import type { Metadata } from "next";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";
import { normalizeHostname, isAdminHost } from "@/lib/tenant";
import { fetchPropertyMetadataByHostname } from "@/lib/propertyQueries";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host");
  const hostname = normalizeHostname(host);

  if (isAdminHost(hostname)) {
    return {
      title: "Homestay CMS",
      description: "Manage your homestay property and content.",
    };
  }

  const meta = hostname ? await fetchPropertyMetadataByHostname(hostname) : null;
  if (meta) {
    const title = meta.tagline ? `${meta.name} | ${meta.tagline}` : meta.name;
    const description = meta.description
      ? meta.description.substring(0, 160)
      : "Book your stay at " + meta.name;
    return {
      title,
      description,
      openGraph: {
        title: meta.name,
        description: meta.description?.substring(0, 160) ?? description,
      },
    };
  }

  return {
    title: "Homestay",
    description: "Experience authentic hospitality",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className="antialiased bg-white text-zinc-900">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
