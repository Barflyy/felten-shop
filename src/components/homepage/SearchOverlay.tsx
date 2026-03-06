'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight, TrendingUp, Package } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { SearchProduct } from './data/types';

interface SearchOverlayProps {
  isOpen: boolean;
  searchQuery: string;
  searchResults: SearchProduct[];
  isSearching: boolean;
  onClose: () => void;
  onQueryChange: (query: string) => void;
}

const QUICK_SEARCHES = [
  'Perceuse M18',
  'Meuleuse FUEL',
  'Batterie 5Ah',
  'M12 visseuse',
  'Éclairage chantier',
  'Kit batteries',
];

const POPULAR_CATEGORIES = [
  { label: 'Perceuses-visseuses', href: '/collections/outils-electroportatifs' },
  { label: 'Meuleuses', href: '/collections/outils-electroportatifs' },
  { label: 'Batteries & Chargeurs', href: '/collections/batteries-chargeurs-et-generateurs' },
];

export default function SearchOverlay({
  isOpen,
  searchQuery,
  searchResults,
  isSearching,
  onClose,
  onQueryChange,
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  /* Focus input on open + ESC to close */
  useEffect(() => {
    if (!isOpen) return;

    /* Small delay to let AnimatePresence render */
    const raf = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);

    /* Lock body scroll */
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const hasQuery = searchQuery.trim().length >= 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Overlay backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* ── Spotlight modal ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-0 z-[9999] flex justify-center px-4 pt-[15vh] md:pt-24 pointer-events-none"
          >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">

              {/* ── Input bar ── */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    onClose();
                    window.location.href = `/recherche?q=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                className="flex items-center gap-3 px-5 h-16 border-b border-gray-100"
              >
                <Search className="w-5 h-5 text-[#6B7280] flex-shrink-0" strokeWidth={2} />
                <input
                  ref={inputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Rechercher par référence, nom ou catégorie..."
                  className="flex-1 h-full text-[15px] text-[#1A1A1A] placeholder:text-gray-400 outline-none bg-transparent"
                />
                {isSearching && (
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-[#DB021D] rounded-full animate-spin flex-shrink-0" />
                )}
                <kbd className="hidden md:flex items-center gap-1 px-2 py-1 bg-gray-100 text-[11px] font-medium text-[#6B7280] rounded-md flex-shrink-0 select-none">
                  ESC
                </kbd>
              </form>

              {/* ── Content area ── */}
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {hasQuery ? (
                  /* ── Results state ── */
                  <div>
                    {!isSearching && searchResults.length > 0 && (
                      <div className="px-5 pt-4 pb-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                          {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    {!isSearching && searchResults.length > 0 ? (
                      <>
                        <ul>
                          {searchResults.map((product, idx) => (
                            <motion.li
                              key={product.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.15, delay: idx * 0.025 }}
                            >
                              <Link
                                href={`/produit/${product.handle}`}
                                onClick={onClose}
                                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                              >
                                <div className="w-12 h-12 flex-shrink-0 bg-[#F5F5F5] rounded-lg overflow-hidden relative">
                                  {product.featuredImage?.url ? (
                                    <Image
                                      src={product.featuredImage.url}
                                      alt={product.featuredImage.altText || product.title}
                                      fill
                                      className="object-contain p-1"
                                      sizes="48px"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-5 h-5 text-gray-300" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[14px] font-semibold text-[#1A1A1A] line-clamp-1">
                                    {product.title}
                                  </p>
                                  <p className="text-[13px] font-black text-[#DB021D] mt-0.5">
                                    {parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)} €
                                    <span className="text-[11px] font-semibold text-[#6B7280] ml-1">TTC</span>
                                  </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                              </Link>
                            </motion.li>
                          ))}
                        </ul>
                        <div className="border-t border-gray-100">
                          <Link
                            href={`/recherche?q=${encodeURIComponent(searchQuery.trim())}`}
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 py-4 text-[13px] font-bold text-[#DB021D] hover:bg-gray-50 transition-colors"
                          >
                            Voir tous les résultats
                            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </Link>
                        </div>
                      </>
                    ) : !isSearching && searchResults.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-[#1A1A1A] font-semibold mb-1">
                          Aucun résultat pour &laquo; {searchQuery} &raquo;
                        </p>
                        <p className="text-[#6B7280] text-[13px]">
                          Vérifiez l&apos;orthographe ou essayez un autre terme
                        </p>
                      </div>
                    ) : (
                      /* Loading state — spacer so modal doesn't collapse */
                      <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#DB021D] rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── Empty state: suggestions ── */
                  <div className="px-5 py-5">
                    {/* Quick searches */}
                    <div className="mb-6">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">
                        <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
                        Recherches fréquentes
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_SEARCHES.map((s) => (
                          <button
                            key={s}
                            onClick={() => onQueryChange(s)}
                            className="px-3 py-1.5 bg-[#F5F5F5] text-[#1A1A1A] text-[13px] font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Popular categories */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">
                        Catégories populaires
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {POPULAR_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.label}
                            href={cat.href}
                            onClick={onClose}
                            className="flex items-center justify-between px-4 py-3 bg-[#F5F5F5] rounded-lg hover:bg-gray-200 transition-colors group"
                          >
                            <span className="text-[13px] font-semibold text-[#1A1A1A]">{cat.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#DB021D] transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
