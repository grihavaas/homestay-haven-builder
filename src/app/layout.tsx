import type { Metadata } from "next";
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
      </body>
    </html>
  );
}
