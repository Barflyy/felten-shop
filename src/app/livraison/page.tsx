import Link from 'next/link';
import { ArrowLeft, Truck, MapPin, Clock, Package, CheckCircle, ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/footer';



const REASSURANCE = [
  { icon: <ShieldCheck className="w-6 h-6 text-[#DB021D]" strokeWidth={1.5} />, title: 'Emballage soigné', desc: 'Chaque commande est emballée avec soin pour protéger votre matériel Milwaukee.' },
  { icon: <Clock className="w-6 h-6 text-[#DB021D]" strokeWidth={1.5} />, title: 'Expédition rapide', desc: 'Les commandes passées avant 14h sont expédiées le jour même (hors week-end).' },
  { icon: <Package className="w-6 h-6 text-[#DB021D]" strokeWidth={1.5} />, title: 'Suivi inclus', desc: 'Un email de suivi avec numéro de tracking vous est envoyé dès l\'expédition.' },
  { icon: <CheckCircle className="w-6 h-6 text-[#DB021D]" strokeWidth={1.5} />, title: 'Stock garanti', desc: 'Les produits affichés "En stock" sont disponibles dans notre entrepôt belge.' },
];
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
      {/* ── Header ── */}
      <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-20 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="w-10 h-10 flex items-center justify-center -ml-2 text-[#1A1A1A] hover:bg-gray-50 rounded-full transition-colors" aria-label="Retour à l'accueil">
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </Link>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-bold text-[#1A1A1A] tracking-tighter underline decoration-[#DB021D] decoration-2 underline-offset-4" style={{ fontFamily: 'var(--font-oswald)' }}>FELTEN</span>
            <span className="text-xl font-medium text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-oswald)' }}> SHOP</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* ── Hero ── */}
        <section className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16 lg:py-20 text-center">
            <p className="text-[13px] font-bold uppercase tracking-widest text-[#DB021D] mb-4 bg-[#DB021D]/5 inline-block px-3 py-1 rounded-full">
              Expédition & Livraison
            </p>
            <h1 className="text-4xl lg:text-6xl font-black uppercase text-[#1A1A1A] tracking-tight mb-6" style={{ fontFamily: 'var(--font-oswald)' }}>
              Tarifs & Délais
            </h1>
            <p className="text-[16px] lg:text-[18px] text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
              Nous livrons votre matériel Milwaukee partout en Belgique, France, Luxembourg, Pays-Bas et Allemagne.
              Expédition rapide depuis notre entrepôt belge.
            </p>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="max-w-[1000px] mx-auto px-4 lg:px-8 py-12 lg:py-20">

          {/* Shipping Table */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#DB021D]/10 flex items-center justify-center text-[#DB021D]">
                <Truck className="w-5 h-5" strokeWidth={2} />
              </div>
              <h2 className="text-[20px] font-black uppercase tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-oswald)' }}>
                Grille Tarifaire
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 bg-white">
              {/* Desktop Header */}
              <div className="hidden md:grid grid-cols-4 bg-gray-50 border-b border-gray-100">
                <div className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Zone de livraison</div>
                <div className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">Standard (J+2/3)</div>
                <div className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">Express (J+1)</div>
                <div className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">Gratuit dès</div>
              </div>

              <div className="divide-y divide-gray-50">
                {ZONES.map((row) => (
                  <div key={row.zone} className="grid md:grid-cols-4 items-center hover:bg-gray-50/50 transition-colors p-6 md:p-0">
                    {/* Zone (Mobile & Desktop) */}
                    <div className="md:px-6 md:py-5 flex items-center gap-3 mb-4 md:mb-0">
                      <span className="text-2xl">{row.flag}</span>
                      <span className="text-[15px] font-bold text-[#1A1A1A]">{row.zone}</span>
                    </div>

                    {/* Mobile Grid for data */}
                    <div className="col-span-3 grid grid-cols-3 md:contents gap-4">
                      <div className="md:px-6 md:py-5 text-center">
                        <span className="md:hidden block text-[10px] font-bold uppercase text-gray-400 mb-1">Standard</span>
                        <span className="text-[15px] font-bold text-[#1A1A1A]">{row.standard}</span>
                      </div>

                      <div className="md:px-6 md:py-5 text-center">
                        <span className="md:hidden block text-[10px] font-bold uppercase text-gray-400 mb-1">Express</span>
                        {row.express !== '—' ? (
                          <span className="inline-flex flex-col md:flex-row items-center gap-1.5">
                            <span className="text-[15px] font-bold text-[#DB021D]">{row.express}</span>
                          </span>
                        ) : (
                          <span className="text-[15px] text-gray-300">—</span>
                        )}
                      </div>

                      <div className="md:px-6 md:py-5 text-center">
                        <span className="md:hidden block text-[10px] font-bold uppercase text-gray-400 mb-1">Gratuit dès</span>
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-[13px] font-bold px-3 py-1 rounded-full border border-green-100">
                          {row.gratuit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-[13px] text-gray-400 italic text-center md:text-left">
              * Mode Express disponible pour toute commande passée avant 13h (jours ouvrés).
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#DB021D] mb-6">
                <Package className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="text-[18px] font-black uppercase tracking-tight text-[#1A1A1A] mb-3" style={{ fontFamily: 'var(--font-oswald)' }}>
                Suivi de commande
              </h3>
              <p className="text-[15px] text-gray-500 mb-6 leading-relaxed">
                Dès l'expédition, recevez un lien de tracking pour suivre votre colis en temps réel jusqu'à chez vous.
              </p>
              <ul className="space-y-3">
                {[
                  'Lien de tracking DPD ou Bpost',
                  'Notifications par email',
                  'Suivi disponible dans votre espace client',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[14px] text-[#1A1A1A] font-medium">
                    <CheckCircle className="w-4 h-4 text-[#DB021D]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#111] text-white rounded-3xl p-8 border border-gray-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#DB021D] blur-[80px] opacity-20 pointer-events-none" />
              <div className="w-12 h-12 rounded-xl bg-[#222] flex items-center justify-center text-[#DB021D] mb-6">
                <MapPin className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="text-[18px] font-black uppercase tracking-tight text-white mb-3" style={{ fontFamily: 'var(--font-oswald)' }}>
                Click & Collect
              </h3>
              <p className="text-[15px] text-gray-400 mb-6 leading-relaxed">
                Besoin de votre matériel tout de suite ? Commandez en ligne et venez récupérer votre commande en magasin.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Gratuit — aucun frais',
                  'Disponible sous 2h (si stock)',
                  'Du Lundi au Vendredi, 8h - 18h',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[14px] text-gray-300 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DB021D]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-full h-12 bg-[#DB021D] text-white text-[13px] font-bold uppercase tracking-wider rounded-xl hover:bg-red-700 transition-colors"
              >
                Voir l'adresse du magasin
              </Link>
            </div>
          </div>

          {/* Reassurance */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, title: "Emballage Renforcé", desc: "Protection optimale pour l'outillage." },
              { icon: Clock, title: "Expédition jour J", desc: "Pour les commandes avant 14h." },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="w-10 h-10 rounded-full bg-red-50 text-[#DB021D] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#1A1A1A]">{item.title}</p>
                  <p className="text-[13px] text-gray-500">{item.desc}</p>
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
