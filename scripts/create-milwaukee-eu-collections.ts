// Script to:
// 1. Update all product types on Shopify to match Milwaukee EU categories
// 2. Create 19 smart collections (18 categories + 1 parent "Outils électroportatifs")
//
// Run with: npx tsx scripts/create-milwaukee-eu-collections.ts

import { readFileSync, readdirSync } from 'fs';
import { parse } from 'path';

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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Step 1: Build handle → new type mapping from CSVs ──────────────────────

function buildTypeMap(): Map<string, string> {
  const csvDir = 'categories_milwaukee_eu';
  const typeMap = new Map<string, string>();

  const files = readdirSync(csvDir).filter(f => f.endsWith('.csv'));
  for (const file of files) {
    const content = readFileSync(`${csvDir}/${file}`, 'utf-8');
    // Remove BOM
    const lines = content.replace(/^\uFEFF/, '').split('\n');
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV properly (handles quoted fields with commas)
      const fields = parseCSVLine(line);
      const handle = fields[0]?.trim();
      const title = fields[1]?.trim();
      const type = fields[3]?.trim();

      if (handle && title && type) {
        typeMap.set(handle, type);
      }
    }
  }

  return typeMap;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

// ─── Step 2: Fetch all products from Shopify ─────────────────────────────────

interface ShopifyProduct {
  id: string;
  handle: string;
  productType: string;
}

const PRODUCTS_QUERY = `
  query getProducts($cursor: String) {
    products(first: 250, after: $cursor) {
      edges {
        node {
          id
          handle
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

async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let cursor: string | null = null;
  let page = 1;

  while (true) {
    const data = await adminFetch<{
      products: {
        edges: { node: ShopifyProduct }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>(PRODUCTS_QUERY, { cursor });

    const batch = data.products.edges.map(e => e.node);
    products.push(...batch);
    console.log(`  Fetched page ${page}: ${batch.length} products (total: ${products.length})`);

    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
    page++;
  }

  return products;
}

// ─── Step 3: Update product types ────────────────────────────────────────────

const PRODUCT_UPDATE_MUTATION = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id handle productType }
      userErrors { field message }
    }
  }
`;

async function updateProductType(productId: string, newType: string): Promise<boolean> {
  const data = await adminFetch<{
    productUpdate: {
      product: { id: string; handle: string; productType: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(PRODUCT_UPDATE_MUTATION, {
    input: { id: productId, productType: newType },
  });

  if (data.productUpdate.userErrors.length > 0) {
    console.error(`    Error: ${data.productUpdate.userErrors.map(e => e.message).join(', ')}`);
    return false;
  }
  return true;
}

// ─── Step 4: Create smart collections ────────────────────────────────────────

interface CollectionDef {
  title: string;
  descriptionHtml: string;
  rules: { column: string; relation: string; condition: string }[];
  disjunctive: boolean;
}

const COLLECTION_CREATE_MUTATION = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id title handle }
      userErrors { field message }
    }
  }
