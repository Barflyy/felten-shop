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
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    // Hysteresis: scroll down past 80 to collapse, scroll back up past 40 to expand
    // Prevents flickering when scroll position hovers around the threshold
    setHeaderScrolled((prev) => {
      if (!prev && latest > 80) return true;
      if (prev && latest < 40) return false;
      return prev;
    });
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

  return (
    <>
      <HomepageHeader
        cartCount={cartCount}
        headerScrolled={headerScrolled}
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
