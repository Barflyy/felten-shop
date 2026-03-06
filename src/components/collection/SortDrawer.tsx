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

          {/* Bottom Sheet — 40% height */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-0 bg-white z-[60] rounded-t-2xl shadow-2xl"
            style={{ maxHeight: '40vh' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
              <h2 className="text-[16px] font-bold text-[#1A1A1A]">Trier par</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Sort Options */}
            <div className="py-1 overflow-y-auto" style={{ maxHeight: 'calc(40vh - 80px)' }}>
              {sortOptions.map((option) => {
                const isActive = currentSort === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    {/* Radio circle */}
                    <span className={`w-[18px] h-[18px] rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                      isActive ? 'border-[#1A1A1A]' : 'border-gray-300'
                    }`}>
                      {isActive && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]" />
                      )}
                    </span>
                    <span className={`text-[14px] ${
                      isActive ? 'font-bold text-[#1A1A1A]' : 'text-gray-700'
                    }`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Safe area for mobile */}
            <div className="safe-area-bottom" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
