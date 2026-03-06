import https from 'https';
import fs from 'fs';

let env = '';
try {
  env = fs.readFileSync('/Users/nathan/florian-mw-app/.env.local', 'utf8');
} catch(e) {}

const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
};

// Check if valid URL
const domain = getEnv('SHOPIFY_STORE_DOMAIN') || 'felten-shop.myshopify.com';
const token = getEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN');

const options = {
  hostname: domain.replace('https://', ''),
  path: '/api/2024-01/graphql.json',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': token,
  }
};

const query = `
{
  products(first: 60) {
    edges {
      node {
        title
        productType
        tags
      }
    }
  }
}
`;

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.data && parsed.data.products) {
        const prods = parsed.data.products.edges.map(e => e.node);
        console.log("Total fetch:", prods.length);
        console.log("Titles:", [...new Set(prods.map(p => p.title))]);
      } else {
        console.log("Error:", parsed);
      }
    } catch(e) {
      console.log("Parse err:", e);
    }
  });
});

req.write(JSON.stringify({ query }));
req.end();
