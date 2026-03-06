#!/usr/bin/env npx tsx
/**
 * Script to update product titles with power specs found in the database.
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

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

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
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  console.log('✓ Obtained Admin API access token');
  return data.access_token;
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
  const inputPath = '/Users/nathan/Downloads/products_with_specs.json';

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    console.error('Run find-missing-specs.ts first to generate this file.');
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  console.log(`Found ${products.length} products to update\n`);

  const token = await getAdminToken();

  let updated = 0;
  let errors = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const newTitle = `${product.title} - ${product.spec}`;

    process.stdout.write(`[${i + 1}/${products.length}] ${product.title}... `);

    try {
      const success = await updateProductTitle(token, product.id, newTitle);
      if (success) {
        console.log(`UPDATED → ${product.spec}`);
        updated++;
      } else {
        console.log('ERROR');
        errors++;
      }
    } catch (error) {
      console.log(`ERROR: ${error}`);
      errors++;
    }

    // Rate limiting
    await delay(500);
  }

  console.log('\n========== SUMMARY ==========');
  console.log(`Total products: ${products.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
