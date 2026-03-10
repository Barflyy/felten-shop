import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#DB021D',
};

export const metadata: Metadata = {
  title: "Felten Shop — Revendeur Agréé Milwaukee | Outillage Professionnel Belgique",
  description: "Revendeur agréé Milwaukee en Belgique. Garantie 3 ans, SAV collecte & retour, livraison 24h. Perceuses, visseuses, meuleuses, batteries M12/M18.",
  keywords: ["Milwaukee", "outillage", "professionnel", "M18", "M12", "FUEL", "Heavy Duty", "Felten", "Belgique", "revendeur agréé"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${barlowCondensed.variable} ${oswald.variable} font-sans antialiased bg-white text-[#1A1A1A]`}>
        <div data-vaul-drawer-wrapper="" className="bg-white min-h-screen">
          <Providers>
            {children}
          </Providers>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
