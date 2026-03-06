#!/usr/bin/env npx tsx
/**
 * Script to update product titles in Shopify from a CSV file.
 * Updates existing products by their handle.
 */

import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local first
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
  console.log('✓ Loaded .env.local');
}

const SHOPIFY_ADMIN_API_VERSION = '2024-10';
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

console.log('Store domain:', SHOPIFY_STORE_DOMAIN);
console.log('Client ID:', SHOPIFY_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('Client Secret:', SHOPIFY_CLIENT_SECRET ? '✓ Set' : '✗ Missing');

// Cache for the access token
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`;
  console.log('Fetching token from:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SHOPIFY_CLIENT_ID!,
      client_secret: SHOPIFY_CLIENT_SECRET!,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to authenticate (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  console.log('✓ Obtained Admin API access token');
  return data.access_token;
}

async function adminApiRequest(query: string, variables: Record<string, unknown>) {
  const accessToken = await getAdminAccessToken();

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'Admin API error');
  }

  return data.data;
}

async function getProductByHandle(handle: string): Promise<{ id: string; title: string } | null> {
  const query = `
    query getProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
      }
    }
  `;

  const data = await adminApiRequest(query, { handle });
  return data?.productByHandle || null;
}

async function updateProductTitle(productId: string, newTitle: string): Promise<boolean> {
  const mutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminApiRequest(mutation, {
    input: {
      id: productId,
      title: newTitle,
    },
  });

  if (data?.productUpdate?.userErrors?.length > 0) {
    console.error('  User errors:', data.productUpdate.userErrors);
    return false;
  }

  return true;
}

// Rate limiting: Shopify allows ~2 requests/second for Admin API
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET || !SHOPIFY_STORE_DOMAIN) {
    console.error('Error: Missing Shopify credentials in .env.local');
    process.exit(1);
  }

  const csvPath = process.argv[2] || '/Users/nathan/Downloads/Shopify_Update_Titles_Only.csv';

  if (!fs.existsSync(csvPath)) {
    console.error(`Error: CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Reading CSV: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Found ${records.length} rows in CSV\n`);

  // Deduplicate by handle (keep first occurrence)
  const uniqueProducts = new Map<string, string>();
  for (const row of records) {
    const handle = row.Handle?.trim();
    const title = row.Title?.trim();
    if (handle && title && !uniqueProducts.has(handle)) {
      uniqueProducts.set(handle, title);
    }
  }

  console.log(`Unique products to update: ${uniqueProducts.size}\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;
  let errors = 0;
  let index = 0;

  for (const [handle, newTitle] of uniqueProducts) {
    index++;
    process.stdout.write(`[${index}/${uniqueProducts.size}] ${handle}... `);

    try {
      const product = await getProductByHandle(handle);

      if (!product) {
        console.log('NOT FOUND');
        notFound++;
        await delay(300);
        continue;
      }

      // Check if title needs updating
      if (product.title === newTitle) {
        console.log('SKIPPED (same title)');
        skipped++;
        await delay(300);
        continue;
      }

      const success = await updateProductTitle(product.id, newTitle);

      if (success) {
        console.log(`UPDATED: "${product.title}" → "${newTitle}"`);
        updated++;
      } else {
        console.log('ERROR');
        errors++;
      }

      // Rate limiting
      await delay(500);
    } catch (error) {
      console.log(`ERROR: ${error}`);
      errors++;
      await delay(1000);
    }
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Total unique products: ${uniqueProducts.size}`);
  console.log(`Updated:    ${updated}`);
  console.log(`Skipped:    ${skipped} (title already correct)`);
  console.log(`Not found:  ${notFound}`);
  console.log(`Errors:     ${errors}`);
}

main().catch(console.error);
