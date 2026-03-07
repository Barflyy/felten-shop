'use client';

import { Headphones, Warehouse, BadgeCheck } from 'lucide-react';

const ITEMS = [
  {
    icon: Headphones,
    stat: '516',
    statLabel: 'réf.',
    title: 'Conseils d\u2019experts',
    text: 'Notre équipe connaît chaque référence Milwaukee. Un doute ? Appelez-nous.',
  },
  {
    icon: Warehouse,
    stat: '24h',
    statLabel: 'expédition',
    title: 'Stock réel en Belgique',
    text: 'Pas de dropshipping. Votre commande part de notre entrepôt sous 24h.',
  },
  {
    icon: BadgeCheck,
    stat: '3 ans',
    statLabel: 'garantie',
    title: 'Revendeur agréé',
    text: 'Garantie constructeur enregistrée automatiquement sur chaque machine.',
  },
];

export default function TrustSignals() {
  return (
    <section className="py-8 lg:py-16 bg-[#F5F5F5]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <h2 className="text-[18px] lg:text-[26px] font-bold text-center text-[#1A1A1A] mb-2 lg:mb-4">
          Pourquoi Felten Shop ?
        </h2>
        <p className="text-[#6B7280] text-[13px] lg:text-[15px] text-center mb-6 lg:mb-10 max-w-lg mx-auto">
          Un service pensé pour les pros du terrain.
        </p>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-6">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-lg p-4 lg:py-10 lg:px-8 border border-gray-100"
              >
                {/* Mobile: horizontal layout */}
                <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-0">
                  <div className="w-10 h-10 lg:w-11 lg:h-11 bg-[#F5F5F5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 lg:w-5 lg:h-5 text-[#1A1A1A]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0 lg:mt-4">
                    <div className="flex items-baseline gap-1.5 lg:mb-2">
                      <span className="text-lg lg:text-2xl font-bold text-[#1A1A1A] leading-none">{item.stat}</span>
                      <span className="text-[11px] lg:text-[12px] text-[#6B7280] font-medium">{item.statLabel}</span>
                      <span className="text-[11px] lg:hidden font-medium text-[#6B7280]">—</span>
                      <span className="text-[12px] lg:hidden font-semibold text-[#1A1A1A]">{item.title}</span>
                    </div>
                    <h3 className="hidden lg:block text-base font-semibold text-[#1A1A1A] mb-2">{item.title}</h3>
                    <p className="hidden lg:block text-[14px] text-[#6B7280] leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
