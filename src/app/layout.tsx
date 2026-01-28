import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Book your perfect getaway",
};

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
