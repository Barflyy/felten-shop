'use client';

import { Truck, ShieldCheck, Award, Lock, Headphones } from 'lucide-react';

const ITEMS = [
  { icon: Truck, text: 'Expédition 24h' },
  { icon: Headphones, text: 'SAV Belgique' },
  { icon: Award, text: 'Garantie 3 ans' },
  { icon: ShieldCheck, text: 'Revendeur officiel' },
  { icon: Lock, text: 'Paiement sécurisé' },
];

export default function TrustMarquee() {
  const renderItems = () =>
    ITEMS.map((item, i) => {
      const Icon = item.icon;
      return (
        <span
          key={`marquee-item-${i}`}
          className="inline-flex items-center gap-1.5 px-4 lg:px-6 text-white text-[11px] lg:text-[13px] font-bold uppercase tracking-wider whitespace-nowrap"
        >
          <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" strokeWidth={2.5} />
          {item.text}
        </span>
      );
    });

  return (
    <div className="bg-[#DB021D] py-2.5 lg:py-3.5 overflow-hidden relative">
      <div
        className="flex w-max"
        style={{ animation: 'marquee 25s linear infinite' }}
      >
        <div className="flex">{renderItems()}</div>
        <div className="flex">{renderItems()}</div>
        <div className="flex">{renderItems()}</div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}} />
    </div>
  );
}
