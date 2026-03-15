import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { normalizeHostname, isAdminHost } from "@/lib/tenant";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const hostname = normalizeHostname(headersList.get("host"));

  if (!hostname || isAdminHost(hostname)) return [];

  return [
    {
      url: `https://${hostname}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
