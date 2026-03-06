import Link from 'next/link';
import { getProducts } from '@/lib/shopify';
import { ProductCard } from '@/components/product-card';
import { Footer } from '@/components/footer';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  // Fetch all products and filter client-side by title for now
  const allProducts = await getProducts(250, true);

  const results = query
    ? allProducts.filter((p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      (p.productType ?? '').toLowerCase().includes(query.toLowerCase()) ||
      (p.tags ?? []).some((t) => t.toLowerCase().includes(query.toLowerCase()))
    )
    : [];

  const count = results.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9]">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 text-center">
          <p className="text-[12px] font-black uppercase tracking-widest text-[#DB021D] mb-3">
            Recherche
          </p>
          <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#1A1A1A] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Résultats
          </h1>
          {query && (
            <p className="text-[15px] font-medium text-gray-500 max-w-xl mx-auto">
              {count === 0
                ? `Aucun résultat n'a été trouvé pour « ${query} »`
                : count === 1
                  ? `1 produit correspond à votre recherche « ${query} »`
                  : `${count} produits correspondent à votre recherche « ${query} »`}
            </p>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* No query entered */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-wide mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              Que recherchez-vous ?
            </h2>
            <p className="text-[14px] text-gray-500 mb-8 max-w-sm">
              Utilisez la barre de recherche pour trouver vos outils Milwaukee ou explorez notre catalogue complet.
            </p>
            <Link
              href="/collections"
              className="group inline-flex items-center justify-center h-12 px-8 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-[13px] font-black uppercase tracking-[0.1em] rounded-xl transition-all shadow-md active:scale-[0.98] overflow-hidden relative"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Parcourir le catalogue</span>
            </Link>
          </div>
        )}

        {/* Zero results */}
        {query && count === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-6 text-gray-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-[#1A1A1A] uppercase tracking-wide mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Oups, aucun résultat
            </h2>
            <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
              Nous n'avons rien trouvé pour &laquo;&nbsp;<span className="font-bold text-[#1A1A1A]">{query}</span>&nbsp;&raquo;. Vérifiez l'orthographe, essayez des termes plus généraux ou utilisez une référence exacte Milwaukee.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
              <Link
                href="/collections"
                className="group w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 bg-[#DB021D] hover:bg-[#B8011A] text-white text-[13px] font-black uppercase tracking-[0.1em] rounded-xl transition-all shadow-md shadow-red-500/20 active:scale-[0.98] overflow-hidden relative"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10">Parcourir le catalogue</span>
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 bg-white hover:bg-gray-50 border border-gray-200 text-[#1A1A1A] text-[13px] font-bold uppercase tracking-wider rounded-xl transition-all active:scale-[0.98]"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>
        )}

        {/* Results grid */}
        {query && count > 0 && (
          <>
            {/* Sort/filter bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
              <p className="text-[13px] text-gray-500 font-medium">
                <span className="font-black text-[#1A1A1A]">{count}</span>{' '}
                {count === 1 ? 'produit correspond' : 'produits correspondent'} à votre recherche
              </p>
              <Link
                href="/collections"
                className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A] hover:text-[#DB021D] transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-[#DB021D]"
              >
                Voir tout le catalogue
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {results.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
