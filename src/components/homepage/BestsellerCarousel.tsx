'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import type { Product } from '@/lib/shopify/types';
import type { TabKey } from './data/types';
import { BESTSELLER_TABS } from './data/constants';
import { filterProducts } from './utils/filter';
import ProductCard from './ProductCard';

interface BestsellerCarouselProps {
  products: Product[];
  addingId: string | null;
  onAddToCart: (variantId: string, productId: string) => void;
}

export default function BestsellerCarousel({
  products,
  addingId,
  onAddToCart,
}: BestsellerCarouselProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('tous');
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.8;
      carouselRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const filteredProducts = useMemo(
    () => filterProducts(products, activeTab).slice(0, 8),
    [products, activeTab]
  );

  return (
    <section className="py-8 lg:py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-5 lg:mb-8">
          <h2 className="text-[18px] lg:text-[26px] font-bold text-[#1A1A1A]">
            Nos bestsellers
          </h2>
          <Link
            href="/collections/all"
            className="text-[12px] lg:text-[13px] font-medium text-[#DB021D] hover:text-[#B8011A] transition-colors flex items-center gap-0.5 shrink-0"
          >
            Tout voir
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-5 lg:mb-8 p-1 bg-[#F5F5F5] rounded-lg w-max max-w-full">
          {BESTSELLER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 lg:px-4 py-2 rounded-md text-[12px] lg:text-[13px] font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#1A1A1A] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#1A1A1A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Products */}
        {filteredProducts.length > 0 ? (
          <div className="relative group/carousel">
            <button
              onClick={() => scrollCarousel('left')}
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center bg-white rounded-full shadow-md border border-gray-100 text-[#6B7280] hover:text-[#1A1A1A] opacity-0 group-hover/carousel:opacity-100 transition-all"
              aria-label="Défiler à gauche"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            </button>

            <div
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth"
            >
              {filteredProducts.map((product, idx) => (
                <div key={product.id} className="snap-start shrink-0 w-[44vw] min-w-[168px] max-w-[220px] md:w-[260px] md:max-w-none">
                  <ProductCard
                    product={product}
                    addingId={addingId}
                    onAddToCart={onAddToCart}
                    priority={idx < 4}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollCarousel('right')}
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center bg-white rounded-full shadow-md border border-gray-100 text-[#6B7280] hover:text-[#1A1A1A] opacity-0 group-hover/carousel:opacity-100 transition-all"
              aria-label="Défiler à droite"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-8 h-8 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280] text-[13px]">Aucun produit dans cette catégorie.</p>
          </div>
        )}
      </div>
    </section>
  );
}
