#!/usr/bin/env npx tsx
/**
 * Upload & attach variant images to Shopify products.
 *
 * For each product in the CSV:
 *   1. Check if product already has images → skip if so
 *   2. For local filenames: stagedUpload + PUT → get resourceUrl
 *   3. Attach to product via productCreateMedia
 *   Full URLs are passed directly to productCreateMedia.
 *
 * Usage:
 *   npx tsx scripts/upload-variant-images.ts [csv-path] [--dry-run] [--force]
 *
 * Options:
 *   --dry-run   Show plan without executing
 *   --force     Re-attach images even if product already has some
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
const IMAGES_DIR = path.join(process.cwd(), 'images variantes');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const CSV_PATH = args.find(a => !a.startsWith('--')) ||
  '/Users/nathan/Downloads/Variantes-Variantes-final-v4.csv';

// ─── Token ──────────────────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
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
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function adminGql<T = any>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getToken();
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: any) => e.message).join('; '));
  return json.data;
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Queries & Mutations ────────────────────────────────────────────────────

const PRODUCT_BY_HANDLE = `
  query ($handle: String!) {
    productByHandle(handle: $handle) {
      id
      media(first: 1) { edges { node { id } } }
      variants(first: 100) {
        edges { node { id sku } }
      }
    }
  }
`;

const STAGED_UPLOADS_CREATE = `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }
`;

const PRODUCT_CREATE_MEDIA = `
  mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media { ... on MediaImage { id } }
      mediaUserErrors { code field message }
    }
  }
`;

// ─── Image Upload ───────────────────────────────────────────────────────────

function getMimeType(filename: string): string {
  if (filename.endsWith('.webp')) return 'image/webp';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/webp';
}

// Cache: filename → resourceUrl (to avoid re-uploading the same file for multiple products)
const uploadCache = new Map<string, string>();

async function stageAndUploadFile(filename: string): Promise<string | null> {
  // Check cache first
  if (uploadCache.has(filename)) return uploadCache.get(filename)!;

  const filePath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filePath)) return null;

  // 1. Create staged upload target
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

  // 2. PUT the file content
  const fileBuffer = fs.readFileSync(filePath);
  const uploadRes = await fetch(target.url, {
    method: 'PUT',
    headers: { 'Content-Type': getMimeType(filename) },
    body: fileBuffer,
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload PUT failed: HTTP ${uploadRes.status}`);
  }

  // Cache and return the resourceUrl
  uploadCache.set(filename, target.resourceUrl);
  return target.resourceUrl;
}

// ─── CSV Parsing ────────────────────────────────────────────────────────────

interface VariantImage {
  handle: string;
  sku: string;
  imageSrc: string;
}

interface ProductImages {
  handle: string;
  images: { sku: string; src: string }[];
}

function parseCSV(): ProductImages[] {
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  // Group by handle, collect unique images per product
  const byHandle = new Map<string, ProductImages>();

  for (const row of rows) {
    const handle = row.Handle?.trim();
    const sku = row['Variant SKU']?.trim();
    const src = row['Variant Image']?.trim();
    if (!handle || !sku || !src) continue;

    if (!byHandle.has(handle)) {
      byHandle.set(handle, { handle, images: [] });
    }

    // Avoid duplicate images within the same product
    const product = byHandle.get(handle)!;
    if (!product.images.some(img => img.src === src)) {
      product.images.push({ sku, src });
    }
  }

  return Array.from(byHandle.values());
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  if (!CLIENT_ID || !CLIENT_SECRET || !STORE_DOMAIN) {
    console.error('Missing Shopify credentials');
    process.exit(1);
  }

  console.log(`\nCSV:        ${CSV_PATH}`);
  console.log(`Images dir: ${IMAGES_DIR}`);
  console.log(`Force:      ${FORCE}`);
  console.log(`Dry run:    ${DRY_RUN}\n`);

  const products = parseCSV();
  const totalImages = products.reduce((s, p) => s + p.images.length, 0);
  console.log(`Products:        ${products.length}`);
  console.log(`Unique images:   ${totalImages}\n`);

  if (DRY_RUN) {
    for (const p of products.slice(0, 10)) {
      console.log(`  ${p.handle}: ${p.images.length} images`);
      for (const img of p.images) {
        const isLocal = !img.src.startsWith('http');
        const exists = isLocal ? fs.existsSync(path.join(IMAGES_DIR, img.src)) : true;
        console.log(`    ${exists ? '✓' : '✗'} ${img.src.slice(0, 60)} (${isLocal ? 'local' : 'URL'})`);
      }
    }
    console.log(`  ... (${products.length - 10} more)`);
    console.log('\nDry run complete.');
    return;
  }

  let attached = 0;
  let skipped = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const prefix = `[${String(i + 1).padStart(3)}/${products.length}]`;

    process.stdout.write(`${prefix} ${product.handle} (${product.images.length} img)... `);

    try {
      // Get product
      const data = await adminGql(PRODUCT_BY_HANDLE, { handle: product.handle });
      const shopifyProduct = data?.productByHandle;

      if (!shopifyProduct) {
        console.log('NOT FOUND');
        errors++;
        await delay(300);
        continue;
      }

      // Skip if product already has media (unless --force)
      const hasMedia = shopifyProduct.media.edges.length > 0;
      if (hasMedia && !FORCE) {
        console.log('SKIP (already has images)');
        skipped++;
        await delay(200);
        continue;
      }

      // Resolve all image URLs
      const mediaToAdd: { originalSource: string; alt: string; mediaContentType: string }[] = [];

      for (const img of product.images) {
        let url: string | null = null;

        if (img.src.startsWith('http')) {
          // Full URL — use directly
          url = img.src;
        } else {
          // Local file — stage upload
          try {
            url = await stageAndUploadFile(img.src);
          } catch (uploadErr: any) {
            // Skip this image but continue
          }
        }

        if (url) {
          mediaToAdd.push({
            originalSource: url,
            alt: img.sku,
            mediaContentType: 'IMAGE',
          });
        }
      }

      if (mediaToAdd.length === 0) {
        console.log('no images resolved');
        skipped++;
        await delay(300);
        continue;
      }

      // Attach media to product
      const mediaData = await adminGql(PRODUCT_CREATE_MEDIA, {
        productId: shopifyProduct.id,
        media: mediaToAdd,
      });

      if (mediaData?.productCreateMedia?.mediaUserErrors?.length > 0) {
        const errs = mediaData.productCreateMedia.mediaUserErrors;
        const realErrors = errs.filter((e: any) => e.code !== 'MEDIA_ALREADY_EXISTS');
        const alreadyCount = errs.length - realErrors.length;

        if (realErrors.length > 0) {
          console.log(`ERROR: ${realErrors[0].message}`);
          errors++;
          errorDetails.push(`${product.handle}: ${realErrors.map((e: any) => e.message).join('; ')}`);
        } else {
          console.log(`OK (${alreadyCount} already existed)`);
          attached++;
        }
      } else {
        console.log(`OK (${mediaToAdd.length} images)`);
        attached++;
      }

      await delay(500);
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.log(`ERROR: ${msg.slice(0, 120)}`);
      errors++;
      errorDetails.push(`${product.handle}: ${msg}`);
      await delay(1000);
    }
  }

  // ═══ Summary ═══
  console.log('\n══════════ SUMMARY ══════════');
  console.log(`Total products:    ${products.length}`);
  console.log(`Images attached:   ${attached}`);
  console.log(`Skipped:           ${skipped} (already had images)`);
  console.log(`Errors:            ${errors}`);
  console.log(`Upload cache hits: ${uploadCache.size} unique files staged`);

  if (errorDetails.length > 0) {
    console.log('\n── Errors ──');
    for (const e of errorDetails.slice(0, 20)) {
      console.log(`  • ${e.slice(0, 150)}`);
    }
    if (errorDetails.length > 20) console.log(`  ... and ${errorDetails.length - 20} more`);
  }
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
