import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  MapPin,
  ShieldCheck,
  Clock,
  Wrench,
  Package,
  Star,
  ExternalLink,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Pourquoi Felten ? — Revendeur Autorise Milwaukee | Felten Shop',
  description:
    "Pourquoi acheter chez Felten plutot qu'ailleurs ? SAV physique, conseil expert, garantie reelle. Decouvrez la difference.",
};

const DIFFERENCES = [
  {
    icon: Phone,
    title: 'Florian vous rappelle sous 2h',
    desc: "Vous avez une question technique ? Vous appelez, Florian decroche. Pas un bot, pas un menu vocal a 8 options. Un vrai expert Milwaukee qui connait chaque outil parce qu'il les utilise.",
    vs: 'Ailleurs : chatbot, email sans reponse, ou numero surtaxe.',
  },
  {
    icon: Wrench,
    title: 'Panne ? On gere en 48h',
    desc: "Votre outil tombe en panne ? Florian organise la collecte, suit la reparation, et vous tient informe. Pas de formulaire en ligne, pas de \"delai de 3 a 6 semaines\". Du concret.",
    vs: 'Ailleurs : renvoyez le colis a vos frais et attendez.',
  },
  {
    icon: MapPin,
    title: 'SAV physique au Luxembourg',
    desc: "On est la, en vrai. Vous pouvez passer au showroom, tester les outils, deposer une machine en SAV. On ne se cache pas derriere une boite postale aux Pays-Bas.",
    vs: 'Ailleurs : entrepot anonyme, aucun contact humain.',
  },
  {
    icon: ShieldCheck,
    title: 'Jamais de piece grise',
    desc: "Chaque produit vient du reseau officiel Milwaukee. Garantie constructeur 3 ans activee automatiquement a l'achat. Numero de serie tracable, facture conforme.",
    vs: 'Ailleurs : import parallele, garantie douteuse, pas de suivi.',
  },
  {
    icon: Clock,
    title: 'Livraison 24h, commande avant 14h',
    desc: "Commande validee le matin, outil sur votre chantier demain. Chaque jour sans outil, c'est de l'argent perdu. On le sait.",
    vs: 'Ailleurs : 3-5 jours ouvrables, livraison aleatoire.',
  },
  {
    icon: Package,
    title: 'Devis pro en 2h',
    desc: "Vous equipez une equipe ? Envoyez votre liste, Florian vous repond avec un devis detaille et des recommandations. Facturation pro, TVA intra-communautaire geree.",
    vs: 'Ailleurs : commandez article par article, debrouillez-vous.',
  },
];

const STORIES = [
  {
    name: 'Pierre M.',
    job: 'Plombier a Namur',
    quote:
      "Ma meuleuse M18 est tombee en panne un vendredi. J'ai appele Florian, il l'a recuperee lundi, reparee mardi, livree mercredi. 3 jours. Essayez d'avoir ca sur Amazon.",
    result: 'Reparation en 3 jours, zero frais',
  },
  {
    name: 'Thomas V.',
    job: 'Chef de chantier a Bruxelles',
    quote:
      "On equipe 12 gars. Florian nous a monte un devis complet en 2h avec les bons kits batteries. Livraison le surlendemain. Facture pro impeccable.",
    result: 'Devis + livraison en 48h pour 12 personnes',
  },
  {
    name: 'Frederic N.',
    job: 'Paysagiste a Arlon',
    quote:
      "Batterie defectueuse apres 8 mois. Un mail, echange standard en 48h sans question. Garantie 3 ans reelle, pas juste sur papier.",
    result: 'Echange batterie en 48h sous garantie',
  },
];

