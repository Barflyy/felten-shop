import { NextRequest, NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify/client';

const PRODUCTS_BY_QUERY = `
  query SearchProducts($query: String!) {
    products(first: 20, query: $query) {
      edges {
        node {
          handle
          title
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

interface ProductNode {
  handle: string;
  title: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handles } = body as { handles: string[] };

    if (!handles || !Array.isArray(handles) || handles.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Limit to 20 handles max
    const limitedHandles = handles.slice(0, 20);

    // Build Shopify search query: handle:xxx OR handle:yyy
    const query = limitedHandles.map((h) => `handle:${h}`).join(' OR ');

    const data = await shopifyFetch<{
      products: { edges: Array<{ node: ProductNode }> };
    }>({
      query: PRODUCTS_BY_QUERY,
      variables: { query },
      revalidate: 300,
    });

    const products = data.products.edges.map((edge) => edge.node);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching wishlist products:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
