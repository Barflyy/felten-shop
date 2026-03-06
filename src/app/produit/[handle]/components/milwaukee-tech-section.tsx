'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Shield } from 'lucide-react';

export function MilwaukeeTechSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const features = [
    {
      title: 'MOTEUR BRUSHLESS POWERSTATE\u2122',
      desc: 'Con\u00e7u et fabriqu\u00e9 par Milwaukee\u00ae, la dur\u00e9e de vie du moteur est multipli\u00e9e par 10 et l\u2019autonomie doubl\u00e9e.',
      icon: <Zap className="w-8 h-8 text-white" />,
    },
    {
      title: 'INTELLIGENCE REDLINK PLUS\u2122',
      desc: "L'\u00e9lectronique la plus avanc\u00e9e du march\u00e9 de l'outil sans fil. Protection contre les surcharges de l'outil et de la batterie.",
      icon: <Shield className="w-8 h-8 text-white" />,
    },
    {
      title: 'BATTERIES REDLITHIUM\u2122',
      desc: "Autonomie multipli\u00e9e par 2,5, +20% de puissance. Dur\u00e9e de vie doubl\u00e9e et utilisation jusqu'\u00e0 -20\u00b0C.",
      icon: (
        <div className="w-8 h-8 text-white font-black flex items-center justify-center text-xs tracking-tighter">
          M18<span className="text-[8px] align-top">\u2122</span>
        </div>
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="bg-[#1A1A1A] py-16 lg:py-24 text-white overflow-hidden">
      <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 lg:px-8 xl:px-12">
        <div className="flex items-center justify-center gap-3 mb-10 lg:mb-16">
          <span className="w-12 h-1 bg-[#DB021D] rounded-full" />
          <h2
            className="text-2xl lg:text-3xl font-black uppercase tracking-tight text-center"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            L&apos;ADN Milwaukee&reg;
          </h2>
          <span className="w-12 h-1 bg-[#DB021D] rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] bg-[#DB021D]/10 blur-[100px] pointer-events-none rounded-full" />

          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center relative z-10 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#DB021D] rounded-[20px] flex items-center justify-center shadow-[0_0_30px_rgba(219,2,29,0.3)] mb-6 lg:mb-8 transform -rotate-[4deg] group-hover:-rotate-[8deg] transition-transform duration-300">
                {feat.icon}
              </div>
              <h3 className="text-xl lg:text-2xl font-black uppercase tracking-wide mb-3 lg:mb-4" style={{ fontFamily: 'var(--font-oswald)' }}>{feat.title}</h3>
              <p className="text-zinc-400 text-sm lg:text-[15px] leading-relaxed max-w-[300px]">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
