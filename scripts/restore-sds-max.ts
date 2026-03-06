#!/usr/bin/env npx tsx
/**
 * Script to restore original SDS-Max product titles.
 */

import * as fs from 'fs';
import * as path from 'path';

// Load env
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;

// Original titles before the bad update (from script output)
const ORIGINAL_TITLES = [
  'M12 FUEL™ Perfo-Burineur - 1.15 J',
  'M18 FUEL™ Perfo-Burineur ONE-KEY™ - 5 J',
  'M18 FUEL™ Perfo-Burineur - 2.5 J',
  'M18 FUEL™ Perfo-Burineur - 1.7 J',
  'M18 FUEL™ Perfo-Burineur - 2.3 J',
  'M18 FUEL™ Perfo-Burineur ONE-KEY™ - 4.9 J',
  'M18™ Perfo-Burineur - 2.3 J',
  'M18™ Perfo-Burineur - 2.6 J',
  'Perfo-Burineur - 3.8 J',
  'Perfo-Burineur - 4.1 J',
  'Perfo-Burineur - 3.6 J',
  'Perfo-Burineur - 3.4 J',
  'M18 FUEL™ Perfo-Burineur - 11 J',
  'Burineur - 3.6 J',
  'M18 FUEL™ Perfo-Burineur - 6.1 J',
  'Perfo-Burineur - 20 J',
  'Burineur - 11.9 J',
  'Perfo-Burineur - 11.9 J',
  'Burineur - 20 J',
  'Burineur K-HEX 10 kg - 20 J',
  'Perfo-Burineur - 8.5 J',
  'Burineur - 8.5 J',
  'Burineur - 26 J',
  'Perfo-Burineur - 4.1 J',
];

async function getAdminToken(): Promise<string> {
  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
      }),
    }
  );
  const data = await response.json();
  console.log('✓ Obtained Admin API access token');
  return data.access_token;
}

async function getSdsMaxProducts(token: string) {
  const query = `
    query {
      products(first: 250, query: "title:*Perfo-Burineur* OR title:*Burineur*") {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `;

  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query }),
    }
  );

  const data = await res.json();
  return data.data.products.edges.map((e: any) => e.node);
}

async function updateProductTitle(token: string, productId: string, newTitle: string): Promise<boolean> {
  const mutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id title }
        userErrors { field message }
      }
    }
  `;

  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input: { id: productId, title: newTitle } },
      }),
    }
  );

  const data = await res.json();
  if (data.data?.productUpdate?.userErrors?.length > 0) {
    console.error('  Errors:', data.data.productUpdate.userErrors);
    return false;
  }
  return true;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findOriginalTitle(currentTitle: string): string | null {
  // Current title format: "Base Name - 11 J - X kg"
  // Original title format: "Base Name - X.X J"

  // Extract base name from current title
  const baseName = currentTitle.split(' - ')[0].trim();

  // Find matching original title by base name
  for (const original of ORIGINAL_TITLES) {
    const originalBase = original.split(' - ')[0].trim();
    if (originalBase === baseName) {
      // Return the first match - this might need manual adjustment if there are duplicates
      return original;
    }
  }

  return null;
}

async function main() {
  console.log('Fetching current SDS-Max products from Shopify...\n');
  const token = await getAdminToken();
  const products = await getSdsMaxProducts(token);

  console.log(`Found ${products.length} products\n`);

  // Show current state
  console.log('Current products:');
  for (const p of products) {
    console.log(`  - ${p.title}`);
  }
  console.log('');

  // Find products that need restoring (have " kg" in title from bad update)
  const needsRestore = products.filter((p: any) =>
    p.title.includes(' kg') &&
    (p.title.includes('Perfo-Burineur') || p.title.includes('Burineur'))
  );

  console.log(`\n${needsRestore.length} products need restoring\n`);

  // We need to match by handle since base names may have duplicates
  // Let's show what we found and restore them

  let restored = 0;
  let errors = 0;
  const usedOriginals = new Set<string>();

  for (let i = 0; i < needsRestore.length; i++) {
    const product = needsRestore[i];
    const baseName = product.title.split(' - ')[0].trim();

    // Find an unused original with matching base name
    let originalTitle: string | null = null;
    for (const orig of ORIGINAL_TITLES) {
      if (!usedOriginals.has(orig) && orig.split(' - ')[0].trim() === baseName) {
        originalTitle = orig;
        usedOriginals.add(orig);
        break;
      }
    }

    if (!originalTitle) {
      console.log(`[${i + 1}/${needsRestore.length}] No original found for: ${product.title}`);
      errors++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${needsRestore.length}] ${product.title} → ${originalTitle}... `);

    try {
      const success = await updateProductTitle(token, product.id, originalTitle);
      if (success) {
        console.log('✓');
        restored++;
      } else {
        console.log('✗ ERROR');
        errors++;
      }
    } catch (error) {
      console.log(`✗ ERROR: ${error}`);
      errors++;
    }

    await delay(500);
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Restored: ${restored}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
