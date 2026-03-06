import { Footer } from '@/components/footer';
import SiteHeader from '@/components/SiteHeader';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight } from 'lucide-react';
import { mainNavigation } from '@/lib/navigation';

export const metadata = {
  title: 'Catalogue — Felten Shop | Outillage Milwaukee',
  description:
    "Découvrez notre catalogue complet d'outillage Milwaukee professionnel.",
};

// Flatten sub-items to get displayable sub-category names (max depth 1)
function getSubCategoryLabels(cat: (typeof mainNavigation)[number]): string[] {
  if (!cat.items || cat.items.length === 0) return [];
  return cat.items.map((item) => item.title).slice(0, 5);
}

export default async function CollectionsPage() {
  return (
    <>
      <SiteHeader />

      <main className="bg-white min-h-screen">

        {/* ━━ Header ━━ */}
        <section className="pt-20 lg:pt-24 pb-4 lg:pb-5 border-b border-gray-100">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
            <div className="flex items-baseline justify-between">
              <h1
                className="text-[24px] lg:text-[32px] font-black uppercase tracking-tight text-[#1A1A1A] leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Catalogue
              </h1>
              <Link
                href="/collections/all"
                className="hidden lg:flex items-center gap-1 text-[13px] font-semibold text-[#6B7280] hover:text-[#DB021D] transition-colors"
              >
                Tous les produits
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </section>

        {/* ━━ Categories Grid ━━ */}
        <section className="py-5 lg:py-8">
          <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 lg:gap-3">
              {mainNavigation.map((cat) => {
                const subLabels = getSubCategoryLabels(cat);
                const extraCount = (cat.items?.length || 0) - subLabels.length;

                return (
                  <Link
                    key={cat.id}
                    href={cat.url}
                    className="group flex items-center gap-3.5 bg-white rounded-lg border border-gray-100 p-3 lg:p-3.5 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 lg:w-20 lg:h-20 relative flex-shrink-0 bg-[#FAFAFA] rounded-lg overflow-hidden">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.title}
                          fill
                          className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-200" />
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-[13px] lg:text-[13px] font-bold text-[#1A1A1A] group-hover:text-[#DB021D] transition-colors leading-tight">
                        {cat.title}
                      </h2>

                      {subLabels.length > 0 && (
                        <p className="mt-1 text-[11px] text-[#9CA3AF] leading-relaxed line-clamp-1">
                          {subLabels.join(' · ')}
                          {extraCount > 0 && (
                            <span> +{extraCount}</span>
                          )}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#DB021D] flex-shrink-0 transition-colors" strokeWidth={2} />
                  </Link>
                );
              })}
            </div>

            {/* Mobile: voir tous les produits */}
            <div className="mt-5 lg:hidden">
              <Link
                href="/collections/all"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#1A1A1A] text-white text-[12px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#2A2A2A] transition-colors"
              >
                Voir tous les produits
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
