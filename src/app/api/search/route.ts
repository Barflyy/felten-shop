import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify/client';

const SEARCH_PRODUCTS_QUERY = `
  query searchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
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
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  try {
    const data = await shopifyFetch<{
      products: { edges: { node: any }[] };
    }>({
      query: SEARCH_PRODUCTS_QUERY,
      variables: { query, first: 8 },
    });

    const products = data.products.edges.map((edge) => edge.node);
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ products: [] });
  }
}
