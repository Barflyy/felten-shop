import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Truck, MapPin, Clock, Package, CheckCircle, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Livraison — Felten Shop | Revendeur Milwaukee Luxembourg',
  description: 'Livraison rapide au Luxembourg, Belgique et Europe. Frais de port offerts dès 200€. Suivi en temps réel de votre commande.',
  alternates: { canonical: 'https://felten.shop/livraison' },
};

const ZONES = [
  { zone: 'Belgique', flag: '🇧🇪', standard: '5,99€', express: '12,99€', gratuit: '150€' },
  { zone: 'Luxembourg', flag: '🇱🇺', standard: '6,99€', express: '—', gratuit: '200€' },
  { zone: 'France', flag: '🇫🇷', standard: '8,99€', express: '—', gratuit: '250€' },
  { zone: 'Pays-Bas', flag: '🇳🇱', standard: '8,99€', express: '—', gratuit: '250€' },
  { zone: 'Allemagne', flag: '🇩🇪', standard: '9,99€', express: '—', gratuit: '250€' },
];

export default function LivraisonPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="w-9 h-9 flex items-center justify-center -ml-1 text-[#1A1A1A]" aria-label="Retour">
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Link>
          <Link href="/" className="text-[1rem] tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">FELTEN</span>
            <span className="font-normal text-[#1A1A1A]"> SHOP</span>
          </Link>
          <div className="w-9" />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#F5F5F5] border-b border-gray-100">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-12 lg:py-16 text-center">
            <span className="inline-flex items-center px-3 py-1 bg-[#DB021D]/10 text-[#DB021D] text-[12px] font-semibold rounded-lg mb-4">
              Expédition & Livraison
            </span>
            <h1 className="text-[22px] lg:text-[32px] font-bold text-[#1A1A1A] mb-4">
              Tarifs & délais
            </h1>
            <p className="text-[14px] lg:text-[16px] text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
              Nous livrons votre matériel Milwaukee partout en Belgique, France, Luxembourg, Pays-Bas et Allemagne.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-[1000px] mx-auto px-4 lg:px-8 py-10 lg:py-16">

          {/* Shipping Table */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-[#DB021D]/10 flex items-center justify-center text-[#DB021D]">
                <Truck className="w-4 h-4" strokeWidth={2} />
              </div>
              <h2 className="text-[16px] font-semibold text-[#1A1A1A]">
                Grille tarifaire
              </h2>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
              {/* Desktop Header */}
              <div className="hidden md:grid grid-cols-4 bg-[#F5F5F5] border-b border-gray-100">
                <div className="px-5 py-3 text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Zone</div>
                <div className="px-5 py-3 text-center text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Standard (J+2/3)</div>
                <div className="px-5 py-3 text-center text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Express (J+1)</div>
                <div className="px-5 py-3 text-center text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">Gratuit dès</div>
              </div>

              <div className="divide-y divide-gray-50">
                {ZONES.map((row) => (
                  <div key={row.zone} className="grid md:grid-cols-4 items-center p-5 md:p-0 hover:bg-gray-50/50 transition-colors">
                    <div className="md:px-5 md:py-4 flex items-center gap-3 mb-3 md:mb-0">
                      <span className="text-xl">{row.flag}</span>
                      <span className="text-[14px] font-semibold text-[#1A1A1A]">{row.zone}</span>
                    </div>
                    <div className="col-span-3 grid grid-cols-3 md:contents gap-4">
                      <div className="md:px-5 md:py-4 text-center">
                        <span className="md:hidden block text-[10px] font-medium text-[#9CA3AF] mb-1">Standard</span>
                        <span className="text-[14px] font-semibold text-[#1A1A1A]">{row.standard}</span>
                      </div>
                      <div className="md:px-5 md:py-4 text-center">
                        <span className="md:hidden block text-[10px] font-medium text-[#9CA3AF] mb-1">Express</span>
                        {row.express !== '—' ? (
                          <span className="text-[14px] font-semibold text-[#DB021D]">{row.express}</span>
                        ) : (
                          <span className="text-[14px] text-[#D1D5DB]">—</span>
                        )}
                      </div>
                      <div className="md:px-5 md:py-4 text-center">
                        <span className="md:hidden block text-[10px] font-medium text-[#9CA3AF] mb-1">Gratuit dès</span>
                        <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[12px] font-semibold px-2.5 py-1 rounded border border-emerald-100">
                          {row.gratuit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[12px] text-[#9CA3AF] italic">
              * Express disponible pour les commandes passées avant 13h (jours ouvrés).
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <div className="bg-[#F5F5F5] rounded-lg p-6 border border-gray-100">
              <Package className="w-6 h-6 text-[#DB021D] mb-4" strokeWidth={2} />
              <h3 className="text-[15px] font-semibold text-[#1A1A1A] mb-2">Suivi de commande</h3>
              <p className="text-[13px] text-[#6B7280] mb-4 leading-relaxed">
                Dès l&apos;expédition, recevez un lien de tracking pour suivre votre colis en temps réel.
              </p>
              <ul className="space-y-2">
                {['Lien de tracking DPD ou Bpost', 'Notifications par email', 'Suivi dans votre espace client'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-[#1A1A1A] font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-[#DB021D]" strokeWidth={2} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#1A1A1A] text-white rounded-lg p-6">
              <MapPin className="w-6 h-6 text-[#DB021D] mb-4" strokeWidth={2} />
              <h3 className="text-[15px] font-semibold text-white mb-2">Click & Collect</h3>
              <p className="text-[13px] text-white/50 mb-4 leading-relaxed">
                Commandez en ligne et venez récupérer votre commande en magasin.
              </p>
              <ul className="space-y-2 mb-6">
                {['Gratuit — aucun frais', 'Disponible sous 2h (si stock)', 'Lun – Ven, 8h – 18h'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DB021D]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-full h-11 bg-white text-[#1A1A1A] text-[13px] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Voir l&apos;adresse du magasin
              </Link>
            </div>
          </div>

          {/* Reassurance */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: ShieldCheck, title: 'Emballage renforcé', desc: 'Protection optimale pour l\'outillage.' },
              { icon: Clock, title: 'Expédition jour J', desc: 'Pour les commandes avant 14h.' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 p-4 rounded-lg border border-gray-100">
                <div className="w-9 h-9 rounded-lg bg-[#DB021D]/5 text-[#DB021D] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1A1A1A]">{item.title}</p>
                  <p className="text-[12px] text-[#6B7280]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
