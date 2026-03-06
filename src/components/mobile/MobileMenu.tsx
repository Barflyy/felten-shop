'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Phone,
  Truck,
  ShieldCheck,
  HelpCircle,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '@/context/customer-context';
import { mainNavigation } from '@/lib/navigation';
import type { MenuItem } from '@/lib/shopify/types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavLevel {
  title: string;
  url: string;
  items: MenuItem[];
}

const INFO_LINKS = [
  { icon: Truck, label: 'Livraison', href: '/livraison' },
  { icon: ShieldCheck, label: 'Garantie & SAV', href: '/garantie' },
  { icon: Phone, label: 'Contact', href: '/contact' },
  { icon: HelpCircle, label: 'FAQ', href: '/faq' },
];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const drawerVariants = {
  closed: { x: '-100%' },
  open: { x: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { x: '-100%', transition: { duration: 0.3, ease: EASE } },
};

function AccordionGroup({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <div className="flex items-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center gap-3 px-6 py-3 text-left active:bg-gray-50 transition-colors"
          aria-expanded={isExpanded}
        >
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={`text-gray-300 transition-transform duration-200 flex-shrink-0 ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            }`}
          />
          <span className="text-[14px] font-semibold text-[#1A1A1A]">
            {item.title}
          </span>
        </button>
        <Link
          href={item.url}
          onClick={onClose}
          className="px-4 py-3 text-gray-300 active:text-[#DB021D] transition-colors"
          aria-label={`Voir ${item.title}`}
        >
          <ChevronRight size={14} strokeWidth={2} />
        </Link>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: {
                height: { duration: 0.25, ease: EASE },
                opacity: { duration: 0.2, delay: 0.05 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.2, ease: EASE },
                opacity: { duration: 0.1 },
              },
            }}
            className="overflow-hidden"
          >
            <div className="pb-2">
              {item.items!.map((child) => (
                <Link
                  key={child.id}
                  href={child.url}
                  onClick={onClose}
                  className="block pl-[52px] pr-6 py-2.5 text-[13px] text-[#9CA3AF] font-medium active:text-[#DB021D] transition-colors"
                >
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

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { customer, isAuthenticated } = useCustomer();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [navStack, setNavStack] = useState<NavLevel[]>([]);
  const [slideDirection, setSlideDirection] = useState<'forward' | 'back'>(
    'forward'
  );

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      setNavStack([]);
      setSlideDirection('forward');
    }
  }, [isOpen]);

  const drillInto = useCallback((item: MenuItem) => {
    if (!item.items || item.items.length === 0) return;
    setSlideDirection('forward');
    setNavStack((prev) => [
      ...prev,
      { title: item.title, url: item.url, items: item.items! },
    ]);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const goBack = useCallback(() => {
    setSlideDirection('back');
    setNavStack((prev) => prev.slice(0, -1));
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const currentLevel =
    navStack.length > 0 ? navStack[navStack.length - 1] : null;
  const isRoot = navStack.length === 0;

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

  const levelKey = isRoot
    ? 'root'
    : `level-${navStack.length}-${currentLevel!.title}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 z-[9998]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="exit"
            drag="x"
            dragConstraints={{ left: -360, right: 0 }}
            dragElastic={{ left: 0, right: 1 }}
            onDragEnd={(_e, { offset, velocity }) => {
              if (offset.x < -50 || velocity.x < -500) {
                onClose();
              }
            }}
            className="fixed inset-y-0 left-0 w-[85vw] max-w-[360px] z-[9999] flex flex-col bg-white shadow-xl"
            aria-modal="true"
            role="dialog"
            aria-label="Menu de navigation"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 pt-[max(env(safe-area-inset-top)+12px,20px)] pb-4 border-b border-gray-100">
              <Link href="/" onClick={onClose}>
                <span
                  className="text-xl tracking-tight leading-none"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">
                    FELTEN
                  </span>
                  <span className="font-normal text-[#1A1A1A]"> SHOP</span>
                </span>
              </Link>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-100 transition-colors"
                aria-label="Fermer le menu"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Scrollable body */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
            >
              {/* Auth section (root only) */}
              {isRoot && (
                <div className="px-6 py-4 border-b border-gray-100">
                  {isAuthenticated && customer ? (
                    <Link
                      href="/compte"
                      onClick={onClose}
                      className="flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-sm font-bold">
                        {(
                          customer.firstName?.[0] ?? customer.email[0]
                        ).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#1A1A1A] truncate">
                          {customer.firstName || 'Mon compte'}
                        </p>
                        <p className="text-[12px] text-[#9CA3AF]">
                          Voir mon espace
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <Link
                      href="/compte/connexion"
                      onClick={onClose}
                      className="flex items-center gap-3 text-[14px] font-medium text-[#1A1A1A]"
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                        <User
                          size={16}
                          strokeWidth={2}
                          className="text-[#6B7280]"
                        />
                      </div>
                      <span>Connexion / Inscription</span>
                    </Link>
                  )}
                </div>
              )}

              {/* Back + category header (drilled in) */}
              {!isRoot && (
                <div className="border-b border-gray-100">
                  <button
                    onClick={goBack}
                    className="flex items-center gap-2 w-full px-6 py-3 text-[13px] font-medium text-[#9CA3AF] active:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={16} strokeWidth={2} />
                    Retour
                  </button>
                  <div className="flex items-center justify-between px-6 pb-3">
                    <span className="text-[16px] font-bold text-[#1A1A1A]">
                      {currentLevel!.title}
                    </span>
                    <Link
                      href={currentLevel!.url}
                      onClick={onClose}
                      className="text-[12px] font-medium text-[#DB021D]"
                    >
                      Tout voir &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav
                aria-label="Catalogue"
                className="relative overflow-hidden"
              >
                <AnimatePresence
                  initial={false}
                  custom={slideDirection}
                  mode="popLayout"
                >
                  <motion.div
                    key={levelKey}
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {isRoot ? (
                      <div className="py-2">
                        {mainNavigation.map((cat) => {
                          const hasItems = cat.items && cat.items.length > 0;
                          return hasItems ? (
                            <button
                              key={cat.id}
                              onClick={() => drillInto(cat)}
                              className="flex items-start justify-between w-full px-6 py-3.5 text-left active:bg-gray-50 transition-colors"
                            >
                              <span className="text-[15px] font-semibold text-[#1A1A1A]">
                                {cat.title}
                              </span>
                              <ChevronRight
                                size={16}
                                strokeWidth={2}
                                className="text-gray-300 mt-[3px] flex-shrink-0"
                              />
                            </button>
                          ) : (
                            <Link
                              key={cat.id}
                              href={cat.url}
                              onClick={onClose}
                              className="flex items-center justify-between px-6 py-3.5 active:bg-gray-50 transition-colors"
                            >
                              <span className="text-[15px] font-semibold text-[#1A1A1A]">
                                {cat.title}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-2">
                        {currentLevel!.items.map((item) => {
                          const hasChildren =
                            item.items && item.items.length > 0;
                          if (hasChildren) {
                            return (
                              <AccordionGroup
                                key={item.id}
                                item={item}
                                onClose={onClose}
                              />
                            );
                          }
                          return (
                            <Link
                              key={item.id}
                              href={item.url}
                              onClick={onClose}
                              className="block px-6 py-3 text-[14px] font-medium text-[#6B7280] active:text-[#DB021D] transition-colors"
                            >
                              {item.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </nav>

              {/* Info links (root only) */}
              {isRoot && (
                <div className="mt-4 px-6 py-4 border-t border-gray-100 pb-[calc(20px+env(safe-area-inset-bottom))]">
                  {INFO_LINKS.map(({ icon: Icon, label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={onClose}
                      className="flex items-center gap-3 py-2.5 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors"
                    >
                      <Icon size={16} strokeWidth={1.8} />
                      <span className="text-[13px] font-medium">{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
