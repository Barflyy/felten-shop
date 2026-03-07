// Update product metafield custom.contenu_de_boite from CSV
// CSV format: Option1 Value, Metafield: custom.contenu_de_boite [multi_line_text_field]
//
// Run with: npx tsx scripts/update-contenu-boite.ts "/path/to/file.csv"

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── Load env ────────────────────────────────────────────────────────────────

const envFile = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
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
  console.error('Missing env vars (STORE_DOMAIN, CLIENT_ID, CLIENT_SECRET)');
  process.exit(1);
}

// ── Auth ────────────────────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }
  const res = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  if (!res.ok) throw new Error(`Token error: ${res.status}`);
  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── GraphQL helper ──────────────────────────────────────────────────────────

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getToken();
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 429) {
    const retryAfter = parseFloat(res.headers.get('Retry-After') || '2');
    await sleep(retryAfter * 1000);
    return gql(query, variables);
  }
  if (!res.ok) throw new Error(`GraphQL error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  return json.data;
}

// ── CSV parsing (multiline-safe) ────────────────────────────────────────────

function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  const len = content.length;
  let i = 0;

  while (i < len) {
    const row: string[] = [];
    while (i < len) {
      let field = '';
      if (content[i] === '"') {
        i++;
        while (i < len) {
          if (content[i] === '"') {
            if (i + 1 < len && content[i + 1] === '"') { field += '"'; i += 2; }
            else { i++; break; }
          } else { field += content[i]; i++; }
        }
        while (i < len && content[i] !== ',' && content[i] !== '\n' && content[i] !== '\r') i++;
      } else {
        while (i < len && content[i] !== ',' && content[i] !== '\n' && content[i] !== '\r') {
          field += content[i]; i++;
        }
      }
      row.push(field);
      if (i < len && content[i] === ',') { i++; } else { break; }
    }
    if (i < len && content[i] === '\r') i++;
    if (i < len && content[i] === '\n') i++;
    rows.push(row);
  }
  return rows;
}

// ── Fetch all variants (option1 value → variant GID) ────────────────────────

async function fetchAllVariantMappings(): Promise<Map<string, string>> {
  // Map: option1 value → variant GID
  const map = new Map<string, string>();

  let cursor: string | null = null;
  let page = 0;

  while (true) {
    page++;
    const afterClause = cursor ? `, after: "${cursor}"` : '';
    const data = await gql<{
      products: {
        edges: {
          node: {
            variants: {
              edges: { node: { id: string; selectedOptions: { name: string; value: string }[] } }[];
            };
          };
          cursor: string;
        }[];
        pageInfo: { hasNextPage: boolean };
      };
    }>(`{
      products(first: 100${afterClause}) {
        edges {
          node {
            variants(first: 50) {
              edges {
                node {
                  id
                  selectedOptions { name value }
                }
              }
            }
          }
          cursor
        }
        pageInfo { hasNextPage }
      }
    }`);

    for (const edge of data.products.edges) {
      for (const vEdge of edge.node.variants.edges) {
        const variantId = vEdge.node.id;
        for (const opt of vEdge.node.selectedOptions) {
          map.set(opt.value.trim(), variantId);
        }
      }
      cursor = edge.cursor;
    }

    console.log(`  Page ${page}: ${data.products.edges.length} products fetched (${map.size} variants mapped)`);

    if (!data.products.pageInfo.hasNextPage) break;
    await sleep(200);
  }

  return map;
}

// ── Set variant metafield ───────────────────────────────────────────────────

async function setProductMetafield(variantId: string, value: string): Promise<boolean> {
  const data = await gql<{
    metafieldsSet: {
      metafields: { id: string }[] | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(`mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id }
      userErrors { field message }
    }
  }`, {
    metafields: [{
      ownerId: variantId,
      namespace: 'custom',
      key: 'contenu_de_boite',
      type: 'multi_line_text_field',
      value,
    }],
  });

  if (data.metafieldsSet.userErrors.length > 0) {
    console.error(`    Errors: ${data.metafieldsSet.userErrors.map(e => e.message).join(', ')}`);
    return false;
  }
  return true;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: npx tsx scripts/update-contenu-boite.ts "/path/to/file.csv"');
    process.exit(1);
  }

  if (!existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Store: ${STORE_DOMAIN}`);
  console.log(`CSV: ${csvPath}\n`);

  // Parse CSV
  const content = readFileSync(csvPath, 'utf-8').replace(/^\uFEFF+/, '');
  const rows = parseCSV(content);

  // Skip header row, build entries
  const entries: { option1Value: string; contenu: string }[] = [];
  for (let i = 1; i < rows.length; i++) {
    const option1Value = rows[i][0]?.trim();
    const contenu = rows[i][1]?.trim();
    if (option1Value && contenu) {
      entries.push({ option1Value, contenu });
    }
  }

  console.log(`${entries.length} entries to process\n`);

  // Fetch all products and build variant → product map
  console.log('Fetching all products from Shopify...');
  const variantMap = await fetchAllVariantMappings();
  console.log(`\n${variantMap.size} variant option values mapped to products.\n`);

  // Process entries
  let updated = 0;
  let notFound = 0;
  let errors = 0;
  const missing: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    const { option1Value, contenu } = entries[i];
    const variantId = variantMap.get(option1Value);

    if (!variantId) {
      notFound++;
      missing.push(option1Value);
      console.log(`  [${i + 1}/${entries.length}] SKIP ${option1Value} — not found on Shopify`);
      continue;
    }

    try {
      const success = await setProductMetafield(variantId, contenu);
      if (success) {
        updated++;
        console.log(`  [${i + 1}/${entries.length}] OK   ${option1Value}`);
      } else {
        errors++;
        console.log(`  [${i + 1}/${entries.length}] ERR  ${option1Value}`);
      }
    } catch (err) {
      errors++;
      console.log(`  [${i + 1}/${entries.length}] ERR  ${option1Value}: ${(err as Error).message.slice(0, 150)}`);
    }

    await sleep(300);
  }

  console.log(`\n=== Done ===`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Not found: ${notFound}`);
  console.log(`  Errors: ${errors}`);

  if (missing.length > 0) {
    console.log(`\nVariants not found on Shopify:`);
    for (const m of missing) console.log(`  - ${m}`);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
