import { NextResponse } from "next/server";

export async function GET() {
  const isProduction = process.env.VERCEL_ENV === "production";

  const robotsTxt = isProduction
    ? `# Production - Allow indexing
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /
`
    : `# Preview/Development - Disallow indexing
User-agent: *
Disallow: /
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
