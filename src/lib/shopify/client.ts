import { createStorefrontClient } from '@shopify/hydrogen-react';

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const isConfigured = domain && token && !domain.includes('your-store') && !token.includes('your-');

const client = createStorefrontClient({
  storeDomain: domain || 'placeholder.myshopify.com',
  publicStorefrontToken: token || 'placeholder',
  storefrontApiVersion: '2025-10',
});

export const getStorefrontApiUrl = client.getStorefrontApiUrl;
export const getPublicTokenHeaders = client.getPublicTokenHeaders;

// Cache revalidation time in seconds (5 minutes default)
const DEFAULT_REVALIDATE = 300;

export async function shopifyFetch<T>({
  query,
  variables,
  revalidate = DEFAULT_REVALIDATE,
  tags,
}: {
  query: string;
  variables?: Record<string, unknown>;
  revalidate?: number | false;
  tags?: string[];
}): Promise<T> {
  if (!isConfigured) {
    console.warn('Shopify credentials not configured');
    // Return empty data structure for development
    return { products: { edges: [] }, collections: { edges: [] }, menu: null } as T;
  }

  const response = await fetch(getStorefrontApiUrl(), {
    method: 'POST',
    headers: {
      ...getPublicTokenHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: {
      revalidate,
      tags,
    },
  });

  const json = await response.json();

  if (json.errors) {
    console.error('Shopify API error:', json.errors);
    throw new Error(json.errors[0]?.message ?? 'Shopify API error');
  }

  return json.data;
}
