import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily disable Turbopack if experiencing crashes
  // Remove this if Turbopack works fine
  // experimental: {
  //   turbo: false,
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
