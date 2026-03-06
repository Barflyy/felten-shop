import { readFileSync } from 'fs';

const env: Record<string, string> = {};
for (const line of readFileSync('.env.local', 'utf-8').split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
}

async function main() {
  const tokenRes = await fetch(`https://${env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: env.SHOPIFY_CLIENT_ID, client_secret: env.SHOPIFY_CLIENT_SECRET }),
  });
  const { access_token } = await tokenRes.json();

  const res = await fetch(`https://${env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': access_token },
    body: JSON.stringify({ query: `{
      products(first: 50, query: "product_type:'Batteries & Chargeurs'") {
        edges { node { title handle } }
      }
    }` }),
  });

  const { data } = await res.json();
  for (const { node } of data.products.edges) {
    console.log(`"${node.title}"  →  handle: ${node.handle}`);
  }
}

main().catch(console.error);
