import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Homestay Haven Builder",
  description: "Beautiful homestay website builder",
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
      </body>
    </html>
  );
}
