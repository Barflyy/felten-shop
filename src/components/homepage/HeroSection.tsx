'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Star } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, delay, ease: EASE },
  }),
};

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <span className="text-base lg:text-lg font-black text-white leading-none block">{value}</span>
    <span className="text-[9px] lg:text-[10px] text-white/50 leading-none">{label}</span>
  </div>
);

const Divider = () => <div className="w-px h-7 lg:h-8 bg-white/15 mx-4 lg:mx-5" />;

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
      {/* Action Video Background - Fallback to intense radial red */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="/images/hero-fallback.jpg" // fallback image if you have one
        >
          <source src="/videos/milwaukee-action.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Carbon fiber / metal texture overlay */}
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 8px), repeating-linear-gradient(-45deg, #000 0px, #000 2px, transparent 2px, transparent 8px)',
        }}
      />

      {/* ────────────────────────────────────────────
          MOBILE & TABLET (< lg) — Clean vertical flow
          Badge → H1 → Subtitle → Image → CTAs → Stats
          ──────────────────────────────────────────── */}
      <div className="lg:hidden relative">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] md:w-[550px] h-[350px] md:h-[550px] bg-[#DB021D]/[0.4] rounded-full blur-[100px] md:blur-[140px] mix-blend-screen"
          />
        </div>

        <div className="relative z-10 px-6 pt-8 md:pt-16 pb-12 md:pb-20 flex flex-col items-center text-center">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-[#DB021D] text-white text-[9px] md:text-[11px] font-bold uppercase tracking-[0.12em] rounded-md mb-6"
          >
            REVENDEUR OFFICIEL MILWAUKEE BELGIQUE
          </motion.span>

          <motion.h1
            className="text-[2.2rem] sm:text-[2.8rem] md:text-[3.5rem] leading-[0.90] font-extrabold uppercase tracking-tight mb-5 w-full"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <motion.span variants={fadeUp} initial="hidden" animate="visible" custom={0.1} className="text-white block">
              LA QUALITÉ
            </motion.span>
            <motion.span variants={fadeUp} initial="hidden" animate="visible" custom={0.2} className="text-white block">
              MILWAUKEE.
            </motion.span>
            <motion.span variants={fadeUp} initial="hidden" animate="visible" custom={0.3} className="text-[#DB021D] block mt-1">
              LE SERVICE FELTEN
            </motion.span>
            <motion.span variants={fadeUp} initial="hidden" animate="visible" custom={0.35} className="text-[#DB021D] block">
              EN PLUS.
            </motion.span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0.4}
            className="text-white/60 text-[15px] md:text-[18px] mb-8 font-medium max-w-md"
          >
            Conseil expert, suivi personnalisé, SAV réactif. L'exigence professionnelle à votre service.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)', rotate: -5 }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', rotate: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: EASE }}
            className="relative w-[80%] sm:w-[50%] md:w-[45%] max-w-[400px] aspect-square mb-10"
          >
            <Image
              src="/images/m18-fuel-drill.png"
              alt="Milwaukee M18 FUEL"
              fill
              className="object-contain drop-shadow-[0_12px_32px_rgba(219,2,29,0.25)]"
              sizes="(max-width: 768px) 80vw, 50vw"
              priority
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: 'spring', stiffness: 200 }}
              className="absolute -bottom-2 -left-2 md:-left-8 md:bottom-2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-100/20 text-left"
            >
              <p className="text-[11px] md:text-[12px] font-black text-[#DB021D] uppercase tracking-widest">FUEL M18</p>
              <p className="text-[12px] md:text-[13px] font-bold text-[#1A1A1A]">En stock</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
              className="absolute -top-4 -right-2 md:-right-8 bg-[#1A1A1A]/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/10 text-right"
            >
              <p className="text-[10px] md:text-[11px] font-bold text-white/60 uppercase tracking-widest">Couple max</p>
              <p className="text-[14px] md:text-[15px] font-black text-white">158 Nm</p>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0.6}
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-[500px] mb-8"
          >
            <motion.div whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Link
                href="/collections"
                className="group/btn relative flex items-center justify-center gap-2 w-full px-8 py-4 sm:py-5 bg-[#DB021D] text-white text-[14px] font-black uppercase tracking-widest rounded-xl hover:bg-[#B8011A] transition-colors shadow-lg shadow-[#DB021D]/30 overflow-hidden"
              >
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                  NOUVEAUTÉS
                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                </span>
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Link
                href="/collections?promo=true"
                className="flex items-center justify-center gap-2 w-full px-6 py-3.5 sm:py-[18px] border-2 border-white/20 text-white text-[13px] font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-[#1A1A1A] hover:border-white transition-colors whitespace-nowrap"
              >
                OFFRES DU MOMENT
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0.75}
            className="inline-flex items-center justify-center bg-white/[0.05] border border-white/10 backdrop-blur-md rounded-2xl px-5 py-3.5"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                ))}
              </div>
              <StatItem value="4.9/5" label="340 avis" />
            </div>
            <Divider />
            <StatItem value="516" label="références" />
            <Divider />
            <StatItem value="24h" label="expédition" />
          </motion.div>
        </div>
      </div>

      {/* ────────────────────────────────────────────
          DESKTOP (lg+) — 50/50 split
          Image overflows downward into the marquee for 3D pop-out.
          ──────────────────────────────────────────── */}
      <div className="hidden lg:block relative z-10">
        {/* Radial glow behind image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[600px] h-[600px] xl:w-[700px] xl:h-[700px] bg-[#DB021D]/[0.4] rounded-full blur-[140px] pointer-events-none mix-blend-screen"
        />

        <div className="max-w-[1280px] mx-auto px-8 xl:px-12 relative z-10">
          <div className="flex items-center min-h-[600px] xl:min-h-[700px]">

            {/* Left 50% — Content */}
            <div className="w-[50%] py-20 xl:py-24 pr-12 xl:pr-16">
              <motion.span
                variants={fadeUp} initial="hidden" animate="visible" custom={0}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#DB021D] text-white text-[11px] font-bold uppercase tracking-[0.12em] rounded-md mb-8"
              >
                REVENDEUR OFFICIEL MILWAUKEE BELGIQUE
              </motion.span>

              <h1
                className="text-[3rem] xl:text-[4rem] leading-[0.92] font-extrabold uppercase tracking-tight mb-8"
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
                  className="text-[#DB021D] block mt-1 whitespace-nowrap"
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
                    className="group/btn relative inline-flex items-center justify-center gap-2 px-10 py-[18px] bg-[#DB021D] text-white text-[15px] font-black uppercase tracking-wider rounded-lg hover:bg-[#B8011A] transition-colors shadow-lg shadow-[#DB021D]/30 overflow-hidden"
                  >
                    <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    DÉCOUVRIR LE CATALOGUE
                    <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" strokeWidth={3} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/collections?promo=true"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white text-sm font-black uppercase tracking-wider rounded-lg hover:bg-white hover:text-[#1A1A1A] hover:border-white transition-all"
                  >
                    OFFRES DU MOMENT
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                variants={fadeUp} initial="hidden" animate="visible" custom={0.65}
                className="inline-flex items-center bg-white/[0.07] backdrop-blur-sm rounded-xl px-5 py-4"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                    ))}
                  </div>
                  <StatItem value="4.9/5" label="340 avis" />
                </div>
                <Divider />
                <StatItem value="516" label="références" />
                <Divider />
                <StatItem value="24h" label="expédition" />
              </motion.div>
            </div>

            {/* Right 50% — Image overflows downward for 3D pop-out */}
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
                  {/* Image overflows right — contained vertically */}
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

                  {/* Floating badge — bottom-left */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 15, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                    className="absolute bottom-16 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-100"
                  >
                    <p className="text-[11px] font-black text-[#DB021D] uppercase tracking-wider">FUEL M18</p>
                    <p className="text-[12px] font-semibold text-[#1A1A1A]">Stock disponible</p>
                  </motion.div>

                  {/* Floating specs badge — top-right */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -15, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
                    className="absolute top-8 right-[25%] bg-[#1A1A1A]/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-white/10"
                  >
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Couple max</p>
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
