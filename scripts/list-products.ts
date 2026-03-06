// Script to list all product titles from Shopify
// Run with: npx tsx scripts/list-products.ts

import { readFileSync } from 'fs';

// Read .env.local file manually
const envFile = readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
for (const line of envFile.split('\n')) {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
}

const SHOPIFY_STORE_DOMAIN = envVars['NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'];
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = envVars['NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN'];

const PRODUCTS_QUERY = `
  query Products($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          handle
          productType
          tags
        }
      }
    }
  }
`;

interface Product {
  id: string;
  title: string;
  handle: string;
  productType: string;
  tags: string[];
}

async function fetchProducts(): Promise<Product[]> {
  const allProducts: Product[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  console.log('Fetching products from Shopify...\n');

  while (hasNextPage) {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
        },
        body: JSON.stringify({
          query: PRODUCTS_QUERY,
          variables: { first: 250, after: cursor },
        }),
      }
    );

    const json = await response.json();
    const data = json.data?.products;

    if (!data) {
      console.error('Error fetching products:', json);
      break;
    }

    const products = data.edges.map((edge: { node: Product }) => edge.node);
    allProducts.push(...products);

    hasNextPage = data.pageInfo.hasNextPage;
    cursor = data.pageInfo.endCursor;

    console.log(`Fetched ${allProducts.length} products...`);
  }

  return allProducts;
}

async function main() {
  const products = await fetchProducts();

  console.log('\n' + '='.repeat(80));
  console.log(`TOTAL: ${products.length} products`);
  console.log('='.repeat(80) + '\n');

  // Group by product type
  const byType: Record<string, Product[]> = {};

  for (const product of products) {
    const type = product.productType || 'Sans catégorie';
    if (!byType[type]) byType[type] = [];
    byType[type].push(product);
  }

  // Display by type
  for (const [type, prods] of Object.entries(byType).sort()) {
    console.log(`\n## ${type} (${prods.length} produits)`);
    console.log('-'.repeat(60));
    for (const p of prods.sort((a, b) => a.title.localeCompare(b.title))) {
      const tags = p.tags.length > 0 ? ` [${p.tags.join(', ')}]` : '';
      console.log(`  - ${p.title}${tags}`);
    }
  }
}

main().catch(console.error);
