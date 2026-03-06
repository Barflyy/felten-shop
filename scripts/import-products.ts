// Import all products from categories_milwaukee_eu/ CSVs to Shopify
// Run with: npx tsx scripts/import-products.ts
//
// Features:
// - Multiline-safe CSV parsing
// - Image upload via base64 attachment
// - Publishes to ALL 5 sales channels
// - Variant metafields (box_content, card_metric, card_metric_label, card_description)

import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve } from 'path';

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
  console.error('Missing env vars');
  process.exit(1);
}

const IMAGES_DIR = resolve('images variantes');

// All 5 publication IDs
const PUBLICATION_IDS = [
  'gid://shopify/Publication/159752814860', // Online Store
  'gid://shopify/Publication/159752880396', // Point of Sale
  'gid://shopify/Publication/240675520780', // Shop
  'gid://shopify/Publication/240850993420', // Facebook & Instagram
  'gid://shopify/Publication/241618780428', // Shop Felten Headless
];

// ─── Auth ────────────────────────────────────────────────────────────────────

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

// ─── GraphQL helper ──────────────────────────────────────────────────────────

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getToken();
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  return json.data;
}

// ─── CSV parsing (multiline-safe) ────────────────────────────────────────────

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

interface CSVProduct {
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string;
  option1Name: string;
  option1Value: string;
  option2Name: string;
  option2Value: string;
  sku: string;
  price: string;
  image: string;
  boxContent: string;
  cardMetric: string;
  cardMetricLabel: string;
  cardDescription: string;
}

function readAllCSVs(): CSVProduct[] {
  const dir = 'categories_milwaukee_eu';
  const products: CSVProduct[] = [];
  const filterArg = process.argv[2]; // optional: filter by CSV filename substring
  let files = readdirSync(dir).filter(f => f.endsWith('.csv'));
  if (filterArg) {
    files = files.filter(f => f.toLowerCase().includes(filterArg.toLowerCase()));
    console.log(`  Filter: "${filterArg}" → ${files.length} file(s): ${files.join(', ')}\n`);
  }

  for (const file of files) {
    const content = readFileSync(`${dir}/${file}`, 'utf-8').replace(/^\uFEFF/, '');
    const rows = parseCSV(content);

    for (let i = 1; i < rows.length; i++) {
      const f = rows[i];
      if (f.length < 2 || f.every(c => !c.trim())) continue;

      const handle = f[0]?.trim() || '';
      const title = f[1]?.trim() || '';
      if (!handle || !title) continue;

      products.push({
        handle,
        title,
        vendor: f[2]?.trim() || 'Milwaukee',
        productType: f[3]?.trim() || '',
        tags: f[4]?.trim() || '',
        option1Name: f[5]?.trim() || 'Modèle',
        option1Value: f[6]?.trim() || '',
        option2Name: f[7]?.trim() || '',
        option2Value: f[8]?.trim() || '',
        sku: f[9]?.trim() || '',
        price: f[10]?.trim() || '',
        image: f[11]?.trim() || '',
        boxContent: f[12]?.trim() || '',
        cardMetric: f[13]?.trim() || '',
        cardMetricLabel: f[14]?.trim() || '',
        cardDescription: f[15]?.trim() || '',
      });
    }
  }

  return products;
}

// ─── Fetch existing product handles ──────────────────────────────────────────

