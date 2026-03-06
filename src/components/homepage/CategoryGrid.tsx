'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { CATEGORIES } from './data/constants';

/**
 * Bento Grid — asymmetric layout breaking symmetry.
 *
 * Mobile (2-col):
 *   [ featured  (col-span-2, tall) ]
 *   [ item2 ] [ item3 ]
 *   [ item4 ] [ item5 ]
 *   [ item6 ] [ item7 ]
 *   [ item8  (col-span-2) ]
 *
 * Desktop (4-col, 3 rows):
 *   [ Outils élec (2×2) ] [ Batteries (1×1) ] [ Aspirateurs (1×2) ]
 *   [       cont.        ] [ Éclairage (1×1) ] [       cont.       ]
 *   [ Mesure    ] [ EPI       ] [ Extérieurs ] [ Assainissement     ]
 */

function getBentoClass(idx: number): string {
  switch (idx) {
    case 0:
      // Master card: 2 cols on mobile, 2×2 on desktop
      return 'col-span-2 h-[220px] min-[400px]:h-[240px] md:h-[280px] lg:col-span-2 lg:row-span-2 lg:h-auto';
    case 2:
      // Aspirateurs: tall vertical card on desktop (1×2)
      return 'h-[150px] md:h-[180px] lg:row-span-2 lg:h-auto';
    case 7:
      // Last item: spans 2 cols on mobile only
      return 'col-span-2 h-[150px] md:h-[180px] lg:col-span-1 lg:h-auto';
    default:
      // Standard 1×1
      return 'h-[150px] md:h-[180px] lg:h-auto';
  }
}

export default function CategoryGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-12 lg:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-[1.75rem] lg:text-4xl font-black uppercase tracking-normal text-center mb-6 lg:mb-12"
        >
          NOTRE CATALOGUE
        </motion.h2>

        <div
          ref={ref}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-4 lg:auto-rows-[200px]"
        >
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.handle}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.55,
                delay: idx * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={getBentoClass(idx)}
            >
              <Link
                href={`/collections/${cat.handle}`}
                className="group relative overflow-hidden rounded-2xl lg:rounded-3xl block h-full transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  sizes={
                    idx === 0
                      ? '(max-width: 1024px) 100vw, 50vw'
                      : idx === 2
                        ? '(max-width: 1024px) 50vw, 25vw'
                        : '(max-width: 1024px) 50vw, 25vw'
                  }
                />
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 transition-all duration-300 ${idx === 0
                      ? 'bg-gradient-to-t from-black/90 via-black/40 to-black/5 group-hover:via-black/50'
                      : idx === 2
                        ? 'bg-gradient-to-t from-black/85 via-black/35 to-black/5 group-hover:via-black/45'
                        : 'bg-gradient-to-t from-black/80 via-black/25 to-transparent group-hover:via-black/35'
                    }`}
                />
                {/* Red accent line on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#DB021D] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-10" />
                {/* Text content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 z-10">
                  <h3
                    className={`text-white font-black uppercase leading-tight ${idx === 0
                        ? 'text-lg min-[400px]:text-xl lg:text-2xl'
                        : idx === 2
                          ? 'text-[15px] lg:text-lg'
                          : 'text-[15px] lg:text-base'
                      }`}
                  >
                    {cat.name}
                  </h3>
                  <p className={`text-white/70 mt-1 leading-snug ${idx === 0 ? 'text-[14px]' : 'text-[12px] lg:text-[13px]'}`}>
                    {cat.subtitle}
                  </p>
                  <p className="text-white/40 text-[12px] mt-1.5 font-medium flex items-center gap-1 group-hover:text-white/60 transition-colors">
                    {cat.count} produits
                    <ChevronRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
                  </p>
                </div>
                {/* Featured badge */}
                {idx === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                    className="absolute top-4 left-4 z-10"
                  >
                    <span className="px-3 py-1.5 bg-[#DB021D] text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg shadow-[#DB021D]/30">
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
