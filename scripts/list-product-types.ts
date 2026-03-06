// Script to list all unique product types with counts from Shopify
// Run with: npx tsx scripts/list-product-types.ts

import { readFileSync } from 'fs';

// ─── Load env ────────────────────────────────────────────────────────────────

const envFile = readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
for (const line of envFile.split('\n')) {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
}

const STORE_DOMAIN = envVars['NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'];
const CLIENT_ID = envVars['SHOPIFY_CLIENT_ID'];
const CLIENT_SECRET = envVars['SHOPIFY_CLIENT_SECRET'];
const ADMIN_API_VERSION = '2025-01';

if (!STORE_DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing SHOPIFY env vars in .env.local');
  process.exit(1);
}

// ─── Admin API helpers ───────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const response = await fetch(
    `https://${STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token error: ${response.status} ${text}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getAdminAccessToken();
  const url = `https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Admin API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  }
  return json.data;
}

// ─── Query ───────────────────────────────────────────────────────────────────

const PRODUCTS_QUERY = `
  query products($cursor: String) {
    products(first: 250, after: $cursor) {
      edges {
        node {
          productType
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface ProductsResponse {
  products: {
    edges: { node: { productType: string } }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Querying product types from ${STORE_DOMAIN}...\n`);

  const typeCounts: Record<string, number> = {};
  let cursor: string | null = null;
  let totalProducts = 0;
  let page = 0;

  while (true) {
    page++;
    const data = await adminFetch<ProductsResponse>(PRODUCTS_QUERY, {
      cursor: cursor ?? undefined,
    });

    for (const edge of data.products.edges) {
      const pType = edge.node.productType || '(empty / no type)';
      typeCounts[pType] = (typeCounts[pType] || 0) + 1;
      totalProducts++;
    }

    console.log(`  Page ${page}: fetched ${data.products.edges.length} products (total: ${totalProducts})`);

    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }

  // Sort by count descending
  const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`PRODUCT TYPES (${sorted.length} unique types, ${totalProducts} total products)`);
  console.log('='.repeat(60));
  console.log('');
  console.log(`${'Count'.padStart(6)}  Product Type`);
  console.log(`${'─'.repeat(6)}  ${'─'.repeat(40)}`);

  for (const [type, count] of sorted) {
    console.log(`${String(count).padStart(6)}  ${type}`);
  }

  console.log(`\n${'─'.repeat(6)}  ${'─'.repeat(40)}`);
  console.log(`${String(totalProducts).padStart(6)}  TOTAL`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
