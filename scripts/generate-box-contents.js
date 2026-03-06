const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Read the CSV file
const csvPath = '/Users/nathan/Downloads/Produits_updated.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV with proper handling of quoted multi-line fields
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  relax_quotes: true,
  relax_column_count: true,
});

console.log(`Parsed ${records.length} records from CSV`);

// Parse box content string into array of items
function parseBoxContent(boxContentStr) {
  if (!boxContentStr || boxContentStr.trim() === '') {
    return [];
  }

  const items = [];
  const lines = boxContentStr.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const parts = trimmedLine.split('|').map(p => p.trim());
    if (parts.length >= 2) {
      const qty = parseInt(parts[0], 10) || 1;
      const label = parts[1];
      const image = parts[2] || null;

      if (label) {
        // Convert .png to .webp as images are stored in webp format
        const imageFile = image ? image.replace(/\.png$/, '.webp') : null;
        items.push({
          qty,
          label,
          image: imageFile ? `/box-images/${imageFile}` : null
        });
      }
    }
  }

  return items;
}

// Main processing
const boxContentsMap = {};

let processedCount = 0;
let withBoxContent = 0;

for (const row of records) {
  const sku = row['Variant SKU'];
  const boxContent = row['Variant Metafield: custom.box_content'];

  if (sku) {
    processedCount++;
    const items = parseBoxContent(boxContent);

    if (items.length > 0) {
      boxContentsMap[sku] = items;
      withBoxContent++;
    }
  }
}

console.log(`Processed ${processedCount} variants`);
console.log(`Found ${withBoxContent} variants with box content`);

// Show a sample
const sampleSku = Object.keys(boxContentsMap)[0];
if (sampleSku) {
  console.log(`\nSample (SKU: ${sampleSku}):`);
  console.log(JSON.stringify(boxContentsMap[sampleSku], null, 2));
}

// Generate TypeScript file
const tsContent = `import { BoxContentItem } from './shopify/types';

// Auto-generated from Produits.csv
// Contains box contents data for ${withBoxContent} product variants

const boxContentsData: Record<string, BoxContentItem[]> = ${JSON.stringify(boxContentsMap, null, 2)};

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

// Write the TypeScript file
const outputPath = path.join(__dirname, '..', 'src', 'lib', 'box-contents.ts');
fs.writeFileSync(outputPath, tsContent);

console.log(`\nGenerated ${outputPath}`);
