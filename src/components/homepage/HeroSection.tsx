'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-[#1A1A1A] relative overflow-clip">
      {/* ── MOBILE (< lg) ── */}
      <div className="lg:hidden relative z-10 px-5 pt-8 pb-10 flex flex-col items-center text-center">
        <span className="inline-flex items-center px-2.5 py-1 bg-white/10 text-white/70 text-[10px] font-semibold uppercase tracking-wider rounded mb-5">
          Revendeur Officiel Milwaukee
        </span>

        <h1 className="text-[1.75rem] leading-[1.05] font-bold text-white mb-3">
          La qualité Milwaukee.
          <br />
          <span className="text-[#DB021D]">Le service Felten en plus.</span>
        </h1>

        <p className="text-white/50 text-[13px] mb-6 max-w-[280px]">
          Conseil expert, suivi personnalisé, SAV réactif.
        </p>

        <div className="relative w-[60%] max-w-[240px] aspect-square mb-6">
          <Image
            src="/images/m18-fuel-drill.png"
            alt="Milwaukee M18 FUEL"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 60vw, 40vw"
            priority
          />
        </div>

        <div className="flex gap-3 w-full max-w-[320px]">
          <Link
            href="/collections/all"
            className="flex-1 flex items-center justify-center gap-1 py-3 bg-white text-[#1A1A1A] text-[13px] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Catalogue
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </Link>
          <Link
            href="/contact"
            className="flex-1 flex items-center justify-center py-3 border border-white/20 text-white text-[13px] font-medium rounded-lg hover:bg-white/10 transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </div>

      {/* ── DESKTOP (lg+) ── */}
      <div className="hidden lg:block relative z-10">
        <div className="max-w-[1280px] mx-auto px-8 xl:px-12">
          <div className="flex items-center min-h-[520px] xl:min-h-[600px]">
            {/* Left */}
            <div className="w-[50%] py-16 xl:py-20 pr-12">
              <span className="inline-flex items-center px-3 py-1.5 bg-white/10 text-white/70 text-[11px] font-semibold uppercase tracking-wider rounded mb-6">
                Revendeur Officiel Milwaukee
              </span>

              <h1 className="text-[2.5rem] xl:text-[3.2rem] leading-[1.05] font-bold text-white mb-6">
                La qualité Milwaukee.
                <br />
                <span className="text-[#DB021D]">Le service Felten en plus.</span>
              </h1>

              <p className="text-white/45 text-[15px] mb-8 max-w-md">
                Conseil expert, suivi personnalisé, SAV réactif.
              </p>

              <div className="flex gap-3">
                <Link
                  href="/collections/all"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#1A1A1A] text-[14px] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Découvrir le catalogue
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-7 py-3.5 border border-white/20 text-white text-[14px] font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  Nous contacter
                </Link>
              </div>
            </div>

            {/* Right */}
            <div className="w-[50%] relative flex items-center justify-center pl-8">
              <div className="relative w-[90%] aspect-square">
                <Image
                  src="/images/m18-fuel-drill.png"
                  alt="Milwaukee M18 FUEL"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 50vw, 40vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
