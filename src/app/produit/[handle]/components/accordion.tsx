'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="group border-b border-zinc-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left transition-colors"
      >
        <span
          className={`font-black uppercase tracking-wide text-[15px] transition-colors ${isOpen ? 'text-[#1A1A1A]' : 'text-zinc-600 group-hover:text-[#DB021D]'
            }`}
          style={{ fontFamily: 'var(--font-oswald)' }}
        >
          {title}
        </span>
        {/* Animated +/- icon */}
        <span
          className={`relative w-6 h-6 flex items-center justify-center transition-colors rounded-full bg-zinc-50 group-hover:bg-red-50 ${isOpen ? 'text-[#DB021D]' : 'text-zinc-500 group-hover:text-[#DB021D]'
            }`}
        >
          <span className="absolute w-3 h-[2px] bg-current rounded-sm" />
          <span
            className={`absolute w-3 h-[2px] bg-current rounded-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? '' : 'rotate-90'
              }`}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pt-2 text-[14px] text-zinc-600 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
