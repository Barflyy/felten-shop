'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/cart-context';
import { Menu, MenuItem } from '@/lib/shopify/types';
import { normalizeUrl } from '@/lib/shopify/menu';
import MobileMenu from '@/components/mobile/MobileMenu';

interface HeaderMegaClientProps {
  produitsMenu: Menu | null;
  mainMenu: Menu | null;
}

export function HeaderMegaClient({ produitsMenu, mainMenu }: HeaderMegaClientProps) {
  const { cart, openCart } = useCart();
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const megaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const itemCount = cart?.lines.edges.reduce((acc, { node }) => acc + node.quantity, 0) || 0;

  // Build navigation from Shopify menus
  const categories = produitsMenu?.items || [];
  const hasProduitsMenu = categories.length > 0;

  // Close search on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Lock body scroll when search is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Handle mega menu hover
  const handleNavEnter = (label: string) => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setActiveMega(label);
    setActivePanel(0);
  };

  const handleNavLeave = () => {
    megaTimeoutRef.current = setTimeout(() => setActiveMega(null), 200);
  };

  const handleMegaEnter = () => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
  };

  const handleMegaLeave = () => {
    megaTimeoutRef.current = setTimeout(() => setActiveMega(null), 200);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  // Search debounce
  const debounce = useCallback((fn: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }, []);

  const performSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSearchResults(data.products || []);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300),
    []
  );

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    performSearch(value);
  };

  return (
    <>
      {/* Floating Header */}
      <div className="sticky top-4 z-[1000] px-5 lg:px-5 mb-[-100px] lg:mb-[-100px]">
        <header className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Burger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden flex flex-col justify-center gap-[5px] w-11 h-11 p-2.5 bg-white/95 backdrop-blur-[20px] rounded-[10px] border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
              aria-label="Menu"
            >
              <span className="block h-0.5 bg-[#27272A] rounded-sm" />
              <span className="block h-0.5 bg-[#27272A] rounded-sm" />
              <span className="block h-0.5 bg-[#27272A] rounded-sm" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0 bg-white/95 backdrop-blur-[20px] px-5 py-2.5 rounded-xl border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:-translate-y-[3px] hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-400"
            >
              <span className="text-[20px] md:text-[22px] font-bold tracking-tight text-[#0A0A0A]">
                FELTEN<span className="text-[#DB021D]">.</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex flex-1 justify-center">
              <ul className="flex items-center gap-1 bg-white/95 backdrop-blur-[20px] rounded-[14px] px-2 py-1.5 border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                {/* Accueil */}
                <li className="relative">
                  <Link
                    href="/"
                    className="flex items-center gap-1.5 px-5 py-3 text-sm font-medium rounded-[10px] transition-all duration-300 text-[#27272A] hover:text-[#DB021D] hover:bg-[#DB021D]/[0.06]"
                  >
                    Accueil
                  </Link>
                </li>

                {/* Produits with mega menu */}
                {hasProduitsMenu && (
                  <li
                    className="relative"
                    onMouseEnter={() => handleNavEnter('Produits')}
                    onMouseLeave={handleNavLeave}
                  >
                    <Link
                      href="/collections"
                      className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium rounded-[10px] transition-all duration-300 ${
                        activeMega === 'Produits'
                          ? 'text-[#DB021D] bg-[#DB021D]/[0.06]'
                          : 'text-[#27272A] hover:text-[#DB021D] hover:bg-[#DB021D]/[0.06]'
                      }`}
                    >
                      Produits
                      <svg
                        className={`w-3.5 h-3.5 fill-current opacity-50 transition-all duration-300 ${
                          activeMega === 'Produits' ? 'rotate-180 opacity-100' : ''
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                      </svg>
                    </Link>
                  </li>
                )}

                {/* Blog */}
                <li className="relative">
                  <Link
                    href="/blogs/news"
                    className="flex items-center gap-1.5 px-5 py-3 text-sm font-medium rounded-[10px] transition-all duration-300 text-[#27272A] hover:text-[#DB021D] hover:bg-[#DB021D]/[0.06]"
                  >
                    Blog
                  </Link>
                </li>

                {/* Contact */}
                <li className="relative">
                  <Link
                    href="/pages/contact"
                    className="flex items-center gap-1.5 px-5 py-3 text-sm font-medium rounded-[10px] transition-all duration-300 text-[#27272A] hover:text-[#DB021D] hover:bg-[#DB021D]/[0.06]"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-[20px] px-2.5 py-1.5 rounded-[14px] border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-11 h-11 flex items-center justify-center text-[#52525B] rounded-[10px] hover:bg-[#DB021D]/[0.08] hover:text-[#DB021D] transition-all duration-300"
                aria-label="Recherche"
              >
                <svg className="w-[22px] h-[22px] fill-current" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative w-11 h-11 flex items-center justify-center text-[#52525B] rounded-[10px] hover:bg-[#DB021D]/[0.08] hover:text-[#DB021D] transition-all duration-300"
                aria-label="Panier"
              >
                <svg className="w-[22px] h-[22px] fill-current" viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-[#DB021D] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mega Menu Dropdown - Uses real Shopify menu data */}
      <AnimatePresence>
        {activeMega === 'Produits' && hasProduitsMenu && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={handleMegaEnter}
            onMouseLeave={handleMegaLeave}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-[calc(100vw-80px)] max-w-[1400px] bg-white/85 backdrop-blur-[24px] saturate-[180%] rounded-[20px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-white/20 overflow-hidden z-[999]"
          >
            {/* Red accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#DB021D] to-transparent" />

            <div className="flex max-h-[calc(100vh-160px)]">
              {/* Sidebar - Level 1 categories from Shopify */}
              <div className="w-[280px] bg-[#FAFAFA]/98 border-r border-black/[0.08] py-5 flex-shrink-0 flex flex-col">
                <div className="px-5 pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2">
                  Catégories
                  <span className="flex-1 h-px bg-[#E5E5E5]" />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {categories.map((cat, idx) => (
                    <button
                      key={cat.id}
                      onMouseEnter={() => setActivePanel(idx)}
                      className={`flex items-center gap-3 w-full px-5 py-3.5 text-left border-l-[3px] transition-all duration-300 ${
                        activePanel === idx
                          ? 'bg-white/90 text-[#27272A] border-l-[#DB021D]'
                          : 'text-[#52525B] border-l-transparent hover:bg-white/90 hover:text-[#27272A] hover:border-l-[#DB021D]'
                      }`}
                    >
                      <span
                        className={`w-9 h-9 flex items-center justify-center rounded-[10px] border transition-all duration-300 ${
                          activePanel === idx
                            ? 'bg-gradient-to-br from-[#DB021D] to-[#B8001F] border-[#DB021D] shadow-[0_6px_16px_rgba(219,0,37,0.3)]'
                            : 'bg-white border-[#E5E5E5]'
                        }`}
                      >
                        <svg
                          className={`w-[18px] h-[18px] transition-all ${
                            activePanel === idx ? 'fill-white' : 'fill-[#A1A1AA]'
                          }`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                        </svg>
                      </span>
                      <span className="flex-1 flex flex-col gap-0.5">
                        <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                          {cat.title}
                        </span>
                        <span className="text-xs text-[#A1A1AA]">
                          {cat.items?.length || 0} sous-catégories
                        </span>
                      </span>
                      <svg
                        className={`w-4 h-4 transition-all duration-300 ${
                          activePanel === idx
                            ? 'fill-[#DB021D] translate-x-1'
                            : 'fill-[#A1A1AA] opacity-50'
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Panels - Level 2 & 3 from Shopify */}
              <div className="flex-1 bg-white relative">
                {categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className={`absolute inset-0 p-7 overflow-y-auto transition-opacity duration-200 ${
                      activePanel === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F4F4F5]">
                      <h3 className="text-lg font-bold text-[#27272A]">{cat.title}</h3>
                      <Link
                        href={normalizeUrl(cat.url)}
                        className="flex items-center gap-1.5 text-[13px] font-semibold text-[#DB021D] hover:gap-2.5 transition-all"
                      >
                        Tout voir
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                      </Link>
                    </div>

                    {/* Grid - Subcategories from Shopify */}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
                      {cat.items?.map((sub) => (
                        <div key={sub.id} className="flex flex-col gap-2.5">
                          <Link
                            href={normalizeUrl(sub.url)}
                            className="flex items-center gap-2.5 text-sm font-semibold text-[#27272A] py-2 border-b border-[#F4F4F5] hover:text-[#DB021D] transition-colors"
                          >
                            <span className="w-7 h-7 flex items-center justify-center bg-[#FAFAFA] rounded-md">
                              <svg className="w-3.5 h-3.5 fill-[#A1A1AA]" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                              </svg>
                            </span>
                            {sub.title}
                          </Link>
                          {/* Level 3 links */}
                          {sub.items && sub.items.length > 0 && (
                            <div className="flex flex-col gap-1">
                              {sub.items.map((item) => (
                                <Link
                                  key={item.id}
                                  href={normalizeUrl(item.url)}
                                  className="pl-[38px] py-1.5 text-[13px] text-[#52525B] hover:text-[#DB021D] hover:pl-[42px] transition-all"
                                >
                                  {item.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileOpen} onClose={closeMobile} />

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-[12px] z-[9999]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[680px] max-h-[80vh] bg-white/85 backdrop-blur-[30px] rounded-[20px] z-[10000] overflow-hidden shadow-[0_30px_70px_-20px_rgba(0,0,0,0.25)] border border-white/20 flex flex-col"
            >
              {/* Red accent */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#DB021D] to-transparent" />

              {/* Search Header */}
              <div className="p-6 pr-16 border-b border-[#E5E5E5] bg-white relative">
                <div className="flex items-center gap-3.5 bg-[#FAFAFA] rounded-xl px-[18px] py-3.5 border-2 border-transparent focus-within:border-[#DB021D] transition-colors">
                  <svg className="w-[22px] h-[22px] fill-[#A1A1AA] flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    placeholder="Rechercher un produit..."
                    className="flex-1 bg-transparent border-none text-base text-[#27272A] outline-none placeholder:text-[#A1A1AA]"
                    autoComplete="off"
                  />
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute top-1/2 right-5 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[#F4F4F5] rounded-lg hover:bg-[#DB021D]/10 transition-colors"
                >
                  <svg className="w-[18px] h-[18px] fill-[#52525B]" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto p-5 bg-white">
                {isSearching ? (
                  <div className="text-center py-10 text-[#A1A1AA]">Recherche...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {searchResults.slice(0, 8).map((product: any) => (
                        <Link
                          key={product.id}
                          href={`/produit/${product.handle}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex flex-col rounded-lg overflow-hidden bg-[#F9F9F9] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all"
                        >
                          {product.featuredImage?.url ? (
                            <div className="aspect-square bg-white relative">
                              <Image
                                src={product.featuredImage.url}
                                alt={product.title}
                                fill
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square bg-[#F4F4F5]" />
                          )}
                          <div className="p-3 flex flex-col gap-1">
                            <span className="text-[13px] font-medium text-[#27272A] line-clamp-2">
                              {product.title}
                            </span>
                            <span className="text-sm font-semibold text-[#DB021D]">
                              {product.priceRange?.minVariantPrice?.amount
                                ? `${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)} €`
                                : ''}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="block text-center mt-5 px-6 py-3 bg-[#DB021D] text-white text-[15px] font-semibold rounded-lg hover:bg-[#B8001F] transition-colors"
                    >
                      Voir tous les résultats
                    </Link>
                  </>
                ) : searchQuery.length >= 2 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-[#A1A1AA] text-center">
                    <p>Aucun produit trouvé pour "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-[#A1A1AA] text-center">
                    <svg className="w-12 h-12 fill-[#E4E4E7] mb-4" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                    <p>Tapez pour rechercher des produits</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
