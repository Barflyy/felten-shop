'use client';

import Link from 'next/link';
import { Wrench, MapPin, ShieldCheck, ChevronRight } from 'lucide-react';

const PILLARS = [
  {
    icon: Wrench,
    title: 'SAV expert',
    desc: 'On répare, on conseille, on rappelle sous 2h. Florian gère chaque dossier personnellement.',
  },
  {
    icon: MapPin,
    title: 'Revendeur physique',
    desc: 'Showroom au Luxembourg. Venez tester, déposer en SAV, repartir avec votre outil.',
  },
  {
    icon: ShieldCheck,
    title: '100% officiel Milwaukee',
    desc: 'Zéro pièce grise. Garantie constructeur 3 ans activée automatiquement à l\'achat.',
  },
];

export default function WhyFeltenSection() {
  return (
    <section className="py-8 lg:py-14 bg-white border-t border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-5 lg:mb-8">
          <h2 className="text-[18px] lg:text-[26px] font-bold text-[#1A1A1A]">
            Pourquoi Felten ?
          </h2>
          <Link
            href="/pourquoi-felten"
            className="text-[12px] lg:text-[13px] font-medium text-[#DB021D] hover:text-[#B8011A] transition-colors flex items-center gap-0.5 shrink-0"
          >
            En savoir plus
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-3 lg:gap-4">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex gap-4 p-4 lg:p-5 rounded-lg border border-gray-100 bg-[#FAFAFA]"
              >
                <div className="w-10 h-10 rounded-lg bg-[#DB021D]/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#DB021D]" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-[13px] lg:text-[14px] font-bold text-[#1A1A1A] mb-1">
                    {pillar.title}
                  </h3>
                  <p className="text-[12px] lg:text-[13px] text-[#6B7280] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
