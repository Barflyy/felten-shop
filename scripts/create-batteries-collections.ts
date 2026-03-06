// Crée 4 collections automatiques par tags :
//   - Batteries, chargeurs et générateur (parent : TAG IN [Batteries, Chargeurs, Générateur])
//   - Batteries        (TAG = Batteries)
//   - Chargeurs        (TAG = Chargeurs)
//   - Générateur       (TAG = Générateur)
// Run: npx tsx scripts/create-batteries-collections.ts

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

// ─── Admin API helpers ────────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }
  const response = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  if (!response.ok) {
    throw new Error(`Token error: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getAdminAccessToken();
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Admin API error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  return json.data;
}

// ─── Mutation ─────────────────────────────────────────────────────────────────

const COLLECTION_CREATE = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id title handle }
      userErrors { field message }
    }
  }
`;

type Rule = { column: string; relation: string; condition: string };

interface ColDef {
  handle: string;
  title: string;
  descriptionHtml: string;
  rules: Rule[];
  disjunctive: boolean;
}

function tagRule(tag: string): Rule {
  return { column: 'TAG', relation: 'EQUALS', condition: tag };
}

// ─── Définitions des collections ─────────────────────────────────────────────

const COLLECTIONS: ColDef[] = [
  // Collection parent — contient tout ce qui a l'un des 3 tags
  {
    handle: 'batteries-chargeurs-et-generateur',
    title: 'Batteries, chargeurs et générateur',
    descriptionHtml: 'Batteries M12, M18 et MX FUEL, chargeurs rapides et générateurs Milwaukee.',
    rules: [
      tagRule('Batteries'),
      tagRule('Chargeurs'),
      tagRule('Générateur'),
    ],
    disjunctive: true, // TAG = Batteries OU TAG = Chargeurs OU TAG = Générateur
  },
  // Sous-collections individuelles
  {
    handle: 'batteries',
    title: 'Batteries',
    descriptionHtml: 'Batteries Milwaukee M12, M18 et MX FUEL. Compatible avec toute la gamme d\'outils.',
    rules: [tagRule('Batteries')],
    disjunctive: false,
  },
  {
    handle: 'chargeurs',
    title: 'Chargeurs',
    descriptionHtml: 'Chargeurs rapides et stations de recharge Milwaukee M12, M18 et MX FUEL.',
    rules: [tagRule('Chargeurs')],
    disjunctive: false,
  },
  {
    handle: 'generateur',
    title: 'Générateur',
    descriptionHtml: 'Générateurs et stations énergie Milwaukee pour le chantier.',
    rules: [tagRule('Générateur')],
    disjunctive: false,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Création de ${COLLECTIONS.length} collections sur ${STORE_DOMAIN}...\n`);

  let success = 0;
  let errors = 0;

  for (const col of COLLECTIONS) {
    try {
      const data = await adminFetch<{
        collectionCreate: {
          collection: { id: string; title: string; handle: string } | null;
          userErrors: { field: string[]; message: string }[];
        };
      }>(COLLECTION_CREATE, {
        input: {
          handle: col.handle,
          title: col.title,
          descriptionHtml: col.descriptionHtml,
          ruleSet: {
            appliedDisjunctively: col.disjunctive,
            rules: col.rules,
          },
        },
      });

      if (data.collectionCreate.userErrors.length > 0) {
        throw new Error(data.collectionCreate.userErrors.map(e => e.message).join(', '));
      }

      const result = data.collectionCreate.collection!;
      const handleOk = result.handle === col.handle ? '✓' : `⚠️  handle=${result.handle}`;
      const rulesDesc = col.rules.map(r => `TAG="${r.condition}"`).join(col.disjunctive ? ' OU ' : ' ET ');
      console.log(`${handleOk}  "${result.title}" → /collections/${result.handle}`);
      console.log(`       Règle : ${rulesDesc}\n`);
      success++;
    } catch (err) {
      console.error(`ERR "${col.title}": ${(err as Error).message}\n`);
      errors++;
    }
  }

  console.log(`Terminé : ${success} créées, ${errors} erreurs.`);
  if (errors > 0) process.exit(1);
}

main();
