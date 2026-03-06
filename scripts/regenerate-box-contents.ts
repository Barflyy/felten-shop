/**
 * Regenerate src/lib/box-contents.ts from the CSV source of truth.
 *
 * Usage: npx tsx scripts/regenerate-box-contents.ts
 *
 * Reads: Imported table 8-Grid view.csv
 * Writes: src/lib/box-contents.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const ROOT = path.resolve(__dirname, '..');
const CSV_PATH = path.join(ROOT, 'Imported table 8-Grid view.csv');
const IMAGES_DIR = path.join(ROOT, 'images');
const OUTPUT_PATH = path.join(ROOT, 'src', 'lib', 'box-contents.ts');

// ── 1. Load available images ──────────────────────────────────────────
const imageFiles = new Set(fs.readdirSync(IMAGES_DIR));

// Build a lookup map: slug-without-extension -> filename.webp
const imageBySlug = new Map<string, string>();
for (const f of imageFiles) {
  if (f.endsWith('.webp')) {
    const slug = f.replace(/\.webp$/, '');
    imageBySlug.set(slug, f);
  }
}

// ── 2. Image resolution ──────────────────────────────────────────────
function resolveImage(rawFilename: string): string | null {
  const trimmed = rawFilename.trim();
  if (!trimmed) return null;

  // Hero images (Shopify product images) → null
  if (/--[Hh]ero/.test(trimmed)) return null;

  // Full URLs are not local box images → null
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return null;

  // Direct match (already a .webp in images/)
  if (imageFiles.has(trimmed)) {
    return `/box-images/${trimmed}`;
  }

  // .png → .webp replacement
  if (trimmed.endsWith('.png')) {
    const webpName = trimmed.replace(/\.png$/, '.webp');
    if (imageFiles.has(webpName)) {
      return `/box-images/${webpName}`;
    }
    // Try matching by slug prefix (without hash and extension)
    const slug = trimmed.replace(/\.png$/, '');
    for (const [s, f] of imageBySlug) {
      if (s.startsWith(slug)) {
        return `/box-images/${f}`;
      }
    }
  }

  // Try slug-based prefix match for .webp files that don't exist directly
  if (trimmed.endsWith('.webp')) {
    const slug = trimmed.replace(/\.webp$/, '');
    for (const [s, f] of imageBySlug) {
      if (s.startsWith(slug)) {
        return `/box-images/${f}`;
      }
    }
  }

  return null;
}

// ── 3. Parse CSV ─────────────────────────────────────────────────────
const csvRaw = fs.readFileSync(CSV_PATH, 'utf-8');
const records: string[][] = parse(csvRaw, {
  columns: false,
  skip_empty_lines: false,
  relax_column_count: true,
});

// Column indices (0-based)
const COL_SKU = 9;           // Variant SKU
const COL_BOX_CONTENT = 12;  // Variant Metafield: custom.box_content

// Skip header row
const header = records[0];
console.log(`CSV columns: ${header.length}`);
console.log(`Column ${COL_SKU}: "${header[COL_SKU]}"`);
console.log(`Column ${COL_BOX_CONTENT}: "${header[COL_BOX_CONTENT]}"`);

interface BoxItem {
  qty: number;
  label: string;
  image: string | null;
}

const boxContents: Record<string, BoxItem[]> = {};

let totalItems = 0;
let itemsWithImage = 0;
let itemsWithoutImage = 0;
let skippedRows = 0;
let heroImageCount = 0;
const unresolvedImages = new Map<string, number>();

for (let i = 1; i < records.length; i++) {
  const row = records[i];
  const sku = (row[COL_SKU] || '').trim();
  const boxContent = (row[COL_BOX_CONTENT] || '').trim();

  if (!sku) {
    skippedRows++;
    continue;
  }
  if (!boxContent) {
    skippedRows++;
    continue;
  }

  const items: BoxItem[] = [];
  const lines = boxContent.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const parts = trimmedLine.split('|').map(p => p.trim());

    if (parts.length < 2) {
      console.warn(`  [WARN] Row ${i + 1}, SKU ${sku}: malformed line "${trimmedLine}"`);
      continue;
    }

    const qty = parseInt(parts[0], 10) || 1;
    const label = parts[1];
    // If only 2 parts (qty | label), image is null
    const rawImage = parts.length >= 3 ? parts[2] : '';

    const image = resolveImage(rawImage);

    if (/--[Hh]ero/.test(rawImage)) {
      heroImageCount++;
    }

    if (image !== null) {
      itemsWithImage++;
    } else {
      itemsWithoutImage++;
      // Track unresolved (non-hero) images that had a filename specified
      if (rawImage && !/--[Hh]ero/.test(rawImage) && !rawImage.startsWith('http')) {
        const count = unresolvedImages.get(rawImage) || 0;
        unresolvedImages.set(rawImage, count + 1);
      }
    }

    items.push({ qty, label, image });
    totalItems++;
  }

  if (items.length > 0) {
    boxContents[sku] = items;
  }
}

// ── 4. Generate TypeScript output ────────────────────────────────────
const skuCount = Object.keys(boxContents).length;

let output = `import { BoxContentItem } from './shopify/types';

// Auto-generated from Imported table 8-Grid view.csv
// Generated on ${new Date().toISOString().split('T')[0]}
// Contains box contents data for ${skuCount} product variants

const boxContentsData: Record<string, BoxContentItem[]> = {\n`;

const sortedSkus = Object.keys(boxContents).sort();

for (const sku of sortedSkus) {
  const items = boxContents[sku];
  output += `  ${JSON.stringify(sku)}: [\n`;
  for (const item of items) {
    output += `    {\n`;
    output += `      "qty": ${item.qty},\n`;
    output += `      "label": ${JSON.stringify(item.label)},\n`;
    output += `      "image": ${item.image === null ? 'null' : JSON.stringify(item.image)}\n`;
    output += `    },\n`;
  }
  output += `  ],\n`;
}

output += `};

/**
 * Get box contents for a specific SKU
 * Handles SKU variations (removes .0 suffix from Shopify numeric SKUs)
 */
