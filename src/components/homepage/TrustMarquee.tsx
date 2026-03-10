'use client';

import { Phone, MapPin, ShieldCheck, Package, Wrench } from 'lucide-react';

const ITEMS = [
  { icon: Phone, text: 'Florian vous rappelle sous 2h' },
  { icon: MapPin, text: 'SAV physique au Luxembourg' },
  { icon: ShieldCheck, text: 'Revendeur agree Milwaukee' },
  { icon: Package, text: 'Jamais de piece grise' },
  { icon: Wrench, text: 'Panne ? On gere en 48h' },
];

export default function TrustMarquee() {
  const renderItems = () =>
    ITEMS.map((item, i) => {
      const Icon = item.icon;
      return (
        <span
          key={`marquee-item-${i}`}
          className="inline-flex items-center gap-1.5 px-4 lg:px-6 text-[#1A1A1A] text-[11px] lg:text-[12px] font-medium whitespace-nowrap"
        >
          <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0 text-[#DB021D]" strokeWidth={2} />
          {item.text}
        </span>
      );
    });

  return (
    <div className="bg-[#F5F5F5] py-2.5 lg:py-3 overflow-hidden border-b border-gray-100">
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
