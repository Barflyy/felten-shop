import { MetadataRoute } from 'next'
import { getAllProducts } from '@/lib/shopify'

const BASE_URL = 'https://felten.shop'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts()

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/produit/${product.handle}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/collections/outils-electroportatifs`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/collections/batteries-chargeurs-et-generateurs`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/collections/aspirateurs`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/collections/eclairage`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/collections/instruments-de-mesure`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/collections/epi-vetements`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/collections/exterieurs-et-espaces-verts`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/collections/assainissement-et-nettoyage`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Sub-collections
    {
      url: `${BASE_URL}/collections/percage-et-burinage`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/collections/vissage`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/collections/meuleuses-et-polisseuses`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/collections/sciage-et-decoupage`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/collections/perceuses-visseuses`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/collections/visseuses-a-chocs`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/collections/boulonneuses-a-chocs`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Institutional
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/livraison`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/garantie`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/a-propos`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/pourquoi-felten`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/configurateur-servante`,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Legal
    {
      url: `${BASE_URL}/mentions-legales`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/cgv`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/politique-de-confidentialite`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/politique-de-retour`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  return [...staticPages, ...productUrls]
}
