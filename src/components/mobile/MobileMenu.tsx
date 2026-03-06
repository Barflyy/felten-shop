'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  Phone,
  Truck,
  ShieldCheck,
  HelpCircle,
  LogOut,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '@/context/customer-context';
import { mainNavigation } from '@/lib/navigation';
import type { MenuItem } from '@/lib/shopify/types';

/* ─────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────── */

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavLevel {
  title: string;
  url: string;
  items: MenuItem[];
}

/* ─────────────────────────────────────────────
   STATIC DATA
   ───────────────────────────────────────────── */

const ECOSYSTEMS = [
  { label: 'M12™', sub: 'Léger & compact', href: '/collections?plateforme=m12', isRed: true },
  { label: 'M18™', sub: 'Performance sur\nchantiers', href: '/collections?plateforme=m18', isRed: true },
  { label: 'PACKOUT™', sub: 'Rangement\nmodulable', href: '/recherche?q=packout', isRed: false },
  { label: 'MX FUEL™', sub: 'Zéro émission', href: '/collections?plateforme=mx-fuel', isRed: false },
];

const INFO_LINKS = [
  { icon: Truck, label: 'Livraison', href: '/livraison' },
  { icon: ShieldCheck, label: 'Garantie & SAV', href: '/garantie' },
  { icon: Phone, label: 'Contact', href: '/contact' },
  { icon: HelpCircle, label: 'FAQ', href: '/faq' },
];

/* ─────────────────────────────────────────────
   ANIMATION CONSTANTS
   ───────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const drawerVariants = {
  closed: { x: '-100%' },
  open: { x: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { x: '-100%', transition: { duration: 0.4, ease: EASE } },
};

/* ─────────────────────────────────────────────
   ACCORDION ITEM (group with children)
   ───────────────────────────────────────────── */

