// Push HTML descriptions to Aspirateurs products on Shopify
// Run with: npx tsx scripts/push-aspirateur-descriptions.ts
//
// Also pushes a SEO-friendly metaDescription for each product.

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
  console.error('Missing env vars');
  process.exit(1);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }
  const res = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  if (!res.ok) throw new Error(`Token error: ${res.status}`);
  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getToken();
  const res = await fetch(`https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  return json.data;
}

// ─── Descriptions HTML ───────────────────────────────────────────────────────

interface ProductDescription {
  handle: string;
  descriptionHtml: string;
  seoDescription: string;
}

const DESCRIPTIONS: ProductDescription[] = [
  {
    handle: 'aspirateur-25-l',
    seoDescription: 'Aspirateur professionnel Milwaukee 25 L disponible en classe L, M ou H. Cuve compacte, puissance 1150 W, filtration haute performance pour chantier et atelier.',
    descriptionHtml: `
<p>L'aspirateur professionnel Milwaukee 25 L est conçu pour répondre aux exigences des chantiers les plus variés. Avec une puissance de <strong>1150 W</strong> et une cuve de <strong>25 litres</strong>, il offre un excellent compromis entre capacité et maniabilité.</p>
<p>Disponible en trois classes de filtration pour s'adapter à chaque environnement de travail :</p>
<ul>
  <li><strong>Classe L</strong> (AS 2-250 ELCP) — Poussières courantes : bois, plâtre, matériaux de construction standard</li>
  <li><strong>Classe M</strong> (AS 2-250EM) — Poussières de bois dur, béton et matériaux minéraux</li>
  <li><strong>Classe H</strong> (AS 2-250EH) — Poussières dangereuses : amiante, plomb, moisissures (filtration HEPA ≥ 99,995 %)</li>
</ul>
<p>Équipé d'un système de décolmatage automatique du filtre et d'une prise asservie pour le démarrage automatique avec vos outils électroportatifs, cet aspirateur s'intègre naturellement dans votre flux de travail.</p>
`.trim(),
  },
  {
    handle: 'aspirateur-30-l',
    seoDescription: 'Aspirateur Milwaukee 30 L haute capacité, classe L ou M. Puissance 1200 W, prise asservie, décolmatage automatique. Idéal gros chantiers.',
    descriptionHtml: `
<p>L'aspirateur Milwaukee 30 litres est pensé pour les travaux intensifs où la capacité compte. Sa cuve de <strong>30 L</strong> et son moteur de <strong>1200 W</strong> garantissent une aspiration puissante et continue, réduisant les interruptions pour vidange.</p>
<p>Deux classes de filtration au choix :</p>
<ul>
  <li><strong>Classe L</strong> (AS 30 LAC) — Adapté aux poussières courantes de chantier</li>
  <li><strong>Classe M</strong> (AS 30 MAC) — Pour les poussières de bois dur, béton et matériaux minéraux nécessitant une filtration renforcée</li>
</ul>
<p>La prise asservie permet le démarrage et l'arrêt automatiques de l'aspirateur lorsque vous utilisez un outil électroportatif branché dessus. Le système de nettoyage automatique du filtre maintient une puissance d'aspiration constante tout au long de la journée.</p>
`.trim(),
  },
  {
    handle: 'aspirateur-30-l-classe-l',
    seoDescription: 'Aspirateur Milwaukee AS 300 ELCP 30 L classe L, 1500 W. Nettoyage facile du filtre, prise asservie. Solution économique pour poussières courantes.',
    descriptionHtml: `
<p>L'aspirateur Milwaukee AS 300 ELCP combine une <strong>cuve généreuse de 30 litres</strong> et un moteur puissant de <strong>1500 W</strong> dans un format accessible. Classé L pour la gestion des poussières courantes, il convient parfaitement aux travaux de menuiserie, plâtrerie et construction générale.</p>
<p>Son système <strong>Easy Clean</strong> simplifie le nettoyage du filtre : un simple levier permet de décolmater le filtre sans le retirer, maintenant une aspiration optimale en continu. La prise asservie intégrée déclenche automatiquement l'aspirateur dès que vous mettez en route votre outil branché dessus.</p>
<p>Robuste et fiable, c'est le choix idéal pour les professionnels qui recherchent un aspirateur de chantier performant sans compromis sur le budget.</p>
`.trim(),
  },
  {
    handle: 'aspirateur-42-l-classe-m',
    seoDescription: 'Aspirateur Milwaukee AS 42 MAC 42 L classe M. La plus grande cuve de la gamme filaire, puissance 1200 W. Pour les gros chantiers sans interruption.',
    descriptionHtml: `
<p>Avec ses <strong>42 litres de capacité</strong>, l'AS 42 MAC est l'aspirateur le plus endurant de la gamme filaire Milwaukee. Conçu pour les gros chantiers où chaque interruption coûte du temps, sa cuve XL vous permet de travailler plus longtemps entre chaque vidange.</p>
<p>La <strong>filtration classe M</strong> assure une rétention efficace des poussières de bois dur, béton et matériaux minéraux, conformément à la norme EN 60335-2-69. Le système de décolmatage automatique du filtre maintient une puissance d'aspiration constante, même lors d'un usage prolongé.</p>
<p>Équipé d'une prise asservie et d'un variateur de puissance, il s'adapte à tous vos outils et à toutes les situations. Sa construction robuste et ses roulettes renforcées facilitent le déplacement sur chantier.</p>
`.trim(),
  },
  {
    handle: 'm12-fuel-aspirateur-eau-et-poussiere',
    seoDescription: 'Aspirateur eau et poussière Milwaukee M12 FUEL FVCL. 6,1 L de cuve, sans fil 12 V, classe L. Ultra portable pour nettoyages sur batterie.',
    descriptionHtml: `
<p>Le M12 FUEL™ FVCL est le premier aspirateur eau et poussière compact sur batterie <strong>M12™</strong>. Avec une cuve de <strong>6,1 litres</strong> et un moteur brushless POWERSTATE™, il délivre une puissance d'aspiration remarquable dans un format ultra portable.</p>
<p>Capable d'aspirer aussi bien les liquides que les poussières sèches, il devient l'allié indispensable pour le nettoyage rapide entre deux interventions. Sa <strong>filtration classe L</strong> avec filtre HEPA retient 99,97 % des particules jusqu'à 0,3 micron.</p>
<p>Compatible avec toutes les batteries M12™, il offre une autonomie suffisante pour les tâches de nettoyage quotidiennes. Compact et léger, il se transporte facilement d'un poste de travail à l'autre.</p>
`.trim(),
  },
  {
    handle: 'm12-aspirateur-compact-de-chantier',
    seoDescription: 'Aspirateur compact Milwaukee M12 HV. Format ultra-léger sur batterie 12 V pour nettoyages rapides entre interventions. Filtre HEPA intégré.',
    descriptionHtml: `
<p>Le M12™ HV est l'aspirateur de chantier le plus compact de la gamme Milwaukee. Pensé pour les <strong>nettoyages rapides</strong> entre deux interventions, il se glisse dans un sac à outils et se dégaine en un instant.</p>
<p>Malgré son format réduit, il embarque un filtre HEPA haute performance qui retient les particules fines. Son design ergonomique et son poids plume en font un outil que vous aurez toujours à portée de main.</p>
<p>Alimenté par la plateforme <strong>M12™</strong>, il partage ses batteries avec plus de 80 outils du système. Idéal pour aspirer les copeaux, la sciure ou la poussière de perçage directement sur votre poste de travail.</p>
`.trim(),
  },
  {
    handle: 'm12-aspirateur-autonome-pour-perforateurs-sds',
    seoDescription: 'Aspirateur autonome Milwaukee M12 UDEL pour perforateurs SDS-Plus. Se fixe directement sur l\'outil, perçage sans poussière jusqu\'à Ø30 mm.',
    descriptionHtml: `
<p>Le M12™ UDEL se fixe <strong>directement sur votre perforateur SDS-Plus</strong> pour capturer la poussière à la source, au moment même du perçage. Plus besoin de tenir un aspirateur séparé : travaillez les deux mains sur l'outil.</p>
<p>Compatible avec les forets jusqu'à <strong>Ø30 mm</strong>, il utilise un filtre HEPA qui retient 99,97 % des particules fines. La poussière est collectée dans un réservoir transparent qui permet de visualiser le niveau de remplissage en un coup d'œil.</p>
<p>Alimenté par une batterie <strong>M12™</strong> indépendante de votre perforateur, il fonctionne quel que soit le perforateur SDS-Plus utilisé — Milwaukee ou autre marque. Disponible en version nue ou en kit complet avec batterie, chargeur et coffret.</p>
`.trim(),
  },
  {
    handle: 'm18-brushless-systeme-d-aspiration-sds-plus',
    seoDescription: 'Système d\'aspiration Milwaukee M18 CDEX pour perforateurs SDS-Plus. Moteur brushless 18 V, perçage propre jusqu\'à 90 mm de profondeur.',
    descriptionHtml: `
<p>Le M18™ CDEX est un système d'extraction de poussière conçu pour fonctionner avec les perforateurs SDS-Plus Milwaukee. Équipé d'un <strong>moteur brushless</strong>, il aspire efficacement la poussière de perçage jusqu'à <strong>90 mm de profondeur</strong>.</p>
<p>Il se connecte directement au perforateur et se déclenche automatiquement avec celui-ci. Le filtre HEPA intégré capture 99,97 % des particules, garantissant un environnement de travail propre — y compris lors de perçages au plafond.</p>
<p>Alimenté par la plateforme <strong>M18™</strong>, il bénéficie de l'autonomie des batteries haute capacité. Sa conception compacte n'ajoute qu'un minimum d'encombrement au perforateur.</p>
`.trim(),
  },
  {
    handle: 'm18-aspirateur',
    seoDescription: 'Aspirateur compact Milwaukee M18 CV. Cuve 7,5 L sur batterie 18 V, filtre HEPA, léger et polyvalent pour nettoyage quotidien de chantier.',
    descriptionHtml: `
<p>Le M18™ CV est un aspirateur compact et polyvalent sur batterie <strong>18 V</strong>. Avec sa cuve de <strong>7,5 litres</strong>, il offre une capacité suffisante pour les nettoyages quotidiens de chantier sans l'encombrement d'un aspirateur industriel.</p>
<p>Son moteur haute performance crée une aspiration puissante, capable de collecter efficacement la poussière de placo, les copeaux de bois, les limailles métalliques et les débris courants. Le <strong>filtre HEPA</strong> retient les particules les plus fines pour un air rejeté propre.</p>
<p>Léger et facilement transportable, il s'emporte partout sur le chantier. Le bouton de verrouillage en marche continue réduit la fatigue lors d'utilisations prolongées. Compatible avec toutes les batteries M18™.</p>
`.trim(),
  },
  {
    handle: 'm18-fuel-systeme-d-aspiration-pour-perforateur-sds-avec-autopulse',
    seoDescription: 'Système d\'aspiration Milwaukee M18 FUEL AUTOPULSE pour perforateurs SDS-Plus. Nettoyage automatique du filtre, perçage propre sans effort.',
    descriptionHtml: `
<p>La gamme de systèmes d'aspiration M18™ FUEL™ avec <strong>AUTOPULSE™</strong> révolutionne le perçage propre. La technologie AUTOPULSE™ est le premier mécanisme de nettoyage automatique du filtre intégré à un aspirateur monté sur outil : le filtre se décolmate tout seul pour maintenir une aspiration maximale en permanence.</p>
<p>Quatre modèles pour couvrir tous vos besoins :</p>
<ul>
  <li><strong>M18 FDDEC</strong> — Compact, pour forets jusqu'à Ø16 mm</li>
  <li><strong>M18 FCDDEXL</strong> — Pour forets SDS-Plus jusqu'à Ø26 mm</li>
  <li><strong>M18 FPDDEXL</strong> — Version haute performance, jusqu'à Ø26 mm</li>
  <li><strong>M18 FDDEL32</strong> — Pour forets SDS-Plus jusqu'à Ø32 mm</li>
</ul>
<p>Chaque modèle intègre un <strong>filtre HEPA</strong> captant 99,97 % des particules et un réservoir transparent pour contrôler le niveau de poussière. L'alimentation indépendante sur batterie M18™ garantit un fonctionnement avec n'importe quel perforateur SDS-Plus.</p>
`.trim(),
  },
  {
    handle: 'm18-fuel-aspirateur-23-l-classe-l',
    seoDescription: 'Aspirateur Milwaukee M18 FUEL 23 L classe L sans fil. Puissance 4200 L/min, filtre HEPA, prise asservie. L\'aspirateur de chantier sur batterie.',
    descriptionHtml: `
<p>Le M18™ FUEL™ F2VC23L est un aspirateur de chantier <strong>23 litres classe L</strong> entièrement sans fil. Avec un débit d'air de <strong>4200 L/min</strong>, il rivalise avec les aspirateurs filaires tout en offrant la liberté totale du sans-fil.</p>
<p>Le moteur brushless POWERSTATE™ optimise l'autonomie et la puissance d'aspiration. Le <strong>filtre HEPA</strong> assure une filtration classe L conforme aux normes, tandis que le système de décolmatage semi-automatique maintient les performances dans la durée.</p>
<p>Équipé d'une prise asservie, il peut également fonctionner sur secteur et se déclencher automatiquement avec un outil électroportatif branché. Sa cuve robuste et ses roulettes tout-terrain en font un véritable aspirateur de chantier professionnel — sans le fil.</p>
`.trim(),
  },
  {
    handle: 'm18-fuel-aspirateur-nexus-23l-classe-l',
    seoDescription: 'Aspirateur Milwaukee M18 FUEL NEXUS 23 L classe L. Technologie NEXUS pour aspiration constante même filtre chargé. Double batterie disponible.',
    descriptionHtml: `
<p>Le M18™ FUEL™ NEXUS™ 23 L repousse les limites de l'aspiration sans fil grâce à la technologie exclusive <strong>NEXUS™</strong>. Ce système intelligent ajuste automatiquement la puissance du moteur lorsque le filtre se charge, maintenant un <strong>débit d'aspiration constant</strong> tout au long de l'utilisation.</p>
<p>Avec une cuve de <strong>23 litres</strong> et une filtration <strong>classe L</strong>, il couvre les besoins des professionnels les plus exigeants. La version NEXUS™ Dual Battery (F2VC23LG2) accepte deux batteries M18™ simultanément pour une autonomie doublée sur les gros chantiers.</p>
<p>Prise asservie pour fonctionnement hybride secteur/batterie, décolmatage semi-automatique du filtre, construction renforcée et roulettes robustes : un aspirateur professionnel complet qui ne fait aucun compromis.</p>
`.trim(),
  },
  {
    handle: 'm18-fuel-aspirateur-dorsal',
    seoDescription: 'Aspirateur dorsal Milwaukee M18 FUEL FBPV. Format sac à dos, 1557 L/min de débit, 3,8 L de cuve. Mobilité totale mains libres sur batterie.',
    descriptionHtml: `
<p>L'aspirateur dorsal M18™ FUEL™ libère vos mains et votre mobilité. Porté comme un sac à dos, il permet de <strong>nettoyer en marchant</strong> sans traîner de cuve au sol — idéal pour les grands espaces, les escaliers et les zones difficiles d'accès.</p>
<p>Malgré son format compact avec une cuve de <strong>3,8 litres</strong>, il développe un débit impressionnant de <strong>1557 L/min</strong> avec une dépression de 189 mbar. Le harnais ergonomique répartit le poids pour un confort optimal même lors d'utilisations prolongées.</p>
<p>Le filtre HEPA intégré assure une filtration fine des particules. Compatible avec toutes les batteries M18™, il offre une autonomie généreuse pour couvrir de grandes surfaces sans interruption. Disponible en deux générations pour répondre à vos besoins.</p>
`.trim(),
  },
  {
    handle: 'm18-fuel-aspirateur-eau-et-poussiere-packout',
    seoDescription: 'Aspirateur eau et poussière Milwaukee M18 FUEL PACKOUT. S\'empile sur le système PACKOUT, aspire eau et solides, cuve 7,5 L, filtre HEPA.',
    descriptionHtml: `
<p>L'aspirateur M18™ FUEL™ PACKOUT™ combine la puissance d'aspiration Milwaukee avec la modularité du système de rangement <strong>PACKOUT™</strong>. Il s'empile et se verrouille directement sur vos coffrets PACKOUT™ pour un transport organisé et un accès immédiat sur chantier.</p>
<p>Capable d'aspirer aussi bien <strong>l'eau que la poussière</strong>, il embarque une cuve de <strong>7,5 litres</strong> et un filtre HEPA H13 captant 99,97 % des particules jusqu'à 0,3 micron. Le débit de 1416 L/min assure une aspiration efficace de tous types de débris.</p>
<p>Deux modèles sont disponibles dans cette gamme : le M18 FPOVCL avec les dernières améliorations, et le M18 VC2 au format éprouvé. Tous deux partagent la compatibilité PACKOUT™ et la plateforme batterie M18™ pour une flexibilité maximale.</p>
`.trim(),
  },
  {
    handle: 'm18-fuel-aspirateur-one-key-packout-34l-ac-dc-classe-m',
    seoDescription: 'Aspirateur Milwaukee M18 FUEL ONE-KEY PACKOUT 34 L classe M. Le plus complet : AC/DC, traçabilité ONE-KEY, compatible PACKOUT, classe M.',
    descriptionHtml: `
<p>Le M18™ FUEL™ ONE-KEY™ PACKOUT™ 34 L est le <strong>fleuron de la gamme d'aspirateurs Milwaukee</strong>. Il réunit toutes les technologies de la marque dans un seul appareil : moteur brushless FUEL™, traçabilité ONE-KEY™, modularité PACKOUT™ et fonctionnement hybride <strong>AC/DC</strong> (secteur et batterie).</p>
<p>Avec une cuve de <strong>34 litres</strong> et une filtration <strong>classe M</strong>, il répond aux exigences des chantiers les plus lourds — bois dur, béton, matériaux minéraux. La technologie ONE-KEY™ permet de tracer l'outil, personnaliser ses réglages et suivre son utilisation via l'application smartphone.</p>
<p>Le fonctionnement hybride AC/DC offre une flexibilité totale : branchez-le sur secteur pour une puissance illimitée, ou utilisez les batteries M18™ HIGH OUTPUT™ pour une liberté sans fil. Le format PACKOUT™ intégré assure un transport et un stockage organisé avec le reste de votre équipement.</p>
`.trim(),
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Pushing descriptions for ${DESCRIPTIONS.length} products to ${STORE_DOMAIN}\n`);

  let success = 0;
  let errors = 0;

  for (const desc of DESCRIPTIONS) {
    process.stdout.write(`  ${desc.handle}... `);

    try {
      // Find product by handle
      const data = await gql<{
        productByHandle: { id: string; title: string } | null;
      }>(`query($handle: String!) {
        productByHandle(handle: $handle) { id title }
      }`, { handle: desc.handle });

      if (!data.productByHandle) {
        console.log('NOT FOUND — skipping');
        errors++;
        continue;
      }

      const productId = data.productByHandle.id;

      // Update product description + SEO
      const updateData = await gql<{
        productUpdate: {
          product: { id: string } | null;
          userErrors: { field: string[]; message: string }[];
        };
      }>(`mutation productUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id }
          userErrors { field message }
        }
      }`, {
        input: {
          id: productId,
          descriptionHtml: desc.descriptionHtml,
          seo: {
            description: desc.seoDescription,
          },
        },
      });

      if (updateData.productUpdate.userErrors.length > 0) {
        const msgs = updateData.productUpdate.userErrors.map(e => e.message).join(', ');
        console.log(`ERROR: ${msgs}`);
        errors++;
      } else {
        console.log(`OK — "${data.productByHandle.title}"`);
        success++;
      }
    } catch (err) {
      console.log(`ERROR: ${(err as Error).message.slice(0, 100)}`);
      errors++;
    }

    // Small rate limit pause
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n══════════ DONE ══════════`);
  console.log(`  Success: ${success}`);
  console.log(`  Errors:  ${errors}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
