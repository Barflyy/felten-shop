'use client';

import { useState, useEffect, useCallback } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { useCart } from '@/context/cart-context';
import HomepageHeader from '@/components/homepage/HomepageHeader';
import MobileMenu from '@/components/mobile/MobileMenu';
import SearchOverlay from '@/components/homepage/SearchOverlay';
import { useSearchOverlay } from '@/components/homepage/hooks/useSearchOverlay';

export default function SiteHeader() {
  const { cart, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setHeaderScrolled(latest > 80);
  });

  const {
    searchOpen,
    searchQuery,
    searchResults,
    isSearching,
    setSearchQuery,
    openSearch,
    closeSearch,
  } = useSearchOverlay();

  const cartCount =
    cart?.lines?.edges?.reduce((sum, { node }) => sum + node.quantity, 0) ?? 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <HomepageHeader
        cartCount={cartCount}
        headerScrolled={headerScrolled}
        placeholderIdx={placeholderIdx}
        onOpenMenu={() => setMobileMenuOpen(true)}
        onOpenSearch={openSearch}
        onOpenCart={openCart}
      />

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <SearchOverlay
        isOpen={searchOpen}
        searchQuery={searchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        onClose={closeSearch}
        onQueryChange={setSearchQuery}
      />
    </>
  );
}
