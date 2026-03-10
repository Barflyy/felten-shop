'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

const ECOSYSTEMS = [
  {
    id: 'm12',
    name: 'M12',
    desc: 'Léger & Compact',
    url: '/collections/m12',
    image: '/images/ecosystems/m12.webp',
    accent: 'from-red-600/10 to-red-600/5',
    badge: 'bg-red-600',
  },
  {
    id: 'm18',
    name: 'M18',
    desc: 'Performance chantier',
    url: '/collections/m18',
    image: '/images/ecosystems/m18.webp',
    accent: 'from-red-700/10 to-red-700/5',
    badge: 'bg-red-700',
  },
  {
    id: 'packout',
    name: 'PACKOUT',
    desc: 'Rangement modulable',
    url: '/collections/packout',
    image: '/images/ecosystems/packout.png',
    accent: 'from-[#1A1A1A]/10 to-[#1A1A1A]/5',
    badge: 'bg-[#1A1A1A]',
  },
  {
    id: 'mx-fuel',
    name: 'MX FUEL',
    desc: 'Zéro émission',
    url: '/collections/mx-fuel',
    image: '/images/ecosystems/mx-fuel.webp',
    accent: 'from-amber-600/10 to-amber-600/5',
    badge: 'bg-amber-600',
  },
];

export default function EcosystemNav() {
  return (
    <section className="py-5 lg:py-8 bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-0 lg:px-8">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 lg:px-0 lg:grid lg:grid-cols-4 lg:gap-3">
          {ECOSYSTEMS.map((eco) => (
            <Link
              key={eco.id}
              href={eco.url}
              className={`group shrink-0 relative overflow-hidden rounded-lg bg-gradient-to-br ${eco.accent} border border-gray-100 hover:border-gray-300 transition-all`}
            >
              <div className="flex items-center gap-3 px-4 py-3.5 lg:px-5 lg:py-4">
                {/* Product image */}
                {eco.image ? (
                  <div className="relative w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0">
                    <Image
                      src={eco.image}
                      alt={eco.name}
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0 rounded-lg bg-[#1A1A1A]/5 flex items-center justify-center">
                    <span className="text-[14px] lg:text-[16px] font-black text-[#1A1A1A]/40">P</span>
                  </div>
                )}

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded ${eco.badge}`}>
                      {eco.name}
                    </span>
                  </div>
                  <p className="text-[11px] lg:text-[12px] text-[#6B7280] mt-1 whitespace-nowrap">
                    {eco.desc}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-[#D1D5DB] group-hover:text-[#1A1A1A] transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
