'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import type { Product } from '@/lib/shopify/types';
import ProductCard from './ProductCard';

interface NouveautesSectionProps {
  products: Product[];
  addingId: string | null;
  onAddToCart: (variantId: string, productId: string) => void;
}

export default function NouveautesSection({
  products,
  addingId,
  onAddToCart,
}: NouveautesSectionProps) {
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

  if (products.length < 3) {
    return (
      <section className="py-8 lg:py-16 bg-[#F5F5F5]">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
          <h2 className="text-[18px] lg:text-[26px] font-bold text-[#1A1A1A] mb-6">
            Nouveautés
          </h2>
          <div className="text-center py-12">
            <Package className="w-8 h-8 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[#6B7280] text-[13px]">Nouvelles références bientôt disponibles.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 lg:py-16 bg-[#F5F5F5]">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-5 lg:mb-8">
          <h2 className="text-[18px] lg:text-[26px] font-bold text-[#1A1A1A]">
            Nouveautés
          </h2>
          <Link
            href="/collections/all"
            className="text-[12px] lg:text-[13px] font-medium text-[#DB021D] hover:text-[#B8011A] transition-colors flex items-center gap-0.5 shrink-0"
          >
            Tout voir
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>

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
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 -mx-5 px-5 lg:mx-0 lg:px-0 scroll-smooth md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4"
          >
            {products.map((product) => (
              <div key={product.id} className="snap-start shrink-0 w-[44vw] min-w-[168px] max-w-[220px] md:w-auto md:max-w-none">
                <ProductCard
                  product={product}
                  size="large"
                  addingId={addingId}
                  onAddToCart={onAddToCart}
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
      </div>
    </section>
  );
}
