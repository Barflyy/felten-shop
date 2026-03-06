import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf-8');
const env: Record<string, string> = {};
for (const line of envFile.split('\n')) {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
}

const DOMAIN = env['NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'];
const CLIENT_ID = env['SHOPIFY_CLIENT_ID'];
const CLIENT_SECRET = env['SHOPIFY_CLIENT_SECRET'];

async function main() {
  const tokenRes = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  const { access_token } = await tokenRes.json();

  const res = await fetch(`https://${DOMAIN}/admin/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': access_token },
    body: JSON.stringify({ query: `{
      collectionByHandle(handle: "batteries-chargeurs") {
        id title handle
        productsCount { count }
        ruleSet { appliedDisjunctively rules { column relation condition } }
        publications(first: 10) { edges { node { publication { name } } } }
      }
    }` }),
  });

  const data = await res.json();
  console.log(JSON.stringify(data.data, null, 2));
}

main().catch(console.error);
