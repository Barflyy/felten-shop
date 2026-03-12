import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/compte/', '/panier', '/api/', '/password'],
      },
    ],
    sitemap: 'https://felten.shop/sitemap.xml',
  }
}
