'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingCart, Menu, User, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { mainNavigation } from '@/lib/navigation';
import { normalizeUrl } from '@/lib/shopify/menu';

const NAV_LINKS = [
  { label: 'Outils', href: '/collections/outils-electroportatifs' },
  { label: 'Batteries', href: '/collections/batteries-chargeurs-et-generateurs' },
  { label: 'Jardin', href: '/collections/exterieurs-et-espaces-verts' },
  { label: 'Mesure', href: '/collections/instruments-de-mesure' },
  { label: 'EPI', href: '/collections/epi-vetements' },
  { label: 'Eclairage', href: '/collections/eclairage' },
];

interface HomepageHeaderProps {
  cartCount: number;
  headerScrolled: boolean;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
}

export default function HomepageHeader({
  cartCount,
  headerScrolled,
  onOpenMenu,
  onOpenSearch,
  onOpenCart,
}: HomepageHeaderProps) {
  const pathname = usePathname();
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCatId, setActiveCatId] = useState(mainNavigation[0]?.id || '');
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const openMega = useCallback(() => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setMegaMenuOpen(true);
  }, []);

  const closeMega = useCallback(() => {
    closeTimeout.current = setTimeout(() => {
      setMegaMenuOpen(false);
      setActiveCatId(mainNavigation[0]?.id || '');
    }, 120);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  return (
    <div className="sticky top-0 z-50">
      <header
        role="banner"
        aria-label="En-tete du site"
        className={`bg-white transition-shadow duration-300 ${
          headerScrolled ? 'shadow-[0_1px_12px_rgba(0,0,0,0.06)]' : ''
        }`}
      >
        {/* ═══════ MOBILE ═══════ */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            {/* Left: hamburger */}
            <button
              onClick={onOpenMenu}
              className="w-10 h-10 flex items-center justify-center -ml-2 text-[#1A1A1A]"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Center: logo */}
            <Link href="/">
              <span
                className="text-[1.15rem] tracking-tight leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">
                  FELTEN
                </span>
                <span className="font-normal text-[#1A1A1A]"> SHOP</span>
              </span>
            </Link>

            {/* Right: search + cart */}
            <div className="flex items-center gap-1 -mr-2">
              <button
                onClick={onOpenSearch}
                className="w-10 h-10 flex items-center justify-center text-[#1A1A1A]"
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" strokeWidth={2} />
              </button>
              <button
                onClick={onOpenCart}
                className="relative w-10 h-10 flex items-center justify-center text-[#1A1A1A]"
                aria-label={`Panier — ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-0.5 w-4 h-4 bg-[#DB021D] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ═══════ DESKTOP ═══════ */}
        <div className="hidden lg:block relative">
          {/* Main bar */}
          <div className="max-w-[1280px] mx-auto px-8 h-16 flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span
                className="text-[1.4rem] tracking-tight leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">
                  FELTEN
                </span>
                <span className="font-normal text-[#1A1A1A]"> SHOP</span>
              </span>
            </Link>

            {/* Catalogue trigger (visible on scroll) */}
            <AnimatePresence>
              {headerScrolled && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                >
                  <button className="flex items-center gap-1.5 px-3 h-9 text-[13px] font-medium text-[#1A1A1A] hover:text-[#DB021D] transition-colors cursor-pointer whitespace-nowrap rounded-lg hover:bg-gray-50">
                    <Menu className="w-4 h-4" strokeWidth={2} />
                    Catalogue
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search */}
            <div className="flex-1 flex justify-center">
              <button
                onClick={onOpenSearch}
                className="w-full max-w-md flex items-center gap-2.5 px-4 h-10 bg-[#F5F5F5] rounded-full text-[#9CA3AF] text-sm hover:bg-[#EFEFEF] transition-colors cursor-pointer"
                aria-label="Rechercher"
              >
                <Search className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                <span className="truncate">Rechercher un produit...</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link
                href="/connexion"
                className="flex items-center gap-2 px-3 h-10 text-[#1A1A1A] text-[13px] font-medium hover:text-[#DB021D] transition-colors rounded-lg"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.8} />
                <span className="hidden xl:inline">Compte</span>
              </Link>
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2 px-4 h-10 bg-[#1A1A1A] text-white rounded-lg text-[13px] font-semibold hover:bg-[#DB021D] transition-colors cursor-pointer"
                aria-label={`Panier — ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
              >
                <ShoppingCart className="w-4 h-4" strokeWidth={2} />
                Panier
                {cartCount > 0 && (
                  <span className="w-5 h-5 bg-[#DB021D] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Nav row */}
          <nav
            className={`border-t border-gray-100 transition-all duration-300 overflow-hidden ${
              headerScrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'
            }`}
            aria-label="Navigation principale"
          >
            <div className="max-w-[1280px] mx-auto px-8 h-11 flex items-center">
              {/* Catalogue trigger */}
              <div onMouseEnter={openMega} onMouseLeave={closeMega}>
                <button
                  className={`flex items-center gap-2 h-11 px-4 text-[13px] font-semibold transition-colors cursor-pointer ${
                    megaMenuOpen
                      ? 'text-[#DB021D]'
                      : 'text-[#1A1A1A] hover:text-[#DB021D]'
                  }`}
                >
                  <Menu className="w-4 h-4" strokeWidth={2} />
                  Tout le catalogue
                </button>
              </div>

              <span className="w-px h-4 bg-gray-200 mx-2" aria-hidden />

              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative flex items-center h-11 px-3.5 text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'text-[#DB021D]'
                        : 'text-[#6B7280] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#DB021D] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Mega Menu */}
          <AnimatePresence>
            {megaMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 z-40"
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <div
                  className="max-w-[1280px] mx-auto flex"
                  style={{ maxHeight: 'calc(100vh - 120px)' }}
                >
                  {/* Sidebar */}
                  <div className="w-[240px] flex-shrink-0 border-r border-gray-100 py-2 overflow-y-auto">
                    {mainNavigation.map((cat) => (
                      <button
                        key={cat.id}
                        onMouseEnter={() => setActiveCatId(cat.id)}
                        onClick={() => {
                          window.location.href = normalizeUrl(cat.url);
                        }}
                        className={`w-full flex items-center justify-between px-5 py-2.5 text-left text-[13px] transition-colors cursor-pointer ${
                          activeCatId === cat.id
                            ? 'text-[#DB021D] font-semibold bg-red-50/60'
                            : 'text-[#1A1A1A] font-medium hover:bg-gray-50'
                        }`}
                      >
                        <span className="leading-tight">{cat.title}</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                            activeCatId === cat.id
                              ? 'text-[#DB021D]'
                              : 'text-gray-300'
                          }`}
                          strokeWidth={2}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Panel */}
                  <div className="flex-1 overflow-y-auto px-8 py-5">
                    <AnimatePresence mode="wait">
                      {mainNavigation.map((cat) => {
                        if (cat.id !== activeCatId) return null;

                        const totalItems = cat.items?.length ?? 0;
                        const columnClass =
                          totalItems <= 4
                            ? 'columns-2 gap-8'
                            : totalItems <= 10
                              ? 'columns-3 gap-8'
                              : 'columns-3 xl:columns-4 gap-6 xl:gap-8';

                        return (
                          <motion.div
                            key={cat.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.1 }}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <Link
                                href={normalizeUrl(cat.url)}
                                className="text-[14px] font-bold text-[#1A1A1A] hover:text-[#DB021D] transition-colors"
                              >
                                {cat.title}
                              </Link>
                              <Link
                                href={normalizeUrl(cat.url)}
                                className="text-[12px] font-medium text-[#DB021D] hover:underline flex-shrink-0"
                              >
                                Tout voir &rarr;
                              </Link>
                            </div>

                            <div className={columnClass}>
                              {cat.items?.map((item) => {
                                const hasChildren =
                                  item.items && item.items.length > 0;
                                return (
                                  <div
                                    key={item.id}
                                    className="break-inside-avoid mb-4"
                                  >
                                    <Link
                                      href={normalizeUrl(item.url)}
                                      className={`block text-[13px] transition-colors ${
                                        hasChildren
                                          ? 'font-semibold text-[#1A1A1A] hover:text-[#DB021D] pb-1.5 border-b border-gray-100'
                                          : 'font-medium text-[#6B7280] hover:text-[#DB021D]'
                                      }`}
                                    >
                                      {item.title}
                                    </Link>
                                    {hasChildren && (
                                      <div className="flex flex-col mt-1.5 gap-0.5">
                                        {item.items!.map((sub) => (
                                          <Link
                                            key={sub.id}
                                            href={normalizeUrl(sub.url)}
                                            className="text-[12px] text-[#9CA3AF] hover:text-[#DB021D] transition-colors py-0.5"
                                          >
                                            {sub.title}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </div>
  );
}
