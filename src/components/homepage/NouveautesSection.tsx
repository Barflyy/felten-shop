'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
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
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  if (products.length < 3) {
    return (
      <section className="pt-14 pb-12 lg:pt-24 lg:pb-20 bg-[#F5F5F5]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <h2 className="text-[1.75rem] lg:text-4xl font-black uppercase tracking-normal mb-8">
            NOUVEAUTÉS
          </h2>
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-[#6B7280]">Nouvelles références bientôt disponibles.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="pt-14 pb-12 lg:pt-24 lg:pb-20 bg-[#F5F5F5]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <h2 className="text-[1.75rem] lg:text-4xl font-black uppercase tracking-normal">
            NOUVEAUTÉS
          </h2>
          <Link
            href="/collections"
            className="text-[13px] font-semibold text-[#DB021D] hover:text-[#B8011A] transition-colors flex items-center gap-1"
          >
            Voir tout
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 md:grid md:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              badge="nouveau"
              size="large"
              addingId={addingId}
              onAddToCart={onAddToCart}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