export function getBoxContents(sku: string | undefined): BoxContentItem[] {
  if (!sku) return [];

  // Clean SKU: remove .0 suffix if present (Shopify treats numeric SKUs as floats)
  const cleanSku = sku.replace(/\\.0$/, '');

  return boxContentsData[cleanSku] || [];
}

/**
 * Check if a SKU has box content data available
 */
export function hasBoxContents(sku: string | undefined): boolean {
  return getBoxContents(sku).length > 0;
}

export { boxContentsData };
`;

// ── 5. Write output ──────────────────────────────────────────────────
fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');

// ── 6. Report ────────────────────────────────────────────────────────
console.log('\n=== Regeneration Complete ===');
console.log(`Total SKUs processed: ${skuCount}`);
console.log(`Total items: ${totalItems}`);
console.log(`Items with images: ${itemsWithImage}`);
console.log(`Items without images: ${itemsWithoutImage}`);
console.log(`  - Hero images (null by design): ${heroImageCount}`);
console.log(`  - 2-part entries with no image field: ${totalItems - heroImageCount - itemsWithImage - unresolvedImages.size}`);
console.log(`  - Unresolved non-hero images: ${unresolvedImages.size} unique`);
console.log(`Skipped rows (no SKU or no content): ${skippedRows}`);
console.log(`Output written to: ${OUTPUT_PATH}`);
console.log(`Output size: ${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1)} KB`);

if (unresolvedImages.size > 0) {
  console.log('\nUnresolved non-hero images (set to null):');
  for (const [img, count] of [...unresolvedImages.entries()].sort()) {
    console.log(`  ${img} (${count}x)`);
  }
}
