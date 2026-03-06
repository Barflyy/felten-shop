// Creates the "batteries-chargeurs" collection on Shopify
// matching the handle used in src/lib/navigation.ts
// Run with: npx tsx scripts/create-batteries-collection.ts

import { readFileSync } from 'fs';

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

async function getAdminAccessToken(): Promise<string> {
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
  if (!response.ok) throw new Error(`Token error: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return data.access_token;
}

async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getAdminAccessToken();
  const res = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  if (!res.ok) throw new Error(`Admin API error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  return json.data;
}

const COLLECTION_CREATE = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id title handle }
      userErrors { field message }
    }
  }
`;

async function main() {
  console.log(`Creating "batteries-chargeurs" collection on ${STORE_DOMAIN}...`);

  const data = await adminFetch<{
    collectionCreate: {
      collection: { id: string; title: string; handle: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(COLLECTION_CREATE, {
    input: {
      handle: 'batteries-chargeurs',
      title: 'Batteries et chargeurs',
      descriptionHtml:
        'Batteries M12™, M18™ et MX FUEL™. Chargeurs rapides, stations énergie et kits de batteries Milwaukee®.',
      ruleSet: {
        appliedDisjunctively: true,
        rules: [
          { column: 'TYPE', relation: 'EQUALS', condition: 'Batteries & Chargeurs' },
          { column: 'TYPE', relation: 'EQUALS', condition: 'Stations énergie' },
        ],
      },
    },
  });

  if (data.collectionCreate.userErrors.length > 0) {
    console.error('Errors:', data.collectionCreate.userErrors.map(e => e.message).join(', '));
    process.exit(1);
  }

  const col = data.collectionCreate.collection!;
  console.log(`\n✓ Created: "${col.title}"`);
  console.log(`  Handle : ${col.handle}`);
  console.log(`  ID     : ${col.id}`);

  if (col.handle !== 'batteries-chargeurs') {
    console.warn(`\n⚠️  Handle mismatch! Got "${col.handle}", expected "batteries-chargeurs".`);
    console.warn('   Update navigation.ts to use the actual handle above.');
  } else {
    console.log('\n✓ Handle matches navigation.ts → /collections/batteries-chargeurs');
  }
}

main();
