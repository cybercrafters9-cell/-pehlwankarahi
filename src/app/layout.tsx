import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pehalwan Karahi & DeraGhar — Authentic Pakistani Karahi, Bar B Q & Desi Cuisine",
  description:
    "Asli Peshawari Shinwari Karahi, smoky Charcoal Seekh Kebabs, and Matka Dum Biryani crafted with 100% pure desi ghee and hand-roasted spices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-sand-100 text-charcoal-900 selection:bg-terracotta-500 selection:text-white relative">
        {/* Subtle Ambient Paper Texture Overlay */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03] z-50"
          style={{
            backgroundImage: "radial-gradient(#161514 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {children}
      </body>
    </html>
  );
}
