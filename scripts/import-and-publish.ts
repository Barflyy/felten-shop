#!/usr/bin/env npx tsx
/**
 * Import products + variants from CSV AND publish to sales channels
 *
 * Usage:
 *   npx tsx scripts/import-and-publish.ts [csv-path] [--dry-run] [--skip-images]
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
const CDN_BASE = `https://cdn.shopify.com/s/files/1/0750/5746/3564/files/`;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SKIP_IMAGES = args.includes('--skip-images');
const CSV_PATH = args.find(a => !a.startsWith('--') && a.endsWith('.csv')) ||
  'categories/Aspirateurs.csv';

const IMAGES_DIR = path.join(process.cwd(), 'images variantes');

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

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: any) => e.message).join('; '));
  return json.data;
}

// ─── Get Publications (Sales Channels) ─────────────────────────────────────

let publicationIds: string[] | null = null;

async function getPublications(): Promise<string[]> {
  if (publicationIds) return publicationIds;

  const query = `
    query {
      publications(first: 10) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `;

  const data = await adminGql(query);
  publicationIds = data.publications.edges.map((e: any) => e.node.id);

  console.log(`✓ Found ${publicationIds.length} sales channels:`,
    data.publications.edges.map((e: any) => e.node.name).join(', '));

  return publicationIds;
}

// ─── Publish Product ────────────────────────────────────────────────────────

async function publishProduct(productId: string): Promise<void> {
  const publications = await getPublications();

  const mutation = `
    mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        publishable {
          availablePublicationsCount {
            count
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input = publications.map(pubId => ({ publicationId: pubId }));

  const data = await adminGql(mutation, { id: productId, input });

  if (data.publishablePublish.userErrors.length > 0) {
    const errors = data.publishablePublish.userErrors.map((e: any) => e.message).join('; ');
    throw new Error(`Publish failed: ${errors}`);
  }
}

// ─── Image Upload (copied from original script) ────────────────────────────

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

async function getImageUrl(src: string): Promise<string> {
  if (!src) return '';
  if (src.startsWith('http')) return src;

  try {
    const resourceUrl = await stageAndUploadFile(src);
    if (resourceUrl) return resourceUrl;
  } catch (err) {
    console.error(`  ⚠️ Failed to upload ${src}:`, err instanceof Error ? err.message : err);
  }

  return CDN_BASE + src;
}

// ─── Types & CSV Parsing (same as original) ─────────────────────────────────

interface CsvRow {
  Handle: string;
  Title: string;
  Vendor: string;
  Type: string;
  Tags: string;
  'Body (HTML)': string;
  'Option1 Name': string;
  'Option1 Value': string;
  'Variant SKU': string;
  'Variant Price': string;
  'Variant Image': string;
  'Variant Metafield: custom.box_content': string;
  'Variant Metafield: custom.card_metric': string;
  'Variant Metafield: custom.card_metric_label': string;
  'Variant Metafield: custom.card_description': string;
}

interface VariantData {
  optionValue: string;
  sku: string;
  price: string;
  imageSrc: string;
  boxContent: string;
  cardMetric: string;
  cardMetricLabel: string;
  cardDescription: string;
}

interface ProductGroup {
  handle: string;
  title: string;
  vendor: string;
  type: string;
  tags: string[];
  description: string;
  optionName: string;
  variants: VariantData[];
}

// Infer product type from CSV filename when Type column is absent
// e.g. "categories/Aspirateurs.csv" → "Aspirateurs"
function inferTypeFromPath(csvPath: string): string {
  return path.basename(csvPath, '.csv').replace(/_/g, ' ');
}

// Auto-resolve image filename from model code when Variant Image column is absent
// e.g. "AS 30 LAC" → "AS_30_LAC--Hero_1.webp"
function lookupImageByModel(model: string): string {
  if (!model) return '';
  const base = model.replace(/\s+/g, '_');
  for (const candidate of [`${base}--Hero_1.webp`, `${base}--Hero_01.webp`]) {
    if (fs.existsSync(path.join(IMAGES_DIR, candidate))) return candidate;
  }
  return '';
}

function groupByHandle(rows: CsvRow[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();
  const inferredType = inferTypeFromPath(CSV_PATH);

  for (const row of rows) {
    const handle = row.Handle?.trim();
    if (!handle) continue;

    if (!groups.has(handle)) {
      groups.set(handle, {
        handle,
        title: row.Title?.trim() || '',
        vendor: row.Vendor?.trim() || 'Milwaukee',
        type: row.Type?.trim() || inferredType,
        tags: (row.Tags || '').split(',').map(t => t.trim()).filter(Boolean),
        description: (row['Body (HTML)'] || row['Body'] || '').trim(),
        optionName: row['Option1 Name']?.trim() || 'Modèle',
        variants: [],
      });
    }

    groups.get(handle)!.variants.push({
      optionValue: row['Option1 Value']?.trim() || '',
      sku: row['Variant SKU']?.trim() || row['Option1 Value']?.trim() || '',
      price: row['Variant Price']?.trim() || '0.00',
      imageSrc: row['Variant Image']?.trim() || lookupImageByModel(row['Option1 Value']?.trim() || ''),
      boxContent: (row['Variant Metafield: custom.box_content'] || '').trim(),
      cardMetric: (row['Variant Metafield: custom.card_metric'] || '').trim(),
      cardMetricLabel: (row['Variant Metafield: custom.card_metric_label'] || '').trim(),
      cardDescription: (row['Variant Metafield: custom.card_description'] || '').trim(),
    });
  }

  return Array.from(groups.values());
}

// ─── Product Creation ───────────────────────────────────────────────────────

const PRODUCT_BY_HANDLE = `
  query ($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
    }
  }
`;

const PRODUCT_SET = `
  mutation productSet($input: ProductSetInput!, $synchronous: Boolean!) {
    productSet(input: $input, synchronous: $synchronous) {
      product {
        id
        handle
      }
      userErrors { code field message }
    }
  }
`;

async function getProductByHandle(handle: string) {
  const data = await adminGql(PRODUCT_BY_HANDLE, { handle });
  return data?.productByHandle || null;
}

function buildVariantMetafields(variant: VariantData) {
  const mf: any[] = [];
  if (variant.boxContent) mf.push({ namespace: 'custom', key: 'box_content', value: variant.boxContent, type: 'multi_line_text_field' });
  if (variant.cardMetric) mf.push({ namespace: 'custom', key: 'card_metric', value: variant.cardMetric, type: 'single_line_text_field' });
  if (variant.cardMetricLabel) mf.push({ namespace: 'custom', key: 'card_metric_label', value: variant.cardMetricLabel, type: 'single_line_text_field' });
  if (variant.cardDescription) mf.push({ namespace: 'custom', key: 'card_description', value: variant.cardDescription, type: 'multi_line_text_field' });
  return mf;
}

async function buildProductSetInput(product: ProductGroup, includeImages: boolean): Promise<Record<string, any>> {
  const optionValues = [...new Set(product.variants.map(v => v.optionValue).filter(Boolean))];
  const variants = [];
  const imageUrls = new Set<string>();

  for (const v of product.variants) {
    const variantInput: Record<string, any> = {
      sku: v.sku,
      price: parseFloat(v.price) || 0,
      optionValues: [{ optionName: product.optionName, name: v.optionValue }],
    };

    const mf = buildVariantMetafields(v);
    if (mf.length > 0) variantInput.metafields = mf;

    if (includeImages && v.imageSrc) {
      const imageUrl = await getImageUrl(v.imageSrc);
      if (imageUrl) {
        variantInput.file = { originalSource: imageUrl };
        imageUrls.add(imageUrl);
      }
    }
    variants.push(variantInput);
  }

  const input: Record<string, any> = {
    title: product.title,
    handle: product.handle,
    vendor: product.vendor,
    productType: product.type,
    tags: product.tags,
    status: 'ACTIVE', // Always ACTIVE
    productOptions: [{ name: product.optionName, values: optionValues.map(v => ({ name: v })) }],
    variants,
  };

  if (product.description) {
    input.descriptionHtml = product.description;
  }

  if (imageUrls.size > 0) {
    input.files = Array.from(imageUrls).map(url => ({ originalSource: url }));
  }

  return input;
}

async function upsertProduct(product: ProductGroup, includeImages: boolean, existingId?: string): Promise<string | null> {
  const input = await buildProductSetInput(product, includeImages);
  if (existingId) input.id = existingId;

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

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }

  console.log(`\nCSV:      ${CSV_PATH}`);
  console.log(`Store:    ${STORE_DOMAIN}`);
  console.log(`Images:   ${SKIP_IMAGES ? 'skipped' : 'included'}`);
  console.log(`Dry run:  ${DRY_RUN}\n`);

  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  const products = groupByHandle(rows);
  console.log(`Products: ${products.length}\n`);

  if (DRY_RUN) {
    console.log('=== DRY RUN ===\n');
    for (const p of products.slice(0, 5)) {
      console.log(`  ${p.handle} — "${p.title}"`);
    }
    return;
  }

  let created = 0;
  let updated = 0;
  let published = 0;
  let errors = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const prefix = `[${String(i + 1).padStart(3)}/${products.length}]`;

    process.stdout.write(`${prefix} ${product.handle}... `);

    try {
      const existing = await getProductByHandle(product.handle);
      const existingId = existing?.id || undefined;

      const includeImages = !SKIP_IMAGES;
      let productId = await upsertProduct(product, includeImages, existingId);

      if (!productId && includeImages) {
        process.stdout.write('retry w/o images... ');
        productId = await upsertProduct(product, false, existingId);
      }

      if (productId) {
        const action = existingId ? 'UPDATED' : 'CREATED';

        // Publish to all sales channels
        try {
          await publishProduct(productId);
          process.stdout.write(`${action} + PUBLISHED`);
          published++;
        } catch (pubErr: any) {
          process.stdout.write(`${action} (publish failed: ${pubErr.message.slice(0, 50)})`);
        }

        console.log('');
        if (existingId) updated++;
        else created++;
      }

      await delay(500);
    } catch (err: any) {
      console.log(`ERROR: ${err.message.slice(0, 100)}`);
      errors++;
    }
  }

  console.log('\n══════════ SUMMARY ══════════');
  console.log(`Total:     ${products.length}`);
  console.log(`Created:   ${created}`);
  console.log(`Updated:   ${updated}`);
  console.log(`Published: ${published}`);
  console.log(`Errors:    ${errors}`);
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
