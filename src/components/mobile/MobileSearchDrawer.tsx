'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Package, ArrowLeft, Sparkles, Percent, Zap, LayoutGrid } from 'lucide-react';
import { shopifyFetch } from '@/lib/shopify/client';
import { SEARCH_PRODUCTS_QUERY } from '@/lib/shopify/queries';

interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText: string | null };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
}

interface MobileSearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickLinks = [
  { label: 'Nouveautés', href: '/collections/nouveautes', icon: Sparkles, bg: 'bg-amber-50', border: 'border-amber-100', iconColor: 'text-amber-500', labelColor: 'text-amber-800', arrowColor: 'text-amber-300' },
  { label: 'Promotions', href: '/collections/promotions', icon: Percent, bg: 'bg-red-50', border: 'border-red-100', iconColor: 'text-[#DB021D]', labelColor: 'text-red-700', arrowColor: 'text-red-300' },
  { label: 'M18 FUEL', href: '/collections/m18-fuel', icon: Zap, bg: 'bg-zinc-900', border: 'border-zinc-800', iconColor: 'text-[#DB021D]', labelColor: 'text-white', arrowColor: 'text-zinc-500' },
  { label: 'Tous les produits', href: '/collections/all', icon: LayoutGrid, bg: 'bg-zinc-50', border: 'border-zinc-200', iconColor: 'text-zinc-500', labelColor: 'text-[#1A1A1A]', arrowColor: 'text-zinc-300' },
];

export function MobileSearchDrawer({ isOpen, onClose }: MobileSearchDrawerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Clear on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await shopifyFetch<{
          products: { edges: { node: SearchProduct }[] };
        }>({
          query: SEARCH_PRODUCTS_QUERY,
          variables: { query, first: 12 },
        });
        setResults(data.products.edges.map((e) => e.node));
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Popular searches
  const popularSearches = ['M18 FUEL', 'Perceuse', 'Meuleuse', 'PACKOUT', 'Batterie'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] lg:hidden bg-white flex flex-col"
        >
          {/* Header with search input */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-shrink-0 bg-white border-b border-zinc-100 pt-[env(safe-area-inset-top)]"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Back button */}
              <button
                onClick={onClose}
                className="p-2.5 -ml-1 hover:bg-zinc-100 active:bg-zinc-200 rounded-2xl transition-colors"
                aria-label="Fermer"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-600" />
              </button>

              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full h-11 pl-10 pr-10 bg-zinc-100 border border-zinc-200 rounded-2xl text-[#1A1A1A] placeholder:text-zinc-400 focus:outline-none focus-visible:outline-none focus:border-zinc-900 text-base transition-colors"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-300 rounded-full flex items-center justify-center active:bg-zinc-400 transition-colors"
                  >
                    <X className="w-4 h-4 text-zinc-600" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="px-4 py-4 pb-[calc(80px+env(safe-area-inset-bottom))]">
              {/* Loading */}
              {isSearching && (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-3 border-[#DB021D] border-t-transparent rounded-full"
                  />
                </div>
              )}

              {/* Results */}
              {!isSearching && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-3 font-semibold">
                    {results.length} résultat{results.length > 1 ? 's' : ''}
                  </p>
                  {results.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link
                        href={`/produit/${product.handle}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl active:bg-zinc-100 transition-colors"
                      >
                        <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-zinc-100">
                          {product.featuredImage?.url ? (
                            <Image
                              src={product.featuredImage.url}
                              alt={product.featuredImage.altText || product.title}
                              fill
                              className="object-contain p-1"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-zinc-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1A1A1A] line-clamp-2 leading-snug">
                            {product.title}
                          </p>
                          <p className="text-sm font-bold text-[#DB021D] mt-1">
                            {parseFloat(product.priceRange.minVariantPrice.amount)
                              .toFixed(2)
                              .replace('.', ',')} €
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* No results */}
              {!isSearching && query.length >= 2 && results.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-zinc-300" />
                  </div>
                  <p className="text-zinc-600 font-medium">Aucun résultat pour</p>
                  <p className="text-[#1A1A1A] font-bold mt-1">&ldquo;{query}&rdquo;</p>
                  <p className="text-sm text-zinc-400 mt-3">
                    Essayez avec d&apos;autres termes
                  </p>
                </motion.div>
              )}

              {/* Popular searches + Quick links (when no query) */}
              {!query && !isSearching && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-3 font-semibold">
                    Recherches populaires
                  </p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-zinc-200 rounded-full text-sm font-semibold text-[#1A1A1A] active:bg-[#DB021D] active:text-white active:border-[#DB021D] transition-colors"
                      >
                        <Search className="w-3 h-3 opacity-40" />
                        {term}
                      </button>
                    ))}
                  </div>

                  {/* Quick Links with icons */}
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-3 font-semibold">
                    Accès rapide
                  </p>
                  <div className="space-y-2">
                    {quickLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={onClose}
                          className={`flex items-center justify-between p-4 ${link.bg} rounded-xl border ${link.border} shadow-sm active:opacity-80 transition-opacity`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${link.iconColor}`} strokeWidth={2} />
                            <span className={`font-bold ${link.labelColor}`}>{link.label}</span>
                          </div>
                          <ArrowRight className={`w-4 h-4 ${link.arrowColor}`} />
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
