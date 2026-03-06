#!/usr/bin/env npx tsx
/**
 * Fix all collection rules to match the XLSX product data.
 * - Updates existing smart collections with correct TYPE/TAG rules
 * - Creates missing collections (EPI subcategories, etc.)
 *
 * Usage: npx tsx scripts/fix-collection-rules.ts [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Load .env.local ────────────────────────────────────────────────────────

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

const API_VERSION = '2025-01';
const STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET!;
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Auth ───────────────────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60_000) return cachedToken.token;
  const res = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function gql<T = any>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getToken();
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 429) {
    const wait = parseFloat(res.headers.get('Retry-After') || '4');
    await delay(wait * 1000);
    return gql(query, variables);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: any) => e.message).join('; '));
  return json.data;
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Collection rule definitions ────────────────────────────────────────────
// Maps collection handle → rules (based on XLSX product types & tags)

interface CollectionDef {
  handle: string;
  title: string;
  rules: { column: 'TYPE' | 'TAG'; relation: 'EQUALS'; condition: string }[];
  disjunctive: boolean; // true = OR, false = AND
}

const COLLECTIONS: CollectionDef[] = [
  // ═══ PARENT CATEGORIES (by TYPE) ═══
  {
    handle: 'outils-electroportatifs',
    title: 'Outils électroportatifs',
    rules: [{ column: 'TYPE', relation: 'EQUALS', condition: 'Outils électroportatifs' }],
    disjunctive: false,
  },
  {
    handle: 'batteries-chargeurs-et-generateurs',
    title: 'Batteries, chargeurs et générateurs',
    rules: [{ column: 'TYPE', relation: 'EQUALS', condition: 'Batteries, chargeurs et générateur' }],
    disjunctive: false,
  },
  {
    handle: 'aspirateurs',
    title: 'Aspirateurs',
    rules: [{ column: 'TYPE', relation: 'EQUALS', condition: 'Aspirateurs' }],
    disjunctive: false,
  },
  {
    handle: 'eclairage',
    title: 'Éclairage',
    rules: [{ column: 'TYPE', relation: 'EQUALS', condition: 'Éclairage' }],
    disjunctive: false,
  },
  {
    handle: 'instruments-de-mesure',
    title: 'Instruments de mesure',
    rules: [{ column: 'TYPE', relation: 'EQUALS', condition: 'Instruments de mesure' }],
    disjunctive: false,
  },
  {
    handle: 'epi-vetements',
    title: 'EPI & Vêtements',
    rules: [{ column: 'TYPE', relation: 'EQUALS', condition: 'Équipement de protection individuelle' }],
    disjunctive: false,
  },
  {
    handle: 'exterieurs-et-espaces-verts',
    title: 'Équipement pour extérieurs et espaces verts',
    rules: [{ column: 'TYPE', relation: 'EQUALS', condition: 'Équipement pour extérieurs et espaces verts' }],
    disjunctive: false,
  },
  {
    handle: 'assainissement-et-nettoyage',
    title: 'Assainissement et nettoyage des canalisations',
    rules: [{ column: 'TYPE', relation: 'EQUALS', condition: 'Assainissement et nettoyage des canalisations' }],
    disjunctive: false,
  },

  // ═══ OUTILS ÉLECTROPORTATIFS — Sub-groups (by TAG) ═══

  // Perçage et burinage
  { handle: 'percage-et-burinage', title: 'Perçage et burinage', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Perçage et burinage' }], disjunctive: false },
  { handle: 'carottage', title: 'Carottage', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Carottage' }], disjunctive: false },
  { handle: 'demolisseurs', title: 'Démolisseurs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Démolisseurs' }], disjunctive: false },
  { handle: 'perceuses-a-percussion', title: 'Perceuses à percussion', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Perceuses à percussion' }], disjunctive: false },
  { handle: 'perceuses-magnetiques', title: 'Perceuses magnétiques', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Perceuses magnétiques' }], disjunctive: false },
  { handle: 'perceuses-visseuses', title: 'Perceuses visseuses', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Perceuses visseuses' }], disjunctive: false },
  { handle: 'sds-max', title: 'SDS Max', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'SDS Max' }], disjunctive: false },
  { handle: 'sds-plus', title: 'SDS Plus', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'SDS Plus' }], disjunctive: false },

  // Vissage
  { handle: 'vissage', title: 'Vissage', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Vissage' }], disjunctive: false },
  { handle: 'boulonneuses-a-chocs', title: 'Boulonneuses à chocs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Boulonneuses à chocs' }], disjunctive: false },
  { handle: 'cles-a-cliquet', title: 'Clés à cliquet', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Clés à cliquet' }], disjunctive: false },
  { handle: 'cloueurs', title: 'Cloueurs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Cloueurs' }], disjunctive: false },
  { handle: 'riveteuse', title: 'Riveteuse', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Riveteuse' }], disjunctive: false },
  { handle: 'visseuses', title: 'Visseuses', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Visseuses' }], disjunctive: false },
  { handle: 'visseuses-a-chocs', title: 'Visseuses à chocs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Visseuses à chocs' }], disjunctive: false },

  // Meuleuses et polisseuses
  { handle: 'meuleuses-et-polisseuses', title: 'Meuleuses et polisseuses', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Meuleuses et polisseuses' }], disjunctive: false },
  { handle: 'meuleuses-115-mm', title: 'Meuleuses 115 mm', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Meuleuses 115 mm' }], disjunctive: false },
  { handle: 'meuleuses-125-mm', title: 'Meuleuses 125 mm', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Meuleuses 125 mm' }], disjunctive: false },
  { handle: 'meuleuses-150-mm', title: 'Meuleuses 150 mm', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Meuleuses 150 mm' }], disjunctive: false },
  { handle: 'meuleuses-180-mm', title: 'Meuleuses 180 mm', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Meuleuses 180 mm' }], disjunctive: false },
  { handle: 'meuleuses-230-mm', title: 'Meuleuses 230 mm', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Meuleuses 230 mm' }], disjunctive: false },
  { handle: 'meuleuses-d-angle', title: "Meuleuses d'angle", rules: [{ column: 'TAG', relation: 'EQUALS', condition: "Meuleuses d'angle" }], disjunctive: false },
  { handle: 'meuleuses-angulaires', title: 'Meuleuses angulaires', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Meuleuses angulaires' }], disjunctive: false },
  { handle: 'meuleuses-droites', title: 'Meuleuses droites', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Meuleuses droites' }], disjunctive: false },
  { handle: 'outils-rotatifs', title: 'Outils rotatifs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Outils rotatifs' }], disjunctive: false },
  { handle: 'polisseuses', title: 'Polisseuses', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Polisseuses' }], disjunctive: false },

  // Sciage et découpage
  { handle: 'sciage-et-decoupage', title: 'Sciage et découpage', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Sciage et découpage' }], disjunctive: false },
  { handle: 'affleureuse', title: 'Affleureuse', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Affleureuse' }], disjunctive: false },
  { handle: 'cisailles', title: 'Cisailles', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Cisailles' }], disjunctive: false },
  { handle: 'coupe-tubes', title: 'Coupe tubes', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Coupe tubes' }], disjunctive: false },
  { handle: 'multitools', title: 'Multitools', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Multitools' }], disjunctive: false },
  { handle: 'rabots', title: 'Rabots', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Rabots' }], disjunctive: false },
  { handle: 'rainureuses', title: 'Rainureuses', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Rainureuses' }], disjunctive: false },
  { handle: 'scies-a-ruban', title: 'Scies à ruban', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Scies à ruban' }], disjunctive: false },
  { handle: 'scies-circulaires', title: 'Scies circulaires', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Scies circulaires' }], disjunctive: false },
  { handle: 'scies-radiales-et-support', title: 'Scies radiales et support', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Scies radiales et support' }], disjunctive: false },
  { handle: 'scies-sabres', title: 'Scies sabres', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Scies sabres' }], disjunctive: false },
  { handle: 'scies-sauteuses', title: 'Scies sauteuses', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Scies sauteuses' }], disjunctive: false },

  // Sertissage
  { handle: 'sertissage', title: 'Sertissage', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Sertissage' }], disjunctive: false },
  { handle: 'cable-stripping', title: 'Cable stripping', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Cable stripping' }], disjunctive: false },
  { handle: 'connexion-de-cable', title: 'Connexion de câble', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Connexion de câbles' }], disjunctive: false },
  { handle: 'coupe-cables', title: 'Coupe câbles', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Coupe câbles' }], disjunctive: false },
  { handle: 'coupe-rail-de-supportage', title: 'Coupe rail de supportage', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Coupe rail de supportage' }], disjunctive: false },
  { handle: 'coupe-tige-filetee', title: 'Coupe tige filetée', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Coupe tige filetée' }], disjunctive: false },
  { handle: 'emporte-piece', title: 'Emporte-pièce', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Emporte-pièce' }], disjunctive: false },
  { handle: 'expandeurs', title: 'Expandeurs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Expandeurs' }], disjunctive: false },
  { handle: 'filiere', title: 'Filière', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Filière' }], disjunctive: false },
  { handle: 'sertisseuse-electricite', title: 'Sertisseuse électricité', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Sertisseuse électricité' }], disjunctive: false },
  { handle: 'sertisseuse-plomberie', title: 'Sertisseuse plomberie', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Sertisseuse plomberie' }], disjunctive: false },
  { handle: 'tire-fils', title: 'Tire fils', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Tire-fils' }], disjunctive: false },

  // Béton
  { handle: 'beton', title: 'Béton', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Béton' }], disjunctive: false },
  { handle: 'compactage', title: 'Compactage', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Compactage' }], disjunctive: false },
  { handle: 'regles-vibrantes', title: 'Règles vibrantes', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Règles vibrantes' }], disjunctive: false },
  { handle: 'vibration-beton', title: 'Vibration béton', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Vibration béton' }], disjunctive: false },

  // Ponçage
  { handle: 'poncage', title: 'Ponçage', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Ponçage' }], disjunctive: false },
  { handle: 'ponceuse', title: 'Ponceuse', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Ponceuse' }], disjunctive: false },

  // Autres outils
  { handle: 'autres-outils', title: 'Autres', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Autres' }], disjunctive: false },
  { handle: 'compresseur', title: 'Compresseur', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Compresseur' }], disjunctive: false },
  { handle: 'decapeur-thermique', title: 'Décapeur thermique', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Décapeur thermique' }], disjunctive: false },
  { handle: 'fer-a-souder', title: 'Fer à souder', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Fer à souder' }], disjunctive: false },
  { handle: 'malaxeur', title: 'Malaxeur', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Malaxeur' }], disjunctive: false },
  { handle: 'material-handling', title: 'Material Handling', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Material Handling' }], disjunctive: false },
  { handle: 'pistolets-a-colle', title: 'Pistolets à colle', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Pistolets à colle' }], disjunctive: false },
  { handle: 'pompe-a-vide', title: 'Pompe à vide', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Pompe à vide' }], disjunctive: false },
  { handle: 'pompe-de-transfert', title: 'Pompe de transfert', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Pompe de transfert' }], disjunctive: false },
  { handle: 'pompe-hydraulique', title: 'Pompe hydraulique', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Pompe hydraulique' }], disjunctive: false },
  { handle: 'pompes-a-graisse', title: 'Pompes à graisse', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Pompes à graisse' }], disjunctive: false },
  { handle: 'radios', title: 'Radios', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Radios' }], disjunctive: false },
  { handle: 'rectifieuse-a-pneumatiques', title: 'Rectifieuse à pneumatiques', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Rectifieuse à pneumatiques' }], disjunctive: false },

  // ═══ BATTERIES — Subcategories ═══
  { handle: 'batteries', title: 'Batteries', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Batteries' }], disjunctive: false },
  { handle: 'batteries-et-chargeurs', title: 'Batteries et chargeurs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Batteries et chargeurs' }], disjunctive: false },
  { handle: 'chargeurs', title: 'Chargeurs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Chargeurs' }], disjunctive: false },
  { handle: 'generateur', title: 'Générateur', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Générateur' }], disjunctive: false },

  // ═══ ASPIRATEURS — Subcategories ═══
  { handle: 'aspirateurs-classe-l', title: 'Aspirateurs Classe L', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Classe L' }], disjunctive: false },
  { handle: 'aspirateurs-classe-m', title: 'Aspirateurs Classe M', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Classe M' }], disjunctive: false },

  // ═══ ÉCLAIRAGE — Subcategories ═══
  { handle: 'torches', title: 'Torches', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Torches' }], disjunctive: false },
  { handle: 'lampes-frontales', title: 'Lampes frontales', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Lampes frontales' }], disjunctive: false },
  { handle: 'eclairage-portatif', title: 'Éclairage portatif', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Éclairage portatif' }], disjunctive: false },
  { handle: 'eclairage-de-site', title: 'Éclairage de site', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Éclairage de site' }], disjunctive: false },
  { handle: 'tour-d-eclairage', title: "Tour d'éclairage", rules: [{ column: 'TAG', relation: 'EQUALS', condition: "Tour d'éclairage" }], disjunctive: false },
  { handle: 'accessoires', title: 'Accessoires', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Accessoires' }], disjunctive: false },

  // ═══ INSTRUMENTS DE MESURE — Subcategories ═══
  { handle: 'diagnostic-et-inspection', title: 'Diagnostic et inspection', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Diagnostic et inspection' }], disjunctive: false },
  { handle: 'cameras-d-inspection', title: "Caméras d'inspection", rules: [{ column: 'TAG', relation: 'EQUALS', condition: "Caméras d'inspection" }], disjunctive: false },
  { handle: 'detecteur', title: 'Détecteur', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Détecteur' }], disjunctive: false },
  { handle: 'lasers', title: 'Lasers', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Lasers' }], disjunctive: false },
  { handle: 'lasers-lignes', title: 'Lasers lignes', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Lasers lignes' }], disjunctive: false },
  { handle: 'lasers-rotatifs', title: 'Lasers rotatifs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Lasers rotatifs' }], disjunctive: false },
  { handle: 'outils-de-test-et-mesure', title: 'Outils de test et mesure', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Outils de test et mesure' }], disjunctive: false },
  { handle: 'lasermetres', title: 'Lasermètres', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Lasermètres' }], disjunctive: false },
  { handle: 'pistolets-a-mesure-thermique', title: 'Pistolets à mesure thermique', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Pistolets à mesure thermique' }], disjunctive: false },
  { handle: 'testeurs-electriques', title: 'Testeurs électriques', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Testeurs électriques' }], disjunctive: false },

  // ═══ EXTÉRIEURS — Subcategories ═══
  { handle: 'tronconneuses', title: 'Tronçonneuses', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Tronçonneuses' }], disjunctive: false },
  { handle: 'tronconneuses-elagage', title: 'Tronçonneuses élagage', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Tronçonneuses délagage' }], disjunctive: false },
  { handle: 'elagueuses', title: 'Élagueuses', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Élagueuses' }], disjunctive: false },
  { handle: 'perche-d-elagage', title: "Perche d'élagage", rules: [{ column: 'TAG', relation: 'EQUALS', condition: "Perche d'élagage" }], disjunctive: false },
  { handle: 'debroussaillage-et-nettoyage', title: 'Débroussaillage et nettoyage', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Débroussaillage et nettoyage' }], disjunctive: false },
  { handle: 'debroussailleuses', title: 'Débroussailleuses', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Débroussailleuses' }], disjunctive: false },
  { handle: 'secateurs', title: 'Sécateurs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Sécateurs' }], disjunctive: false },
  { handle: 'taille-haies', title: 'Taille haies', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Taille-haies' }], disjunctive: false },
  { handle: 'taille-haies-sur-perche', title: 'Taille haies sur perche', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Taille-haies sur perche' }], disjunctive: false },
  { handle: 'entretien-des-sols-des-pelouses-et-des-terrains', title: 'Entretien des sols, des pelouses et des terrains', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Entretien des sols' }, { column: 'TAG', relation: 'EQUALS', condition: 'des pelouses et des terrains' }], disjunctive: true },
  { handle: 'coupe-bordures', title: 'Coupe bordures', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Coupe-bordures' }], disjunctive: false },
  { handle: 'fraise-a-neige', title: 'Fraise à neige', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Fraise à neige' }], disjunctive: false },
  { handle: 'pulverisateurs', title: 'Pulvérisateurs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Pulvérisateurs' }], disjunctive: false },
  { handle: 'souffleurs', title: 'Souffleurs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Souffleurs' }], disjunctive: false },
  { handle: 'souffleurs-et-ventilateurs', title: 'Souffleurs et ventilateurs', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Souffleurs et ventilateurs' }], disjunctive: false },
  { handle: 'tondeuse-a-gazon', title: 'Tondeuse à gazon', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Tondeuse à gazon' }], disjunctive: false },
  { handle: 'combi-systeme-quik-lok', title: 'Combi-système QUIK-LOK', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Combi-système QUIK-LOK' }], disjunctive: false },

  // ═══ ASSAINISSEMENT — Subcategories ═══
  { handle: 'deboucheur-a-sections', title: 'Déboucheur à sections', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Déboucheur à sections' }], disjunctive: false },
  { handle: 'deboucheur-a-sections-et-a-tambours', title: 'Déboucheur à sections et à tambours', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Déboucheur à sections et à tambours' }], disjunctive: false },
  { handle: 'deboucheur-automatique-haute-vitesse', title: 'Déboucheur automatique haute vitesse', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Déboucheur automatique haute vitesse' }], disjunctive: false },
  { handle: 'deboucheurs-a-tambours', title: 'Déboucheurs à tambours', rules: [{ column: 'TAG', relation: 'EQUALS', condition: 'Déboucheurs à tambours' }], disjunctive: false },
];

// ─── Fetch existing collections ─────────────────────────────────────────────

async function fetchAllCollections(): Promise<Map<string, string>> {
  const map = new Map<string, string>(); // handle → id
  let cursor: string | null = null;

  while (true) {
    const data = await gql(`query($cursor: String) {
      collections(first: 250, after: $cursor) {
        edges { node { id handle } }
        pageInfo { hasNextPage endCursor }
      }
    }`, { cursor });

    for (const e of data.collections.edges) {
      map.set(e.node.handle, e.node.id);
    }
    if (!data.collections.pageInfo.hasNextPage) break;
    cursor = data.collections.pageInfo.endCursor;
  }

  return map;
}

// ─── Update or Create ───────────────────────────────────────────────────────

const COLLECTION_UPDATE = `
  mutation collectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection { id handle title }
      userErrors { field message }
    }
  }
`;

const COLLECTION_CREATE = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id handle title }
      userErrors { field message }
    }
  }
`;

async function main() {
  console.log(`\n══════════ FIX COLLECTION RULES ══════════`);
  console.log(`Store:    ${STORE_DOMAIN}`);
  console.log(`Dry run:  ${DRY_RUN}`);
  console.log(`Collections to process: ${COLLECTIONS.length}\n`);

  // Fetch existing
  console.log('Fetching existing collections...');
  const existing = await fetchAllCollections();
  console.log(`  ${existing.size} collections found\n`);

  let updated = 0;
  let created = 0;
  let errors = 0;

  for (const def of COLLECTIONS) {
    const existingId = existing.get(def.handle);
    const ruleSet = {
      appliedDisjunctively: def.disjunctive,
      rules: def.rules,
    };

    if (existingId) {
      // Update existing collection
      process.stdout.write(`  UPDATE ${def.handle}... `);

      if (DRY_RUN) {
        console.log(`would update rules: ${def.rules.map(r => `${r.column}=${r.condition}`).join(' | ')}`);
        updated++;
        continue;
      }

      try {
        const data = await gql(COLLECTION_UPDATE, {
          input: { id: existingId, ruleSet },
        });

        if (data.collectionUpdate.userErrors.length > 0) {
          const errs = data.collectionUpdate.userErrors.map((e: any) => e.message).join('; ');
          console.log(`ERROR: ${errs}`);
          errors++;
        } else {
          console.log('OK');
          updated++;
        }
      } catch (err: any) {
        console.log(`ERROR: ${err.message.slice(0, 100)}`);
        errors++;
      }
    } else {
      // Create new collection
      process.stdout.write(`  CREATE ${def.handle}... `);

      if (DRY_RUN) {
        console.log(`would create with rules: ${def.rules.map(r => `${r.column}=${r.condition}`).join(' | ')}`);
        created++;
        continue;
      }

      try {
        const data = await gql(COLLECTION_CREATE, {
          input: { title: def.title, handle: def.handle, ruleSet },
        });

        if (data.collectionCreate.userErrors.length > 0) {
          const errs = data.collectionCreate.userErrors.map((e: any) => e.message).join('; ');
          console.log(`ERROR: ${errs}`);
          errors++;
        } else {
          const h = data.collectionCreate.collection?.handle;
          console.log(`OK (handle: ${h})`);
          created++;
        }
      } catch (err: any) {
        console.log(`ERROR: ${err.message.slice(0, 100)}`);
        errors++;
      }
    }

    await delay(300);
  }

  console.log(`\n══════════ SUMMARY ══════════`);
  console.log(`Updated: ${updated}`);
  console.log(`Created: ${created}`);
  console.log(`Errors:  ${errors}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
