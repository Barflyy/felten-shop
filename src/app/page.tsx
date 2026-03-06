import { HomePage } from '@/components/homepage';
import { getCollectionProducts } from '@/lib/shopify';
import type { Product } from '@/lib/shopify/types';

export default async function Home() {
  const [percage, scies, meuleuses, batteries] = await Promise.all([
    getCollectionProducts({ collection: 'percage-et-burinage' }),
    getCollectionProducts({ collection: 'sciage-et-decoupage' }),
    getCollectionProducts({ collection: 'meuleuses-et-polisseuses' }),
    getCollectionProducts({ collection: 'batteries-chargeurs-et-generateurs' }),
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
