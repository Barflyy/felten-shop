'use client';

import { useRef } from 'react';
import { Product } from '@/lib/shopify/types';
import { ProductCardMini } from '@/components/product-card-mini';

export function CrossSellSection({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 lg:px-8 py-10 lg:py-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 lg:mb-6">
        <h2 className="text-[16px] lg:text-[20px] font-bold text-[#1A1A1A]">
          Complétez votre équipement
        </h2>

      </div>

      {/* Cards — grid on desktop, horizontal scroll on mobile */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-x-visible lg:snap-none"
      >
        {products.slice(0, 5).map((product) => (
          <div
            key={product.id}
            className="snap-start w-[200px] sm:w-[220px] lg:w-auto flex-shrink-0 lg:flex-shrink flex"
          >
            <ProductCardMini product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
