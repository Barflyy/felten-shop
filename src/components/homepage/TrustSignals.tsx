'use client';

import { useRef } from 'react';
import { Headphones, Warehouse, BadgeCheck } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-8 lg:py-20 bg-[#F5F5F5]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl lg:text-4xl font-black uppercase tracking-normal text-center mb-2 lg:mb-4"
        >
          POURQUOI FELTEN SHOP ?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[#6B7280] text-[13px] lg:text-[15px] text-center mb-6 lg:mb-12 max-w-lg mx-auto"
        >
          Un service pensé pour les pros du terrain.
        </motion.p>

        <div ref={ref} className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-8">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl lg:rounded-2xl p-4 lg:py-12 lg:px-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                {/* Mobile: horizontal layout */}
                <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-0">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#DB021D] rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-[#1A1A1A]/5 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]">
                    <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white drop-shadow-sm" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0 lg:mt-4">
                    <div className="flex items-baseline gap-1.5 lg:mb-2">
                      <span className="text-lg lg:text-2xl font-black text-[#1A1A1A] leading-none">{item.stat}</span>
                      <span className="text-[11px] lg:text-[12px] text-[#6B7280] font-medium">{item.statLabel}</span>
                      <span className="text-[11px] lg:hidden font-medium text-[#6B7280]">—</span>
                      <span className="text-[12px] lg:hidden font-bold text-[#1A1A1A]">{item.title}</span>
                    </div>
                    <h3 className="hidden lg:block text-base font-bold text-[#1A1A1A] mb-2">{item.title}</h3>
                    <p className="hidden lg:block text-[14px] text-[#6B7280] leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
