'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/shopify/types';
import { ProductCardMini } from '@/components/product-card-mini';

export function CrossSellSection({ products }: { products: Product[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -300 : 300,
      behavior: 'smooth',
    });
  };

  return (
    <section
      ref={sectionRef}
      className="max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 lg:px-8 xl:px-12 py-12 lg:py-16"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-lg lg:text-2xl font-black text-[#1A1A1A] uppercase tracking-tight"
          style={{ fontFamily: 'var(--font-oswald)' }}
        >
          Complétez votre équipement
        </motion.h2>

        {/* Arrows — desktop only */}
        <div className="hidden lg:flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors"
            aria-label="Précédent"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-500" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors"
            aria-label="Suivant"
          >
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Cards */}
      <motion.div
        ref={scrollRef}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0"
      >
        {products.slice(0, 5).map((product, i) => (
          <div
            key={product.id}
            className="snap-start w-[220px] sm:w-[240px] lg:w-[260px] flex-shrink-0"
          >
            <ProductCardMini product={product} />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