export default function PourquoiFeltenPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center -ml-1 text-[#1A1A1A]"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Link>
          <Link
            href="/"
            className="text-[1rem] tracking-tight leading-none"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">
              FELTEN
            </span>
            <span className="font-normal text-[#1A1A1A]"> SHOP</span>
          </Link>
          <div className="w-9" />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#1A1A1A] text-white">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16 lg:py-24 text-center">
            <span className="inline-flex items-center px-3 py-1 bg-white/10 text-white/70 text-[11px] font-semibold uppercase tracking-wider rounded-lg mb-5">
              La vraie question
            </span>
            <h1 className="text-[24px] lg:text-[40px] font-bold leading-tight mb-4 max-w-3xl mx-auto">
              Pourquoi payer chez Felten
              <br />
              <span className="text-[#DB021D]">
                quand Amazon est moins cher ?
              </span>
            </h1>
            <p className="text-[14px] lg:text-[16px] text-white/50 max-w-2xl mx-auto leading-relaxed">
              Parce que le jour ou votre outil tombe en panne sur un chantier,
              ce n&apos;est pas le prix d&apos;achat qui compte. C&apos;est la
              vitesse a laquelle quelqu&apos;un decroche le telephone.
            </p>
          </div>
        </section>

        {/* Differences */}
        <section className="max-w-[1100px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
          <div className="text-center mb-10 lg:mb-14">
            <h2 className="text-[20px] lg:text-[28px] font-bold text-[#1A1A1A] mb-2">
              Ce qu&apos;on fait differemment
            </h2>
            <p className="text-[14px] text-[#6B7280]">
              Concret. Verifiable. Impossible a copier.
            </p>
          </div>

          <div className="space-y-4 lg:space-y-5">
            {DIFFERENCES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex gap-4 lg:gap-6 p-5 lg:p-6 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-[#DB021D]/10 flex items-center justify-center flex-shrink-0">
                    <Icon
                      className="w-5 h-5 text-[#DB021D]"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] lg:text-[15px] font-bold text-[#1A1A1A] mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-[#6B7280] leading-relaxed mb-2.5">
                      {item.desc}
                    </p>
                    <p className="text-[12px] text-[#9CA3AF] italic">
                      {item.vs}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stories */}
        <section className="bg-[#F5F5F5] border-y border-gray-100 py-12 lg:py-20">
          <div className="max-w-[1100px] mx-auto px-4 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-[20px] lg:text-[28px] font-bold text-[#1A1A1A] mb-2">
                Ils l&apos;ont vecu
              </h2>
              <p className="text-[14px] text-[#6B7280]">
                Des situations reelles, pas du marketing.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 lg:gap-5">
              {STORIES.map((story) => (
                <div
                  key={story.name}
                  className="bg-white rounded-lg p-6 border border-gray-100"
                >
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-[#FBBF24]"
                        fill="#FBBF24"
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <p className="text-[13px] lg:text-[14px] text-[#1A1A1A] leading-relaxed mb-4">
                    &quot;{story.quote}&quot;
                  </p>
                  <div className="flex items-center gap-2 mb-3 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-md w-fit">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {story.result}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1A1A1A]">
                      {story.name}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">{story.job}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Google Review CTA */}
            <div className="mt-10 text-center">
              <p className="text-[13px] text-[#6B7280] mb-3">
                Client Felten ? Votre experience compte.
              </p>
              <a
                href="https://g.page/r/CcFQnq3Msd1AEAE/review"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 h-10 bg-white border border-gray-200 rounded-lg text-[13px] font-semibold text-[#1A1A1A] hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <Star
                  className="w-4 h-4 text-[#FBBF24]"
                  fill="#FBBF24"
                  strokeWidth={0}
                />
                Laisser un avis Google
                <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </a>
            </div>
          </div>
        </section>

        {/* The real cost */}
        <section className="max-w-[900px] mx-auto px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center mb-8">
            <h2 className="text-[20px] lg:text-[28px] font-bold text-[#1A1A1A] mb-3">
              Le vrai cout d&apos;un outil &quot;moins cher&quot;
            </h2>
            <p className="text-[14px] text-[#6B7280] max-w-xl mx-auto leading-relaxed">
              Un outil a 15&euro; de moins qui tombe en panne sans SAV, c&apos;est une
              journee de chantier perdue. A 400&euro;/jour de CA, le calcul est vite
              fait.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Felten */}
            <div className="rounded-lg border-2 border-[#DB021D] p-6 bg-[#DB021D]/5">
              <p className="text-[13px] font-bold text-[#DB021D] uppercase tracking-wider mb-4">
                Chez Felten
              </p>
              <div className="space-y-3">
                {[
                  'Florian decroche en personne',
                  'SAV collecte & retour en 48h',
                  'Garantie 3 ans activee automatiquement',
                  'Conseil technique avant achat',
                  'Facture pro + TVA intra-UE',
                  'Produit 100% officiel Milwaukee',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2.5">
                    <Check
                      className="w-4 h-4 text-[#DB021D] mt-0.5 flex-shrink-0"
                      strokeWidth={2.5}
                    />
                    <span className="text-[13px] text-[#1A1A1A]">{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ailleurs */}
            <div className="rounded-lg border border-gray-200 p-6 bg-[#FAFAFA]">
              <p className="text-[13px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-4">
                Ailleurs
              </p>
              <div className="space-y-3">
                {[
                  'Chatbot ou email sans reponse',
                  'Renvoyez a vos frais, attendez 3 semaines',
                  'Garantie theorique, bon courage',
                  'Fiche produit copiee-collee',
                  'Facturation basique',
                  'Import parallele possible',
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0 flex items-center justify-center text-[#9CA3AF]">
                      &mdash;
                    </span>
                    <span className="text-[13px] text-[#9CA3AF]">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#1A1A1A] py-12 lg:py-16">
          <div className="max-w-[800px] mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-[20px] lg:text-[26px] font-bold text-white mb-3">
              Convaincu ?
            </h2>
            <p className="text-[14px] text-white/50 mb-8 max-w-md mx-auto">
              Parcourez le catalogue ou appelez Florian. Il vous conseille sans
              engagement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/collections"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#DB021D] text-white text-[14px] font-semibold px-6 py-3.5 rounded-lg hover:bg-[#B8011A] transition-colors"
              >
                Voir le catalogue
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </Link>
              <a
                href="tel:+352621304952"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 text-white text-[14px] font-semibold px-6 py-3.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Phone className="w-4 h-4" strokeWidth={2} />
                Appeler Florian
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
