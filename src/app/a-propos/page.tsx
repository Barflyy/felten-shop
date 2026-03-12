import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Award, Zap, Users, Package, Clock, HeartHandshake, CheckCircle } from 'lucide-react';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'À propos — Felten Shop | Revendeur Agréé Milwaukee Luxembourg',
  description: 'Découvrez Felten Shop, revendeur agréé Milwaukee au Luxembourg. Notre équipe de passionnés vous accompagne dans le choix de votre outillage professionnel.',
  alternates: { canonical: 'https://felten.shop/a-propos' },
};

const STATS = [
  { value: '5K+', label: 'Clients satisfaits', icon: <Users className="w-5 h-5" strokeWidth={2} /> },
  { value: '100%', label: 'Agréé Milwaukee', icon: <Award className="w-5 h-5" strokeWidth={2} /> },
  { value: '24h', label: 'Expédition rapide', icon: <Clock className="w-5 h-5" strokeWidth={2} /> },
  { value: '3 ans', label: 'Garantie incluse', icon: <ShieldCheck className="w-5 h-5" strokeWidth={2} /> },
];

const ENGAGEMENTS = [
  {
    icon: <Award className="w-6 h-6 text-[#DB021D]" strokeWidth={2} />,
    title: 'Qualité certifiée',
    desc: 'Produits 100% authentiques issus du réseau officiel Milwaukee. Zéro contrefaçon.',
  },
  {
    icon: <Users className="w-6 h-6 text-[#DB021D]" strokeWidth={2} />,
    title: 'Expertise pro',
    desc: 'Une équipe de passionnés qui utilise les outils au quotidien pour mieux vous conseiller.',
  },
  {
    icon: <Zap className="w-6 h-6 text-[#DB021D]" strokeWidth={2} />,
    title: 'Service réactif',
    desc: 'Un SAV local géré en interne. Pas de plateforme téléphonique, mais des vrais experts.',
  },
  {
    icon: <HeartHandshake className="w-6 h-6 text-[#DB021D]" strokeWidth={2} />,
    title: 'Partenaire durable',
    desc: 'Nous construisons une relation de confiance avec nos clients pros : tarifs, exclusivités et suivi.',
  },
];

export default function AProposPage() {
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
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-12 lg:py-20 text-center">
            <span className="inline-flex items-center px-3 py-1 bg-[#DB021D]/10 text-[#DB021D] text-[12px] font-semibold rounded-lg mb-4">
              Notre histoire
            </span>
            <h1 className="text-[22px] lg:text-[36px] font-bold text-[#1A1A1A] mb-4">
              L&apos;excellence <span className="text-[#DB021D]">Milwaukee</span>
            </h1>
            <p className="text-[14px] lg:text-[16px] text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
              Plus qu&apos;un simple revendeur, nous sommes votre partenaire outillage de confiance.
              Basés en Belgique, nous équipons les pros du Benelux avec le meilleur matériel.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-[1280px] mx-auto px-6 lg:px-8 -mt-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg p-5 text-center border border-gray-100 shadow-sm">
                <div className="flex justify-center text-[#DB021D] mb-2">{stat.icon}</div>
                <p className="text-[22px] font-bold text-[#1A1A1A] mb-0.5">{stat.value}</p>
                <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-[20px] lg:text-[26px] font-bold text-[#1A1A1A] mb-6">
                Passionnés par la performance
              </h2>
              <div className="space-y-4 text-[14px] text-[#6B7280] leading-relaxed">
                <p>
                  Felten Shop est né d&apos;une conviction simple : les professionnels méritent des outils à la hauteur de leur talent. C&apos;est pourquoi nous avons choisi de nous dédier exclusivement à <strong className="text-[#1A1A1A]">Milwaukee Tool</strong>, la référence mondiale de l&apos;innovation.
                </p>
                <p>
                  Notre mission est de rendre l&apos;outillage premium accessible à tous, avec un service irréprochable. Du conseil avant-vente au service après-vente, nous sommes là pour garantir que vos chantiers ne s&apos;arrêtent jamais.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {['Stock en Belgique', 'Livraison 24h', 'Conseil d\'expert'].map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5F5] border border-gray-100 text-[13px] font-medium text-[#1A1A1A]">
                    <CheckCircle className="w-4 h-4 text-[#DB021D]" strokeWidth={2} />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Dealer Card */}
            <div className="bg-[#1A1A1A] text-white rounded-lg p-8 lg:p-10 border border-gray-800">
              <div className="w-12 h-12 bg-[#DB021D] rounded-lg flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-[18px] font-bold text-white mb-3">
                Revendeur agréé
              </h3>
              <p className="text-white/50 text-[14px] mb-8 leading-relaxed">
                En achetant chez nous, vous avez la garantie d&apos;un produit authentique et d&apos;une couverture complète par le réseau Milwaukee.
              </p>
              <div className="flex items-center gap-6 border-t border-white/10 pt-6">
                <div>
                  <p className="text-[22px] font-bold text-white">100%</p>
                  <p className="text-[11px] text-white/40">Authentique</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <p className="text-[22px] font-bold text-white">3 ans</p>
                  <p className="text-[11px] text-white/40">Garantie</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-[#F5F5F5] border-y border-gray-100 py-12 lg:py-16">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-[12px] font-semibold text-[#DB021D] mb-2 block">Nos engagements</span>
              <h2 className="text-[20px] lg:text-[26px] font-bold text-[#1A1A1A]">
                Pourquoi nous choisir ?
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ENGAGEMENTS.map((item) => (
                <div key={item.title} className="bg-white rounded-lg p-6 border border-gray-100">
                  <div className="w-11 h-11 rounded-lg bg-[#DB021D]/5 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-[#6B7280] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-[800px] mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-[20px] lg:text-[26px] font-bold text-[#1A1A1A] mb-4">
              Prêt à s&apos;équiper ?
            </h2>
            <p className="text-[14px] text-[#6B7280] mb-8 max-w-xl mx-auto">
              Découvrez notre catalogue complet ou contactez notre équipe pour un devis personnalisé.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/collections"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#DB021D] text-white text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-[#B8011A] transition-colors"
              >
                <Package className="w-4 h-4" />
                Voir le catalogue
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F5F5F5] text-[#1A1A1A] text-[14px] font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
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
