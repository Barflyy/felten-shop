'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const MESSAGES = [
  '🚚 Livraison gratuite dès 150€ — Expédition sous 24h',
  '🛡 Garantie 3 ans sur toutes les machines Milwaukee',
  '📞 Besoin d\'aide ? +352 691 000 000',
  '⚡ Revendeur agréé Milwaukee — SAV collecte & retour inclus',
];

const STORAGE_KEY = 'shopfelten_announcement_dismissed';

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch {}
  };

  if (!visible) return null;

  return (
    <div className="relative w-full h-9 bg-[#1A1A1A] flex items-center justify-center overflow-hidden flex-shrink-0">
      <p className="text-white text-[11px] sm:text-[12px] font-semibold tracking-wide px-10 text-center leading-tight truncate">
        {MESSAGES[index]}
      </p>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        aria-label="Fermer l'annonce"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
