import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed, Oswald } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  metadataBase: new URL('https://felten.shop'),
  title: {
    default: 'Felten Shop — Revendeur Autorisé Milwaukee | Outillage Professionnel Luxembourg',
    template: '%s | Felten Shop',
  },
  description: 'Revendeur autorisé Milwaukee au Luxembourg. Outillage professionnel, garantie 3 ans, SAV collecte & retour, livraison rapide. Perceuses, visseuses, meuleuses, batteries M12/M18/MX FUEL.',
  keywords: ['Milwaukee', 'outillage professionnel', 'Luxembourg', 'revendeur autorisé Milwaukee', 'M18', 'M12', 'MX FUEL', 'FUEL', 'Felten', 'outils Milwaukee Luxembourg', 'perceuse Milwaukee', 'batterie Milwaukee'],
  openGraph: {
    type: 'website',
    locale: 'fr_LU',
    siteName: 'Felten Shop',
    title: 'Felten Shop — Revendeur Autorisé Milwaukee Luxembourg',
    description: 'Revendeur autorisé Milwaukee au Luxembourg. Outillage professionnel, garantie 3 ans, SAV collecte & retour.',
    url: 'https://felten.shop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Felten Shop — Revendeur Autorisé Milwaukee Luxembourg',
    description: 'Revendeur autorisé Milwaukee au Luxembourg. Outillage professionnel, garantie 3 ans.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://felten.shop',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${barlowCondensed.variable} ${oswald.variable} font-sans antialiased bg-white text-[#1A1A1A]`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'Felten Shop',
              description: 'Revendeur autorisé Milwaukee au Luxembourg. Outillage professionnel, garantie 3 ans, SAV collecte & retour.',
              url: 'https://felten.shop',
              telephone: '+352621304952',
              email: 'florian@felten.lu',
              brand: {
                '@type': 'Brand',
                name: 'Milwaukee',
              },
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'LU',
                addressLocality: 'Luxembourg',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 49.6117,
                longitude: 6.1300,
              },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '08:00',
                closes: '18:00',
              },
              priceRange: '€€',
              currenciesAccepted: 'EUR',
              paymentAccepted: 'Cash, Credit Card, Bank Transfer',
              areaServed: [
                { '@type': 'Country', name: 'Luxembourg' },
                { '@type': 'Country', name: 'Belgium' },
                { '@type': 'Country', name: 'France' },
                { '@type': 'Country', name: 'Germany' },
              ],
              sameAs: [
                'https://www.instagram.com/feltenshop/',
                'https://felten.lu',
              ],
            }),
          }}
        />
        <div data-vaul-drawer-wrapper="" className="bg-white min-h-screen">
          <Providers>
            {children}
          </Providers>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
