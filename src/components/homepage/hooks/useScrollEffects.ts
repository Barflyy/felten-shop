'use client';

import { useState, useCallback } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';

export function useScrollEffects() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setShowScrollTop(latest > 500);
    setHeaderScrolled(latest > 80);
  });

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { showScrollTop, headerScrolled, scrollToTop };
}
