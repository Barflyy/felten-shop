'use client';

import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FloatingBadge() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 hidden md:flex items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-md border border-gray-200">
      <div className="w-9 h-9 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
        <ShieldCheck className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2} />
      </div>
      <div className="flex flex-col">
        <span className="text-[12px] font-semibold text-[#1A1A1A] leading-tight">
          Revendeur Officiel
        </span>
        <span className="text-[11px] text-[#6B7280]">
          Garantie 3 ans
        </span>
      </div>
    </div>
  );
}
