"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemedContent } from "@/components/ThemedContent";
import { ThemeSelector } from "@/components/ThemeSelector";
import { getCurrentHostname } from "@/lib/hostname";
import { isAdminHost } from "@/lib/tenant";
import Link from "next/link";

function AdminLandingPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Homestay CMS Admin
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to the Homestay Content Management System
        </p>
        <div className="space-y-4">
          <Link
            href="/admin"
            className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
          >
            Go to Admin Dashboard
          </Link>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            This is the admin domain. Property websites are available on their custom domains.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const hostname = getCurrentHostname();
  const isAdmin = isAdminHost(hostname);

  // Show simple landing page for admin domain
  if (isAdmin) {
    return <AdminLandingPage />;
  }

  // Show property website for customer domains
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <ThemedContent />
        <ThemeSelector />
      </div>
    </ThemeProvider>
  );
}
