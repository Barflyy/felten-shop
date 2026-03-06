// Script to create 7 specific collections
// Run with: npx tsx scripts/create-7-collections.ts

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

// ─── Mutation ────────────────────────────────────────────────────────────────

const COLLECTION_CREATE_MUTATION = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface CollectionDef {
  handle: string;
  title: string;
  descriptionHtml: string;
  rules: { column: string; relation: string; condition: string }[];
  disjunctive: boolean;
}

async function createSmartCollection(col: CollectionDef) {
  const data = await adminFetch<{
    collectionCreate: {
      collection: { id: string; title: string; handle: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(COLLECTION_CREATE_MUTATION, {
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
    const msgs = data.collectionCreate.userErrors.map(e => e.message).join(', ');
    throw new Error(msgs);
  }

  return data.collectionCreate.collection!;
}

// ─── Collection definitions ─────────────────────────────────────────────────

function typeRule(condition: string) {
  return { column: 'TYPE', relation: 'EQUALS', condition };
}

const COLLECTIONS: CollectionDef[] = [
  {
    handle: 'batteries-chargeurs-et-generateurs',
    title: 'Batteries, chargeurs et générateurs',
    descriptionHtml: 'Batteries M12, M18 et MX FUEL. Chargeurs rapides, stations énergie et générateurs.',
    rules: [
      typeRule('Batteries & Chargeurs'),
      typeRule('Stations énergie'),
    ],
    disjunctive: true,
  },
  {
    handle: 'aspirateurs',
    title: 'Aspirateurs',
    descriptionHtml: 'Aspirateurs Milwaukee pour chantiers et ateliers. Classe L, M et H.',
    rules: [
      typeRule('Aspirateurs'),
    ],
    disjunctive: false,
  },
  {
    handle: 'eclairage',
    title: 'Éclairage',
    descriptionHtml: 'Projecteurs, lampes et éclairages de chantier Milwaukee. Sur batterie ou filaire.',
    rules: [
      typeRule('Éclairage'),
    ],
    disjunctive: false,
  },
  {
    handle: 'assainissement-et-nettoyage',
    title: 'Assainissement et nettoyage des canalisations',
    descriptionHtml: 'Déboucheurs, furets et caméras de canalisations Milwaukee.',
    rules: [
      typeRule('Outillage de plomberie'),
    ],
    disjunctive: false,
  },
  {
    handle: 'outils-electroportatifs',
    title: 'Outils électroportatifs',
    descriptionHtml: 'Tous les outils électroportatifs Milwaukee : perceuses, scies, meuleuses et plus.',
    rules: [
      typeRule('Perceuses & Visseuses'),
      typeRule('Perforateurs & Démolisseurs'),
      typeRule('Scies'),
      typeRule('Meuleuses'),
      typeRule('Cloueurs & Agrafeuses'),
      typeRule('Ponceuses & Polisseuses'),
      typeRule('Défonceuses & Multi-tool'),
      typeRule('Béton'),
      typeRule('Aspirateurs'),
    ],
    disjunctive: true,
  },
  {
    handle: 'exterieurs-et-espaces-verts',
    title: 'Équipement pour extérieurs et espaces verts',
    descriptionHtml: 'Taille-haies, souffleurs, tronçonneuses et outils de jardin sans fil.',
    rules: [
      typeRule('Jardin & Extérieur'),
    ],
    disjunctive: false,
  },
  {
    handle: 'instruments-de-mesure',
    title: 'Instruments de mesure',
    descriptionHtml: 'Lasermètres, détecteurs, caméras d\'inspection et niveaux laser.',
    rules: [
      typeRule('Mesure & Inspection'),
    ],
    disjunctive: false,
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Creating ${COLLECTIONS.length} collections on ${STORE_DOMAIN}...\n`);

  let success = 0;
  let errors = 0;

  for (const col of COLLECTIONS) {
    try {
      const result = await createSmartCollection(col);
      const match = result.handle === col.handle ? '✓' : `⚠️ handle: ${result.handle}`;
      console.log(`${match}  "${result.title}" -> /collections/${result.handle}`);
      success++;
    } catch (err) {
      console.error(`✗  "${col.title}": ${(err as Error).message}`);
      errors++;
    }
  }

  console.log(`\nDone: ${success} created, ${errors} errors.`);
  if (errors > 0) process.exit(1);
}

main();
