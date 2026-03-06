import type { Product } from '@/lib/shopify/types';
import type { TabKey } from '../data/types';

export function filterProducts(products: Product[], tab: TabKey): Product[] {
  if (tab === 'tous') return products;
  const keywords: Record<Exclude<TabKey, 'tous'>, string[]> = {
    perceuses: ['perceuse', 'perforateur'],
    visseuses: ['visseuse', 'boulonneuse'],
    meuleuses: ['meuleuse'],
    batteries: ['batterie', 'chargeur'],
  };
  const terms = keywords[tab];
  return products.filter((p) => {
    const text = `${p.title} ${p.productType || ''}`.toLowerCase();
    return terms.some((t) => text.includes(t));
  });
}
