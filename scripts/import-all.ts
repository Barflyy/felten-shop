#!/usr/bin/env npx tsx
/**
 * Import ALL products from categories/ CSVs and publish to sales channels.
 * Loops over every CSV sequentially, reusing the import-and-publish logic.
 *
 * Usage:
 *   npx tsx scripts/import-all.ts [--dry-run] [--skip-images]
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

const IMAGES_DIR = path.join(process.cwd(), 'images variantes');
const CATEGORIES_DIR = path.join(process.cwd(), 'categories');

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

// ─── Image Upload ───────────────────────────────────────────────────────────

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

// ─── Types & CSV Parsing ────────────────────────────────────────────────────

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

// ─── Product Creation ───────────────────────────────────────────────────────

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
    status: 'ACTIVE',
    productOptions: [{ name: product.optionName, values: optionValues.map(v => ({ name: v })) }],
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

  // Discover CSV files
  const csvFiles = fs.readdirSync(CATEGORIES_DIR)
    .filter(f => f.endsWith('.csv'))
    .sort();

  console.log(`\n══════════ IMPORT ALL PRODUCTS ══════════`);
  console.log(`Store:      ${STORE_DOMAIN}`);
  console.log(`CSV files:  ${csvFiles.length}`);
  console.log(`Images:     ${SKIP_IMAGES ? 'skipped' : 'included'}`);
  console.log(`Dry run:    ${DRY_RUN}\n`);

  // Pre-count totals
  let totalProducts = 0;
  const fileSummaries: { file: string; count: number }[] = [];
  for (const csvFile of csvFiles) {
    const csvContent = fs.readFileSync(path.join(CATEGORIES_DIR, csvFile), 'utf-8');
    const rows: CsvRow[] = parse(csvContent, {
      columns: true, skip_empty_lines: true, bom: true,
      relax_quotes: true, relax_column_count: true,
    });
    const products = groupByHandle(rows);
    totalProducts += products.length;
    fileSummaries.push({ file: csvFile, count: products.length });
  }

  console.log(`Total products across all files: ${totalProducts}\n`);
  for (const s of fileSummaries) {
    console.log(`  ${s.file}: ${s.count} products`);
  }
  console.log('');

  if (DRY_RUN) {
    console.log('=== DRY RUN — no products created ===');
    return;
  }

  // Warm up: get publications list once
  await getPublications();

  let globalCreated = 0;
  let globalPublished = 0;
  let globalErrors = 0;
  let globalIndex = 0;
  const errorDetails: { file: string; handle: string; error: string }[] = [];

  for (const csvFile of csvFiles) {
    console.log(`\n── ${csvFile} ──────────────────────────────────`);

    const csvContent = fs.readFileSync(path.join(CATEGORIES_DIR, csvFile), 'utf-8');
    const rows: CsvRow[] = parse(csvContent, {
      columns: true, skip_empty_lines: true, bom: true,
      relax_quotes: true, relax_column_count: true,
    });

    const products = groupByHandle(rows);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      globalIndex++;
      const prefix = `[${String(globalIndex).padStart(4)}/${totalProducts}]`;

      process.stdout.write(`${prefix} ${product.handle}... `);

      try {
        const includeImages = !SKIP_IMAGES;
        let productId = await upsertProduct(product, includeImages);

        if (!productId && includeImages) {
          process.stdout.write('retry w/o images... ');
          productId = await upsertProduct(product, false);
        }

        if (productId) {
          try {
            await publishProduct(productId);
            process.stdout.write('CREATED + PUBLISHED');
            globalPublished++;
          } catch (pubErr: any) {
            process.stdout.write(`CREATED (publish failed: ${pubErr.message.slice(0, 50)})`);
          }

          console.log('');
          globalCreated++;
        }

        await delay(500);
      } catch (err: any) {
        const msg = err.message.slice(0, 120);
        console.log(`ERROR: ${msg}`);
        globalErrors++;
        errorDetails.push({ file: csvFile, handle: product.handle, error: msg });
      }
    }
  }

  console.log('\n══════════════════ FINAL SUMMARY ══════════════════');
  console.log(`Total attempted: ${totalProducts}`);
  console.log(`Created:         ${globalCreated}`);
  console.log(`Published:       ${globalPublished}`);
  console.log(`Errors:          ${globalErrors}`);

  if (errorDetails.length > 0) {
    console.log('\n── Error Details ──');
    for (const e of errorDetails) {
      console.log(`  [${e.file}] ${e.handle}: ${e.error}`);
    }
  }
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
