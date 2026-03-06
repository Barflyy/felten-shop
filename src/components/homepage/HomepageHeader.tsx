'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Menu, User, ChevronRight, LayoutGrid, Flame } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { SEARCH_PLACEHOLDERS } from './data/constants';
import { mainNavigation } from '@/lib/navigation';
import { normalizeUrl } from '@/lib/shopify/menu';

/* ─────────────────────────────────────────────
   NAV ITEMS — simplified top-level categories
   ───────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'OUTILS', href: '/collections/outils-electroportatifs' },
  { label: 'BATTERIES', href: '/collections/batteries-chargeurs-et-generateurs' },
  { label: 'JARDIN', href: '/collections/exterieurs-et-espaces-verts' },
  { label: 'MESURE', href: '/collections/instruments-de-mesure' },
  { label: 'EPI', href: '/collections/epi-vetements' },
];

/* ─────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────── */

interface HomepageHeaderProps {
  cartCount: number;
  headerScrolled: boolean;
  placeholderIdx: number;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
}

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */

export default function HomepageHeader({
  cartCount,
  headerScrolled,
  placeholderIdx,
  onOpenMenu,
  onOpenSearch,
  onOpenCart,
}: HomepageHeaderProps) {
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

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    /* Outer sticky anchor — always pinned top-0 */
    <div className="sticky top-0 z-50">
      <motion.div
        className="h-1 bg-[#DB021D] origin-left z-[100] absolute top-0 left-0 right-0 w-full"
        style={{ scaleX }}
      />
      {/* Floating wrapper — width shrinks on scroll via CSS transition */}
      <div
        className="mx-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          maxWidth: headerScrolled ? '900px' : '100%',
          paddingTop: headerScrolled ? '8px' : '0px',
          paddingLeft: headerScrolled ? '16px' : '0px',
          paddingRight: headerScrolled ? '16px' : '0px',
        }}
      >
        <header
          role="banner"
          aria-label="En-tête du site"
          className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            backgroundColor: headerScrolled ? 'rgba(255,255,255,0.92)' : 'rgb(255,255,255)',
            backdropFilter: headerScrolled ? 'blur(20px)' : 'blur(0px)',
            WebkitBackdropFilter: headerScrolled ? 'blur(20px)' : 'blur(0px)',
            borderRadius: headerScrolled ? '16px' : '0px',
            boxShadow: headerScrolled
              ? '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)'
              : '0 0px 0px rgba(0,0,0,0)',
          }}
        >
          {/* ════════════════════════════════════════
              MOBILE (< lg)
              ════════════════════════════════════════ */}
          <div className="lg:hidden">
            {/* Line 1: Menu | Logo | Cart */}
            <div className={`flex items-center justify-between px-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${headerScrolled ? 'h-12' : 'h-14'
              }`}>
              <button
                onClick={onOpenMenu}
                className="w-11 h-11 flex items-center justify-center -ml-1.5 cursor-pointer"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-6 h-6 text-[#1A1A1A]" strokeWidth={1.8} />
              </button>

              <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center pt-[2px]">
                <span className="text-[1.1rem] tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                  <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">
                    FELTEN
                  </span>
                  <span className="font-normal text-[#1A1A1A]"> SHOP</span>
                </span>
              </Link>

              <div className="flex items-center -mr-1.5">
                <button
                  onClick={onOpenSearch}
                  className="w-11 h-11 flex items-center justify-center cursor-pointer"
                  aria-label="Rechercher"
                >
                  <Search className="w-[22px] h-[22px] text-[#1A1A1A]" strokeWidth={1.8} />
                </button>

                <button
                  onClick={onOpenCart}
                  className="relative w-11 h-11 flex items-center justify-center cursor-pointer"
                  aria-label={`Panier — ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
                >
                  <ShoppingCart className="w-[22px] h-[22px] text-[#1A1A1A]" strokeWidth={1.8} />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        key="cart-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute top-1 right-0.5 w-[18px] h-[18px] bg-[#DB021D] text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════
              DESKTOP (lg+) — 2-Level Header
              Level 1: Utility Bar
              Level 2: Navigation Bar (black)
              ════════════════════════════════════════ */}
          <div className="hidden lg:block relative">

            {/* ── LEVEL 1 — Utility Bar ── */}
            <div className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${headerScrolled ? '' : 'border-b border-gray-100'
              }`}>
              <div className="max-w-[1280px] mx-auto px-8">
                <div className={`flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${headerScrolled ? 'h-[52px]' : 'h-[64px]'
                  }`}>

                  {/* Logo + tagline */}
                  <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center pt-[2px]">
                      <span className="text-[1.4rem] tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                        <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">
                          FELTEN
                        </span>
                        <span className="font-normal text-[#1A1A1A]"> SHOP</span>
                      </span>
                    </Link>
                    <span className={`text-[10px] text-[#6B7280] font-medium uppercase tracking-wider border-l border-gray-200 pl-4 transition-opacity duration-300 ${headerScrolled ? 'opacity-0 w-0 pl-0 border-0 overflow-hidden' : 'opacity-100'
                      }`}>
                      Revendeur officiel Milwaukee
                    </span>
                  </div>

                  {/* Search bar — center */}
                  <button
                    onClick={onOpenSearch}
                    className="flex items-center gap-2.5 px-4 h-10 bg-[#F5F5F5] rounded-full text-[#6B7280] text-sm hover:ring-2 hover:ring-[#DB021D]/20 transition-all w-[38%] max-w-md cursor-pointer overflow-hidden"
                    aria-label="Rechercher"
                  >
                    <Search className="w-4 h-4 flex-shrink-0 text-[#6B7280]" strokeWidth={1.8} />
                    <span className="relative h-5 flex-1 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={placeholderIdx}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute inset-0 flex items-center truncate"
                        >
                          {SEARCH_PLACEHOLDERS[placeholderIdx]}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </button>

                  {/* Actions — right */}
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/connexion"
                        className="flex items-center gap-2 px-4 h-10 text-[#1A1A1A] text-[13px] font-medium hover:text-[#DB021D] transition-colors rounded-lg"
                      >
                        <User className="w-4 h-4" strokeWidth={1.8} />
                        Mon compte
                      </Link>
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onOpenCart}
                      className="relative flex items-center gap-2 px-4 h-10 bg-[#1A1A1A] text-white rounded-lg text-[13px] font-semibold hover:bg-[#DB021D] transition-colors cursor-pointer"
                      aria-label={`Panier — ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
                    >
                      <ShoppingCart className="w-4 h-4" strokeWidth={2} />
                      Panier
                      <AnimatePresence>
                        {cartCount > 0 && (
                          <motion.span
                            key="cart-badge-desktop"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            className="w-5 h-5 bg-[#DB021D] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                          >
                            {cartCount > 9 ? '9+' : cartCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── LEVEL 2 — Navigation Bar (black) ── */}
            <nav className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${headerScrolled
              ? 'bg-[#1A1A1A]/90 backdrop-blur-sm rounded-b-2xl'
              : 'bg-[#1A1A1A]'
              }`} aria-label="Navigation principale">
              <div className="max-w-[1280px] mx-auto px-8">
                <ul className={`flex items-center gap-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${headerScrolled ? 'h-10' : 'h-11'
                  }`}>

                  {/* CATALOGUE button — triggers mega menu */}
                  <li
                    className="relative"
                    onMouseEnter={openMega}
                    onMouseLeave={closeMega}
                  >
                    <button
                      className={`flex items-center gap-2 h-full px-5 text-[13px] font-bold uppercase tracking-wide transition-colors cursor-pointer ${megaMenuOpen
                        ? 'bg-[#DB021D] text-white'
                        : 'text-white hover:bg-white/10'
                        }`}
                    >
                      <LayoutGrid className="w-4 h-4" strokeWidth={2} />
                      CATALOGUE
                    </button>
                  </li>

                  {/* Separator */}
                  <li className="w-px h-5 bg-white/15 mx-1" aria-hidden />

                  {/* Category shortcuts */}
                  {NAV_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="relative flex items-center h-11 px-4 text-[13px] font-bold text-white/80 uppercase tracking-wide hover:text-white transition-colors group"
                      >
                        {link.label}
                        <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#DB021D] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                      </Link>
                    </li>
                  ))}

                  {/* Separator */}
                  <li className="w-px h-5 bg-white/15 mx-1" aria-hidden />

                  {/* PROMOS — red accent */}
                  <li>
                    <Link
                      href="/collections?promo=true"
                      className="relative flex items-center gap-1.5 h-11 px-4 text-[13px] font-bold text-[#DB021D] uppercase tracking-wide hover:text-[#ff4d4d] transition-colors group"
                    >
                      <Flame className="w-3.5 h-3.5" strokeWidth={2.5} />
                      PROMOS
                      <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#DB021D] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>

            {/* ── MEGA MENU — AnimatePresence dropdown ── */}
            <AnimatePresence>
              {megaMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 z-40"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                >
                  <div className="max-w-[1280px] mx-auto flex" style={{ maxHeight: 'calc(100vh - 120px)' }}>

                    {/* Sidebar — category list */}
                    <div className="w-[260px] flex-shrink-0 bg-[#FAFAFA] border-r border-gray-100 py-2 overflow-y-auto">
                      {mainNavigation.map((cat) => (
                        <button
                          key={cat.id}
                          onMouseEnter={() => setActiveCatId(cat.id)}
                          onClick={() => {
                            window.location.href = normalizeUrl(cat.url);
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-5 py-2.5 text-left text-[13px] font-semibold transition-all duration-150 cursor-pointer ${activeCatId === cat.id
                            ? 'bg-white text-[#DB021D] shadow-[inset_3px_0_0_#DB021D]'
                            : 'text-[#1A1A1A] hover:bg-white/70 hover:text-[#1A1A1A]'
                            }`}
                        >
                          <span className="leading-tight">{cat.title}</span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 flex-shrink-0 transition-all duration-150 ${activeCatId === cat.id ? 'text-[#DB021D] translate-x-0.5' : 'text-gray-300'
                              }`}
                            strokeWidth={2}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Panel — sub-categories for active item */}
                    <div className="flex-1 overflow-y-auto px-8 py-5">
                      {mainNavigation.map((cat) => {
                        if (cat.id !== activeCatId) return null;

                        const totalItems = cat.items?.length ?? 0;
                        const columnClass = totalItems <= 4
                          ? 'columns-2 gap-8'
                          : totalItems <= 10
                            ? 'columns-3 gap-8'
                            : 'columns-3 xl:columns-4 gap-6 xl:gap-8';

                        return (
                          <div key={cat.id}>
                            {/* Category title + "See all" */}
                            <div className="flex items-center justify-between mb-5">
                              <Link
                                href={normalizeUrl(cat.url)}
                                className="inline-flex items-center gap-2 group"
                              >
                                <h3 className="text-[15px] font-black text-[#1A1A1A] uppercase tracking-wide group-hover:text-[#DB021D] transition-colors">
                                  {cat.title}
                                </h3>
                                <ChevronRight className="w-4 h-4 text-[#DB021D] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" strokeWidth={2.5} />
                              </Link>
                              <Link
                                href={normalizeUrl(cat.url)}
                                className="text-[12px] font-bold text-[#DB021D] hover:underline flex-shrink-0"
                              >
                                Voir toute la catégorie →
                              </Link>
                            </div>

                            {/* Multi-column sub-categories */}
                            <div className={columnClass}>
                              {cat.items?.map((item) => {
                                const hasChildren = item.items && item.items.length > 0;

                                return (
                                  <div key={item.id} className="break-inside-avoid mb-4">
                                    <Link
                                      href={normalizeUrl(item.url)}
                                      className={`flex items-center gap-2 text-[13px] font-bold transition-colors group/item ${
                                        hasChildren
                                          ? 'text-[#1A1A1A] hover:text-[#DB021D] pb-2 border-b border-gray-200/80'
                                          : 'text-[#6B7280] hover:text-[#DB021D] py-0.5'
                                      }`}
                                    >
                                      {!hasChildren && (
                                        <span className="w-1 h-1 rounded-full bg-gray-300 group-hover/item:bg-[#DB021D] transition-colors flex-shrink-0" />
                                      )}
                                      {item.title}
                                    </Link>
                                    {hasChildren && (
                                      <div className="flex flex-col mt-1.5">
                                        {item.items!.map((sub) => (
                                          <Link
                                            key={sub.id}
                                            href={normalizeUrl(sub.url)}
                                            className="py-1 text-[12px] text-[#6B7280] hover:text-[#DB021D] hover:translate-x-0.5 transition-all"
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
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>
      </div>
    </div>
  );
}
