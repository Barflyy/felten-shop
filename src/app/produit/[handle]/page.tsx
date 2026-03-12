import { notFound } from 'next/navigation';
import { shopifyFetch } from '@/lib/shopify/client';
import { PRODUCT_BY_HANDLE_QUERY } from '@/lib/shopify/queries';
import { Product } from '@/lib/shopify/types';
import { ProductDetails } from './product-details';
import { getProducts } from '@/lib/shopify';
import { getProductDetailSpecs } from '@/lib/product-specs';
import SiteHeader from '@/components/SiteHeader';
import { Footer } from '@/components/footer';

interface PageProps {
  params: Promise<{ handle: string }>;
}

async function getProduct(handle: string) {
  const data = await shopifyFetch<{ product: Product | null }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    tags: [`product-${handle}`, 'products'],
  });
  return data.product;
}

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: 'Produit non trouvé',
    };
  }

  return {
    title: `${product.title} - Felten Milwaukee`,
    description: product.description?.slice(0, 160) || `Découvrez ${product.title} chez Felten Milwaukee.`,
    alternates: {
      canonical: `https://felten.shop/produit/${handle}`,
    },
    openGraph: {
      title: product.title,
      description: product.description || '',
      images: product.featuredImage ? [product.featuredImage.url] : [],
    },
  };
}

export default async function ProduitPage({ params }: PageProps) {
  const { handle } = await params;

  const [product, allProducts] = await Promise.all([
    getProduct(handle),
    getProducts(8),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 6);

  // Pre-compute specs for all variants server-side to avoid shipping 77KB of spec data to the client
  const variants = product.variants?.edges?.map(e => e.node) || [];
  const specsMap: Record<string, { label: string; value: string }[]> = {};
  for (const variant of variants) {
    const reference = variant.selectedOptions?.find(o => o.name === 'Modèle')?.value || variant.sku || '';
    specsMap[variant.id] = getProductDetailSpecs(
      product.title,
      reference,
      product.productType || '',
      product.tags || []
    );
  }

  const firstVariant = product.variants?.edges?.[0]?.node;
  const price = firstVariant?.price?.amount || product.priceRange.minVariantPrice.amount;
  const currency = firstVariant?.price?.currencyCode || product.priceRange.minVariantPrice.currencyCode;
  const isAvailable = product.availableForSale !== false;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    url: `https://felten.shop/produit/${handle}`,
    brand: {
      '@type': 'Brand',
      name: 'Milwaukee',
    },
    offers: {
      '@type': 'Offer',
      url: `https://felten.shop/produit/${handle}`,
      priceCurrency: currency,
      price: price,
      availability: isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Felten Shop',
      },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: '/',
      },
      ...(product.productType
        ? [{
            '@type': 'ListItem' as const,
            position: 2,
            name: product.productType,
          }]
        : []),
      {
        '@type': 'ListItem',
        position: product.productType ? 3 : 2,
        name: product.title,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <SiteHeader />
      <ProductDetails product={product} relatedProducts={relatedProducts} specsMap={specsMap} />
      <Footer />
    </>
  );
}
