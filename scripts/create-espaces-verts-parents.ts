// Create parent sub-collections for "Extérieurs et espaces verts"
// Run with: npx tsx scripts/create-espaces-verts-parents.ts

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

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) return cachedToken.token;
  const response = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  const data = await response.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getAdminAccessToken();
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  return json.data;
}

const MUTATION = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id title handle }
      userErrors { field message }
    }
  }
`;

const collections = [
  {
    handle: 'combi-systeme-quik-lok',
    title: 'Combi-système QUIK-LOK',
    descriptionHtml: 'Système modulaire QUIK-LOK Milwaukee : un moteur, plusieurs accessoires interchangeables.',
    rules: [
      { column: 'TAG', relation: 'EQUALS', condition: 'QUIK-LOK' },
    ],
    disjunctive: false,
  },
  {
    handle: 'debroussaillage-et-nettoyage',
    title: 'Débroussaillage et nettoyage',
    descriptionHtml: 'Débroussailleuses, sécateurs et taille-haies Milwaukee sans fil.',
    rules: [
      { column: 'TAG', relation: 'EQUALS', condition: 'Débroussailleuse' },
      { column: 'TAG', relation: 'EQUALS', condition: 'Sécateur' },
      { column: 'TAG', relation: 'EQUALS', condition: 'Taille-haie' },
      { column: 'TAG', relation: 'EQUALS', condition: 'Taille-haie sur perche' },
    ],
    disjunctive: true,
  },
  {
    handle: 'entretien-des-sols-des-pelouses-et-des-terrains',
    title: 'Entretien des sols, des pelouses et des terrains',
    descriptionHtml: 'Coupe-bordures, souffleurs et fraises à neige Milwaukee sans fil.',
    rules: [
      { column: 'TAG', relation: 'EQUALS', condition: 'Coupe-bordure' },
      { column: 'TAG', relation: 'EQUALS', condition: 'Fraise à neige' },
      { column: 'TAG', relation: 'EQUALS', condition: 'Souffleur' },
    ],
    disjunctive: true,
  },
];

async function main() {
  console.log('Creating 3 collections for Extérieurs et espaces verts...\n');
  for (const col of collections) {
    try {
      const data = await adminFetch<any>(MUTATION, {
        input: {
          handle: col.handle,
          title: col.title,
          descriptionHtml: col.descriptionHtml,
          ruleSet: { appliedDisjunctively: col.disjunctive, rules: col.rules },
        },
      });
      if (data.collectionCreate.userErrors.length > 0) {
        throw new Error(data.collectionCreate.userErrors.map((e: any) => e.message).join(', '));
      }
      const r = data.collectionCreate.collection;
      console.log(`✓  "${r.title}" -> /collections/${r.handle}`);
    } catch (err) {
      console.error(`✗  "${col.title}": ${(err as Error).message}`);
    }
  }
}

main();
