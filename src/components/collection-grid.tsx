'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/shopify/types';
import { ProductCard } from './product-card';

interface CollectionGridProps {
  products: Product[];
  collectionTitle: string;
}

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'newest';

export function CollectionGrid({ products }: CollectionGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  // Sort products
  const sortedProducts = useMemo(() => {
    const result = [...products];

    switch (sortBy) {
      case 'price-asc':
        result.sort(
          (a, b) =>
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0')
        );
        break;
      case 'price-desc':
        result.sort(
          (a, b) =>
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0')
        );
        break;
      default:
        break;
    }

    return result;
  }, [products, sortBy]);

  return (
    <>
      {/* USP Bar */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <svg className="w-4 h-4 fill-[#DB021D]" viewBox="0 0 24 24">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z" />
              </svg>
              <span className="text-[#0A0A0A]">Expédié sous 24h</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <svg className="w-4 h-4 fill-[#DB021D]" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
              <span className="text-[#0A0A0A]">Distributeur Autorisé</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <svg className="w-4 h-4 fill-[#DB021D]" viewBox="0 0 24 24">
                <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
              </svg>
              <span className="text-[#0A0A0A]">SAV Inclus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sort Bar */}
      <div className="sticky top-20 bg-white border-b border-[#E5E5E5] z-20">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#71717A]">
              <span className="font-semibold text-[#0A0A0A]">{sortedProducts.length}</span> produit{sortedProducts.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#71717A] hidden sm:inline">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-[#F4F4F5] border-none rounded-lg px-3 py-2 text-sm text-[#0A0A0A] cursor-pointer focus:ring-2 focus:ring-[#DB021D] focus:outline-none"
              >
                <option value="popular">Popularité</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="newest">Nouveautés</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {sortedProducts.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={idx}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#71717A]">Aucun produit trouvé</p>
          </div>
        )}
      </div>

    </>
  );
}
