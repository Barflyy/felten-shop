#!/usr/bin/env npx tsx
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;

async function main() {
  // Get token
  const tokenRes = await fetch(
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
  const { access_token: token } = await tokenRes.json();

  // Find the product that still has wrong title
  const query = `
    query {
      products(first: 250, query: "title:*11 J - 6 kg*") {
        edges { node { id title } }
      }
    }
  `;

  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query }),
    }
  );

  const data = await res.json();
  const products = data.data.products.edges.map((e: any) => e.node);

  console.log('Products still with wrong title:');
  for (const p of products) {
    console.log(`  ${p.id}: ${p.title}`);
  }

  if (products.length === 0) {
    console.log('All products already fixed!');
    return;
  }

  // Fix the last one - it should be "Perfo-Burineur - 4.1 J"
  for (const product of products) {
    if (product.title === 'Perfo-Burineur - 11 J - 6 kg') {
      const mutation = `
        mutation productUpdate($input: ProductInput!) {
          productUpdate(input: $input) {
            product { id title }
            userErrors { field message }
          }
        }
      `;

      const updateRes = await fetch(
        `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
          body: JSON.stringify({
            query: mutation,
            variables: { input: { id: product.id, title: 'Perfo-Burineur - 4.1 J' } },
          }),
        }
      );

      const updateData = await updateRes.json();
      if (updateData.data?.productUpdate?.userErrors?.length > 0) {
        console.error('Error:', updateData.data.productUpdate.userErrors);
      } else {
        console.log(`✓ Fixed: ${product.title} → Perfo-Burineur - 4.1 J`);
      }
    }
  }
}

main().catch(console.error);
