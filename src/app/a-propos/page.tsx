import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Award, Zap, Users, Package, Clock, Star, HeartHandshake, CheckCircle } from 'lucide-react';
import { Footer } from '@/components/footer';

const STATS = [
  { value: '5K+', label: 'Clients satisfaits', icon: <Users className="w-6 h-6" strokeWidth={1.5} /> },
  { value: '100%', label: 'Agréé Milwaukee', icon: <Award className="w-6 h-6" strokeWidth={1.5} /> },
  { value: '24h', label: 'Expédition Rapide', icon: <Clock className="w-6 h-6" strokeWidth={1.5} /> },
  { value: '3 Ans', label: 'Garantie Incluse', icon: <ShieldCheck className="w-6 h-6" strokeWidth={1.5} /> },
];

const ENGAGEMENTS = [
  {
    icon: <Award className="w-8 h-8 text-[#DB021D]" strokeWidth={1.5} />,
    title: 'Qualité Certifiée',
    desc: 'Produits 100% authentiques issus du réseau officiel Milwaukee. Zéro contrefaçon, zéro compromis.',
  },
  {
    icon: <Users className="w-8 h-8 text-[#DB021D]" strokeWidth={1.5} />,
    title: 'Expertise Pro',
    desc: 'Une équipe de passionnés qui utilise les outils au quotidien pour mieux vous conseiller.',
  },
  {
    icon: <Zap className="w-8 h-8 text-[#DB021D]" strokeWidth={1.5} />,
    title: 'Service Réactif',
    desc: 'Un SAV local géré en interne. Pas de plateforme téléphonique, mais des vrais experts.',
  },
  {
    icon: <HeartHandshake className="w-8 h-8 text-[#DB021D]" strokeWidth={1.5} />,
    title: 'Partenaire Durable',
    desc: 'Nous construisons une relation de confiance avec nos clients pros : tarifs, exclusivités et suivi.',
  },
];

export default function AProposPage() {
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
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-20 lg:py-28 text-center">
            <p className="text-[13px] font-bold uppercase tracking-widest text-[#DB021D] mb-4 bg-[#DB021D]/5 inline-block px-3 py-1 rounded-full">
              Notre Histoire
            </p>
            <h1 className="text-4xl lg:text-7xl font-black uppercase text-[#1A1A1A] tracking-tight mb-8" style={{ fontFamily: 'var(--font-oswald)' }}>
              L'EXCELLENCE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DB021D] to-[#b80019]">MILWAUKEE</span>
            </h1>
            <p className="text-[16px] lg:text-[19px] text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
              Plus qu'un simple revendeur, nous sommes votre partenaire outillage de confiance.
              Basés en Belgique, nous équipons les pros du Benelux avec le meilleur matériel.
            </p>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="max-w-[1280px] mx-auto px-6 lg:px-8 -mt-10 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-xl shadow-gray-100/50 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-center text-[#DB021D] mb-3">{stat.icon}</div>
                <p className="text-3xl font-black text-[#1A1A1A] mb-1 leading-none" style={{ fontFamily: 'var(--font-oswald)' }}>{stat.value}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Story & Mission ── */}
        <section className="max-w-[1280px] mx-auto px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black uppercase text-[#1A1A1A] mb-8 leading-tight" style={{ fontFamily: 'var(--font-oswald)' }}>
                Passionnés par<br />la performance
              </h2>
              <div className="space-y-6 text-[15px] text-gray-500 leading-relaxed font-medium">
                <p>
                  Felten Shop est né d'une conviction simple : les professionnels méritent des outils à la hauteur de leur talent. C'est pourquoi nous avons choisi de nous dédier exclusivement à <strong className="text-[#1A1A1A]">Milwaukee Tool</strong>, la référence mondiale de l'innovation.
                </p>
                <p>
                  Notre mission est de rendre l'outillage premium accessible à tous, avec un service irréprochable. Du conseil avant-vente au service après-vente, nous sommes là pour garantir que vos chantiers ne s'arrêtent jamais.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                {['Stock en Belgique', 'Livraison 24h', 'Conseil d\'expert'].map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-[13px] font-bold text-[#1A1A1A]">
                    <CheckCircle className="w-4 h-4 text-[#DB021D]" strokeWidth={2.5} />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Official Dealer Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#DB021D] blur-[100px] opacity-10" />
              <div className="relative bg-[#111] text-white rounded-3xl p-10 border border-gray-800 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#DB021D] opacity-20 rounded-bl-full" />

                <div className="w-16 h-16 bg-[#DB021D] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#DB021D]/20">
                  <Award className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>

                <h3 className="text-2xl font-black uppercase mb-4" style={{ fontFamily: 'var(--font-oswald)' }}>
                  Revendeur Agréé
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  En achetant chez nous, vous avez la garantie d'un produit authentique et d'une couverture complète par le réseau Milwaukee.
                </p>

                <div className="space-y-4 border-t border-gray-800 pt-8">
                  <div className="flex items-center gap-4">
                    <div className="text-right flex-1">
                      <p className="text-2xl font-black text-white leading-none" style={{ fontFamily: 'var(--font-oswald)' }}>100%</p>
                      <p className="text-[10px] uppercase text-gray-500 tracking-wider">Authentique</p>
                    </div>
                    <div className="w-px h-8 bg-gray-800" />
                    <div className="flex-1">
                      <p className="text-2xl font-black text-white leading-none" style={{ fontFamily: 'var(--font-oswald)' }}>3 ANS</p>
                      <p className="text-[10px] uppercase text-gray-500 tracking-wider">Garantie</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Values Grid ── */}
        <section className="bg-[#F9F9F9] border-y border-gray-100 py-24">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-[12px] font-bold uppercase tracking-widest text-[#DB021D] mb-3 block">Nos Engagements</span>
              <h2 className="text-3xl lg:text-4xl font-black uppercase text-[#1A1A1A]" style={{ fontFamily: 'var(--font-oswald)' }}>
                Pourquoi nous choisir ?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ENGAGEMENTS.map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#DB021D]/30 hover:shadow-lg hover:shadow-[#DB021D]/5 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-[16px] font-black uppercase text-[#1A1A1A] mb-3 group-hover:text-[#DB021D] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-white">
          <div className="max-w-[1000px] mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-black uppercase text-[#1A1A1A] mb-8" style={{ fontFamily: 'var(--font-oswald)' }}>
              Prêt à S'équiper ?
            </h2>
            <p className="text-[16px] text-gray-500 mb-10 max-w-xl mx-auto">
              Découvrez notre catalogue complet ou contactez notre équipe pour un devis personnalisé.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/collections"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#DB021D] text-white text-[14px] font-black uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-[#b80019] shadow-lg shadow-[#DB021D]/20 transition-all hover:-translate-y-0.5"
              >
                <Package className="w-5 h-5" />
                Voir le catalogue
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F5F5F5] text-[#1A1A1A] text-[14px] font-black uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-[#E5E5E5] transition-all"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
