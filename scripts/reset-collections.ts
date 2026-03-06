// Script to:
// 1. Delete ALL existing collections on Shopify
// 2. Recreate the 19 Milwaukee EU collections with clean handles
//
// Run with: npx tsx scripts/reset-collections.ts

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
  if (!response.ok) throw new Error(`Token error: ${response.status}`);
  const data = await response.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getAdminAccessToken();
  const res = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query, variables }),
    }
  );
  if (!res.ok) throw new Error(`Admin API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  return json.data;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Step 1: Fetch & delete ALL collections ──────────────────────────────────

const LIST_COLLECTIONS = `
  query($cursor: String) {
    collections(first: 250, after: $cursor) {
      edges { node { id title handle } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const DELETE_COLLECTION = `
  mutation($input: CollectionDeleteInput!) {
    collectionDelete(input: $input) {
      deletedCollectionId
      userErrors { field message }
    }
  }
`;

async function deleteAllCollections() {
  // Fetch all
  const allCollections: { id: string; title: string; handle: string }[] = [];
  let cursor: string | null = null;

  while (true) {
    const data = await adminFetch<{
      collections: {
        edges: { node: { id: string; title: string; handle: string } }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>(LIST_COLLECTIONS, { cursor });

    allCollections.push(...data.collections.edges.map(e => e.node));
    if (!data.collections.pageInfo.hasNextPage) break;
    cursor = data.collections.pageInfo.endCursor;
  }

  console.log(`Found ${allCollections.length} collections to delete.\n`);

  // Delete all
  let deleted = 0;
  for (const col of allCollections) {
    try {
      await adminFetch(DELETE_COLLECTION, { input: { id: col.id } });
      deleted++;
      console.log(`  DEL  ${col.handle} ("${col.title}")`);
    } catch (err) {
      console.error(`  ERR  ${col.handle}: ${(err as Error).message}`);
    }
    // Rate limit
    if (deleted % 4 === 0) await sleep(1000);
  }

  console.log(`\nDeleted ${deleted} / ${allCollections.length} collections.\n`);

  // Wait for Shopify to process deletions and free up handles
  console.log('Waiting 15s for Shopify to release handles...\n');
  await sleep(15000);
}

// ─── Step 2: Create Milwaukee EU collections ─────────────────────────────────

const COLLECTION_CREATE = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id title handle }
      userErrors { field message }
    }
  }
`;

interface CollectionDef {
  title: string;
  handle: string;
  descriptionHtml: string;
  rules: { column: string; relation: string; condition: string }[];
  disjunctive: boolean;
}

function typeRule(condition: string) {
  return { column: 'TYPE', relation: 'EQUALS', condition };
}

const OUTILS_TYPES = [
  'Perçage et burinage', 'Vissage', 'Meuleuses et polisseuses',
  'Démolition', 'Béton', 'Sciage et découpe', 'Ponçage',
  'Sertissage', 'Radios et enceintes', 'Autres',
];

const COLLECTIONS: CollectionDef[] = [
  // Sub-categories outils électroportatifs
  { handle: 'percage-et-burinage', title: 'Perçage et burinage', descriptionHtml: 'Perceuses-visseuses, perforateurs et perceuses magnétiques Milwaukee.', rules: [typeRule('Perçage et burinage')], disjunctive: false },
  { handle: 'vissage', title: 'Vissage', descriptionHtml: 'Visseuses à chocs, boulonneuses, cloueurs et agrafeuses Milwaukee.', rules: [typeRule('Vissage')], disjunctive: false },
  { handle: 'meuleuses-et-polisseuses', title: 'Meuleuses et polisseuses', descriptionHtml: "Meuleuses d'angle et polisseuses Milwaukee. De 115 mm à 230 mm.", rules: [typeRule('Meuleuses et polisseuses')], disjunctive: false },
  { handle: 'demolition', title: 'Démolition', descriptionHtml: 'Marteaux démolisseurs et brise-béton Milwaukee.', rules: [typeRule('Démolition')], disjunctive: false },
  { handle: 'beton', title: 'Béton', descriptionHtml: 'Carotteuses, vibrateurs, talocheuses et pilonneuses Milwaukee.', rules: [typeRule('Béton')], disjunctive: false },
  { handle: 'sciage-et-decoupe', title: 'Sciage et découpe', descriptionHtml: 'Scies circulaires, sabres, sauteuses, défonceuses et outils de découpe Milwaukee.', rules: [typeRule('Sciage et découpe')], disjunctive: false },
  { handle: 'poncage', title: 'Ponçage', descriptionHtml: 'Ponceuses excentriques, orbitales et à bande Milwaukee.', rules: [typeRule('Ponçage')], disjunctive: false },
  { handle: 'sertissage', title: 'Sertissage', descriptionHtml: 'Presses à sertir, coupe-câbles, expandeurs et outils de sertissage Milwaukee.', rules: [typeRule('Sertissage')], disjunctive: false },
  { handle: 'radios-et-enceintes', title: 'Radios et enceintes', descriptionHtml: 'Radios et enceintes de chantier Milwaukee.', rules: [typeRule('Radios et enceintes')], disjunctive: false },
  { handle: 'autres', title: 'Autres', descriptionHtml: 'Pistolets à calfeutrer, pompes, malaxeurs et outils spécialisés Milwaukee.', rules: [typeRule('Autres')], disjunctive: false },
  // Parent outils électroportatifs
  { handle: 'outils-electroportatifs', title: 'Outils électroportatifs', descriptionHtml: 'Tous les outils électroportatifs Milwaukee : perceuses, scies, meuleuses et plus.', rules: OUTILS_TYPES.map(t => typeRule(t)), disjunctive: true },
  // Standalone
  { handle: 'batteries-chargeurs-et-generateurs', title: 'Batteries, chargeurs et générateurs', descriptionHtml: 'Batteries M12, M18 et MX FUEL. Chargeurs rapides, générateurs et stations énergie.', rules: [typeRule('Batteries, chargeurs et générateurs')], disjunctive: false },
  { handle: 'exterieurs-et-espaces-verts', title: 'Extérieurs et espaces verts', descriptionHtml: 'Tronçonneuses, taille-haies, souffleurs, tondeuses et outils de jardin Milwaukee.', rules: [typeRule('Extérieurs et espaces verts')], disjunctive: false },
  { handle: 'assainissement-et-nettoyage', title: 'Assainissement et nettoyage', descriptionHtml: "Déboucheurs, furets et outils d'assainissement Milwaukee.", rules: [typeRule('Assainissement et nettoyage des canalisations')], disjunctive: false },
  { handle: 'eclairage', title: 'Éclairage', descriptionHtml: 'Projecteurs, lampes torches, frontales et éclairages de chantier Milwaukee.', rules: [typeRule('Éclairage')], disjunctive: false },
  { handle: 'instruments-de-mesure', title: 'Instruments de mesure', descriptionHtml: "Lasers, télémètres, détecteurs et caméras d'inspection Milwaukee.", rules: [typeRule('Instruments de mesure')], disjunctive: false },
  { handle: 'aspirateurs', title: 'Aspirateurs', descriptionHtml: 'Aspirateurs de chantier Milwaukee. Cuve, dorsaux, extracteurs et compacts.', rules: [typeRule('Aspirateurs')], disjunctive: false },
  { handle: 'equipements-de-protection-epi', title: 'Équipements de protection (EPI)', descriptionHtml: 'Chaussures de sécurité et casques de protection Milwaukee.', rules: [typeRule('Équipements de protection individuelle (EPI)')], disjunctive: false },
  { handle: 'vetements-chauffants-et-de-travail', title: 'Vêtements chauffants et de travail', descriptionHtml: 'Vestes chauffantes M12, hoodies, pantalons de travail et accessoires Milwaukee.', rules: [typeRule('Vêtements chauffants et vêtements de travail')], disjunctive: false },
];

async function createCollections() {
  let success = 0;
  for (const col of COLLECTIONS) {
    try {
      const data = await adminFetch<{
        collectionCreate: {
          collection: { id: string; title: string; handle: string } | null;
          userErrors: { field: string[]; message: string }[];
        };
      }>(COLLECTION_CREATE, {
        input: {
          title: col.title,
          handle: col.handle,
          descriptionHtml: col.descriptionHtml,
          ruleSet: { appliedDisjunctively: col.disjunctive, rules: col.rules },
        },
      });

      if (data.collectionCreate.userErrors.length > 0) {
        const msgs = data.collectionCreate.userErrors.map(e => e.message).join(', ');
        console.error(`  ERR  "${col.title}": ${msgs}`);
      } else {
        const c = data.collectionCreate.collection!;
        const match = c.handle === col.handle ? '✓' : `⚠ got ${c.handle}`;
        console.log(`  OK   /collections/${c.handle}  "${c.title}"  ${match}`);
        success++;
      }
    } catch (err) {
      console.error(`  ERR  "${col.title}": ${(err as Error).message}`);
    }
    await sleep(500);
  }
  return success;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Store: ${STORE_DOMAIN}\n`);

  console.log('═══ Step 1: Deleting ALL existing collections ═══\n');
  await deleteAllCollections();

  console.log('═══ Step 2: Creating 19 Milwaukee EU collections ═══\n');
  const created = await createCollections();

  console.log(`\n═══ Done: ${created} / ${COLLECTIONS.length} collections created ═══`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
