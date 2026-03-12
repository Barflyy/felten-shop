import type { Metadata } from 'next';
import Link from 'next/link';
import { shopifyFetch } from '@/lib/shopify/client';
import { SEARCH_PRODUCTS_QUERY } from '@/lib/shopify/queries';
import { Product } from '@/lib/shopify/types';
import { ProductCard } from '@/components/product-card';
import { Footer } from '@/components/footer';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'Recherche — Felten Shop',
  description: 'Recherchez parmi notre catalogue complet d\'outillage Milwaukee. Perceuses, visseuses, meuleuses, batteries et accessoires.',
  robots: { index: false, follow: true },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function searchProducts(query: string): Promise<Product[]> {
  if (!query) return [];
  const data = await shopifyFetch<{
    products: { edges: { node: Product }[] };
  }>({
    query: SEARCH_PRODUCTS_QUERY,
    variables: { query, first: 40 },
    tags: ['search'],
  });
  return data.products.edges.map((e) => e.node);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  const results = await searchProducts(query);
  const count = results.length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />

      {/* Page header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <h1 className="text-[22px] lg:text-[28px] font-bold text-[#1A1A1A] mb-2">
            Résultats de recherche
          </h1>
          {query && (
            <p className="text-[14px] text-[#6B7280]">
              {count === 0
                ? `Aucun résultat pour « ${query} »`
                : `${count} produit${count !== 1 ? 's' : ''} pour « ${query} »`}
            </p>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* No query entered */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[#9CA3AF] text-[14px] mb-6">
              Utilisez la barre de recherche pour trouver un produit.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center justify-center h-11 px-6 bg-[#1A1A1A] hover:bg-[#333] text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              Parcourir le catalogue
            </Link>
          </div>
        )}

        {/* Zero results */}
        {query && count === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
            <p className="text-[14px] text-[#6B7280] mb-6">
              Aucun produit ne correspond à votre recherche. Vérifiez l&apos;orthographe ou essayez des termes plus généraux.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center h-11 px-6 bg-[#1A1A1A] hover:bg-[#333] text-white text-[13px] font-semibold rounded-lg transition-colors"
              >
                Voir le catalogue
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center h-11 px-6 border border-gray-200 hover:border-gray-300 text-[#1A1A1A] text-[13px] font-medium rounded-lg transition-colors"
              >
                Accueil
              </Link>
            </div>
          </div>
        )}

        {/* Results grid */}
        {query && count > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {results.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