`;

function productTypeRule(condition: string) {
  return { column: 'TYPE', relation: 'EQUALS', condition };
}

// Sub-categories under Outils électroportatifs
const OUTILS_TYPES = [
  'Perçage et burinage',
  'Vissage',
  'Meuleuses et polisseuses',
  'Démolition',
  'Béton',
  'Sciage et découpe',
  'Ponçage',
  'Sertissage',
  'Radios et enceintes',
  'Autres',
];

const COLLECTIONS: CollectionDef[] = [
  // ─── Outils électroportatifs sub-categories ───
  {
    title: 'Perçage et burinage',
    descriptionHtml: 'Perceuses-visseuses, perforateurs et perceuses magnétiques Milwaukee.',
    rules: [productTypeRule('Perçage et burinage')],
    disjunctive: false,
  },
  {
    title: 'Vissage',
    descriptionHtml: 'Visseuses à chocs, boulonneuses, cloueurs et agrafeuses Milwaukee.',
    rules: [productTypeRule('Vissage')],
    disjunctive: false,
  },
  {
    title: 'Meuleuses et polisseuses',
    descriptionHtml: 'Meuleuses d\'angle et polisseuses Milwaukee. De 115 mm à 230 mm.',
    rules: [productTypeRule('Meuleuses et polisseuses')],
    disjunctive: false,
  },
  {
    title: 'Démolition',
    descriptionHtml: 'Marteaux démolisseurs et brise-béton Milwaukee.',
    rules: [productTypeRule('Démolition')],
    disjunctive: false,
  },
  {
    title: 'Béton',
    descriptionHtml: 'Carotteuses, vibrateurs, talocheuses et pilonneuses Milwaukee.',
    rules: [productTypeRule('Béton')],
    disjunctive: false,
  },
  {
    title: 'Sciage et découpe',
    descriptionHtml: 'Scies circulaires, sabres, sauteuses, défonceuses et outils de découpe Milwaukee.',
    rules: [productTypeRule('Sciage et découpe')],
    disjunctive: false,
  },
  {
    title: 'Ponçage',
    descriptionHtml: 'Ponceuses excentriques, orbitales et à bande Milwaukee.',
    rules: [productTypeRule('Ponçage')],
    disjunctive: false,
  },
  {
    title: 'Sertissage',
    descriptionHtml: 'Presses à sertir, coupe-câbles, expandeurs et outils de sertissage Milwaukee.',
    rules: [productTypeRule('Sertissage')],
    disjunctive: false,
  },
  {
    title: 'Radios et enceintes',
    descriptionHtml: 'Radios et enceintes de chantier Milwaukee.',
    rules: [productTypeRule('Radios et enceintes')],
    disjunctive: false,
  },
  {
    title: 'Autres',
    descriptionHtml: 'Pistolets à calfeutrer, pompes, malaxeurs et outils spécialisés Milwaukee.',
    rules: [productTypeRule('Autres')],
    disjunctive: false,
  },

  // ─── Parent: Outils électroportatifs (groups all sub-types) ───
  {
    title: 'Outils électroportatifs',
    descriptionHtml: 'Tous les outils électroportatifs Milwaukee : perceuses, scies, meuleuses et plus.',
    rules: OUTILS_TYPES.map(t => productTypeRule(t)),
    disjunctive: true,
  },

  // ─── Standalone categories ───
  {
    title: 'Batteries, chargeurs et générateurs',
    descriptionHtml: 'Batteries M12, M18 et MX FUEL. Chargeurs rapides, générateurs et stations énergie.',
    rules: [productTypeRule('Batteries, chargeurs et générateurs')],
    disjunctive: false,
  },
  {
    title: 'Extérieurs et espaces verts',
    descriptionHtml: 'Tronçonneuses, taille-haies, souffleurs, tondeuses et outils de jardin Milwaukee.',
    rules: [productTypeRule('Extérieurs et espaces verts')],
    disjunctive: false,
  },
  {
    title: 'Assainissement et nettoyage',
    descriptionHtml: 'Déboucheurs, furets et outils d\'assainissement Milwaukee.',
    rules: [productTypeRule('Assainissement et nettoyage des canalisations')],
    disjunctive: false,
  },
  {
    title: 'Éclairage',
    descriptionHtml: 'Projecteurs, lampes torches, frontales et éclairages de chantier Milwaukee.',
    rules: [productTypeRule('Éclairage')],
    disjunctive: false,
  },
  {
    title: 'Instruments de mesure',
    descriptionHtml: 'Lasers, télémètres, détecteurs et caméras d\'inspection Milwaukee.',
    rules: [productTypeRule('Instruments de mesure')],
    disjunctive: false,
  },
  {
    title: 'Aspirateurs',
    descriptionHtml: 'Aspirateurs de chantier Milwaukee. Cuve, dorsaux, extracteurs et compacts.',
    rules: [productTypeRule('Aspirateurs')],
    disjunctive: false,
  },
  {
    title: 'Équipements de protection (EPI)',
    descriptionHtml: 'Chaussures de sécurité et casques de protection Milwaukee.',
    rules: [productTypeRule('Équipements de protection individuelle (EPI)')],
    disjunctive: false,
  },
  {
    title: 'Vêtements chauffants et de travail',
    descriptionHtml: 'Vestes chauffantes M12, hoodies, pantalons de travail et accessoires Milwaukee.',
    rules: [productTypeRule('Vêtements chauffants et vêtements de travail')],
    disjunctive: false,
  },
];

async function createSmartCollection(col: CollectionDef): Promise<{ id: string; title: string; handle: string }> {
  const data = await adminFetch<{
    collectionCreate: {
      collection: { id: string; title: string; handle: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(COLLECTION_CREATE_MUTATION, {
    input: {
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

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Step 1: Build type mapping from new CSVs
  console.log('═══ Step 1: Building handle → type mapping from CSVs ═══\n');
  const typeMap = buildTypeMap();
  console.log(`  ${typeMap.size} product handles mapped.\n`);

  // Show type distribution
  const typeCounts = new Map<string, number>();
  for (const type of typeMap.values()) {
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  }
  for (const [type, count] of [...typeCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${type}: ${count}`);
  }

  // Step 2: Fetch all products from Shopify
  console.log('\n═══ Step 2: Fetching all products from Shopify ═══\n');
  const products = await fetchAllProducts();
  console.log(`\n  Total: ${products.length} products on Shopify.\n`);

  // Step 3: Update product types
  console.log('═══ Step 3: Updating product types ═══\n');
  let updated = 0;
  let skipped = 0;
  let notFound = 0;
  let errors = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const newType = typeMap.get(product.handle);

    if (!newType) {
      // Product not in our CSVs (might be an old/other product)
      skipped++;
      continue;
    }

    if (product.productType === newType) {
      // Already correct
      skipped++;
      continue;
    }

    try {
      const ok = await updateProductType(product.id, newType);
      if (ok) {
        updated++;
        if (updated % 50 === 0) {
          console.log(`  Updated ${updated} products...`);
        }
      } else {
        errors++;
      }
    } catch (err) {
      console.error(`  Error updating ${product.handle}: ${(err as Error).message}`);
      errors++;
    }

    // Rate limiting: ~4 updates per second
    if ((updated + errors) % 4 === 0) {
      await sleep(1000);
    }
  }

  console.log(`\n  Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}\n`);

  // Step 4: Create smart collections
  console.log('═══ Step 4: Creating smart collections ═══\n');
  let colSuccess = 0;
  let colErrors = 0;

  for (const col of COLLECTIONS) {
    try {
      const result = await createSmartCollection(col);
      console.log(`  OK  "${result.title}" → /collections/${result.handle}`);
      colSuccess++;
    } catch (err) {
      console.error(`  ERR "${col.title}": ${(err as Error).message}`);
      colErrors++;
    }
    await sleep(500);
  }

  console.log(`\n═══ Done ═══`);
  console.log(`  Products updated: ${updated}`);
  console.log(`  Collections created: ${colSuccess} / ${COLLECTIONS.length}`);
  if (colErrors > 0) {
    console.log(`  Collection errors: ${colErrors}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
