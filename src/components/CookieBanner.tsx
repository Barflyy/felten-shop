'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEY = 'shopfelten_cookies';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const t = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const save = (accepted: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: accepted, marketing: accepted, decided: true }));
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[9985] bg-white border-t border-gray-200 shadow-2xl"
        >
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Shield size={18} className="text-[#DB021D] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-[13px] text-[#6B7280] leading-relaxed">
                  Nous utilisons des cookies pour améliorer votre expérience sur shopfelten.be.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => save(false)}
                  className="flex-1 sm:flex-none h-9 px-4 border-2 border-[#1A1A1A] text-[#1A1A1A] text-[12px] font-black uppercase rounded-xl hover:bg-[#1A1A1A] hover:text-white transition-colors"
                >
                  Refuser
                </button>
                <button
                  onClick={() => save(true)}
                  className="flex-1 sm:flex-none h-9 px-5 bg-[#DB021D] text-white text-[12px] font-black uppercase rounded-xl hover:bg-[#B8011A] transition-colors"
                >
                  Tout accepter
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
