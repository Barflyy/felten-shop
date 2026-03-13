'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/cart-context';
import HomepageHeader from '@/components/homepage/HomepageHeader';
import MobileMenu from '@/components/mobile/MobileMenu';
import SearchOverlay from '@/components/homepage/SearchOverlay';
import { useSearchOverlay } from '@/components/homepage/hooks/useSearchOverlay';

export default function SiteHeader() {
  const { cart, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHeaderScrolled((prev) => {
        if (!prev && y > 80) return true;
        if (prev && y < 40) return false;
        return prev;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
