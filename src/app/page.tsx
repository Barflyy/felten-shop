import type { Metadata } from 'next'
import { HomePage } from '@/components/homepage';
import { getCollectionProducts } from '@/lib/shopify';
import type { Product } from '@/lib/shopify/types';

export const metadata: Metadata = {
  title: 'Felten Shop — Revendeur Autorisé Milwaukee au Luxembourg | Outillage Pro',
  description: 'Votre revendeur autorisé Milwaukee au Luxembourg. Gammes M12, M18 et MX FUEL. Perceuses, visseuses, meuleuses, batteries. Garantie 3 ans, SAV local, livraison rapide.',
  alternates: {
    canonical: 'https://felten.shop',
  },
  openGraph: {
    title: 'Felten Shop — Revendeur Autorisé Milwaukee au Luxembourg',
    description: 'Outillage professionnel Milwaukee. Gammes M12, M18 et MX FUEL. Garantie 3 ans, SAV local.',
    url: 'https://felten.shop',
    type: 'website',
  },
}

export default async function Home() {
  const [percage, scies, meuleuses, batteries] = await Promise.all([
    getCollectionProducts({ collection: 'percage-et-burinage', first: 8 }),
    getCollectionProducts({ collection: 'sciage-et-decoupage', first: 8 }),
    getCollectionProducts({ collection: 'meuleuses-et-polisseuses', first: 8 }),
    getCollectionProducts({ collection: 'batteries-chargeurs-et-generateurs', first: 8 }),
  ]);

  // Merge and deduplicate to ensure all filter tabs have products
  const seen = new Set<string>();
  const products: Product[] = [];
  for (const p of [...percage, ...scies, ...meuleuses, ...batteries]) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      products.push(p);
    }
  }

  return <HomePage products={products} />;
}
