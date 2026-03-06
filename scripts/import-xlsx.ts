#!/usr/bin/env npx tsx
/**
 * Import products from "Felten shop.xlsx" into Shopify.
 * Reads the converted CSV (data/felten-shop-import.csv), groups variants by handle,
 * creates/updates products via productSet mutation, uploads images, publishes to all channels.
 *
 * Usage:
 *   npx tsx scripts/import-xlsx.ts [--dry-run] [--skip-images] [--skip-existing]
 */

import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

// ─── Load .env.local ────────────────────────────────────────────────────────

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
  console.log('✓ Loaded .env.local');
}

// ─── Config ─────────────────────────────────────────────────────────────────

const API_VERSION = '2025-01';
const STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_IMAGES = args.includes('--skip-images');
const SKIP_EXISTING = args.includes('--skip-existing');

const IMAGES_DIR = path.join(process.cwd(), 'images variantes');
const CSV_FILE = path.join(process.cwd(), 'data', 'felten-shop-import.csv');

// ─── Token Cache ────────────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60_000) {
    return cachedToken.token;
  }

  const res = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) throw new Error(`Auth failed (${res.status}): ${await res.text()}`);

  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  console.log('✓ Obtained Admin API token');
  return data.access_token;
}

// ─── GraphQL Helper ─────────────────────────────────────────────────────────

async function adminGql<T = any>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getAdminAccessToken();
  const res = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query, variables }),
    },
  );

  if (res.status === 429) {
    const retryAfter = parseFloat(res.headers.get('Retry-After') || '4');
    console.log(`  Rate limited, waiting ${retryAfter}s...`);
    await delay(retryAfter * 1000);
    return adminGql(query, variables);
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: any) => e.message).join('; '));
  return json.data;
}

// ─── Get Publications (Sales Channels) ─────────────────────────────────────

let publicationIds: string[] | null = null;

async function getPublications(): Promise<string[]> {
  if (publicationIds) return publicationIds;

  const data = await adminGql(`
    query {
      publications(first: 10) {
        edges { node { id name } }
      }
    }
  `);

  publicationIds = data.publications.edges.map((e: any) => e.node.id);
  console.log(`✓ Found ${publicationIds.length} sales channels:`,
    data.publications.edges.map((e: any) => e.node.name).join(', '));

  return publicationIds;
}

async function publishProduct(productId: string): Promise<void> {
  const publications = await getPublications();

  const data = await adminGql(`
    mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        publishable { availablePublicationsCount { count } }
        userErrors { field message }
      }
    }
  `, {
    id: productId,
    input: publications.map(pubId => ({ publicationId: pubId })),
  });

  if (data.publishablePublish.userErrors.length > 0) {
    const errors = data.publishablePublish.userErrors.map((e: any) => e.message).join('; ');
    throw new Error(`Publish failed: ${errors}`);
  }
}

// ─── Image Upload via Staged Uploads ───────────────────────────────────────

function getMimeType(filename: string): string {
  if (filename.endsWith('.webp')) return 'image/webp';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/webp';
}

const STAGED_UPLOADS_CREATE = `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }
`;

const uploadCache = new Map<string, string>();

async function stageAndUploadFile(filename: string): Promise<string | null> {
  if (uploadCache.has(filename)) return uploadCache.get(filename)!;

  const filePath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filePath)) return null;

  const stageData = await adminGql(STAGED_UPLOADS_CREATE, {
    input: [{
      filename,
      mimeType: getMimeType(filename),
      resource: 'PRODUCT_IMAGE',
      httpMethod: 'PUT',
    }],
  });

  if (stageData.stagedUploadsCreate.userErrors.length > 0) {
    throw new Error(stageData.stagedUploadsCreate.userErrors[0].message);
  }

  const target = stageData.stagedUploadsCreate.stagedTargets[0];
  const fileBuffer = fs.readFileSync(filePath);

  const uploadRes = await fetch(target.url, {
    method: 'PUT',
    headers: { 'Content-Type': getMimeType(filename) },
    body: fileBuffer,
  });

  if (!uploadRes.ok) throw new Error(`Upload PUT failed: HTTP ${uploadRes.status}`);

  uploadCache.set(filename, target.resourceUrl);
  return target.resourceUrl;
}

