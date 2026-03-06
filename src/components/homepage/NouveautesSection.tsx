'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
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

  if (products.length < 3) {
    return (
      <section className="pt-8 pb-8 lg:pt-24 lg:pb-20 bg-[#F5F5F5]">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
          <h2 className="text-xl lg:text-4xl font-black uppercase tracking-normal mb-6">
            NOUVEAUTÉS
          </h2>
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-[#6B7280] text-sm">Nouvelles références bientôt disponibles.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="pt-8 pb-8 lg:pt-24 lg:pb-20 bg-[#F5F5F5]">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between gap-4 mb-5 lg:mb-8"
        >
          <h2 className="text-xl lg:text-4xl font-black uppercase tracking-normal">
            NOUVEAUTÉS
          </h2>
          <Link
            href="/collections/all"
            className="text-[12px] lg:text-[13px] font-semibold text-[#DB021D] hover:text-[#B8011A] transition-colors flex items-center gap-0.5 shrink-0"
          >
            Tout voir
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </motion.div>

        <div className="relative group/carousel">
          <button
            onClick={() => scrollCarousel('left')}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-premium border border-gray-100 text-gray-700 hover:text-[#DB021D] hover:scale-110 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300"
            aria-label="Faire défiler vers la gauche"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <motion.div
            ref={carouselRef}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 -mx-5 px-5 lg:mx-0 lg:px-0 lg:pb-2 scroll-smooth md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5"
          >
            {products.map((product) => (
              <div key={product.id} className="snap-start shrink-0 w-[44vw] min-w-[168px] max-w-[220px] md:w-auto md:max-w-none">
                <ProductCard
                  key={product.id}
                  product={product}
                  size="large"
                  addingId={addingId}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </motion.div>

          <button
            onClick={() => scrollCarousel('right')}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-premium border border-gray-100 text-gray-700 hover:text-[#DB021D] hover:scale-110 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300"
            aria-label="Faire défiler vers la droite"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
