'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const filteredProducts = useMemo(
    () => filterProducts(products, activeTab).slice(0, 8),
    [products, activeTab]
  );

  return (
    <section ref={sectionRef} className="pt-14 pb-12 lg:pt-24 lg:pb-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <h2 className="text-[1.75rem] lg:text-4xl font-black uppercase tracking-normal">
            NOS BESTSELLERS
          </h2>
          <Link
            href="/collections"
            className="text-[13px] font-semibold text-[#DB021D] hover:text-[#B8011A] transition-colors flex items-center gap-1"
          >
            Voir tout le catalogue
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </motion.div>

        {/* Filter tabs with animated indicator */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex gap-1 overflow-x-auto no-scrollbar mb-8 pb-1"
        >
          {BESTSELLER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-2.5 min-h-[40px] rounded-lg text-[12px] font-black uppercase tracking-wide transition-all duration-200 active:scale-[0.95] whitespace-nowrap cursor-pointer ${activeTab === tab.key
                  ? 'text-white'
                  : 'bg-[#F5F5F5] text-[#6B7280] hover:text-[#1A1A1A]'
                }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-[#1A1A1A] rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
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
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 md:grid md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    addingId={addingId}
                    onAddToCart={onAddToCart}
                    priority={idx < 4}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-[#6B7280]">Aucun produit dans cette catégorie.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
