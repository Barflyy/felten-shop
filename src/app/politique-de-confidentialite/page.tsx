import { Footer } from '@/components/footer';
import { getShopPolicies } from '@/lib/shopify';
import Link from 'next/link';

export const metadata = {
  title: 'Politique de confidentialité — Felten Shop',
  description: 'Politique de confidentialité et protection des données personnelles de Felten Shop.',
};

export default async function PolitiqueConfidentialitePage() {
  const policies = await getShopPolicies();
  const policy = policies.privacyPolicy;

  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Header band */}
        <div className="bg-[#1A1A1A] py-12">
          <div className="max-w-[900px] mx-auto px-6 lg:px-8">
            <nav aria-label="Fil d'Ariane" className="mb-4">
              <ol className="flex items-center gap-2 text-[12px] text-white/40">
                <li><Link href="/" className="hover:text-[#DB021D] transition-colors">Accueil</Link></li>
                <li className="text-white/20">/</li>
                <li className="text-white/70">Politique de confidentialité</li>
              </ol>
            </nav>
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
              {policy?.title || 'POLITIQUE DE CONFIDENTIALITÉ'}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[900px] mx-auto px-6 lg:px-8 py-12">
          {policy?.body ? (
            <div
              className="shopify-policy prose prose-sm max-w-none text-[#1A1A1A]/70 leading-relaxed
                [&_h1]:text-xl [&_h1]:font-black [&_h1]:uppercase [&_h1]:tracking-tight [&_h1]:text-[#1A1A1A] [&_h1]:mt-8 [&_h1]:mb-4
                [&_h2]:text-base [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-[#1A1A1A] [&_h2]:mt-8 [&_h2]:mb-4
                [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[#1A1A1A] [&_h3]:mt-6 [&_h3]:mb-3
                [&_p]:mb-3 [&_p]:text-sm
                [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1 [&_ul]:ml-2 [&_ul]:text-sm
                [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-1 [&_ol]:ml-2 [&_ol]:text-sm
                [&_a]:text-[#DB021D] [&_a:hover]:underline
                [&_strong]:text-[#1A1A1A]
                [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse
                [&_th]:text-left [&_th]:p-2 [&_th]:border-b [&_th]:border-[#F5F5F5] [&_th]:font-bold [&_th]:text-[#1A1A1A]
                [&_td]:p-2 [&_td]:border-b [&_td]:border-[#F5F5F5]"
              dangerouslySetInnerHTML={{ __html: policy.body }}
            />
          ) : (
            <p className="text-sm text-[#1A1A1A]/50">
              La politique de confidentialité n&apos;est pas encore disponible.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
