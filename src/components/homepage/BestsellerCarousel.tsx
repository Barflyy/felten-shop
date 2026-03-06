'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

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
    <section ref={sectionRef} className="pt-8 pb-8 lg:pt-24 lg:pb-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between gap-4 mb-5 lg:mb-8"
        >
          <h2 className="text-xl lg:text-4xl font-black uppercase tracking-normal">
            NOS BESTSELLERS
          </h2>
          <Link
            href="/collections/all"
            className="text-[12px] lg:text-[13px] font-semibold text-[#DB021D] hover:text-[#B8011A] transition-colors flex items-center gap-0.5 shrink-0"
          >
            Tout voir
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center gap-1 overflow-x-auto no-scrollbar mb-5 lg:mb-8 p-1 bg-[#F4F4F5] rounded-xl w-max max-w-full"
        >
          {BESTSELLER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-3 lg:px-4 py-2 min-h-[36px] rounded-lg text-[12px] lg:text-[13px] font-bold tracking-wide transition-colors duration-200 whitespace-nowrap cursor-pointer select-none ${isActive ? 'text-[#1A1A1A]' : 'text-[#71717A] hover:text-[#1A1A1A]'}`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="bestseller-active-tab"
                    className="absolute inset-0 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-black/[0.04]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Products */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {filteredProducts.length > 0 ? (
              <div className="relative group/carousel">
                {/* Left arrow */}
                <button
                  onClick={() => scrollCarousel('left')}
                  className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-premium border border-gray-100 text-gray-700 hover:text-[#DB021D] hover:scale-110 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300"
                  aria-label="Faire défiler vers la gauche"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                </button>

                <div
                  ref={carouselRef}
                  className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 -mx-5 px-5 lg:mx-0 lg:px-0 lg:pb-2 scroll-smooth"
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

                {/* Right arrow */}
                <button
                  onClick={() => scrollCarousel('right')}
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-premium border border-gray-100 text-gray-700 hover:text-[#DB021D] hover:scale-110 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300"
                  aria-label="Faire défiler vers la droite"
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-[#6B7280] text-sm">Aucun produit dans cette catégorie.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
