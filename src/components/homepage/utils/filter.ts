import type { Product } from '@/lib/shopify/types';
import type { TabKey } from '../data/types';

function getSystemPriority(p: Product): number {
  const t = p.title.toLowerCase();
  const tags = (p.tags || []).map(tag => tag.toLowerCase());
  const isMx = t.includes('mx fuel') || t.includes('mxfuel');
  const isM18 = t.includes('m18') || tags.includes('m18');
  const isM12 = t.includes('m12') || tags.includes('m12');
  const hasFuel = t.includes('fuel') || tags.includes('fuel');

  // Prioritize accessible price points first (M12 → M18 → MX FUEL)
  if (isM12 && hasFuel) return 0;
  if (isM12) return 1;
  if (isM18 && hasFuel) return 2;
  if (isM18) return 3;
  if (isMx) return 5;
  return 4;
}

function getPriceSortValue(p: Product): number {
  const price = parseFloat(p.priceRange?.minVariantPrice?.amount || '0');
  return price;
}

export function filterProducts(products: Product[], tab: TabKey): Product[] {
  if (tab === 'tous') {
    return [...products].sort((a, b) => {
      const prioDiff = getSystemPriority(a) - getSystemPriority(b);
      if (prioDiff !== 0) return prioDiff;
      // Within same priority, show affordable products first
      return getPriceSortValue(a) - getPriceSortValue(b);
    });
  }

  // Extended keywords to match more Milwaukee tools
  const keywords: Record<Exclude<TabKey, 'tous'>, string[]> = {
    perceuses: ['perceuse', 'visseuse', 'perforateur', 'carotteuse', 'fraiseuse', 'perçage'],
    scies: ['scie', 'tronconneuse', 'decoupeuse', 'multi-tool', 'multitools', 'sciage'],
    meuleuses: ['meuleuse', 'polisseuse', 'ponceuse', 'meulage'],
    batteries: ['batterie', 'chargeur', 'pack nrg', 'm18b', 'm18hb', 'm12b', 'energie'],
  };

  const terms = keywords[tab];

  const filtered = products.filter((p) => {
    const textToSearch = [
      p.title,
      p.productType,
      ...(p.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();

    const normalizedText = textToSearch.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return terms.some((t) => {
      const normalizedTerm = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedText.includes(normalizedTerm);
    });
  });

  return filtered.sort((a, b) => {
    const prioDiff = getSystemPriority(a) - getSystemPriority(b);
    if (prioDiff !== 0) return prioDiff;
    return getPriceSortValue(a) - getPriceSortValue(b);
  });
}
