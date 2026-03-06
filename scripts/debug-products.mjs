import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const vars = {};
env.split('\n').forEach(l => { const [k,...v] = l.split('='); if(k && v.length) vars[k.trim()] = v.join('=').trim(); });
const domain = vars['NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'];
const token = vars['NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN'];

async function fetchColl(handle, first) {
  const query = `{ collection(handle: "${handle}") { products(first: ${first}) { edges { node { title productType tags } } } } }`;
  const res = await fetch(`https://${domain}/api/2025-10/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  return data.data.collection?.products.edges.map(e => e.node) || [];
}

const [percage, scies, meuleuses, batteries] = await Promise.all([
  fetchColl('percage-et-burinage', 12),
  fetchColl('sciage-et-decoupage', 12),
  fetchColl('meuleuses-et-polisseuses', 12),
  fetchColl('batteries-chargeurs-et-generateurs', 12),
]);

const seen = new Set();
const products = [];
for (const p of [...percage, ...scies, ...meuleuses, ...batteries]) {
  if (!seen.has(p.title)) { seen.add(p.title); products.push(p); }
}

const keywords = {
  perceuses: ['perceuse', 'visseuse', 'perforateur', 'carotteuse', 'fraiseuse', 'percage'],
  scies: ['scie', 'tronconneuse', 'decoupeuse', 'multi-tool', 'multitools', 'sciage'],
  meuleuses: ['meuleuse', 'polisseuse', 'ponceuse', 'meulage'],
  batteries: ['batterie', 'chargeur', 'pack nrg', 'm18b', 'm18hb', 'm12b', 'energie'],
};

console.log(`Total: ${products.length} produits\n`);
for (const [tab, terms] of Object.entries(keywords)) {
  const matches = products.filter(p => {
    const text = [p.title, p.productType, ...p.tags].join(' ').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return terms.some(t => text.includes(t.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
  });
  console.log(`${tab}: ${matches.length} matches`);
  matches.slice(0, 4).forEach(m => console.log(`  - ${m.title}`));
  if (matches.length > 4) console.log(`  ... +${matches.length - 4} autres`);
}