async function getImageUrl(src: string): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith('http')) return src;

  try {
    return await stageAndUploadFile(src);
  } catch (err) {
    console.error(`  ⚠ Failed to upload ${src}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

// ─── Fetch Existing Handles ────────────────────────────────────────────────

async function fetchExistingHandles(): Promise<Set<string>> {
  const handles = new Set<string>();
  let cursor: string | null = null;

  while (true) {
    const data = await adminGql<{
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

// ─── CSV Types & Parsing ───────────────────────────────────────────────────

interface CsvRow {
  Handle: string;
  Title: string;
  Vendor: string;
  Type: string;
  Tags: string;
  'Option1 Name': string;
  'Option1 Value': string;
  'Variant SKU': string;
  'Variant Price': string;
  'Variant Image': string;
  Body: string;
}

interface VariantData {
  optionValue: string;
  sku: string;
  price: string;
  imageSrc: string;
}

interface ProductGroup {
  handle: string;
  title: string;
  vendor: string;
  type: string;
  tags: string[];
  optionName: string;
  descriptionHtml: string;
  variants: VariantData[];
}

function groupByHandle(rows: CsvRow[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();

  for (const row of rows) {
    const handle = row.Handle?.trim();
    if (!handle) continue;

    if (!groups.has(handle)) {
      groups.set(handle, {
        handle,
        title: row.Title?.trim() || '',
        vendor: row.Vendor?.trim() || 'Milwaukee',
        type: row.Type?.trim() || '',
        tags: (row.Tags || '').split(',').map(t => t.trim()).filter(Boolean),
        optionName: row['Option1 Name']?.trim() || 'Modèle',
        descriptionHtml: row.Body?.trim() || '',
        variants: [],
      });
    }

    // Use Body from first variant that has it
    const existing = groups.get(handle)!;
    if (!existing.descriptionHtml && row.Body?.trim()) {
      existing.descriptionHtml = row.Body.trim();
    }

    groups.get(handle)!.variants.push({
      optionValue: row['Option1 Value']?.trim() || '',
      sku: row['Variant SKU']?.trim() || '',
      price: row['Variant Price']?.trim() || '0.00',
      imageSrc: row['Variant Image']?.trim() || '',
    });
  }

  return Array.from(groups.values());
}

// ─── Product Creation via productSet ───────────────────────────────────────

const PRODUCT_SET = `
  mutation productSet($input: ProductSetInput!, $synchronous: Boolean!) {
    productSet(input: $input, synchronous: $synchronous) {
      product { id handle }
      userErrors { code field message }
    }
  }
`;

async function buildProductSetInput(product: ProductGroup, includeImages: boolean): Promise<Record<string, any>> {
  const optionValues = [...new Set(product.variants.map(v => v.optionValue).filter(Boolean))];
  const variants = [];
  const imageUrls = new Set<string>();

  for (const v of product.variants) {
    const variantInput: Record<string, any> = {
      optionValues: [{ optionName: product.optionName, name: v.optionValue || 'Default' }],
    };

    if (v.sku) variantInput.sku = v.sku;
    if (v.price && v.price !== '0.00') variantInput.price = parseFloat(v.price) || 0;

    if (includeImages && v.imageSrc) {
      const imageUrl = await getImageUrl(v.imageSrc);
      if (imageUrl) {
        variantInput.file = { originalSource: imageUrl };
        imageUrls.add(imageUrl);
      }
    }
    variants.push(variantInput);
  }

  // If no option values are provided, use 'Default'
  const effectiveOptionValues = optionValues.length > 0
    ? optionValues.map(v => ({ name: v }))
    : [{ name: 'Default' }];

  const input: Record<string, any> = {
    title: product.title,
    handle: product.handle,
    vendor: product.vendor,
    productType: product.type,
    tags: product.tags,
    status: 'ACTIVE',
    descriptionHtml: product.descriptionHtml,
    productOptions: [{ name: product.optionName, values: effectiveOptionValues }],
    variants,
  };

  if (imageUrls.size > 0) {
    input.files = Array.from(imageUrls).map(url => ({ originalSource: url }));
  }

  return input;
}

async function upsertProduct(product: ProductGroup, includeImages: boolean): Promise<string | null> {
  const input = await buildProductSetInput(product, includeImages);

  const data = await adminGql(PRODUCT_SET, { input, synchronous: true });

  if (data?.productSet?.userErrors?.length > 0) {
    const errs = data.productSet.userErrors;
    throw new Error(errs.map((e: any) => `[${e.code}] ${e.field}: ${e.message}`).join('; '));
  }

  return data?.productSet?.product?.id || null;
}

// ─── Main ───────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET || !STORE_DOMAIN) {
    console.error('Missing Shopify credentials in .env.local');
    process.exit(1);
  }

  if (!fs.existsSync(CSV_FILE)) {
    console.error(`CSV file not found: ${CSV_FILE}`);
    console.error('Run Python conversion first to create data/felten-shop-import.csv');
    process.exit(1);
  }

  // Parse CSV
  console.log(`\nReading ${CSV_FILE}...`);
  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const rows: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  const products = groupByHandle(rows);

  console.log(`\n══════════ IMPORT FROM XLSX ══════════`);
  console.log(`Store:         ${STORE_DOMAIN}`);
  console.log(`Products:      ${products.length}`);
  console.log(`Variant rows:  ${rows.length}`);
  console.log(`Images:        ${SKIP_IMAGES ? 'SKIPPED' : 'included'}`);
  console.log(`Skip existing: ${SKIP_EXISTING}`);
  console.log(`Dry run:       ${DRY_RUN}`);

  // Type distribution
  const typeCounts = new Map<string, number>();
  for (const p of products) typeCounts.set(p.type, (typeCounts.get(p.type) || 0) + 1);
  console.log('\nProduct types:');
  for (const [t, c] of [...typeCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t || '(empty)'}: ${c}`);
  }

  // Check images
  if (!SKIP_IMAGES) {
    let found = 0, missing = 0;
    const uniqueImages = new Set<string>();
    for (const p of products) {
      for (const v of p.variants) {
        if (v.imageSrc && !uniqueImages.has(v.imageSrc)) {
          uniqueImages.add(v.imageSrc);
          if (fs.existsSync(path.join(IMAGES_DIR, v.imageSrc))) found++;
          else missing++;
        }
      }
    }
    console.log(`\nImages: ${found} found, ${missing} missing out of ${uniqueImages.size} unique`);
  }

  // Check with body
  const withBody = products.filter(p => p.descriptionHtml.length > 0).length;
  console.log(`Products with description: ${withBody}/${products.length}`);

  if (DRY_RUN) {
    console.log('\n=== DRY RUN — no products created ===');
    // Show first 5 products as sample
    for (const p of products.slice(0, 5)) {
      console.log(`\n  ${p.handle}`);
      console.log(`    Title: ${p.title}`);
      console.log(`    Type: ${p.type}`);
      console.log(`    Tags: ${p.tags.join(', ')}`);
      console.log(`    Variants: ${p.variants.length}`);
      console.log(`    Body: ${p.descriptionHtml.length} chars`);
      for (const v of p.variants) {
        console.log(`      - ${v.optionValue} | SKU: ${v.sku} | ${v.price}€ | img: ${v.imageSrc}`);
      }
    }
    return;
  }

  // Warm up
  await getPublications();

  // Optionally check existing handles
  let existingHandles = new Set<string>();
  if (SKIP_EXISTING) {
    console.log('\nFetching existing product handles...');
    existingHandles = await fetchExistingHandles();
    console.log(`  ${existingHandles.size} products already on Shopify`);
  }

  const toProcess = SKIP_EXISTING
    ? products.filter(p => !existingHandles.has(p.handle))
    : products;

  console.log(`\n${toProcess.length} products to process\n`);

  if (toProcess.length === 0) {
    console.log('Nothing to import!');
    return;
  }

  let created = 0;
  let published = 0;
  let errors = 0;
  const errorDetails: { handle: string; error: string }[] = [];

  for (let i = 0; i < toProcess.length; i++) {
    const product = toProcess[i];
    const prefix = `[${String(i + 1).padStart(4)}/${toProcess.length}]`;

    process.stdout.write(`${prefix} ${product.handle}... `);

    try {
      const includeImages = !SKIP_IMAGES;
      let productId = await upsertProduct(product, includeImages);

      // Retry without images if it fails with images
      if (!productId && includeImages) {
        process.stdout.write('retry w/o images... ');
        productId = await upsertProduct(product, false);
      }

      if (productId) {
        try {
          await publishProduct(productId);
          process.stdout.write('OK + PUBLISHED');
          published++;
        } catch (pubErr: any) {
          process.stdout.write(`OK (publish: ${pubErr.message.slice(0, 50)})`);
        }
        console.log('');
        created++;
      } else {
        console.log('NO ID RETURNED');
      }

      // Rate limit: 500ms between products (image uploads are heavier)
      await delay(includeImages ? 800 : 400);
    } catch (err: any) {
      const msg = err.message.slice(0, 150);
      console.log(`ERROR: ${msg}`);
      errors++;
      errorDetails.push({ handle: product.handle, error: msg });
    }
  }

  console.log('\n══════════════════ FINAL SUMMARY ══════════════════');
  console.log(`Total products:  ${products.length}`);
  console.log(`Processed:       ${toProcess.length}`);
  console.log(`Created/Updated: ${created}`);
  console.log(`Published:       ${published}`);
  console.log(`Errors:          ${errors}`);
  if (SKIP_EXISTING) {
    console.log(`Skipped (exist): ${products.length - toProcess.length}`);
  }

  if (errorDetails.length > 0) {
    console.log('\n── Error Details ──');
    for (const e of errorDetails.slice(0, 50)) {
      console.log(`  ${e.handle}: ${e.error}`);
    }
    if (errorDetails.length > 50) {
      console.log(`  ... and ${errorDetails.length - 50} more`);
    }
  }
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
