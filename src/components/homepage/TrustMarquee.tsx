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
          key={i}
          className="inline-flex items-center gap-2 px-6 text-white/95 text-[13px] font-bold uppercase tracking-wider whitespace-nowrap"
        >
          <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={3} />
          {item.text}
        </span>
      );
    });

  return (
    <div className="bg-[#DB021D] py-2.5 overflow-hidden relative">
      <div className="flex animate-[marquee_25s_linear_infinite]">
        {renderItems()}
        {renderItems()}
        {renderItems()}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
