import { Footer } from '@/components/footer';
import SiteHeader from '@/components/SiteHeader';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, Truck, ShieldCheck, Headset, Award } from 'lucide-react';
import { mainNavigation } from '@/lib/navigation';

export const metadata = {
  title: 'Catalogue — Felten Shop | Outillage Milwaukee',
  description:
    "Découvrez notre catalogue complet d'outillage Milwaukee professionnel.",
};

function getSubCategoryLabels(cat: (typeof mainNavigation)[number]): string[] {
  if (!cat.items || cat.items.length === 0) return [];
  return cat.items.map((item) => item.title).slice(0, 4);
}

export default async function CollectionsPage() {
  return (
    <>
      <SiteHeader />

      <main className="bg-white min-h-screen">

        {/* Hero */}
        <section className="bg-[#F5F5F5] border-b border-gray-100">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-8 pt-24 lg:pt-28 pb-8 lg:pb-12">
            <span className="inline-flex items-center px-3 py-1 bg-[#DB021D]/10 text-[#DB021D] text-[11px] font-semibold rounded-lg mb-3">
              Revendeur Autorise Milwaukee
            </span>
            <h1 className="text-[24px] lg:text-[32px] font-bold text-[#1A1A1A] mb-2">
              Notre catalogue
            </h1>
            <p className="text-[13px] lg:text-[15px] text-[#6B7280] max-w-lg leading-relaxed">
              Parcourez l&apos;ensemble de notre gamme d&apos;outillage professionnel Milwaukee. Conseil expert et livraison rapide.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-6 lg:py-10">
          <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {mainNavigation.map((cat) => {
                const subLabels = getSubCategoryLabels(cat);
                const totalSubs = cat.items?.length || 0;
                const extraCount = totalSubs - subLabels.length;

                return (
                  <Link
                    key={cat.id}
                    href={cat.url}
                    className="group flex flex-col bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-[2.2/1] bg-[#FAFAFA]">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.title}
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-200" />
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 px-4 py-3 flex flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-[13px] font-bold text-[#1A1A1A] group-hover:text-[#DB021D] transition-colors leading-tight">
                          {cat.title}
                        </h2>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#DB021D] shrink-0 transition-colors" strokeWidth={2} />
                      </div>

                      {subLabels.length > 0 && (
                        <p className="mt-1.5 text-[11px] text-[#9CA3AF] leading-relaxed line-clamp-2">
                          {subLabels.join(', ')}
                          {extraCount > 0 && (
                            <span className="text-[#6B7280]"> +{extraCount}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Voir tous les produits */}
            <div className="mt-6 lg:mt-8 flex justify-center">
              <Link
                href="/collections/all"
                className="inline-flex items-center gap-2 px-6 h-11 bg-[#1A1A1A] text-white text-[13px] font-semibold rounded-lg hover:bg-black transition-colors"
              >
                Voir tous les produits
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-t border-gray-100 bg-[#FAFAFA]">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-8 py-8 lg:py-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
              {[
                { icon: Truck, title: 'Livraison 24h', desc: 'Expedition rapide' },
                { icon: ShieldCheck, title: 'Garantie 3 ans', desc: 'Pieces et main d\'oeuvre' },
                { icon: Headset, title: 'Conseil expert', desc: 'Equipe specialisee' },
                { icon: Award, title: 'Revendeur autorise', desc: 'Milwaukee officiel' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#1A1A1A]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1A1A1A]">{title}</p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
