import { getCollectionProducts, getMenu } from '@/lib/shopify';
import { CollectionPageContent } from '@/components/collection';
import SiteHeader from '@/components/SiteHeader';
import { Footer } from '@/components/footer';
import { notFound } from 'next/navigation';
import { mainNavigation } from '@/lib/navigation';

export const revalidate = 300;

interface Props {
  params: Promise<{ categorie: string; souscategorie: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { categorie, souscategorie } = await params;

  const parentItem = mainNavigation.find((item) => item.id === categorie);
  const parentTitle = parentItem?.title ?? categorie.replace(/-/g, ' ');

  const subTitle = souscategorie
    .replace(/-\d+$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${subTitle} — ${parentTitle} | Felten Shop`,
    description: `Découvrez notre sélection ${subTitle.toLowerCase()} Milwaukee. Revendeur autorisé, garantie 3 ans.`,
  };
}

export default async function SubCategoryPage({ params }: Props) {
  const { categorie, souscategorie } = await params;

  const [initialProducts, menu] = await Promise.all([
    getCollectionProducts({ collection: souscategorie }),
    getMenu('produits'),
  ]);

  let products = initialProducts;
  let resolvedHandle = souscategorie;

  if (products.length === 0) {
    for (const suffix of ['-1', '-2']) {
      const attempt = await getCollectionProducts({ collection: souscategorie + suffix });
      if (attempt.length > 0) {
        products = attempt;
        resolvedHandle = souscategorie + suffix;
        break;
      }
    }
  }

  if (products.length === 0) {
    notFound();
  }

  const parentItem = mainNavigation.find((item) => item.id === categorie);
  const parentTitle = parentItem?.title ?? categorie.replace(/-/g, ' ');

  const subTitle = souscategorie
    .replace(/-\d+$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const collectionTitle = `${subTitle} — ${parentTitle}`;

  return (
    <>
      <SiteHeader />
      <CollectionPageContent
        products={products}
        collectionTitle={collectionTitle}
        collectionHandle={resolvedHandle}
        menu={menu}
      />
      <Footer />
    </>
  );
}