function AccordionGroup({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Group header — tap to expand, link icon to navigate */}
      <div className="flex items-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center gap-3 px-6 py-3.5 text-left active:bg-gray-50 transition-colors"
          aria-expanded={isExpanded}
        >
          <ChevronDown
            size={14}
            strokeWidth={2.5}
            className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            }`}
          />
          <span className="text-[14px] font-bold text-[#1A1A1A]">
            {item.title}
          </span>
        </button>
        <Link
          href={item.url}
          onClick={onClose}
          className="px-4 py-3.5 text-gray-400 active:text-[#DB021D] transition-colors"
          aria-label={`Voir ${item.title}`}
        >
          <ChevronRight size={14} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Accordion children */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { height: { duration: 0.25, ease: EASE }, opacity: { duration: 0.2, delay: 0.05 } } }}
            exit={{ height: 0, opacity: 0, transition: { height: { duration: 0.2, ease: EASE }, opacity: { duration: 0.1 } } }}
            className="overflow-hidden"
          >
            <div className="pb-2">
              {item.items!.map((child) => (
                <Link
                  key={child.id}
                  href={child.url}
                  onClick={onClose}
                  className="flex items-center gap-2.5 pl-[52px] pr-6 py-2.5 text-[13px] text-[#6B7280] font-medium active:text-[#DB021D] active:bg-gray-50 transition-colors"
                >
                  <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                  {child.title}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { customer, isAuthenticated, logout } = useCustomer();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation: only 1 level of drill-down (root → category)
  // Groups with children use accordion pattern instead of a 3rd level
  const [navStack, setNavStack] = useState<NavLevel[]>([]);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'back'>('forward');

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Escape key */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  /* Reset on open */
  useEffect(() => {
    if (isOpen) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      setNavStack([]);
      setSearchQuery('');
      setSlideDirection('forward');
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onClose();
    router.push(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const drillInto = useCallback((item: MenuItem) => {
    if (!item.items || item.items.length === 0) return;
    setSlideDirection('forward');
    setNavStack(prev => [...prev, { title: item.title, url: item.url, items: item.items! }]);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const goBack = useCallback(() => {
    setSlideDirection('back');
    setNavStack(prev => prev.slice(0, -1));
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const currentLevel = navStack.length > 0 ? navStack[navStack.length - 1] : null;
  const isRoot = navStack.length === 0;

  // Slide animation variants
  const slideVariants = {
    enter: (dir: 'forward' | 'back') => ({
      x: dir === 'forward' ? '100%' : '-100%',
      opacity: 0.5,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: EASE },
    },
    exit: (dir: 'forward' | 'back') => ({
      x: dir === 'forward' ? '-100%' : '100%',
      opacity: 0.5,
      transition: { duration: 0.2, ease: EASE },
    }),
  };

  // Key for AnimatePresence to detect level changes
  const levelKey = isRoot ? 'root' : `level-${navStack.length}-${currentLevel!.title}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Overlay ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/80 z-[9998]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Drawer ── */}
          <motion.aside
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="exit"
            className="fixed inset-y-0 left-0 w-[85vw] max-w-[360px] z-[9999] flex flex-col bg-white shadow-2xl"
            aria-modal="true"
            role="dialog"
            aria-label="Menu de navigation"
          >

            {/* ═══════════════════════════════════
                HEADER — Premium Black
                ═══════════════════════════════════ */}
            <div className="flex-shrink-0 bg-[#111] px-6 pt-[max(env(safe-area-inset-top)+16px,24px)] pb-5">
              <div className="flex items-center justify-between mb-6">
                <Link href="/" onClick={onClose} className="flex items-baseline gap-0">
                  <span className="text-2xl font-black text-white tracking-tight underline decoration-[#DB021D] decoration-2 underline-offset-4" style={{ fontFamily: 'var(--font-display)' }}>
                    FELTEN
                  </span>
                  <span className="text-2xl font-normal text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}> SHOP</span>
                </Link>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/80 active:bg-white/20 hover:bg-white/20 transition-all"
                  aria-label="Fermer le menu"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Search Bar — Integrated */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un outil, une référence..."
                  className="w-full h-11 pl-10 pr-4 bg-white/10 text-white placeholder:text-gray-500 text-[14px] font-medium rounded-xl outline-none focus:ring-1 focus:ring-[#DB021D] transition-all"
                />
              </form>
            </div>

            {/* ═══════════════════════════════════
                SCROLLABLE BODY
                ═══════════════════════════════════ */}
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-white">

              {/* ── Auth Branding ── (only on root) */}
              {isRoot && (
                <>
                  {isAuthenticated && customer ? (
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                      <Link href="/compte" onClick={onClose} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-sm font-black shadow-md">
                          {(customer.firstName?.[0] ?? customer.email[0]).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-bold text-[#1A1A1A] truncate">
                            Bonjour, {customer.firstName || 'Client'}
                          </p>
                          <p className="text-[12px] text-[#6B7280] font-medium">Accéder à mon espace pro</p>
                        </div>
                        <LogOut
                          size={18}
                          className="text-gray-400"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); onClose(); }}
                        />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 px-6 py-5 border-b border-gray-100">
                      <Link
                        href="/compte/connexion"
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 h-10 bg-[#1A1A1A] text-white text-[12px] font-black uppercase tracking-wider rounded-lg shadow-lg shadow-black/10 active:scale-95 transition-all"
                      >
                        <User size={14} strokeWidth={2.5} />
                        Connexion
                      </Link>
                      <Link
                        href="/compte/inscription"
                        onClick={onClose}
                        className="flex items-center justify-center h-10 border border-gray-200 text-[#1A1A1A] text-[12px] font-black uppercase tracking-wider rounded-lg active:scale-95 transition-all hover:border-[#DB021D] hover:text-[#DB021D]"
                      >
                        Inscription
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* ── BACK + CATEGORY HEADER (when drilled in) ── */}
              {!isRoot && (
                <div className="border-b border-gray-200 bg-gray-50/80">
                  <button
                    onClick={goBack}
                    className="flex items-center gap-2 w-full px-6 py-3 text-[12px] font-bold text-[#6B7280] uppercase tracking-wide active:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                    {navStack.length > 1 ? navStack[navStack.length - 2].title : 'Menu'}
                  </button>
                  <div className="flex items-center justify-between px-6 pb-3">
                    <Link
                      href={currentLevel!.url}
                      onClick={onClose}
                      className="text-[17px] font-black uppercase tracking-wide text-[#1A1A1A]"
                      style={{ fontFamily: 'var(--font-oswald)' }}
                    >
                      {currentLevel!.title}
                    </Link>
                    <Link
                      href={currentLevel!.url}
                      onClick={onClose}
                      className="text-[12px] font-bold text-[#DB021D] active:underline flex-shrink-0"
                    >
                      Tout voir →
                    </Link>
                  </div>
                </div>
              )}

              {/* ── NAVIGATION — Animated panel ── */}
              <nav aria-label="Catalogue" className="relative overflow-hidden">
                <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                  <motion.div
                    key={levelKey}
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {isRoot ? (
                      /* ── Root level: main categories ── */
                      <div className="py-1">
                        {mainNavigation.map((cat) => {
                          const hasItems = cat.items && cat.items.length > 0;

                          return (
                            <div key={cat.id} className="border-b border-gray-50 last:border-0">
                              {hasItems ? (
                                <button
                                  onClick={() => drillInto(cat)}
                                  className="flex items-center justify-between w-full px-6 py-4 active:bg-gray-50 transition-colors"
                                >
                                  <span
                                    className="text-[16px] font-black uppercase tracking-wide text-[#1A1A1A] text-left"
                                    style={{ fontFamily: 'var(--font-oswald)' }}
                                  >
                                    {cat.title}
                                  </span>
                                  <ChevronRight size={18} strokeWidth={2.5} className="text-gray-400 flex-shrink-0" />
                                </button>
                              ) : (
                                <Link
                                  href={cat.url}
                                  onClick={onClose}
                                  className="flex items-center justify-between px-6 py-4 active:bg-gray-50 transition-colors"
                                >
                                  <span
                                    className="text-[16px] font-black uppercase tracking-wide text-[#1A1A1A]"
                                    style={{ fontFamily: 'var(--font-oswald)' }}
                                  >
                                    {cat.title}
                                  </span>
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* ── Drilled level: accordion for groups, links for flat items ── */
                      <div className="py-1">
                        {currentLevel!.items.map((item) => {
                          const hasChildren = item.items && item.items.length > 0;

                          if (hasChildren) {
                            return <AccordionGroup key={item.id} item={item} onClose={onClose} />;
                          }

                          return (
                            <div key={item.id} className="border-b border-gray-100 last:border-0">
                              <Link
                                href={item.url}
                                onClick={onClose}
                                className="flex items-center gap-3 px-6 py-3.5 text-[14px] font-medium text-[#6B7280] active:text-[#DB021D] active:bg-gray-50 transition-colors"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                {item.title}
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </nav>

              {/* ── ECOSYSTEMS (root only) ── */}
              {isRoot && (
                <div className="mt-4 px-6 mb-8">
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4 pl-1">
                    Les plateformes
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {ECOSYSTEMS.map((eco) => (
                      <Link
                        key={eco.label}
                        href={eco.href}
                        onClick={onClose}
                        className={`h-[90px] group flex flex-col items-start justify-center p-3 md:p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 ${eco.isRed ? 'border-[#DB021D]/20 hover:border-[#DB021D]/40' : 'border-gray-100 hover:border-gray-200'
                          }`}
                      >
                        <span
                          className={`text-[19px] font-black italic transition-colors leading-none tracking-tight ${eco.isRed ? 'text-[#DB021D]' : 'text-[#1A1A1A] group-hover:text-[#DB021D]'
                            }`}
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {eco.label}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.05em] mt-1.5 leading-[1.3] whitespace-pre-line">
                          {eco.sub}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── FOOTER LINKS (root only) ── */}
              {isRoot && (
                <div className="bg-gray-50 px-6 py-6 border-t border-gray-100 pb-[calc(20px+env(safe-area-inset-bottom))]">
                  <div className="space-y-1">
                    {INFO_LINKS.map(({ icon: Icon, label, href }) => (
                      <Link
                        key={label}
                        href={href}
                        onClick={onClose}
                        className="flex items-center gap-3 py-2.5 text-gray-600 hover:text-black transition-colors"
                      >
                        <Icon size={16} strokeWidth={2} />
                        <span className="text-[14px] font-medium">{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
