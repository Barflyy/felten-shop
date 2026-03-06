#!/usr/bin/env npx tsx
/**
 * Script to update SDS-Max products with both J (Joules) and kg (weight) specs.
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

// SDS-Max product J -> kg mapping (weight varies by joules/class)
// Based on Milwaukee SDS-Max product specifications
const JOULES_TO_KG: Record<string, string> = {
  '1.15 J': '2.2 kg',
  '1.7 J': '3.2 kg',
  '2.3 J': '3.5 kg',
  '2.5 J': '3.8 kg',
  '2.6 J': '3.8 kg',
  '3.4 J': '4.2 kg',
  '3.6 J': '4.4 kg',
  '3.8 J': '4.5 kg',
  '4.1 J': '4.7 kg',
  '4.9 J': '5.3 kg',
  '5 J': '5.3 kg',
  '6.1 J': '6.2 kg',
  '8.5 J': '7.6 kg',
  '11 J': '9.5 kg',
  '11.9 J': '10 kg',
  '20 J': '10.9 kg',
  '26 J': '12.5 kg',
};

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
      products(first: 250, query: "title:*SDS-Max* OR title:*Perfo-Burineur* OR title:*Burineur*") {
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

async function main() {
  console.log('Fetching SDS-Max products from Shopify...\n');
  const token = await getAdminToken();
  const products = await getSdsMaxProducts(token);

  console.log(`Found ${products.length} SDS-Max products\n`);

  // Filter to only SDS-Max category products (not SDS-Plus)
  const sdsMaxProducts = products.filter((p: any) => {
    const title = p.title.toLowerCase();
    // Must be a perfo-burineur or burineur (SDS-Max category)
    return (title.includes('perfo-burineur') || title.includes('burineur')) &&
           !title.includes('sds-plus') &&
           !title.includes('sds plus');
  });

  console.log(`Filtered to ${sdsMaxProducts.length} SDS-Max perfo-burineurs/burineurs\n`);

  // Display current titles and let's prepare updates
  console.log('Current SDS-Max products:');
  for (const p of sdsMaxProducts) {
    console.log(`  - ${p.title}`);
  }
  console.log('');

  // Prepare updates with J and kg specs
  const updates: { id: string; currentTitle: string; newTitle: string }[] = [];

  for (const product of sdsMaxProducts) {
    const title = product.title;

    // Extract base name and J value from current title
    const parts = title.split(' - ');
    const baseName = parts[0].trim();

    // Extract existing J value
    let joules = '';
    for (const part of parts.slice(1)) {
      const jMatch = part.match(/(\d+(?:\.\d+)?\s*J)/);
      if (jMatch) {
        joules = jMatch[1].replace(/\s+/g, ' ').trim();
        break;
      }
    }

    if (!joules) {
      console.log(`  Skipping ${title} - no J value found`);
      continue;
    }

    // Look up kg based on J value
    const kg = JOULES_TO_KG[joules];
    if (!kg) {
      console.log(`  Warning: No kg mapping for ${joules} in "${title}"`);
      continue;
    }

    // Check if already has kg
    if (title.includes(' kg')) {
      console.log(`  Skipping ${title} - already has kg`);
      continue;
    }

    const newTitle = `${baseName} - ${joules} - ${kg}`;

    updates.push({ id: product.id, currentTitle: title, newTitle });
  }

  if (updates.length === 0) {
    console.log('No products need updating.\n');
    return;
  }

  console.log('\n=== PLANNED UPDATES ===\n');
  for (const u of updates) {
    console.log(`${u.currentTitle}`);
    console.log(`  → ${u.newTitle}\n`);
  }

  console.log(`\nUpdating ${updates.length} products...\n`);

  let updated = 0;
  let errors = 0;

  for (let i = 0; i < updates.length; i++) {
    const u = updates[i];
    process.stdout.write(`[${i + 1}/${updates.length}] Updating... `);

    try {
      const success = await updateProductTitle(token, u.id, u.newTitle);
      if (success) {
        console.log('✓ Updated');
        updated++;
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
  console.log(`Total products: ${updates.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
