'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, delay, ease: EASE },
  }),
};

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={sectionRef}
      className="bg-[#1A1A1A] relative overflow-clip"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="/images/hero-fallback.jpg"
        >
          <source src="/videos/milwaukee-action.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Texture overlay */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 8px), repeating-linear-gradient(-45deg, #000 0px, #000 2px, transparent 2px, transparent 8px)',
        }}
      />

      {/* ── MOBILE & TABLET (< lg) ── */}
      <div className="lg:hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#DB021D]/[0.4] rounded-full blur-[80px] mix-blend-screen"
          />
        </div>

        <div className="relative z-10 px-5 pt-6 pb-8 flex flex-col items-center text-center">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#DB021D] text-white text-[8px] font-bold uppercase tracking-[0.12em] rounded-md mb-4"
          >
            REVENDEUR OFFICIEL MILWAUKEE
          </motion.span>

          <motion.h1
            className="text-[1.85rem] leading-[0.92] font-extrabold uppercase tracking-tight mb-3 w-full"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <motion.span variants={fadeUp} initial="hidden" animate="visible" custom={0.05} className="text-white block">
              LA QUALITÉ
            </motion.span>
            <motion.span variants={fadeUp} initial="hidden" animate="visible" custom={0.1} className="text-white block">
              MILWAUKEE.
            </motion.span>
            <motion.span variants={fadeUp} initial="hidden" animate="visible" custom={0.2} className="text-transparent bg-clip-text bg-gradient-to-r from-[#DB021D] to-[#FF3B53] block mt-0.5">
              LE SERVICE FELTEN
            </motion.span>
            <motion.span variants={fadeUp} initial="hidden" animate="visible" custom={0.25} className="text-transparent bg-clip-text bg-gradient-to-r from-[#DB021D] to-[#FF3B53] block">
              EN PLUS.
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0.3}
            className="text-white/55 text-[13px] mb-5 font-medium max-w-[280px]"
          >
            Conseil expert, suivi personnalisé, SAV réactif.
          </motion.p>

          {/* Product image - compact */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="relative w-[65%] max-w-[260px] aspect-square mb-6"
          >
            <Image
              src="/images/m18-fuel-drill.png"
              alt="Milwaukee M18 FUEL"
              fill
              className="object-contain drop-shadow-[0_8px_24px_rgba(219,2,29,0.2)]"
              sizes="(max-width: 768px) 65vw, 50vw"
              priority
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
              className="absolute -bottom-1 -left-3 bg-white/70 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg border border-white/50 text-left"
            >
              <p className="text-[9px] font-black text-[#DB021D] uppercase tracking-widest">FUEL M18</p>
              <p className="text-[10px] font-bold text-[#1A1A1A]">En stock</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: 'spring', stiffness: 200 }}
              className="absolute -top-2 -right-3 bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg border border-white/10 text-right"
            >
              <p className="text-[8px] font-bold text-white/70 uppercase tracking-widest">Couple max</p>
              <p className="text-[12px] font-black text-white">158 Nm</p>
            </motion.div>
          </motion.div>

          {/* CTAs - side by side */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0.45}
            className="flex gap-2.5 w-full max-w-[340px] mb-5"
          >
            <Link
              href="/collections"
              className="group/btn relative flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-[#DB021D] text-white text-[12px] font-black uppercase tracking-wider rounded-lg hover:bg-[#B8011A] transition-colors overflow-hidden"
            >
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative z-10 flex items-center gap-1">
                CATALOGUE
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
              </span>
            </Link>
            <Link
              href="/collections?promo=true"
              className="flex-1 flex items-center justify-center py-3.5 border-2 border-white/20 text-white text-[12px] font-black uppercase tracking-wider rounded-lg hover:bg-white hover:text-[#1A1A1A] transition-colors"
            >
              OFFRES
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── DESKTOP (lg+) ── */}
      <div className="hidden lg:block relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[600px] h-[600px] xl:w-[700px] xl:h-[700px] bg-[#DB021D]/[0.4] rounded-full blur-[140px] pointer-events-none mix-blend-screen"
        />

        <div className="max-w-[1280px] mx-auto px-8 xl:px-12 relative z-10">
          <div className="flex items-center min-h-[600px] xl:min-h-[700px]">

            {/* Left 50% */}
            <div className="w-[50%] py-20 xl:py-24 pr-12 xl:pr-16">
              <motion.span
                variants={fadeUp} initial="hidden" animate="visible" custom={0}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#DB021D] text-white text-[11px] font-bold uppercase tracking-[0.12em] rounded-md mb-8"
              >
                REVENDEUR OFFICIEL MILWAUKEE BELGIQUE
              </motion.span>

              <h1
                className="text-[3rem] xl:text-[4.5rem] leading-[0.92] font-extrabold uppercase tracking-tight mb-8"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <motion.span
                  variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
                  className="text-white block"
                >
                  LA QUALITÉ MILWAUKEE.
                </motion.span>
                <motion.span
                  variants={fadeUp} initial="hidden" animate="visible" custom={0.3}
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#DB021D] to-[#FF3B53] block mt-1"
                >
                  LE SERVICE FELTEN EN PLUS.
                </motion.span>
              </h1>

              <motion.p
                variants={fadeUp} initial="hidden" animate="visible" custom={0.45}
                className="text-white/50 text-[15px] lg:text-base mb-8 max-w-md"
              >
                Conseil expert, suivi personnalisé, SAV réactif.
              </motion.p>

              <motion.div
                variants={fadeUp} initial="hidden" animate="visible" custom={0.55}
                className="flex gap-3 mb-8"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/collections"
                    className="group/btn relative inline-flex items-center justify-center gap-2 px-10 py-[18px] bg-[#DB021D] text-white text-[15px] font-black uppercase tracking-wider rounded-lg hover:bg-[#B8011A] transition-colors shadow-premium overflow-hidden"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    DÉCOUVRIR LE CATALOGUE
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" strokeWidth={3} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/collections?promo=true"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white text-sm font-black uppercase tracking-wider rounded-lg hover:bg-white hover:text-[#1A1A1A] hover:border-white transition-all shadow-premium"
                  >
                    OFFRES DU MOMENT
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Right 50% */}
            <motion.div
              className="w-[50%] relative self-stretch flex items-center justify-center pl-8"
              style={{ y: imageY }}
            >
              <motion.div
                initial={{ opacity: 0, x: 100, y: 20, rotate: 6, scale: 0.85, filter: 'blur(12px)' }}
                animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
                className="relative w-full"
              >
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="relative w-[110%] aspect-square -mr-[10%] drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
                    <Image
                      src="/images/m18-fuel-drill.png"
                      alt="Milwaukee M18 FUEL — Perceuse-visseuse haute performance"
                      fill
                      className="object-contain"
                      style={{
                        filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.4)) drop-shadow(0 10px 20px rgba(219,2,29,0.15))',
                      }}
                      sizes="(max-width: 1024px) 50vw, 40vw"
                      priority
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 15, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                    className="absolute bottom-16 left-4 bg-white/70 backdrop-blur-[20px] saturate-150 rounded-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50"
                  >
                    <p className="text-[11px] font-black text-[#DB021D] uppercase tracking-wider">FUEL M18</p>
                    <p className="text-[12px] font-semibold text-[#1A1A1A]">Stock disponible</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -15, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
                    className="absolute top-8 right-[25%] bg-black/60 backdrop-blur-[20px] saturate-150 rounded-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-[#ffffff1a]"
                  >
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Couple max</p>
                    <p className="text-[14px] font-black text-white">158 Nm</p>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
