import type { Product } from '@/lib/shopify/types';
import type { TabKey } from '../data/types';

export function filterProducts(products: Product[], tab: TabKey): Product[] {
  if (tab === 'tous') return products;

  // Extended keywords to match more Milwaukee tools
  const keywords: Record<Exclude<TabKey, 'tous'>, string[]> = {
    perceuses: ['perceuse', 'visseuse', 'perforateur', 'carotteuse', 'fraiseuse', 'perçage'],
    scies: ['scie', 'tronconneuse', 'decoupeuse', 'multi-tool', 'multitools', 'sciage'],
    meuleuses: ['meuleuse', 'polisseuse', 'ponceuse', 'meulage'],
    batteries: ['batterie', 'chargeur', 'pack nrg', 'm18b', 'm18hb', 'm12b', 'energie'],
  };

  const terms = keywords[tab];

  return products.filter((p) => {
    // Combine all relevant searchable fields
    const textToSearch = [
      p.title,
      p.productType,
      ...(p.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();

    // Normalize text to remove accents (e.g. "perceuse" matches "perçage", "meuleuse" matches "découpeuse")
    const normalizedText = textToSearch.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return terms.some((t) => {
      const normalizedTerm = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedText.includes(normalizedTerm);
    });
  });
}