async function fetchExistingHandles(): Promise<Set<string>> {
  const handles = new Set<string>();
  let cursor: string | null = null;

  while (true) {
    const data = await gql<{
      products: {
        edges: { node: { handle: string } }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>(`query($cursor: String) {
      products(first: 250, after: $cursor) {
        edges { node { handle } }
        pageInfo { hasNextPage endCursor }
      }
    }`, { cursor });

    for (const e of data.products.edges) handles.add(e.node.handle);
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }

  return handles;
}

// ─── Create product via REST API ─────────────────────────────────────────────

async function createProduct(product: CSVProduct): Promise<{ id: number; handle: string }> {
  const token = await getToken();

  // Build variant
  const variant: Record<string, unknown> = {
    option1: product.option1Value || 'Default',
    sku: product.sku,
    price: product.price,
    inventory_management: null,
  };
  if (product.option2Value) variant.option2 = product.option2Value;

  // Variant metafields
  const metafields: Record<string, unknown>[] = [];
  if (product.boxContent) {
    metafields.push({ namespace: 'custom', key: 'box_content', value: product.boxContent, type: 'multi_line_text_field' });
  }
  if (product.cardMetric) {
    metafields.push({ namespace: 'custom', key: 'card_metric', value: product.cardMetric, type: 'single_line_text_field' });
  }
  if (product.cardMetricLabel) {
    metafields.push({ namespace: 'custom', key: 'card_metric_label', value: product.cardMetricLabel, type: 'single_line_text_field' });
  }
  if (product.cardDescription) {
    metafields.push({ namespace: 'custom', key: 'card_description', value: product.cardDescription, type: 'multi_line_text_field' });
  }
  if (metafields.length > 0) variant.metafields = metafields;

  // Build images array (base64 from local file)
  const images: Record<string, unknown>[] = [];
  if (product.image) {
    const imagePath = resolve(IMAGES_DIR, product.image);
    if (existsSync(imagePath)) {
      const imageBuffer = readFileSync(imagePath);
      images.push({
        attachment: imageBuffer.toString('base64'),
        filename: product.image,
      });
    }
  }

  const options: Record<string, unknown>[] = [{ name: product.option1Name || 'Modèle' }];
  if (product.option2Name) options.push({ name: product.option2Name });

  const body = {
    product: {
      title: product.title,
      handle: product.handle,
      vendor: product.vendor,
      product_type: product.productType,
      tags: product.tags,
      status: 'active',
      published: true,
      variants: [variant],
      options,
      images,
    },
  };

  const res = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/products.json`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) {
      const retryAfter = parseFloat(res.headers.get('Retry-After') || '2');
      await sleep(retryAfter * 1000);
      return createProduct(product);
    }
    throw new Error(`${res.status}: ${text.slice(0, 300)}`);
  }

  const json = await res.json();
  return { id: json.product.id, handle: json.product.handle };
}

// ─── Publish to all sales channels ──────────────────────────────────────────

async function publishToAllChannels(productGid: string): Promise<void> {
  await gql(`mutation($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      userErrors { field message }
    }
  }`, {
    id: productGid,
    input: PUBLICATION_IDS.map(id => ({ publicationId: id })),
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Store: ${STORE_DOMAIN}\n`);

  // Read all CSVs
  console.log('Reading CSVs from categories_milwaukee_eu/...');
  const products = readAllCSVs();
  console.log(`  ${products.length} products found.\n`);

  // Type distribution
  const typeCounts = new Map<string, number>();
  for (const p of products) typeCounts.set(p.productType, (typeCounts.get(p.productType) || 0) + 1);
  for (const [t, c] of [...typeCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t}: ${c}`);
  }

  // Check images
  let imagesFound = 0;
  let imagesMissing = 0;
  for (const p of products) {
    if (p.image) {
      if (existsSync(resolve(IMAGES_DIR, p.image))) imagesFound++;
      else imagesMissing++;
    }
  }
  console.log(`\n  Images: ${imagesFound} found, ${imagesMissing} missing\n`);

  // Fetch existing
  console.log('Fetching existing products...');
  const existing = await fetchExistingHandles();
  console.log(`  ${existing.size} products already on Shopify.\n`);

  // Filter out existing
  const toCreate = products.filter(p => !existing.has(p.handle));
  console.log(`  ${toCreate.length} new products to create.\n`);

  if (toCreate.length === 0) {
    console.log('Nothing to import!');
    return;
  }

  // Create products
  console.log('═══ Importing products ═══\n');
  let created = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (let i = 0; i < toCreate.length; i++) {
    const product = toCreate[i];
    try {
      const result = await createProduct(product);

      // Publish to all 5 channels
      const productGid = `gid://shopify/Product/${result.id}`;
      try {
        await publishToAllChannels(productGid);
      } catch {
        // Non-fatal: product created but may not be on all channels
      }

      created++;
      if (created % 25 === 0 || created === 1) {
        const pct = Math.round((i / toCreate.length) * 100);
        console.log(`  [${pct}%] ${created}/${toCreate.length} created (${product.title})`);
      }
    } catch (err) {
      errors++;
      const msg = `${product.handle}: ${(err as Error).message}`;
      errorDetails.push(msg);
      if (errors <= 10) console.error(`  ERR  ${msg.slice(0, 200)}`);
    }

    // Rate limit: ~1 per second (REST + image upload is heavier)
    await sleep(1000);
  }

  console.log(`\n═══ Done ═══`);
  console.log(`  Created: ${created}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Skipped (existing): ${existing.size}`);

  if (errorDetails.length > 0 && errorDetails.length <= 30) {
    console.log('\nError details:');
    for (const e of errorDetails) console.log(`  - ${e.slice(0, 250)}`);
  } else if (errorDetails.length > 30) {
    console.log(`\nFirst 30 errors:`);
    for (const e of errorDetails.slice(0, 30)) console.log(`  - ${e.slice(0, 250)}`);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
