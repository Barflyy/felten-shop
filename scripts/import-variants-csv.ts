#!/usr/bin/env npx tsx
/**
 * Import products + variants from CSV into Shopify via Admin API.
 * Uses the productSet mutation (new product model, API 2025-01+).
 *
 * Usage:
 *   npx tsx scripts/import-variants-csv.ts [csv-path] [--dry-run] [--active] [--skip-images]
 *
 * Options:
 *   --dry-run       Parse CSV and show what would be created, without calling Shopify
 *   --active        Create products as ACTIVE (default: DRAFT)
 *   --skip-images   Don't attach images to products (faster, avoids image URL errors)
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
const STATUS = args.includes('--active') ? 'ACTIVE' : 'DRAFT';
const SKIP_IMAGES = args.includes('--skip-images');
const CSV_PATH = args.find(a => !a.startsWith('--') && a.endsWith('.csv')) ||
  'Variantes-Variantes-final-v4.csv';

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

// ─── Image Upload Helpers ───────────────────────────────────────────────────

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

// ─── Types ──────────────────────────────────────────────────────────────────

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
  optionName: string;
  variants: VariantData[];
}

// ─── CSV Parsing ────────────────────────────────────────────────────────────

async function getImageUrl(src: string): Promise<string> {
  if (!src) return '';
  if (src.startsWith('http')) return src;

  // Try local upload first
  try {
    const resourceUrl = await stageAndUploadFile(src);
    if (resourceUrl) return resourceUrl;
  } catch (err) {
    console.error(`  ⚠️ Failed to upload ${src}:`, err instanceof Error ? err.message : err);
  }

  return CDN_BASE + src;
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
        vendor: row.Vendor?.trim() || '',
        type: row.Type?.trim() || '',
        tags: (row.Tags || '').split(',').map(t => t.trim()).filter(Boolean),
        optionName: row['Option1 Name']?.trim() || 'Modèle',
        variants: [],
      });
    }

    groups.get(handle)!.variants.push({
      optionValue: row['Option1 Value']?.trim() || '',
      sku: row['Variant SKU']?.trim() || '',
      price: row['Variant Price']?.trim() || '0.00',
      imageSrc: row['Variant Image']?.trim() || '',
      boxContent: (row['Variant Metafield: custom.box_content'] || '').trim(),
      cardMetric: (row['Variant Metafield: custom.card_metric'] || '').trim(),
      cardMetricLabel: (row['Variant Metafield: custom.card_metric_label'] || '').trim(),
      cardDescription: (row['Variant Metafield: custom.card_description'] || '').trim(),
    });
  }

  return Array.from(groups.values());
}

// ─── Queries & Mutations ────────────────────────────────────────────────────

const PRODUCT_BY_HANDLE = `
  query ($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      variants(first: 100) {
        edges { node { id sku } }
      }
    }
  }
`;

// productSet: new product model (2024-01+), handles create & update
const PRODUCT_SET = `
  mutation productSet($input: ProductSetInput!, $synchronous: Boolean!) {
    productSet(input: $input, synchronous: $synchronous) {
      product {
        id
        handle
        variants(first: 100) {
          edges { node { id sku } }
        }
      }
      userErrors { code field message }
    }
  }
`;

const METAFIELDS_SET = `
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id }
      userErrors { field message }
    }
  }
`;

// ─── API Helpers ────────────────────────────────────────────────────────────

async function getProductByHandle(handle: string) {
  const data = await adminGql(PRODUCT_BY_HANDLE, { handle });
  return data?.productByHandle || null;
}

function buildVariantMetafields(variant: VariantData): { namespace: string; key: string; value: string; type: string }[] {
  const mf: { namespace: string; key: string; value: string; type: string }[] = [];

  if (variant.boxContent) {
    mf.push({ namespace: 'custom', key: 'box_content', value: variant.boxContent, type: 'multi_line_text_field' });
  }
  if (variant.cardMetric) {
    mf.push({ namespace: 'custom', key: 'card_metric', value: variant.cardMetric, type: 'single_line_text_field' });
  }
  if (variant.cardMetricLabel) {
    mf.push({ namespace: 'custom', key: 'card_metric_label', value: variant.cardMetricLabel, type: 'single_line_text_field' });
  }
  if (variant.cardDescription) {
    mf.push({ namespace: 'custom', key: 'card_description', value: variant.cardDescription, type: 'single_line_text_field' });
  }

  return mf;
}

async function buildProductSetInput(product: ProductGroup, includeImages: boolean): Promise<Record<string, any>> {
  // Collect unique option values for productOptions
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
    if (mf.length > 0) {
      variantInput.metafields = mf;
    }

    // Attach image to variant if available
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
    status: STATUS,
    productOptions: [
      {
        name: product.optionName,
        values: optionValues.map(v => ({ name: v })),
      },
    ],
    variants,
  };

  // MUST include files at product level if used in variants
  if (imageUrls.size > 0) {
    input.files = Array.from(imageUrls).map(url => ({ originalSource: url }));
  }

  return input;
}

async function upsertProduct(product: ProductGroup, includeImages: boolean, existingId?: string): Promise<{ id: string; variantCount: number; wasUpdate: boolean } | null> {
  const input = await buildProductSetInput(product, includeImages);

  // If the product already exists, pass its ID so productSet updates instead of creating
  if (existingId) {
    input.id = existingId;
  }

  const data = await adminGql(PRODUCT_SET, { input, synchronous: true });

  if (data?.productSet?.userErrors?.length > 0) {
    const errs = data.productSet.userErrors;
    throw new Error(errs.map((e: any) => `[${e.code}] ${e.field}: ${e.message}`).join('; '));
  }

  const p = data?.productSet?.product;
  if (!p) return null;

  return {
    id: p.id,
    variantCount: p.variants.edges.length,
    wasUpdate: !!existingId,
  };
}

async function setVariantMetafields(variantGid: string, variant: VariantData) {
  const mf = buildVariantMetafields(variant);
  if (mf.length === 0) return;

  const metafields = mf.map(m => ({ ownerId: variantGid, ...m }));
  const data = await adminGql(METAFIELDS_SET, { metafields });

  if (data?.metafieldsSet?.userErrors?.length > 0) {
    throw new Error(data.metafieldsSet.userErrors.map((e: any) => e.message).join('; '));
  }
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
  console.log(`Status:   ${STATUS}`);
  console.log(`Images:   ${SKIP_IMAGES ? 'skipped' : 'included'}`);
  console.log(`Dry run:  ${DRY_RUN}\n`);

  // Parse CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  console.log(`CSV rows: ${rows.length}`);

  const products = groupByHandle(rows);
  console.log(`Products: ${products.length}`);
  console.log(`Variants: ${products.reduce((s, p) => s + p.variants.length, 0)}\n`);

  if (DRY_RUN) {
    console.log('=== DRY RUN — showing first 10 products ===\n');
    for (const p of products.slice(0, 10)) {
      console.log(`  ${p.handle} — "${p.title}" (${p.type})`);
      console.log(`    Tags: ${p.tags.join(', ')}`);
      for (const v of p.variants) {
        console.log(`    ├ ${v.optionValue}  SKU:${v.sku}  ${v.price}€  metric:${v.cardMetric}`);
      }
      console.log('');
    }
    console.log('Dry run complete. Remove --dry-run to execute.');
    return;
  }

  // ── Execute import ──

  let created = 0;
  let updated = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const prefix = `[${String(i + 1).padStart(3)}/${products.length}]`;

    process.stdout.write(`${prefix} ${product.handle} (${product.variants.length} var.)... `);

    try {
      // Check if product already exists to get its ID
      const existing = await getProductByHandle(product.handle);
      const existingId = existing?.id || undefined;

      const includeImages = !SKIP_IMAGES;
      let result = await upsertProduct(product, includeImages, existingId);

      // If failed with images, retry without
      if (!result && includeImages) {
        process.stdout.write('retrying without images... ');
        result = await upsertProduct(product, false, existingId);
      }

      if (result) {
        const action = result.wasUpdate ? 'UPDATED' : 'CREATED';
        console.log(`${action} (${result.variantCount} variants)`);
        if (result.wasUpdate) updated++;
        else created++;
      } else {
        console.log('OK (no data)');
        created++;
      }

      await delay(500); // rate limit
    } catch (err: any) {
      const msg = err?.message || String(err);

      console.log(`ERROR: ${msg.slice(0, 150)}`);
      errors++;
      errorDetails.push(`${product.handle}: ${msg}`);

      // Retry without images on image-related error
      if (!SKIP_IMAGES && (msg.includes('image') || msg.includes('file') || msg.includes('INVALID') || msg.includes('originalSource'))) {
        try {
          const existing = await getProductByHandle(product.handle);
          process.stdout.write('  retrying without images... ');
          const result = await upsertProduct(product, false, existing?.id);
          if (result) {
            const action = result.wasUpdate ? 'UPDATED' : 'CREATED';
            console.log(`${action} (no images, ${result.variantCount} var.)`);
            // We still counted it as an error/detail above, maybe adjust stats if you want
            await delay(500);
            continue;
          }
        } catch (retryErr: any) {
          console.log(`  RETRY ERROR: ${retryErr.message}`);
        }
      }

      await delay(1000);
    }
  }

  // ── Summary ──

  console.log('\n══════════ SUMMARY ══════════');
  console.log(`Total products:    ${products.length}`);
  console.log(`Created:           ${created}`);
  console.log(`Updated:           ${updated}`);
  console.log(`Errors:            ${errors}`);

  if (errorDetails.length > 0) {
    console.log('\n── Errors ──');
    for (const e of errorDetails) {
      console.log(`  • ${e}`);
    }
  }
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
