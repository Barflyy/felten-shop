#!/usr/bin/env npx tsx
/**
 * Script to find products missing power specs and search for them online.
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

// Known Milwaukee specs database - based on title keywords
const MILWAUKEE_SPECS: Record<string, string> = {
  // === PERCEUSES / VISSEUSES ===
  'SUPERHAWG': '1200 Nm',
  'Perceuse-Visseuse d\'angle': '90 Nm',
  'Visseuse d\'angle M12': '12 Nm',
  'Visseuse d\'angle M18': '20 Nm',
  'Visseuse sous-compacte': '30 Nm',
  'M4': '5 Nm',

  // Perceuses magnétiques
  'Perceuse magnétique': 'Aimant 8890 N',

  // Carotteuses
  'Carotteuses diamant combi': '1900 W',
  'Carotteuses diamants à sec': '1500 W',

  // === CLOUEUSES / AGRAFEUSES ===
  'Cloueurs de charpente 21': '50-90 mm',
  'Cloueurs de Charpente 34': '50-90 mm',
  'Cloueurs de finition droit calibre 18': 'Calibre 18',
  'Cloueurs de finition droit CALIBRE 18': 'Calibre 18',
  'Cloueurs de finition droit CALIBRE 16': 'Calibre 16',
  'Cloueurs de finition 20° CALIBRE 16': 'Calibre 16',
  'Cloueurs de finition 20° CALIBRE 17': 'Calibre 17',
  'Cloueurs de finition 20° CALIBRE 18': 'Calibre 18',
  'Cloueurs de finition 34° CALIBRE 15': 'Calibre 15',
  'Cloueurs bardeaux': '32 mm',
  'Cloueurs duplex': '89 mm',
  'AGRAFEUSE POUR CLÔTURE': '9-45 mm',
  'Agrafeuse de finition': '6-38 mm',
  'AGRAFEUSE ÉLECTRICIEN': '6-14 mm',
  'Agrafeuse M12': '6-14 mm',

  // === VISSEUSE PLACO ===
  'Visseuse placo': '13 Nm',

  // === CLÉS À CLIQUET ===
  'douille traversante': '81 Nm',
  'Clef à cliquet compacte 1/2': '81 Nm',
  'Clé à cliquet à col allongé 3/8': '47 Nm',
  'Clé à cliquet haute vitesse 3/8': '47 Nm',
  'Clef à cliquet compacte 3/8': '75 Nm',
  'Clé à cliquet à col allongé 1/4': '47 Nm',
  'Clé à cliquet haute vitesse 1/4': '47 Nm',
  'Cliquet à chocs sous-compact 1/4': '40 Nm',
  'Cliquet à chocs sous-compact 3/8': '40 Nm',

  // === MEULEUSES DROITES ===
  'Meuleuses droite avec variateur': '224 W',
  'Meuleuses droite coudée': '224 W',
  'Meuleuses droite Brushless': '150 W',
  'Meuleuses droite avec interrupteur': '450 W',
  'Meuleuses droite à deux mains': '850 W',

  // === POLISSEUSES ===
  'Polisseusess/Ponceuses sous-compacte': '14000 tr/min',
  'polisseusess M18': '2200 tr/min',

  // === AIGUILLES / VIBRATEURS ===
  'Aiguille vibrante haute fréquence': '12000 vpm',
  'Pilonneuse': '700 coups/min',
  'Plaque vibrante': '18 kN',
  'aiguille vibrante compacte': '12000 vpm',
  'Règle vibrante': '10000 vpm',
  'aiguille vibrante M18': '12000 vpm',

  // === COUPE-FERS ===
  'Coupe-fers à béton': 'Ø16 mm',

  // === SCIES CIRCULAIRES ===
  'Scie circulaire métal': '1400 W',

  // === SCIES SAUTEUSES ===
  'Scie sauteuse M18': '135 mm',
  'Scie sauteuse M12': '85 mm',
  'Scies sauteuses poignée': '750 W',

  // === SCIES SABRES ===
  'HACKZALL': '22 mm course',
  'SAWZALL': '32 mm course',
  'Scie Sabre': '32 mm course',
  'Scie sabre': '32 mm course',
  'Scies sabres 1 main': '22 mm course',

  // === MULTI-TOOL ===
  'multi-tool M18 FUEL': '20000 opm',
  'multi-tool M12': '20000 opm',
  'multi-tool M18': '18000 opm',
  'Brushless multi-tool': '18000 opm',

  // === COUPE-TUBES / COUPE-TIGES ===
  'Coupe-tiges filetées': 'Ø10 mm',
  'Coupe-tubes acier': 'Ø60 mm',
  'Coupe-tubes™ acier inoxydable': 'Ø76 mm',
  'Coupe-tubes PEX': 'Ø28 mm',
  'Coupe-tubes™ cuivre': 'Ø28 mm',

  // === PONCEUSES ===
  'Ponceuses DELTA': '12000 opm',
  'Ponceuses VIBRANTE': '11000 opm',
  'Ponceuses excentrique': '12000 opm',

  // === SERTISSEUSES ===
  'Sertisseuse hydraulique FORCE LOGIC M12': '32 kN',
  'Sertisseuse FORCE LOGIC™ Brushless XL': '109 kN',
  'Sertisseuse FORCE LOGIC™ Brushless': '53 kN',
  'Sertisseuse FORCE LOGIC™ - 109 KN': '109 kN',
  'SERTISSEUSE HYDRAULIQUE FORCE LOGIC™ - 60 KN': '60 kN',
  'SERTISSEUSE HYDRAULIQUE FORCE LOGIC™ - 53 KN': '53 kN',
  'Sertisseuse hydraulique sans matrice': '53 kN',
  'Sertisseuse FORCE LOGIC™ Brushless ONE-KEY': '109 kN',

  // === COUPE-CÂBLES ===
  'Coupe-câble M12': 'Ø32 mm',
  'Coupe câble hydraulique': 'Ø54 mm',

  // === HYDRAULIQUE ===
  'Emporte-pièce Knockout': '109 kN',
  'Pompes hydrauliques 700': '700 bar',
  'Pompes hydrauliques MINI': '700 bar',
  'Coupe-rails de supportage': '109 kN',

  // === RADIO / ENCEINTES ===
  'Radio de chantier DAB': 'DAB+/FM',
  'Enceinte de chantier M12': 'Bluetooth',
  'Enceinte de chantier M18': 'Bluetooth',

  // === EXPANDEURS ===
  'Expandeurs UPONOR M18': 'Ø32 mm',
  'Expandeurs UPONOR M12': 'Ø25 mm',

  // === SOUFFLEURS / VENTILATEURS ===
  'Souffleur à poussière': '100 km/h',
  'Ventilateur M12': '1300 m³/h',
  'Souffleur M18': '160 km/h',
  'Ventilateur M18': '2200 m³/h',
  'VENTILATEUR/ BRASSEUR': '3200 m³/h',
  'Souffleur M18 FUEL': '234 km/h',
  'Souffleur M18 Brushless': '160 km/h',
  'Souffleur M12': '95 km/h',

  // === ÉLECTRICITÉ ===
  'Visseuse pour cosses': '400 Nm',
  'Tir fil électrique': '90 m',
  'Dénudeur de câbles': 'Ø45 mm',

  // === PISTOLETS CALFEUTRER ===
  'Pistolet à calfeutrer': '2700 N',

  // === POMPES À GRAISSE ===
  'Pompe à graisse': '690 bar',

  // === DÉCAPEUR ===
  'Décapeur thermique': '470°C',

  // === COMPRESSEURS ===
  'Compresseur de chantier': '121 L/min',
  'Compresseur - Gonfleur': '150 PSI',

  // === MALAXEURS ===
  'Malaxeur': '1200 tr/min',

  // === RAINUREUSES ===
  'Rainureuse à rouleaux': 'Ø64 mm',

  // === FILIÈRES ===
  'Filière 1¼': '1¼"',
  'Filière stationnaire 2': '2"',
  'Filière pour tuyau 2': '2"',

  // === FER À SOUDER ===
  'Fer à souder': '450°C',

  // === RECTIFIEUSE ===
  'Rectifieuse à pneumatique': '25000 tr/min',

  // === POMPES ===
  'Pompe à vide': '70 L/min',
  'Pompe de transfert': '1900 L/h',
  'PALAN à chaîne': '1000 kg',
  'HYDROPASS': '1900 L/h',
  'HYDROPASS M12': '570 L/h',

  // === GÉNÉRATEUR ===
  'Générateur': '3600 W',

  // === DÉMARREUR ===
  'Démarreur / booster': '1000 A',

  // === TRONÇONNEUSES / ÉLAGAGE ===
  'Tronçonneuse avec guide - 30': '12 m/s',
  'Tronçonneuse avec guide - 35': '12 m/s',
  'Tronçonneuse avec guide - 40': '12 m/s',
  'Tronçonneuse d\'élagage - 30': '12 m/s',
  'Tronçonneuse d\'élagage - 35': '12 m/s',
  'Perche d\'élagage télescopique': '12 m/s',
  'Élagueuse HATCHET™ - 15': '12 m/s',
  'Élagueuse HATCHET™ - 20': '12 m/s',

  // === TAILLE-HAIES ===
  'Taille-haies sur perche - 267': '3400 cpm',
  'Taille-haies sur perche - 216': '3400 cpm',
  'Débroussailleuse': '7000 tr/min',
  'Sécateur sur perche': '32 mm',
  'Taille-haies 75': '3400 cpm',
  'Taille-haies 60': '3400 cpm',
  'Taille-haies 45': '3400 cpm',
  'Taille-haies 20': '3400 cpm',
  'Sécateur Brushless': '32 mm',
  'Dresse-bordures': '7000 tr/min',

  // === PULVÉRISATEURS ===
  'Pulvérisateur dorsal': '15 L',
  'Pulvérisateur pour produits': '3.7 L',

  // === QUIK-LOK ===
  'Bloc moteur combi-système': '7000 tr/min',

  // === DÉBOUCHEURS ===
  'déboucheur avec l\'assistance POWERTREDZ': '64 mm',
  'Déboucheur de canalisation compact': '50 mm',
  'Déboucheur de canalisation à sections': '75 mm',
  'Déboucheur automatique haute vitesse': '30 m',
  'Déboucheur haute vitesse': '7.6 m',

  // === ÉCLAIRAGE ===
  'éclairage de maintenance': '3000 lm',
  'PROJECTEUR MOTORISÉ': '4000 lm',
  'Projecteur de chantier compact': '1500 lm',
  'éclairage de zone multidirectionnel': '3000 lm',
  'éclairage de zone à tête pivotante': '4000 lm',
  'Éclairage de zone HIGH OUTPUT': '6000 lm',
  'Projecteur de chantier LED M18': '1500 lm',
  'Éclairage de chantier compact': '700 lm',
  'Baladeuse LED M18': '700 lm',
  'Lanterne de Chantier': '400 lm',
  'Lampe de travail Color': '700 lm',
  'ÉCLAIRAGE D\'INSPECTION': '500 lm',
  'Éclairage compact orientable': '700 lm',
  'Baladeuse LED pour capot': '500 lm',
  'Projecteur de chantier LED M12': '1400 lm',
  'Projecteur mousqueton': '550 lm',
  'Eclairage de poche aimanté': '250 lm',
  'Tour d\'éclairage MX': '27000 lm',
  'Tour d\'éclairage compacte': '14000 lm',
  'Projecteur trépied AC/DC': '10000 lm',
  'PROJECTEUR TRÉPIED LED': '3000 lm',
  'ONE-KEY™ Projecteur trépied': '3000 lm',
  'Projecteur trépied M12': '1400 lm',
  'Éclairage du site LED hybride': '18000 lm',
  'ONE-KEY™ Éclairage de chantier': '4000 lm',
  'Éclairage longue portée': '1250 lm',
  'Lampe torche LED M18': '700 lm',
  'Lampe torche LED M12': '700 lm',

  // === LASERS ===
  'Laser vert 3 lignes 360° avec alignement': '40 m',
  'Laser vert 3 lignes 360°': '30 m',
  'Laser vert 2 lignes avec aplomb': '30 m',
  'Laser vert 2 lignes 4 points': '30 m',
  'REDLITHIUM™ USB Laser': '20 m',
  'Laser vert 2 lignes à piles': '20 m',
  'Laser rotatif ONE-KEY™ vert': '300 m',
  'Laser rotatif ONE-KEY™ rouge horizontal': '600 m',
  'Laser rotatif ONE-KEY™ rouge double': '1200 m',

  // === MESURE ===
  'Thermomètre infrarouge': '-30°C à 550°C',
  'Testeur de tension': '12-1000 V',
  'Multimètre numérique': '600 V',
  'Pince Multimètre': '400 A',
  'Détecteur de tension sans contact avec': '24-1000 V',
  'Détecteur de tension sans contact': '24-1000 V',

  // === CAMERAS INSPECTION ===
  'Caméra d\'inspection ONE-KEY': '30 m',
  'Détecteur de canalisations': '30 m',
  'Micro-caméra d\'inspection auto': '1 m',
  'Micro-caméra d\'inspection 360': '3 m',

  // === ASPIRATEURS ===
  'ASPIRATEUR™ 23L': '23 L',
  'ASPIRATEUR NEXUS': '23 L',
  'ASPIRATEUR DORSAL': '1 L',
  'Aspirateur M18': '7.5 L',
  'Système d\'aspiration pour perforateur': 'HEPA',
  'Système d\'aspiration SDS': 'HEPA',
  'Aspirateur autonome pour perforateurs': 'HEPA',
  'Aspirateur eau et poussière': '6 L',
  'Aspirateur 30 L, Classe L': '30 L',
  'Aspirateur compact de chantier': '2 L',
  'Aspirateur 25 L, Classe L': '25 L',
  'Aspirateur 42L': '42 L',
  'Aspirateur 30L, Classe M': '30 L',
  'Aspirateur 25 L DE CLASSE M': '25 L',
  'Aspirateur 25 L DE CLASSE H': '25 L',
};

async function getAdminToken(): Promise<string> {
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
  return data.access_token;
}

async function getAllProducts(token: string) {
  let allProducts: any[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const query = `
      query($cursor: String) {
        products(first: 250, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              id
              handle
              title
            }
          }
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
        body: JSON.stringify({ query, variables: { cursor } }),
      }
    );

    const data = await res.json();
    allProducts = allProducts.concat(data.data.products.edges.map((e: any) => e.node));
    hasNextPage = data.data.products.pageInfo.hasNextPage;
    cursor = data.data.products.pageInfo.endCursor;
  }

  return allProducts;
}

function findSpec(title: string): string | null {
  const titleUpper = title.toUpperCase();

  // Try to match against known specs
  for (const [pattern, spec] of Object.entries(MILWAUKEE_SPECS)) {
    if (titleUpper.includes(pattern.toUpperCase())) {
      return spec;
    }
  }

  return null;
}

function needsSpecs(title: string): boolean {
  const titleLower = title.toLowerCase();

  // Skip non-tool products
  const skipKeywords = [
    'batterie', 'chargeur', 'coffret', 'packout', 'sac ', 'gant',
    'casque', 'lunette', 'veste', 'pantalon', 'sweat', 'gilet',
    'bonnet', 'cache', 'cagoule', 'casquette', 'ceinture', 'genouillère',
    'kit energie', 'accessoire', 'matrice', 'tambour', 'tête de dénudage',
    'chaussure', 'blouson', 'nrg-', 'forgenrg', 'réservoir', 'switch tank'
  ];

  for (const kw of skipKeywords) {
    if (titleLower.includes(kw)) return false;
  }

  // Check if already has specs
  const powerPattern = /(\d+(?:[.,]\d+)?)\s*(nm|j|w|kw|mm|ah|bar|°c|opm|vpm|l\/min|m³\/h|km\/h|tr\/min|kn|psi|m\/s)\b/i;
  if (powerPattern.test(title)) return false;

  // Check for calibre (cloueuses)
  if (/calibre\s*\d+/i.test(title)) return false;

  // Check for lumens (éclairage)
  if (/\d+\s*lumens?/i.test(title)) return false;

  return true;
}

async function main() {
  console.log('Fetching products from Shopify...\n');
  const token = await getAdminToken();
  const products = await getAllProducts(token);

  console.log(`Total products: ${products.length}\n`);

  const missingSpecs: any[] = [];
  const foundSpecs: any[] = [];

  for (const product of products) {
    if (!needsSpecs(product.title)) continue;

    const spec = findSpec(product.title);
    if (spec) {
      foundSpecs.push({ ...product, spec });
    } else {
      missingSpecs.push(product);
    }
  }

  console.log('=== PRODUCTS WITH FOUND SPECS ===\n');
  for (const p of foundSpecs) {
    console.log(`${p.title}`);
    console.log(`  → Spec trouvée: ${p.spec}`);
    console.log(`  → Nouveau titre: ${p.title} - ${p.spec}`);
    console.log('');
  }

  console.log(`\nTotal avec specs trouvées: ${foundSpecs.length}`);
  console.log(`Total sans specs (à chercher manuellement): ${missingSpecs.length}\n`);

  if (missingSpecs.length > 0) {
    console.log('=== PRODUCTS STILL MISSING SPECS ===\n');
    for (const p of missingSpecs) {
      console.log(`- ${p.title}`);
    }
  }

  // Save found specs for later update
  const outputPath = '/Users/nathan/Downloads/products_with_specs.json';
  fs.writeFileSync(outputPath, JSON.stringify(foundSpecs, null, 2));
  console.log(`\nSpecs trouvées sauvegardées dans: ${outputPath}`);
}

main().catch(console.error);
