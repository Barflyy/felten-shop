'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { CATEGORIES } from './data/constants';

/**
 * Mobile: 2-column grid with featured card spanning full width
 * Desktop: 4-col bento grid
 */

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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-8 lg:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl lg:text-4xl font-black uppercase tracking-normal text-center mb-5 lg:mb-12"
        >
          NOTRE CATALOGUE
        </motion.h2>

        <div
          ref={ref}
          className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4 lg:auto-rows-[200px]"
        >
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.handle}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: idx * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={getBentoClass(cat.bentoSize)}
            >
              <Link
                href={`/collections/${cat.handle}`}
                className="group relative overflow-hidden rounded-xl lg:rounded-2xl block h-full transition-all duration-400 active:scale-[0.98] lg:hover:scale-[1.02] lg:hover:shadow-premium bg-[#1a1a1a]"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  priority={idx < 4}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  sizes={
                    cat.bentoSize === 'featured'
                      ? '(max-width: 1024px) 100vw, 50vw'
                      : '(max-width: 1024px) 50vw, 25vw'
                  }
                />
                {/* Gradient */}
                <div
                  className={`absolute inset-0 transition-all duration-300 ${cat.bentoSize === 'featured'
                    ? 'bg-gradient-to-t from-black/90 via-black/40 to-black/5'
                    : 'bg-gradient-to-t from-black/85 via-black/30 to-transparent'
                    }`}
                />
                {/* Red accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#DB021D] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />
                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-5 z-10">
                  <h3
                    className={`text-white font-black uppercase leading-tight ${cat.bentoSize === 'featured'
                      ? 'text-base lg:text-2xl'
                      : 'text-[13px] lg:text-base'
                      }`}
                  >
                    {cat.name}
                  </h3>
                  <p className={`text-white/60 mt-0.5 leading-snug ${cat.bentoSize === 'featured' ? 'text-[12px] lg:text-[14px]' : 'text-[10px] lg:text-[13px]'}`}>
                    {cat.subtitle}
                  </p>
                  <p className="text-white/35 text-[10px] lg:text-[12px] mt-1 font-medium flex items-center gap-0.5 group-hover:text-white/60 transition-colors">
                    {cat.count} produits
                    <ChevronRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
                  </p>
                </div>
                {/* Featured badge */}
                {cat.bentoSize === 'featured' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                    className="absolute top-3 left-3 lg:top-4 lg:left-4 z-10"
                  >
                    <span className="px-2.5 py-1 lg:px-3 lg:py-1.5 bg-[#DB021D] text-white text-[9px] lg:text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg shadow-[#DB021D]/30">
                      POPULAIRE
                    </span>
                  </motion.div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
