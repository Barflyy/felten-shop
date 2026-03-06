// Create or verify the Béton smart collection
// Run with: npx tsx scripts/create-beton-collection.ts

import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf-8').split('\n')
    .filter(l => l.includes('='))
    .map(l => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; })
);

const DOMAIN = env['NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'];
const CLIENT_ID = env['SHOPIFY_CLIENT_ID'];
const CLIENT_SECRET = env['SHOPIFY_CLIENT_SECRET'];

let token = '';

async function getToken() {
  const r = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  token = (await r.json()).access_token;
}

async function gql<T>(query: string, variables = {}): Promise<T> {
  const r = await fetch(`https://${DOMAIN}/admin/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(j.errors[0].message);
  return j.data;
}

async function main() {
  await getToken();

  // Check if a Béton collection already exists
  const check = await gql<any>(`
    query {
      collections(first: 10, query: "title:Béton") {
        edges { node { id handle title productsCount { count } } }
      }
    }
  `);

  const existing = check.collections.edges.map((e: any) => e.node);
  if (existing.length > 0) {
    console.log('Collection(s) Béton existante(s) :');
    for (const c of existing) {
      console.log(`  handle: ${c.handle} — ${c.productsCount.count} produits`);
    }
    console.log('\nLa collection sera automatiquement peuplée par la règle product_type = "Béton".');
    return;
  }

  // Create the smart collection
  const mutation = `
    mutation collectionCreate($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { id handle title }
        userErrors { field message }
      }
    }
  `;

  const input = {
    title: 'Béton',
    handle: 'beton',
    descriptionHtml: 'Outils pour travaux béton : carotteuses, vibrateurs, talocheuses et pilonneuses Milwaukee.',
    ruleSet: {
      appliedDisjunctively: false,
      rules: [{ column: 'TYPE', relation: 'EQUALS', condition: 'Béton' }],
    },
    sortOrder: 'BEST_SELLING',
  };

  const result = await gql<any>(mutation, { input });

  if (result.collectionCreate.userErrors.length > 0) {
    console.error('Erreurs:', result.collectionCreate.userErrors);
  } else {
    const c = result.collectionCreate.collection;
    console.log(`Collection créée : "${c.title}" (handle: ${c.handle}, id: ${c.id})`);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
