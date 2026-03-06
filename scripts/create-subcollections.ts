// Script to create ~100 sub-collections via Shopify Admin API
// Run with: npx tsx scripts/create-subcollections.ts

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tagRule(condition: string) {
  return { column: 'TAG', relation: 'EQUALS', condition };
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Sub-collection definitions ──────────────────────────────────────────────

const SUB_COLLECTIONS: { title: string; tag: string; description: string }[] = [
  { title: 'Accessoires', tag: 'Accessoires', description: 'Accessoires Milwaukee pour outils électroportatifs.' },
  { title: 'Affleureuse', tag: 'Affleureuse', description: 'Affleureuses Milwaukee pour travaux de finition.' },
  { title: 'Aspirateurs Classe L', tag: 'Classe L', description: 'Aspirateurs Milwaukee de classe L pour poussières non dangereuses.' },
  { title: 'Aspirateurs Classe M', tag: 'Classe M', description: 'Aspirateurs Milwaukee de classe M pour poussières modérément dangereuses.' },
  { title: 'Batteries', tag: 'Batterie', description: 'Batteries Milwaukee M12, M18 et MX FUEL.' },
  { title: 'Batteries et chargeurs', tag: 'Batteries et chargeurs', description: 'Packs batteries et chargeurs Milwaukee.' },
  { title: "Caméras d'inspection", tag: "Caméra d'inspection", description: "Caméras d'inspection Milwaukee pour diagnostic et contrôle." },
  { title: 'Carottage', tag: 'Carottage', description: 'Carotteuses Milwaukee pour perçage de précision dans le béton.' },
  { title: 'Chargeurs', tag: 'Chargeur', description: 'Chargeurs rapides et séquentiels Milwaukee M12, M18 et MX FUEL.' },
  { title: 'Cisailles', tag: 'Cisaille', description: 'Cisailles Milwaukee pour découpe de tôle et métal.' },
  { title: 'Clés à cliquet', tag: 'Clé à cliquet', description: 'Clés à cliquet Milwaukee sans fil pour accès difficiles.' },
  { title: 'Cloueurs', tag: 'Cloueur', description: 'Cloueurs et agrafeuses Milwaukee sans fil.' },
  { title: 'Compactage', tag: 'Compactage', description: 'Outils de compactage Milwaukee pour travaux de terrassement.' },
  { title: 'Compresseur', tag: 'Compresseur', description: 'Compresseurs Milwaukee portables sans fil.' },
  { title: 'Connexion de câble', tag: 'Connexion de câble', description: 'Outils de connexion de câble Milwaukee.' },
  { title: 'Coupe bordures', tag: 'Coupe-bordure', description: 'Coupe-bordures Milwaukee sans fil pour entretien des espaces verts.' },
  { title: 'Coupe câbles', tag: 'Coupe-câble', description: 'Coupe-câbles Milwaukee pour électriciens.' },
  { title: 'Coupe rail de supportage', tag: 'Coupe rail de supportage', description: 'Outils de coupe rail de supportage Milwaukee.' },
  { title: 'Coupe tige filetée', tag: 'Coupe tige filetée', description: 'Coupe-tiges filetées Milwaukee sans fil.' },
  { title: 'Coupe tubes', tag: 'Coupe-tube', description: 'Coupe-tubes Milwaukee pour plombiers et chauffagistes.' },
  { title: 'Décapeur thermique', tag: 'Décapeur thermique', description: 'Décapeurs thermiques Milwaukee sans fil.' },
  { title: 'Déboucheur automatique haute vitesse', tag: 'Déboucheur automatique haute vitesse', description: 'Déboucheurs automatiques haute vitesse Milwaukee.' },
  { title: 'Déboucheur à sections', tag: 'Déboucheur à sections', description: 'Déboucheurs à sections Milwaukee pour canalisations.' },
  { title: 'Déboucheur à sections et à tambours', tag: 'Déboucheur à sections et à tambours', description: 'Déboucheurs combinés sections et tambours Milwaukee.' },
  { title: 'Déboucheurs à tambours', tag: 'Déboucheur à tambours', description: 'Déboucheurs à tambours Milwaukee pour canalisations.' },
  { title: 'Débroussailleuses', tag: 'Débroussailleuse', description: 'Débroussailleuses Milwaukee sans fil.' },
  { title: 'Détecteur', tag: 'Détecteur', description: 'Détecteurs Milwaukee pour repérage de métaux, câbles et tuyaux.' },
  { title: 'Démolisseurs', tag: 'Démolisseur', description: 'Démolisseurs et brise-béton Milwaukee SDS-Max et MX FUEL.' },
  { title: 'Éclairage de site', tag: 'Éclairage de site', description: 'Éclairages de site et projecteurs Milwaukee pour chantiers.' },
  { title: 'Éclairage portatif', tag: 'Éclairage portatif', description: 'Éclairages portatifs et lampes Milwaukee.' },
  { title: 'Élagueuses', tag: 'Élagueuse', description: 'Élagueuses Milwaukee sans fil.' },
  { title: 'Emporte-pièce', tag: 'Emporte-pièce', description: 'Emporte-pièces Milwaukee pour perçage de tôle.' },
  { title: 'Expandeurs', tag: 'Expandeur', description: 'Expandeurs Milwaukee pour tubes PER et multicouche.' },
  { title: 'Fer à souder', tag: 'Fer à souder', description: 'Fers à souder Milwaukee sans fil.' },
  { title: 'Filière', tag: 'Filière', description: 'Filières Milwaukee pour filetage de tubes.' },
  { title: 'Fraise à neige', tag: 'Fraise à neige', description: 'Fraises à neige Milwaukee sans fil.' },
  { title: 'Générateur', tag: 'Générateur', description: 'Générateurs et stations énergie Milwaukee MX FUEL.' },
  { title: 'Lampes frontales', tag: 'Lampe frontale', description: 'Lampes frontales Milwaukee pour travail mains libres.' },
  { title: 'Lasermètres', tag: 'Lasermètre', description: 'Lasermètres et télémètres laser Milwaukee.' },
  { title: 'Lasers lignes', tag: 'Laser ligne', description: 'Lasers lignes Milwaukee pour alignement et nivellement.' },
  { title: 'Lasers rotatifs', tag: 'Laser rotatif', description: 'Lasers rotatifs Milwaukee pour nivellement grande portée.' },
  { title: 'Malaxeur', tag: 'Malaxeur', description: 'Malaxeurs Milwaukee pour mélanges de mortier, colle et peinture.' },
  { title: 'Material Handling', tag: 'Material Handling', description: 'Outils de manutention Milwaukee.' },
  { title: 'Meuleuses 115 mm', tag: 'Meuleuse 115mm', description: 'Meuleuses Milwaukee 115 mm compactes.' },
  { title: 'Meuleuses 125 mm', tag: 'Meuleuse 125mm', description: 'Meuleuses Milwaukee 125 mm polyvalentes.' },
  { title: 'Meuleuses 150 mm', tag: 'Meuleuse 150mm', description: 'Meuleuses Milwaukee 150 mm.' },
  { title: 'Meuleuses 180 mm', tag: 'Meuleuse 180mm', description: 'Meuleuses Milwaukee 180 mm pour gros travaux.' },
  { title: 'Meuleuses 230 mm', tag: 'Meuleuse 230mm', description: 'Meuleuses Milwaukee 230 mm pour découpe et meulage intensif.' },
  { title: "Meuleuses d'angle", tag: "Meuleuse d'angle", description: "Meuleuses d'angle Milwaukee toutes tailles." },
  { title: 'Meuleuses droites', tag: 'Meuleuse droite', description: 'Meuleuses droites Milwaukee pour travaux de précision.' },
  { title: 'Multitools', tag: 'Multitool', description: 'Outils multifonctions oscillants Milwaukee.' },
  { title: 'Outils rotatifs', tag: 'Outil rotatif', description: 'Outils rotatifs Milwaukee pour gravure et ponçage de précision.' },
  { title: 'Perceuses magnétiques', tag: 'Perceuse magnétique', description: 'Perceuses magnétiques Milwaukee pour perçage sur métal.' },
  { title: 'Perceuses visseuses', tag: 'Perceuse-visseuse', description: 'Perceuses-visseuses Milwaukee M12 et M18.' },
  { title: 'Perceuses à percussion', tag: 'Perceuse à percussion', description: 'Perceuses à percussion Milwaukee pour maçonnerie et béton.' },
  { title: "Perche d'élagage", tag: "Perche d'élagage", description: "Perches d'élagage Milwaukee pour travail en hauteur." },
  { title: 'Pistolets à colle', tag: 'Pistolet à colle', description: 'Pistolets à colle et à mastic Milwaukee sans fil.' },
  { title: 'Pistolets à mesure thermique', tag: 'Pistolet thermique', description: 'Pistolets de mesure thermique Milwaukee.' },
  { title: 'Polisseuses', tag: 'Polisseuse', description: 'Polisseuses Milwaukee pour finition et lustrage.' },
  { title: 'Pompe de transfert', tag: 'Pompe de transfert', description: 'Pompes de transfert Milwaukee sans fil.' },
  { title: 'Pompe hydraulique', tag: 'Pompe hydraulique', description: 'Pompes hydrauliques Milwaukee.' },
  { title: 'Pompe à vide', tag: 'Pompe à vide', description: 'Pompes à vide Milwaukee pour CVC.' },
  { title: 'Pompes à graisse', tag: 'Pompe à graisse', description: 'Pompes à graisse Milwaukee sans fil.' },
  { title: 'Ponceuse', tag: 'Ponceuse', description: 'Ponceuses Milwaukee excentriques et orbitales.' },
  { title: 'Pulvérisateurs', tag: 'Pulvérisateur', description: 'Pulvérisateurs Milwaukee sans fil.' },
  { title: 'Rabots', tag: 'Rabot', description: 'Rabots Milwaukee sans fil.' },
  { title: 'Radios', tag: 'Radio', description: 'Radios et enceintes de chantier Milwaukee.' },
  { title: 'Rainureuses', tag: 'Rainureuse', description: 'Rainureuses Milwaukee pour saignées dans murs et sols.' },
  { title: 'Rectifieuse à pneumatiques', tag: 'Rectifieuse à pneumatiques', description: 'Rectifieuses à pneumatiques Milwaukee.' },
  { title: 'Riveteuse', tag: 'Riveteuse', description: 'Riveteuses Milwaukee sans fil.' },
  { title: 'Règles vibrantes', tag: 'Règle vibrante', description: 'Règles vibrantes Milwaukee pour lissage du béton.' },
  { title: 'SDS Max', tag: 'SDS-Max', description: 'Perforateurs et démolisseurs Milwaukee SDS-Max.' },
  { title: 'SDS Plus', tag: 'SDS-Plus', description: 'Perforateurs Milwaukee SDS-Plus.' },
  { title: 'Scies circulaires', tag: 'Scie circulaire', description: 'Scies circulaires Milwaukee pour bois, métal et matériaux.' },
  { title: 'Scies radiales et support', tag: 'Scie radiale', description: 'Scies radiales à onglets et supports Milwaukee.' },
  { title: 'Scies sabres', tag: 'Scie sabre', description: 'Scies sabres Milwaukee pour découpe polyvalente.' },
  { title: 'Scies sauteuses', tag: 'Scie sauteuse', description: 'Scies sauteuses Milwaukee pour découpe de précision.' },
  { title: 'Scies à ruban', tag: 'Scie à ruban', description: 'Scies à ruban Milwaukee portatives.' },
  { title: 'Sertisseuse plomberie', tag: 'Sertisseuse plomberie', description: 'Presses à sertir Milwaukee pour plomberie.' },
  { title: 'Sertisseuse électricité', tag: 'Sertisseuse électricité', description: 'Presses à sertir Milwaukee pour connectique électrique.' },
  { title: 'Souffleurs', tag: 'Souffleur', description: 'Souffleurs Milwaukee sans fil.' },
  { title: 'Souffleurs et ventilateurs', tag: 'Souffleur et ventilateur', description: 'Souffleurs et ventilateurs Milwaukee pour chantier.' },
  { title: 'Sécateurs', tag: 'Sécateur', description: 'Sécateurs Milwaukee sans fil.' },
  { title: 'Taille haies', tag: 'Taille-haie', description: 'Taille-haies Milwaukee sans fil.' },
  { title: 'Taille haies sur perche', tag: 'Taille-haie sur perche', description: 'Taille-haies sur perche Milwaukee pour travail en hauteur.' },
  { title: 'Testeurs électriques', tag: 'Testeur électrique', description: 'Testeurs et multimètres Milwaukee.' },
  { title: 'Tire fils', tag: 'Tire-fil', description: 'Tire-fils Milwaukee pour passage de câbles.' },
  { title: 'Tondeuse à gazon', tag: 'Tondeuse', description: 'Tondeuses à gazon Milwaukee sans fil.' },
  { title: 'Torches', tag: 'Torche', description: 'Lampes torches Milwaukee haute puissance.' },
  { title: "Tour d'éclairage", tag: "Tour d'éclairage", description: "Tours d'éclairage Milwaukee MX FUEL pour chantiers." },
  { title: 'Tronçonneuses', tag: 'Tronçonneuse', description: 'Tronçonneuses Milwaukee sans fil.' },
  { title: 'Tronçonneuses élagage', tag: 'Tronçonneuse élagage', description: "Tronçonneuses d'élagage Milwaukee compactes." },
  { title: 'Vibration béton', tag: 'Vibrateur béton', description: 'Vibrateurs béton Milwaukee sans fil.' },
  { title: 'Visseuses', tag: 'Visseuse', description: 'Visseuses Milwaukee pour assemblage rapide.' },
  { title: 'Visseuses à chocs', tag: 'Visseuse à chocs', description: 'Visseuses à chocs Milwaukee M12 et M18.' },
  { title: 'Boulonneuses à chocs', tag: 'Boulonneuse à chocs', description: 'Boulonneuses à chocs Milwaukee haute performance.' },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Build CollectionDef array
  const collections: CollectionDef[] = SUB_COLLECTIONS.map(sc => ({
    handle: slugify(sc.title),
    title: sc.title,
    descriptionHtml: sc.description,
    rules: [tagRule(sc.tag)],
    disjunctive: false,
  }));

  console.log(`Creating ${collections.length} sub-collections on ${STORE_DOMAIN}...\n`);

  let success = 0;
  let errors = 0;
  const results: { title: string; handle: string; status: string }[] = [];

  for (const col of collections) {
    try {
      const result = await createSmartCollection(col);
      const match = result.handle === col.handle ? '✓' : `⚠️ → ${result.handle}`;
      console.log(`${match}  "${result.title}"`);
      results.push({ title: result.title, handle: result.handle, status: 'ok' });
      success++;
    } catch (err) {
      const msg = (err as Error).message;
      console.error(`✗  "${col.title}": ${msg}`);
      results.push({ title: col.title, handle: col.handle, status: `error: ${msg}` });
      errors++;
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Done: ${success} created, ${errors} errors.`);

  if (errors > 0) {
    console.log('\nFailed collections:');
    results.filter(r => r.status !== 'ok').forEach(r => {
      console.log(`  - ${r.title}: ${r.status}`);
    });
  }
}

main();
