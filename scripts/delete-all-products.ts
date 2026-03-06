// Delete all products on Shopify
// Run with: npx tsx scripts/delete-all-products.ts

import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
for (const line of envFile.split('\n')) {
  const [key, ...v] = line.split('=');
  if (key && v.length > 0) envVars[key.trim()] = v.join('=').trim();
}
const STORE = envVars['NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'];
const CID = envVars['SHOPIFY_CLIENT_ID'];
const CS = envVars['SHOPIFY_CLIENT_SECRET'];

async function main() {
  const tokenRes = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CID, client_secret: CS }),
  });
  const { access_token } = await tokenRes.json();

  async function gql(query: string, variables?: Record<string, unknown>) {
    const res = await fetch(`https://${STORE}/admin/api/2025-01/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': access_token },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
    return json.data;
  }

  // Fetch all product IDs
  const ids: string[] = [];
  let cursor: string | null = null;
  while (true) {
    const data = await gql(`query($c: String) { products(first: 250, after: $c) { edges { node { id title } } pageInfo { hasNextPage endCursor } } }`, { c: cursor });
    for (const e of data.products.edges) {
      ids.push(e.node.id);
      console.log(`  Found: ${e.node.title}`);
    }
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }

  console.log(`\nDeleting ${ids.length} products...\n`);

  let deleted = 0;
  for (const id of ids) {
    await gql(`mutation($id: ProductDeleteInput!) { productDelete(input: $id) { deletedProductId userErrors { message } } }`, { id: { id } });
    deleted++;
    if (deleted % 10 === 0) console.log(`  ${deleted}/${ids.length} deleted`);
    if (deleted % 4 === 0) await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nDone: ${deleted} products deleted.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
