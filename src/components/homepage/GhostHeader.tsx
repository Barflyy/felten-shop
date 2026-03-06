'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Phone, Menu as MenuIcon, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, MenuItem } from '@/lib/shopify/types';
import { normalizeUrl } from '@/lib/shopify/menu';
import { mainNavigation } from '@/lib/navigation';
import { useCart } from '@/context/cart-context';

import { MobileSearchDrawer } from '@/components/mobile/MobileSearchDrawer';
import MobileMenu from '@/components/mobile/MobileMenu';

interface GhostHeaderProps {
  menu: Menu | null;
  alwaysVisible?: boolean;
}

// Search result type
interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText: string | null };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
}

export function GhostHeader({ menu, alwaysVisible }: GhostHeaderProps) {
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use hardcoded navigation from our collection structure
  const navigation: MenuItem[] = mainNavigation;

  // Active sidebar category (for mega-menu panel)
  const [activeSidebarId, setActiveSidebarId] = useState<string>(navigation[0]?.id || '');

  // Scroll detection via Framer Motion
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 80);

    // Header hide/show logic (mobile only)
    const delta = latest - lastScrollYRef.current;
    if (!alwaysVisible && typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (latest < 10) {
        setHeaderVisible(true);
      } else if (delta > 3) {
        setHeaderVisible(false);
      } else if (delta < -3) {
        setHeaderVisible(true);
      }
    } else {
      setHeaderVisible(true);
    }
    lastScrollYRef.current = latest;
  });

  // Handle mouse enter with delay clear
  const handleMouseEnter = useCallback((categoryId: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoveredCategory(categoryId);
    setIsMenuOpen(true);
  }, []);

  // Handle mouse leave with 100ms delay
  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setIsMenuOpen(false);
      setActiveSidebarId(navigation[0]?.id || '');
    }, 100);
  }, [navigation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Instant search with debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.products || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 150);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        const dropdown = document.getElementById('search-results-dropdown');
        if (dropdown && !dropdown.contains(e.target as Node)) {
          setShowSearchResults(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mega menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

  return (
    <>
      {/* Fixed anchor with mobile hide/show */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: headerVisible ? 0 : -100 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Floating wrapper — shrinks on scroll */}
        <div
          className="mx-auto transition-all duration-500"
          style={{
            maxWidth: scrolled ? '900px' : '100%',
            paddingTop: scrolled ? '8px' : '0px',
            paddingLeft: scrolled ? '16px' : '0px',
            paddingRight: scrolled ? '16px' : '0px',
            transitionTimingFunction: EASE,
          }}
        >
          <header
            role="banner"
            aria-label="En-tête du site"
            className="transition-all duration-500 flex flex-col"
            style={{
              backgroundColor: scrolled || mobileMenuOpen ? 'rgba(255,255,255,0.92)' : 'transparent',
              backdropFilter: scrolled || mobileMenuOpen ? 'blur(20px)' : 'blur(0px)',
              WebkitBackdropFilter: scrolled || mobileMenuOpen ? 'blur(20px)' : 'blur(0px)',
              borderRadius: scrolled ? '16px' : '0px',
              boxShadow: scrolled
                ? '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)'
                : '0 0px 0px rgba(0,0,0,0)',
              transitionTimingFunction: EASE,
            }}
          >
            <div className="w-full max-w-[1400px] xl:max-w-[1600px] mx-auto px-5 lg:px-8 xl:px-12">
              {/* Main Header Row */}
              <div
                className="flex items-center justify-between transition-all duration-500"
                style={{
                  height: scrolled ? '52px' : '80px',
                  transitionTimingFunction: EASE,
                }}
              >
                {/* Mobile: Hamburger menu (left) */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden w-10 h-10 flex items-center justify-center -ml-1"
                  aria-label="Ouvrir le menu"
                >
                  <MenuIcon className="w-6 h-6 text-zinc-900" strokeWidth={1.5} />
                </button>

                {/* Mobile: Centered Logo */}
                <Link href="/" className="lg:hidden absolute left-1/2 -translate-x-1/2">
                  <span className="text-lg font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    <span className="text-[#DB021D]">FELTEN</span>
                    <span className="text-zinc-900"> SHOP</span>
                  </span>
                </Link>

                {/* Desktop: Left Logo + Categories */}
                <div className="hidden lg:flex items-center gap-5">
                  {/* Logo */}
                  <Link href="/" className="flex items-center">
                    <span className="text-2xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      <span className="text-[#DB021D]">FELTEN</span>
                      <span className="text-[#1A1A1A]"> SHOP</span>
                    </span>
                  </Link>

                  {/* Categories Button - Desktop */}
                  <div
                    className="relative hidden lg:flex items-center"
                    onMouseEnter={() => handleMouseEnter('all-categories')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-md transition-all duration-200 cursor-pointer ${
                        hoveredCategory === 'all-categories'
                          ? 'bg-[#DB021D] text-white'
                          : 'bg-zinc-100 text-[#1A1A1A] hover:bg-zinc-200'
                      }`}
                    >
                      <MenuIcon className="w-4 h-4" />
                      Catégories
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                        hoveredCategory === 'all-categories' ? 'rotate-180' : ''
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Center: Search Bar - Desktop only */}
                <div className="hidden lg:flex flex-1 max-w-xl mx-8">
                  <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                      placeholder="Rechercher un produit..."
                      className="w-full pl-11 pr-4 py-2.5 bg-zinc-100/80 border border-zinc-200/50 rounded-md text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#DB021D]/20 focus:bg-white focus:border-zinc-300 transition-all duration-300"
                    />

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                      {showSearchResults && (
                        <motion.div
                          id="search-results-dropdown"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-zinc-200 overflow-hidden z-50"
                        >
                          {isSearching ? (
                            <div className="p-4 text-center">
                              <div className="inline-block w-5 h-5 border-2 border-zinc-300 border-t-[#DB021D] rounded-full animate-spin" />
                            </div>
                          ) : searchResults.length > 0 ? (
                            <div className="max-h-[400px] overflow-y-auto">
                              {searchResults.map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/produit/${product.handle}`}
                                  onClick={() => {
                                    setShowSearchResults(false);
                                    setSearchQuery('');
                                  }}
                                  className="flex items-center gap-3 p-3 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0"
                                >
                                  {/* Product Image */}
                                  <div className="w-12 h-12 bg-zinc-100 rounded-md overflow-hidden flex-shrink-0">
                                    {product.featuredImage?.url ? (
                                      <Image
                                        src={product.featuredImage.url}
                                        alt={product.featuredImage.altText || product.title}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-contain"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Search className="w-4 h-4 text-zinc-300" />
                                      </div>
                                    )}
                                  </div>
                                  {/* Product Info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#1A1A1A] truncate">
                                      {product.title}
                                    </p>
                                    <p className="text-sm font-bold text-[#DB021D]">
                                      {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2).replace('.', ',')} €
                                    </p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                                </Link>
                              ))}
                              {/* View All Results */}
                              <Link
                                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                                onClick={() => {
                                  setShowSearchResults(false);
                                }}
                                className="flex items-center justify-center gap-2 p-3 bg-zinc-50 text-sm font-semibold text-[#DB021D] hover:bg-zinc-100 transition-colors"
                              >
                                Voir tous les résultats
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </div>
                          ) : (
                            <div className="p-4 text-center text-sm text-zinc-500">
                              Aucun produit trouvé pour &quot;{searchQuery}&quot;
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right Actions - Desktop */}
                <div className="hidden lg:flex items-center gap-6">
                  {/* Service Pro */}
                  <Link
                    href="/pages/contact"
                    className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A] hover:text-[#DB021D] transition-colors duration-300"
                  >
                    <Phone className="w-4 h-4" />
                    SERVICE PRO 24/7
                  </Link>

                  {/* Cart */}
                  <button
                    onClick={openCart}
                    className="relative p-2 -m-2 cursor-pointer"
                    aria-label="Ouvrir le panier"
                  >
                    <ShoppingBag className="w-6 h-6 text-[#1A1A1A]" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#DB021D] text-white text-[10px] font-bold flex items-center justify-center rounded-md">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </button>
                </div>

                {/* Mobile: Search + Cart (right) */}
                <div className="lg:hidden flex items-center gap-1">
                  <button
                    onClick={() => setMobileSearchOpen(true)}
                    className="w-10 h-10 flex items-center justify-center"
                    aria-label="Rechercher"
                  >
                    <Search className="w-6 h-6 text-zinc-900" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={openCart}
                    className="relative w-10 h-10 flex items-center justify-center -mr-1"
                    aria-label="Ouvrir le panier"
                  >
                    <ShoppingBag className="w-6 h-6 text-zinc-900" strokeWidth={1.5} />
                    {totalItems > 0 && (
                      <span className="absolute top-0.5 right-0.5 w-[18px] h-[18px] bg-[#DB021D] text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Mega Menu Dropdown Panel - Sidebar + Panel Layout */}
            <AnimatePresence>
              {hoveredCategory === 'all-categories' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-zinc-200 z-50 hidden lg:block"
                  onMouseEnter={() => handleMouseEnter('all-categories')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto flex min-h-[380px]">
                    {/* Sidebar */}
                    <div className="w-[260px] flex-shrink-0 bg-zinc-50 border-r border-zinc-200 py-3">
                      {navigation.map((category) => (
                        <button
                          key={category.id}
                          onMouseEnter={() => setActiveSidebarId(category.id)}
                          onClick={() => {
                            window.location.href = normalizeUrl(category.url);
                          }}
                          className={`w-full flex items-center justify-between px-5 py-3 text-left text-sm font-semibold transition-colors cursor-pointer ${
                            activeSidebarId === category.id
                              ? 'bg-white text-[#DB021D] border-r-2 border-[#DB021D]'
                              : 'text-[#1A1A1A] hover:bg-white/60'
                          }`}
                        >
                          {category.title}
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                            activeSidebarId === category.id ? 'text-[#DB021D]' : 'text-zinc-400'
                          }`} />
                        </button>
                      ))}
                    </div>

                    {/* Panel */}
                    <div className="flex-1 px-8 py-6 overflow-y-auto">
                      {navigation.map((category) => {
                        if (category.id !== activeSidebarId) return null;

                        return (
                          <div key={category.id}>
                            {/* Panel Header */}
                            <Link
                              href={normalizeUrl(category.url)}
                              className="flex items-center gap-2 mb-5 group"
                            >
                              <h3 className="text-base font-black text-[#1A1A1A] uppercase tracking-wide group-hover:text-[#DB021D] transition-colors">
                                {category.title}
                              </h3>
                              <ArrowRight className="w-4 h-4 text-[#DB021D] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </Link>

                            {/* Items in grid */}
                            <div className="grid grid-cols-3 gap-x-8 gap-y-1">
                              {category.items?.map((item) => (
                                <Link
                                  key={item.id}
                                  href={normalizeUrl(item.url)}
                                  className="flex items-center gap-2 py-1.5 text-sm text-zinc-600 hover:text-[#DB021D] transition-colors group"
                                >
                                  <span className="w-1 h-1 bg-zinc-300 rounded-full group-hover:bg-[#DB021D] transition-colors flex-shrink-0" />
                                  {item.title}
                                </Link>
                              ))}
                            </div>

                            {/* View all link */}
                            <Link
                              href={normalizeUrl(category.url)}
                              className="inline-flex items-center gap-1.5 mt-5 text-sm font-bold text-[#DB021D] hover:underline"
                            >
                              Tout voir {category.title}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <MobileSearchDrawer isOpen={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} />
    </>
  );
}
