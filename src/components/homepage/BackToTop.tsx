'use client';

import { ArrowUp } from 'lucide-react';

interface BackToTopProps {
  visible: boolean;
  onClick: () => void;
}

export default function BackToTop({ visible, onClick }: BackToTopProps) {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-40 w-11 h-11 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-[#F5F5F5] transition-colors cursor-pointer"
      aria-label="Retour en haut"
    >
      <ArrowUp className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2} />
    </button>
  );
}
