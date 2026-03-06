import Link from 'next/link';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* Illustration */}
      <div className="w-24 h-24 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mb-8">
        <svg
          className="w-12 h-12 text-gray-300"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
        </svg>
      </div>

      {/* Content */}
      <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tight text-[#1A1A1A] mb-4">
        PAGE INTROUVABLE
      </h1>
      <p className="text-[15px] text-[#6B7280] mb-10 max-w-md leading-relaxed">
        L&apos;outil que vous cherchez n&apos;est pas ici.
        <br />
        Il est peut-être sur le chantier.
      </p>

      {/* Search bar */}
      <div className="w-full max-w-md mb-6">
        <form action="/recherche" method="GET">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <input
                type="search"
                name="q"
                placeholder="Rechercher un produit ou SKU..."
                className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-lg text-[14px] text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#DB021D] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-5 bg-[#DB021D] text-white text-[13px] font-black uppercase rounded-lg hover:bg-[#B8011A] transition-colors"
            >
              OK
            </button>
          </div>
        </form>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#DB021D] text-white text-[13px] font-black uppercase tracking-wide rounded-lg hover:bg-[#B8011A] transition-colors"
        >
          Retour à l&apos;accueil →
        </Link>
        <Link
          href="/collections"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#1A1A1A] text-[#1A1A1A] text-[13px] font-black uppercase tracking-wide rounded-lg hover:bg-[#1A1A1A] hover:text-white transition-colors"
        >
          Parcourir le catalogue
        </Link>
      </div>
    </div>
  );
}
