import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChromeGate from "@/components/ChromeGate";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "HeyNovelWorld — Read Novels Free",
    template: "%s · HeyNovelWorld",
  },
  description:
    "Discover beautiful stories, unforgettable characters and endless adventures. Read your favorite novels for FREE on HeyNovelWorld.",
};

export const viewport: Viewport = { themeColor: "#080B0B" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,500&display=swap"
        />
      </head>
      <body className="min-h-screen bg-ink text-white antialiased">
        <Navbar user={user ? { name: user.name, role: user.role } : null} />
        <main className="min-h-[70vh]">{children}</main>
        <ChromeGate>
          <Footer />
        </ChromeGate>
      </body>
    </html>
  );
}
