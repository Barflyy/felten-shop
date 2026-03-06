import { getCollectionProducts, getMenu } from '@/lib/shopify';
import { CollectionPageContent } from '@/components/collection';
import SiteHeader from '@/components/SiteHeader';
import { Footer } from '@/components/footer';
import { notFound } from 'next/navigation';

export const revalidate = 300;

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const title = handle
    .replace(/-\d+$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${title} — Felten Shop | Milwaukee`,
    description: `Découvrez notre sélection ${title.toLowerCase()} Milwaukee. Revendeur agréé, garantie 3 ans.`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  // Try the exact handle first, then with -1 / -2 suffixes (legacy Shopify handles)
  const [initialProducts, menu] = await Promise.all([
    getCollectionProducts({ collection: handle, first: 50 }),
    getMenu('produits'),
  ]);
  let products = initialProducts;
  let resolvedHandle = handle;

  if (products.length === 0 && handle !== 'all') {
    for (const suffix of ['-1', '-2']) {
      const attempt = await getCollectionProducts({ collection: handle + suffix, first: 50 });
      if (attempt.length > 0) {
        products = attempt;
        resolvedHandle = handle + suffix;
        break;
      }
    }
  }

  if (products.length === 0 && handle !== 'all') {
    notFound();
  }

  const title = handle
    .replace(/-\d+$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <SiteHeader />
      <CollectionPageContent
        products={products}
        collectionTitle={title}
        collectionHandle={resolvedHandle}
        menu={menu}
      />
      <Footer />
    </>
  );
}
