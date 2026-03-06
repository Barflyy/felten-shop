// Import products from a single CSV file to Shopify
// CSV format: Handle,Title,Vendor,Type,Tags,Option1 Name,Option1 Value,Variant SKU,Variant Price,Variant Image,Body
// Rows sharing the same Handle are grouped as variants of one product.
//
// Run with: npx tsx scripts/import-csv-products.ts "/path/to/file.csv"

import { readFileSync, existsSync } from 'fs';
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

// ─── Types ───────────────────────────────────────────────────────────────────

interface CSVRow {
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string;
  option1Name: string;
  option1Value: string;
  sku: string;
  price: string;
  image: string;
  body: string;
}

interface GroupedProduct {
  handle: string;
  title: string;
  vendor: string;
  productType: string;
  tags: string;
  body: string;
  option1Name: string;
  variants: { option1Value: string; sku: string; price: string; image: string }[];
}

// ─── Read & group CSV ────────────────────────────────────────────────────────

function readAndGroupCSV(filePath: string): GroupedProduct[] {
  const content = readFileSync(filePath, 'utf-8').replace(/^\uFEFF+/, '');
  const rows = parseCSV(content);

  // Parse rows
  const csvRows: CSVRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const f = rows[i];
    if (f.length < 2 || f.every(c => !c.trim())) continue;
    const handle = f[0]?.trim() || '';
    const title = f[1]?.trim() || '';
    if (!handle && !title) continue;

    csvRows.push({
      handle,
      title,
      vendor: f[2]?.trim() || 'Milwaukee',
      productType: f[3]?.trim() || '',
      tags: f[4]?.trim() || '',
      option1Name: f[5]?.trim() || 'Modele',
      option1Value: f[6]?.trim() || 'Default',
      sku: f[7]?.trim() || '',
      price: f[8]?.trim() || '0',
      image: f[9]?.trim() || '',
      body: f[10]?.trim() || '',
    });
  }

  // Group by handle
  const grouped = new Map<string, GroupedProduct>();
  for (const row of csvRows) {
    const existing = grouped.get(row.handle);
    if (existing) {
      existing.variants.push({
        option1Value: row.option1Value,
        sku: row.sku,
        price: row.price,
        image: row.image,
      });
    } else {
      grouped.set(row.handle, {
        handle: row.handle,
        title: row.title,
        vendor: row.vendor,
        productType: row.productType,
        tags: row.tags,
        body: row.body,
        option1Name: row.option1Name,
        variants: [{
          option1Value: row.option1Value,
          sku: row.sku,
          price: row.price,
          image: row.image,
        }],
      });
    }
  }

  return [...grouped.values()];
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

async function createProduct(product: GroupedProduct): Promise<{ id: number; handle: string }> {
  const token = await getToken();

  // Build variants
  const variants = product.variants.map(v => {
    const variant: Record<string, unknown> = {
      option1: v.option1Value || 'Default',
      sku: v.sku,
      price: v.price,
      inventory_management: null,
    };
    return variant;
  });

  // Build images array from all variant images
  const images: Record<string, unknown>[] = [];
  const seenImages = new Set<string>();
  for (const v of product.variants) {
    if (v.image && !seenImages.has(v.image)) {
      seenImages.add(v.image);
      const imagePath = resolve(IMAGES_DIR, v.image);
      if (existsSync(imagePath)) {
        const imageBuffer = readFileSync(imagePath);
        images.push({
          attachment: imageBuffer.toString('base64'),
          filename: v.image,
        });
      }
    }
  }

  const body = {
    product: {
      title: product.title,
      handle: product.handle,
      vendor: product.vendor,
      product_type: product.productType,
      tags: product.tags,
      body_html: product.body,
      status: 'active',
      published: true,
      variants,
      options: [{ name: product.option1Name || 'Modele' }],
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
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: npx tsx scripts/import-csv-products.ts "/path/to/file.csv"');
    process.exit(1);
  }

  if (!existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Store: ${STORE_DOMAIN}`);
  console.log(`CSV: ${csvPath}\n`);

  // Read & group
  const products = readAndGroupCSV(csvPath);
  const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0);
  console.log(`${products.length} products (${totalVariants} variants total)\n`);

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
    for (const v of p.variants) {
      if (v.image) {
        if (existsSync(resolve(IMAGES_DIR, v.image))) imagesFound++;
        else imagesMissing++;
      }
    }
  }
  console.log(`\nImages: ${imagesFound} found, ${imagesMissing} missing\n`);

  // Fetch existing
  console.log('Fetching existing products...');
  const existing = await fetchExistingHandles();
  console.log(`${existing.size} products already on Shopify.\n`);

  // Filter out existing
  const toCreate = products.filter(p => !existing.has(p.handle));
  console.log(`${toCreate.length} new products to create.\n`);

  if (toCreate.length === 0) {
    console.log('Nothing to import!');
    return;
  }

  console.log('Starting import...\n');

  let created = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (let i = 0; i < toCreate.length; i++) {
    const product = toCreate[i];
    try {
      const result = await createProduct(product);

      // Publish to all channels
      const productGid = `gid://shopify/Product/${result.id}`;
      try {
        await publishToAllChannels(productGid);
      } catch {
        // Non-fatal
      }

      created++;
      const pct = Math.round(((i + 1) / toCreate.length) * 100);
      console.log(`  [${pct}%] ${created}/${toCreate.length} — ${product.title} (${product.variants.length} variant${product.variants.length > 1 ? 's' : ''})`);
    } catch (err) {
      errors++;
      const msg = `${product.handle}: ${(err as Error).message}`;
      errorDetails.push(msg);
      if (errors <= 20) console.error(`  ERR  ${msg.slice(0, 250)}`);
    }

    // Rate limit
    await sleep(product.variants.length > 3 ? 1500 : 1000);
  }

  console.log(`\n=== Done ===`);
  console.log(`  Created: ${created}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Skipped (existing): ${products.length - toCreate.length}`);

  if (errorDetails.length > 0 && errorDetails.length <= 30) {
    console.log('\nError details:');
    for (const e of errorDetails) console.log(`  - ${e.slice(0, 250)}`);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
