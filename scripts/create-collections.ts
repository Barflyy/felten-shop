// Script to create smart collections aligned with navigation.ts
// Run with: npx tsx scripts/create-collections.ts

import { readFileSync } from 'fs';

// ─── Load env ────────────────────────────────────────────────────────────────

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
const ADMIN_API_VERSION = '2025-01';

if (!STORE_DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing SHOPIFY env vars in .env.local');
  process.exit(1);
}

// ─── Admin API helpers ───────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const response = await fetch(
    `https://${STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token error: ${response.status} ${text}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getAdminAccessToken();
  const url = `https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Admin API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  }
  return json.data;
}

// ─── Mutation ────────────────────────────────────────────────────────────────

const COLLECTION_CREATE_MUTATION = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface CollectionDef {
  handle: string;
  title: string;
  descriptionHtml: string;
  rules: { column: string; relation: string; condition: string }[];
  disjunctive: boolean;
}

async function createSmartCollection(col: CollectionDef) {
  const data = await adminFetch<{
    collectionCreate: {
      collection: { id: string; title: string; handle: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(COLLECTION_CREATE_MUTATION, {
    input: {
      handle: col.handle,
      title: col.title,
      descriptionHtml: col.descriptionHtml,
      ruleSet: {
        appliedDisjunctively: col.disjunctive,
        rules: col.rules,
      },
    },
  });

  if (data.collectionCreate.userErrors.length > 0) {
    const msgs = data.collectionCreate.userErrors.map(e => e.message).join(', ');
    throw new Error(msgs);
  }

  return data.collectionCreate.collection!;
}

// ─── Collection definitions aligned with navigation.ts ───────────────────────

function typeRule(condition: string) {
  return { column: 'TYPE', relation: 'EQUALS', condition };
}

// Collections must match exactly the handles used in src/lib/navigation.ts
const COLLECTIONS: CollectionDef[] = [
  // ── Outils électroportatifs (parent) ──
  {
    handle: 'outils-electroportatifs',
    title: 'Outils électroportatifs',
    descriptionHtml: 'Tous les outils électroportatifs Milwaukee : perceuses, scies, meuleuses et plus.',
    rules: [
      typeRule('Perceuses & Visseuses'),
      typeRule('Perforateurs & Démolisseurs'),
      typeRule('Scies'),
      typeRule('Meuleuses'),
      typeRule('Cloueurs & Agrafeuses'),
      typeRule('Ponceuses & Polisseuses'),
      typeRule('Défonceuses & Multi-tool'),
      typeRule('Béton'),
      typeRule('Aspirateurs'),
    ],
    disjunctive: true,
  },
  // ── Sub-collections under Outils électroportatifs ──
  {
    handle: 'percage-et-burinage',
    title: 'Perçage et burinage',
    descriptionHtml: 'Perceuses-visseuses, perforateurs et démolisseurs Milwaukee M12, M18 et MX FUEL.',
    rules: [
      typeRule('Perceuses & Visseuses'),
      typeRule('Perforateurs & Démolisseurs'),
    ],
    disjunctive: true,
  },
  {
    handle: 'vissage',
    title: 'Vissage',
    descriptionHtml: 'Boulonneuses à chocs, clés dynamométriques et visseuses à chocs Milwaukee.',
    rules: [
      typeRule('Boulonneuses & Clés'),
      typeRule('Visseuses à chocs'),
    ],
    disjunctive: true,
  },
  {
    handle: 'meuleuses-et-polisseuses',
    title: 'Meuleuses et polisseuses',
    descriptionHtml: 'Meuleuses d\'angle et polisseuses Milwaukee. De 115 mm à 230 mm.',
    rules: [
      typeRule('Meuleuses'),
      typeRule('Ponceuses & Polisseuses'),
    ],
    disjunctive: true,
  },
  {
    handle: 'demolition',
    title: 'Démolition',
    descriptionHtml: 'Perforateurs SDS-Plus et SDS-Max. Démolisseurs et burineurs pour gros travaux.',
    rules: [
      typeRule('Perforateurs & Démolisseurs'),
    ],
    disjunctive: false,
  },
  {
    handle: 'beton',
    title: 'Béton',
    descriptionHtml: 'Outils pour travaux béton : carotteuses, vibrateurs, talocheuses et pilonneuses.',
    rules: [
      typeRule('Béton'),
    ],
    disjunctive: false,
  },
  {
    handle: 'sciage-et-decoupe',
    title: 'Sciage et découpe',
    descriptionHtml: 'Scies circulaires, sabres, sauteuses, à onglets, multi-outils et défonceuses.',
    rules: [
      typeRule('Scies'),
      typeRule('Défonceuses & Multi-tool'),
    ],
    disjunctive: true,
  },
  {
    handle: 'poncage',
    title: 'Ponçage',
    descriptionHtml: 'Ponceuses excentriques, orbitales et polisseuses Milwaukee.',
    rules: [
      typeRule('Ponceuses & Polisseuses'),
    ],
    disjunctive: false,
  },
  {
    handle: 'sertissage',
    title: 'Sertissage',
    descriptionHtml: 'Presses à sertir, coupe-câbles et outils pour plombiers et électriciens.',
    rules: [
      typeRule('Outillage de plomberie'),
      typeRule('Outillage électricien'),
    ],
    disjunctive: true,
  },
  {
    handle: 'radios-et-enceintes',
    title: 'Radios et enceintes',
    descriptionHtml: 'Radios et enceintes de chantier M12 et M18. Résistantes et puissantes.',
    rules: [
      typeRule('Radios & Enceintes'),
    ],
    disjunctive: false,
  },
  {
    handle: 'autres',
    title: 'Autres',
    descriptionHtml: 'Pistolets à calfeutrer, pompes de transfert et outils spécialisés Milwaukee.',
    rules: [
      typeRule('Outils spécialisés'),
    ],
    disjunctive: false,
  },
  // ── Batteries, chargeurs et générateurs ──
  {
    handle: 'batteries-chargeurs-et-generateurs',
    title: 'Batteries, chargeurs et générateurs',
    descriptionHtml: 'Batteries M12, M18 et MX FUEL. Chargeurs rapides, stations énergie et générateurs.',
    rules: [
      typeRule('Batteries & Chargeurs'),
      typeRule('Stations énergie'),
    ],
    disjunctive: true,
  },
  // ── Extérieurs et espaces verts ──
  {
    handle: 'exterieurs-et-espaces-verts',
    title: 'Extérieurs et espaces verts',
    descriptionHtml: 'Taille-haies, souffleurs, tronçonneuses et outils de jardin sans fil.',
    rules: [
      typeRule('Jardin & Extérieur'),
    ],
    disjunctive: false,
  },
  // ── Assainissement et nettoyage ──
  {
    handle: 'assainissement-et-nettoyage',
    title: 'Assainissement et nettoyage',
    descriptionHtml: 'Déboucheurs, furets et caméras de canalisations Milwaukee.',
    rules: [
      typeRule('Outillage de plomberie'),
    ],
    disjunctive: false,
  },
  // ── Éclairage ──
  {
    handle: 'eclairage',
    title: 'Éclairage',
    descriptionHtml: 'Projecteurs, lampes et éclairages de chantier Milwaukee. Sur batterie ou filaire.',
    rules: [
      typeRule('Éclairage'),
    ],
    disjunctive: false,
  },
  // ── Instruments de mesure ──
  {
    handle: 'instruments-de-mesure',
    title: 'Instruments de mesure',
    descriptionHtml: 'Lasermètres, détecteurs, caméras d\'inspection et niveaux laser.',
    rules: [
      typeRule('Mesure & Inspection'),
    ],
    disjunctive: false,
  },
  // ── Aspirateurs ──
  {
    handle: 'aspirateurs',
    title: 'Aspirateurs',
    descriptionHtml: 'Aspirateurs Milwaukee pour chantiers et ateliers. Classe L, M et H.',
    rules: [
      typeRule('Aspirateurs'),
    ],
    disjunctive: false,
  },
  // ── EPI ──
  {
    handle: 'equipements-de-protection-epi',
    title: 'Équipements de protection (EPI)',
    descriptionHtml: 'Équipements de protection individuelle : chaussures, casques, gants et lunettes.',
    rules: [
      typeRule('EPI & Vêtements'),
    ],
    disjunctive: false,
  },
  // ── Vêtements ──
  {
    handle: 'vetements-chauffants-et-de-travail',
    title: 'Vêtements chauffants et de travail',
    descriptionHtml: 'Vestes chauffantes M12, hoodies, vêtements de travail et accessoires.',
    rules: [
      typeRule('EPI & Vêtements'),
    ],
    disjunctive: false,
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Creating ${COLLECTIONS.length} collections on ${STORE_DOMAIN}...\n`);

  // Expected handles from navigation.ts for verification
  const expectedHandles = [
    'outils-electroportatifs',
    'percage-et-burinage', 'vissage', 'meuleuses-et-polisseuses', 'demolition',
    'beton', 'sciage-et-decoupe', 'poncage', 'sertissage', 'radios-et-enceintes', 'autres',
    'batteries-chargeurs-et-generateurs',
    'exterieurs-et-espaces-verts',
    'assainissement-et-nettoyage',
    'eclairage',
    'instruments-de-mesure',
    'aspirateurs',
    'equipements-de-protection-epi',
    'vetements-chauffants-et-de-travail',
  ];

  // Pre-flight check
  const definedHandles = COLLECTIONS.map(c => c.handle);
  const missing = expectedHandles.filter(h => !definedHandles.includes(h));
  if (missing.length > 0) {
    console.error('MISSING handles not defined:', missing);
    process.exit(1);
  }

  let success = 0;
  let errors = 0;
  const handleMismatches: string[] = [];

  for (const col of COLLECTIONS) {
    try {
      const result = await createSmartCollection(col);
      const match = result.handle === col.handle ? '✓' : '⚠️ MISMATCH';
      console.log(`${match}  "${result.title}" -> /collections/${result.handle}`);

      if (result.handle !== col.handle) {
        handleMismatches.push(`Expected "${col.handle}", got "${result.handle}"`);
      }

      success++;
    } catch (err) {
      console.error(`ERR "${col.title}": ${(err as Error).message}`);
      errors++;
    }
  }

  console.log(`\nDone: ${success} created, ${errors} errors.`);

  if (handleMismatches.length > 0) {
    console.log('\n⚠️ Handle mismatches (navigation links will be broken):');
    for (const m of handleMismatches) console.log(`  ${m}`);
  }

  if (errors > 0) process.exit(1);
}

main();
