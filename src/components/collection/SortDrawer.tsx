'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export type SortOption = 'featured' | 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'name-asc' | 'capacity-desc';

interface SortDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Par défaut' },
  { value: 'popular', label: 'Popularité' },
  { value: 'capacity-desc', label: 'Capacité (Ah)' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'name-asc', label: 'Nom A-Z' },
];

export function SortDrawer({ isOpen, onClose, currentSort, onSortChange }: SortDrawerProps) {
  const handleSelect = (sort: SortOption) => {
    onSortChange(sort);
    onClose();
  };

  // Body scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed left-0 right-0 bottom-0 bg-white z-[60] rounded-t-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-[15px] font-bold text-[#1A1A1A]">Trier par</h2>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 text-[#9CA3AF]" />
              </button>
            </div>

            {/* Sort Options */}
            <div className="py-1">
              {sortOptions.map((option) => {
                const isActive = currentSort === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center px-5 py-3 text-[14px] transition-colors ${
                      isActive ? 'font-semibold text-[#1A1A1A]' : 'text-[#4B5563]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="h-[env(safe-area-inset-bottom)]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
