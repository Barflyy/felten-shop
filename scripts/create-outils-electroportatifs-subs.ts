// Create parent sub-collections + new items for "Outils électroportatifs"
// Run with: npx tsx scripts/create-outils-electroportatifs-subs.ts

import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
for (const line of envFile.split('\n')) {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
}

const STORE_DOMAIN = envVars['NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'];
const CLIENT_ID = envVars['SHOPIFY_CLIENT_ID'];
const CLIENT_SECRET = envVars['SHOPIFY_CLIENT_SECRET'];

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) return cachedToken.token;
  const response = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  const data = await response.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getAdminAccessToken();
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  return json.data;
}

const MUTATION = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id title handle }
      userErrors { field message }
    }
  }
`;

type Rule = { column: string; relation: string; condition: string };
function tag(condition: string): Rule {
  return { column: 'TAG', relation: 'EQUALS', condition };
}

interface ColDef {
  handle: string;
  title: string;
  desc: string;
  rules: Rule[];
  disjunctive: boolean;
}

const collections: ColDef[] = [
  // ── Parent sub-collections ──
  {
    handle: 'beton',
    title: 'Béton',
    desc: 'Outils pour travaux béton : compactage, règles vibrantes et vibration.',
    rules: [tag('Compactage'), tag('Règle vibrante'), tag('Vibrateur béton')],
    disjunctive: true,
  },
  {
    handle: 'meuleuses-et-polisseuses',
    title: 'Meuleuses et polisseuses',
    desc: "Meuleuses d'angle, meuleuses droites, polisseuses et outils rotatifs Milwaukee.",
    rules: [
      tag('Meuleuse 115mm'), tag('Meuleuse 125mm'), tag('Meuleuse 150mm'),
      tag('Meuleuse 180mm'), tag('Meuleuse 230mm'), tag("Meuleuse d'angle"),
      tag('Meuleuse droite'), tag('Outil rotatif'), tag('Polisseuse'),
    ],
    disjunctive: true,
  },
  {
    handle: 'percage-et-burinage',
    title: 'Perçage et burinage',
    desc: 'Perceuses-visseuses, perceuses à percussion, perforateurs SDS-Plus et SDS-Max, carotteuses Milwaukee.',
    rules: [
      tag('Carottage'), tag('Perceuse à percussion'), tag('Perceuse magnétique'),
      tag('Perceuse-visseuse'), tag('SDS-Max'), tag('SDS-Plus'),
    ],
    disjunctive: true,
  },
  {
    handle: 'poncage',
    title: 'Ponçage',
    desc: 'Ponceuses excentriques et orbitales Milwaukee.',
    rules: [tag('Ponceuse')],
    disjunctive: false,
  },
  {
    handle: 'sciage-et-decoupage',
    title: 'Sciage et découpage',
    desc: 'Scies, affleureuses, multitools, rainureuses, cisailles et rabots Milwaukee.',
    rules: [
      tag('Affleureuse'), tag('Coupe-tube'), tag('Meuleuse angulaire'),
      tag('Multitool'), tag('Rainureuse'), tag('Scie à ruban'),
      tag('Scie circulaire'), tag('Scie radiale'), tag('Scie sabre'),
      tag('Scie sauteuse'), tag('Tronçonneuse'), tag('Cisaille'), tag('Rabot'),
    ],
    disjunctive: true,
  },
  {
    handle: 'sertissage',
    title: 'Sertissage',
    desc: 'Presses à sertir, coupe-câbles, emporte-pièces et expandeurs Milwaukee.',
    rules: [
      tag('Coupe-câble'), tag('Coupe rail de supportage'), tag('Emporte-pièce'),
      tag('Expandeur'), tag('Pompe hydraulique'), tag('Sertisseuse électricité'),
      tag('Sertisseuse plomberie'),
    ],
    disjunctive: true,
  },
  {
    handle: 'vissage',
    title: 'Vissage',
    desc: 'Boulonneuses, visseuses à chocs, clés à cliquet, cloueurs et riveteuses Milwaukee.',
    rules: [
      tag('Boulonneuse à chocs'), tag('Clé à cliquet'), tag('Cloueur'),
      tag('Riveteuse'), tag('Visseuse'), tag('Visseuse à chocs'),
    ],
    disjunctive: true,
  },
  {
    handle: 'autres-outils',
    title: 'Autres',
    desc: 'Pistolets à colle, souffleurs, pompes, décapeurs et outils spécialisés Milwaukee.',
    rules: [
      tag('Pistolet à colle'), tag('Souffleur et ventilateur'), tag('Pompe de transfert'),
      tag('Rectifieuse à pneumatiques'), tag('Décapeur thermique'), tag('Pompe à graisse'),
      tag('Compresseur'), tag('Fer à souder'), tag('Material Handling'),
      tag('Malaxeur'), tag('Pompe à vide'),
    ],
    disjunctive: true,
  },
  // ── New standalone collections ──
  {
    handle: 'cable-stripping',
    title: 'Cable stripping',
    desc: 'Outils de dénudage de câbles Milwaukee.',
    rules: [tag('Cable stripping')],
    disjunctive: false,
  },
  {
    handle: 'meuleuses-angulaires',
    title: 'Meuleuses angulaires',
    desc: 'Meuleuses angulaires Milwaukee.',
    rules: [tag('Meuleuse angulaire')],
    disjunctive: false,
  },
];

async function main() {
  console.log(`Creating ${collections.length} collections for Outils électroportatifs...\n`);

  let success = 0;
  let errors = 0;

  for (const col of collections) {
    try {
      const data = await adminFetch<any>(MUTATION, {
        input: {
          handle: col.handle,
          title: col.title,
          descriptionHtml: col.desc,
          ruleSet: { appliedDisjunctively: col.disjunctive, rules: col.rules },
        },
      });
      if (data.collectionCreate.userErrors.length > 0) {
        throw new Error(data.collectionCreate.userErrors.map((e: any) => e.message).join(', '));
      }
      const r = data.collectionCreate.collection;
      const match = r.handle === col.handle ? '✓' : `⚠️ → ${r.handle}`;
      console.log(`${match}  "${r.title}" -> /collections/${r.handle}`);
      success++;
    } catch (err) {
      console.error(`✗  "${col.title}": ${(err as Error).message}`);
      errors++;
    }
    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\nDone: ${success} created, ${errors} errors.`);
}

main();
