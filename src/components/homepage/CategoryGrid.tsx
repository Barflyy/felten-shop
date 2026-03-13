'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { CATEGORIES } from './data/constants';

function getBentoClass(size?: 'featured' | 'tall' | 'wide' | 'standard'): string {
  switch (size) {
    case 'featured':
      return 'col-span-2 aspect-[2/1] lg:col-span-2 lg:row-span-2 lg:aspect-auto';
    case 'tall':
      return 'aspect-[3/4] lg:row-span-2 lg:aspect-auto';
    case 'wide':
      return 'col-span-2 aspect-[2/1] lg:col-span-1 lg:aspect-auto';
    default:
      return 'aspect-[3/4] lg:aspect-auto';
  }
}

export default function CategoryGrid() {
  return (
    <section className="py-8 lg:py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3 lg:auto-rows-[200px]">
          {CATEGORIES.map((cat, idx) => (
            <div key={cat.handle} className={getBentoClass(cat.bentoSize)}>
              <Link
                href={`/collections/${cat.handle}`}
                className="group relative overflow-hidden rounded-lg block h-full bg-[#F5F5F5]"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  priority={idx < 4}
                  className="object-contain p-4 lg:p-6 transition-transform duration-300 group-hover:scale-[1.05]"
                  sizes={
                    cat.bentoSize === 'featured'
                      ? '(max-width: 1024px) 100vw, 50vw'
                      : '(max-width: 1024px) 50vw, 25vw'
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-5">
                  <h3 className={`text-white font-bold leading-tight ${cat.bentoSize === 'featured' ? 'text-[15px] lg:text-[20px]' : 'text-[13px] lg:text-[15px]'}`}>
                    {cat.name}
                  </h3>
                  <p className={`text-white/60 mt-0.5 ${cat.bentoSize === 'featured' ? 'text-[12px] lg:text-[13px]' : 'text-[10px] lg:text-[12px]'}`}>
                    {cat.subtitle}
                  </p>
                  <p className="text-white/40 text-[10px] lg:text-[11px] mt-1 flex items-center gap-0.5 group-hover:text-white/60 transition-colors">
                    {cat.count} produits
                    <ChevronRight className="w-3 h-3" strokeWidth={2} />
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
