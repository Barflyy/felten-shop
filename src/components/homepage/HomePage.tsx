'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Footer } from '@/components/footer';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/shopify/types';


import SiteHeader from '@/components/SiteHeader';
import HeroSection from './HeroSection';
import TrustMarquee from './TrustMarquee';
import EcosystemNav from './EcosystemNav';
import CategoryGrid from './CategoryGrid';
import BestsellerCarousel from './BestsellerCarousel';
import WhyFeltenSection from './WhyFeltenSection';

// Below-fold sections: lazy-loaded to reduce initial JS bundle
const NewsletterSection = dynamic(() => import('./NewsletterSection'), { ssr: true });
const ReviewSection = dynamic(() => import('./ReviewSection'), { ssr: true });

const FloatingBadge = dynamic(() => import('./FloatingBadge'), { ssr: false });

export default function HomePage({ products }: { products: Product[] }) {
  const [addingId, setAddingId] = useState<string | null>(null);
  const { addToCart } = useCart();


  const handleAddToCart = useCallback(
    async (variantId: string, productId: string) => {
      setAddingId(productId);
      await addToCart(variantId, 1);
      setAddingId(null);
    },
    [addToCart]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-[#DB021D] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
      >
        Aller au contenu principal
      </a>

      <SiteHeader />

      <main id="main-content">
        <HeroSection />
        <TrustMarquee />
        <EcosystemNav />
        <BestsellerCarousel
          products={products}
          addingId={addingId}
          onAddToCart={handleAddToCart}
        />
        <NewsletterSection />
        <WhyFeltenSection />
        <ReviewSection />
        <CategoryGrid />
      </main>

      <Footer />

      <FloatingBadge />

    </div>
  );
}
