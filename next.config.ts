import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: '/connexion', destination: '/compte/connexion', permanent: true },
      { source: '/inscription', destination: '/compte/inscription', permanent: true },
      { source: '/mot-de-passe-oublie', destination: '/compte/connexion', permanent: true },
      { source: '/politique-confidentialite', destination: '/politique-de-confidentialite', permanent: true },
      { source: '/politique-retour', destination: '/politique-de-retour', permanent: true },
      { source: '/catalogue/:handle', destination: '/collections/:handle', permanent: true },
      { source: '/account', destination: '/compte', permanent: true },
      { source: '/account/:path*', destination: '/compte', permanent: true },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'static.milwaukeetool.eu',
      },
    ],
  },
};

export default nextConfig;
