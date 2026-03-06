import { Product } from './shopify/types';

export interface ContextualFilterDef {
  key: string;
  label: string;
  /** Extract available values from products list */
  extractValues: (products: Product[]) => string[];
  /** Check if a product matches a selected value */
  matchProduct: (product: Product, selectedValue: string) => boolean;
  /** Optional color mapping for chip display */
  colorMap?: Record<string, string>;
}

export interface CollectionFilterConfig {
  contextualFilters: ContextualFilterDef[];
  showMachineTypeFilter: boolean;
  showSystemFilter?: boolean; // defaults to true when omitted
}

// ---- Helper: tag-based filter builder ----

interface TagCategory {
  /** Display label */
  label: string;
  /** Tags that map to this category (case-insensitive, any match = hit) */
  tags: string[];
}

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // strip accents
}

function productHasAnyTag(product: Product, tags: string[]): boolean {
  const productTags = (product.tags || []).map(normalizeTag);
  return tags.some((t) => productTags.includes(normalizeTag(t)));
}

function buildTagFilter(
  key: string,
  label: string,
  categories: TagCategory[],
  fallbackLabel?: string
): ContextualFilterDef {
  return {
    key,
    label,
    extractValues: (products) => {
      const found = new Set<string>();
      for (const p of products) {
        let matched = false;
        for (const cat of categories) {
          if (productHasAnyTag(p, cat.tags)) {
            found.add(cat.label);
            matched = true;
            break;
          }
        }
        if (!matched && fallbackLabel) {
          found.add(fallbackLabel);
        }
      }
      // Return in defined order
      const ordered = categories.map((c) => c.label).filter((l) => found.has(l));
      if (fallbackLabel && found.has(fallbackLabel)) ordered.push(fallbackLabel);
      return ordered;
    },
    matchProduct: (product, selectedValue) => {
      if (selectedValue === fallbackLabel) {
        return !categories.some((cat) => productHasAnyTag(product, cat.tags));
      }
      const cat = categories.find((c) => c.label === selectedValue);
      if (!cat) return false;
      return productHasAnyTag(product, cat.tags);
    },
  };
}

// ──── Perçage et burinage ────────────────────────────────────────────────────

const percageTypeFilter = buildTagFilter('percageType', 'Type', [
  { label: 'Perceuses à percussion', tags: ['Perceuses a percussion', 'Perceuse a percussion', 'Perceuses à percussion', 'Perceuse à percussion', 'Visseuses à percussion'] },
  { label: 'Perceuses-visseuses', tags: ['Perceuses-visseuses', 'Perceuse-visseuse', 'Visseuses sans percussion'] },
  { label: 'Perforateurs SDS-Plus', tags: ['Perforateurs SDS-Plus', 'SDS-Plus', 'SDS Plus'] },
  { label: 'Perforateurs SDS-Max', tags: ['Perforateurs SDS-Max', 'SDS-Max', 'SDS Max'] },
  { label: 'Perceuses d\'angle', tags: ['Perceuses d\'angle', 'Visseuses d\'angle', 'Visseuse d\'angle'] },
  { label: 'Visseuses placo', tags: ['Visseuses placo / autoperceuses', 'Visseuse placo', 'Visseuses a placo', 'Visseuses à placo'] },
  { label: 'Perceuses magnétiques', tags: ['Perceuses magnetiques', 'Perceuses magnétiques', 'Perceuse magnetique'] },
  { label: 'Démolisseurs', tags: ['Demolisseurs', 'Démolisseurs', 'Marteaux demolisseurs', 'Marteaux démolisseurs', 'Démolisseurs / Marteaux piqueurs'] },
], 'Autres');

// ──── Vissage ────────────────────────────────────────────────────────────────

const vissageTypeFilter = buildTagFilter('vissageType', 'Type', [
  { label: 'Boulonneuses à chocs', tags: ['Boulonneuses a chocs', 'Boulonneuses à chocs', 'Boulonneuse a chocs', 'Boulonneuses / Clés à chocs'] },
  { label: 'Visseuses à chocs', tags: ['Visseuses a chocs', 'Visseuses à chocs', 'Visseuse a chocs'] },
  { label: 'Clés à cliquet', tags: ['Cles a cliquet', 'Clés à cliquet', 'Cle a cliquet', 'Cliquets a chocs'] },
  { label: 'Clés dynamométriques', tags: ['Cles dynamometriques', 'Clés dynamométriques', 'Cle dynamometrique'] },
  { label: 'Cloueurs', tags: ['Cloueurs', 'Cloueur', 'Cloueurs de finition', 'Cloueurs de charpente', 'Cloueurs Brad / Finish', 'Cloueur de bardage', 'Cloueurs et agrafeuses'] },
  { label: 'Agrafeuses', tags: ['Agrafeuses', 'Agrafeuse'] },
  { label: 'Riveteuses', tags: ['Riveteuses', 'Riveteuse'] },
], 'Autres');

const vissageCoupleFilter = buildTagFilter('vissageCouple', 'Couple', [
  { label: '0-50 Nm', tags: ['0-50 Nm'] },
  { label: '50-100 Nm', tags: ['50-100 Nm'] },
  { label: '100-200 Nm', tags: ['100-200 Nm'] },
  { label: '200+ Nm', tags: ['200+ Nm'] },
]);

// ──── Meuleuses et polisseuses ───────────────────────────────────────────────

const meuleusesTypeFilter = buildTagFilter('meuleuseType', 'Type', [
  { label: 'Meuleuses d\'angle', tags: ['Meuleuses 115mm', 'Meuleuses 125mm', 'Meuleuses 150mm', 'Meuleuses 180mm', 'Meuleuses 230mm', 'Meuleuses compactes 76 mm', 'Meuleuses 76mm'] },
  { label: 'Meuleuses droites', tags: ['Meuleuses droites / de precision', 'Meuleuses droites et coudees', 'Meuleuses droites / de précision', 'Meuleuses droites et coudées'] },
  { label: 'Surfaceuses', tags: ['Meuleuses a surfacer', 'Meuleuses à surfacer'] },
  { label: 'Polisseuses', tags: ['Polisseuses', 'Polisseuse', 'Polisseuses / Lustreuses'] },
]);

const meuleusesTailleFilter = buildTagFilter('meuleuseTaille', 'Diamètre', [
  { label: '76 mm', tags: ['Meuleuses compactes 76 mm', 'Meuleuses 76mm', '76 mm'] },
  { label: '115 mm', tags: ['Meuleuses 115mm', '115 mm'] },
  { label: '125 mm', tags: ['Meuleuses 125mm', '125 mm'] },
  { label: '150 mm', tags: ['Meuleuses 150mm', '150 mm'] },
  { label: '180 mm', tags: ['Meuleuses 180mm', '180 mm'] },
  { label: '230 mm', tags: ['Meuleuses 230mm', '230 mm'] },
]);

// ──── Démolition ─────────────────────────────────────────────────────────────

const demolitionAlimFilter = buildTagFilter('demolitionAlim', 'Alimentation', [
  { label: 'Filaire', tags: ['Filaire'] },
  { label: 'MX FUEL', tags: ['MX FUEL'] },
]);

// ──── Béton ──────────────────────────────────────────────────────────────────

const betonTypeFilter = buildTagFilter('betonType', 'Type', [
  { label: 'Vibrateurs à béton', tags: ['Vibrateurs a beton', 'Vibrateurs à béton', 'Aiguilles vibrantes', 'Aiguille vibrante'] },
  { label: 'Carotteuses', tags: ['Carotteuses', 'Carotteuse', 'Carotteuses diamant'] },
  { label: 'Compactage & Finition', tags: ['Pilonneuse', 'Plaque vibrante', 'Regle vibrante', 'Règle vibrante', 'Talocheuse'] },
]);

// ──── Sciage et découpe ──────────────────────────────────────────────────────

const sciageTypeFilter = buildTagFilter('sciageType', 'Type', [
  { label: 'Scies circulaires', tags: ['Scies circulaires', 'Scie circulaire'] },
  { label: 'Scies sabres', tags: ['Scies sabres', 'Scies sabre (Sawzall)'] },
  { label: 'Scies sauteuses', tags: ['Scies sauteuses', 'Scie sauteuse'] },
  { label: 'Scies à ruban', tags: ['Scies a ruban', 'Scies à ruban', 'Scie a ruban'] },
  { label: 'Scies à onglets', tags: ['Scies a onglets', 'Scies à onglets', 'Scies radiales'] },
  { label: 'Outils oscillants', tags: ['Outils oscillants (Multi-tool)', 'Outils multifonctions', 'Outil multifonctions', 'Multi-tool'] },
  { label: 'Défonceuses & Affleureuses', tags: ['Defonceuses / Affleureuses', 'Défonceuses / Affleureuses', 'Defonceuses et affleureuses', 'Défonceuses et affleureuses'] },
  { label: 'Cisailles & Grignoteuses', tags: ['Cisailles / Grignoteuses', 'Cisailles', 'Grignoteuses'] },
  { label: 'Découpeuses', tags: ['Decoupeuses a beton', 'Découpeuses a beton', 'Découpeuses à béton', 'Decoupeuses a disque (beton)', 'Découpeuses à disque (béton)'] },
  { label: 'Rainureuses', tags: ['Rainureuses', 'Rainureuse'] },
], 'Autres');

// ──── Ponçage ────────────────────────────────────────────────────────────────

const poncageAlimFilter = buildTagFilter('poncageAlim', 'Plateforme', [
  { label: 'M12', tags: ['M12', 'M12 FUEL', 'M12 Brushless'] },
  { label: 'M18', tags: ['M18', 'M18 FUEL', 'M18 Brushless'] },
  { label: 'Filaire', tags: ['Filaire'] },
]);

// ──── Sertissage ─────────────────────────────────────────────────────────────

const sertissageTypeFilter = buildTagFilter('sertissageType', 'Type', [
  { label: 'Presses à sertir', tags: ['Presses a sertir compactes', 'Presses à sertir compactes', 'Sertisseuses plomberie', 'Sertisseuse plomberie'] },
  { label: 'Coupe-câbles', tags: ['Coupe-cables', 'Coupe-câbles', 'Coupe-cables hydrauliques', 'Coupe-câbles hydrauliques'] },
  { label: 'Presses hydrauliques', tags: ['Presses hydrauliques (sertissage cables)', 'Presses hydrauliques (sertissage câbles)', 'Sertisseuses electricite', 'Sertisseuses électricité'] },
  { label: 'Coupe-tubes', tags: ['Coupe-tubes', 'Coupe-tube'] },
  { label: 'Filières', tags: ['Filieres', 'Filières', 'Filiere', 'Filière'] },
  { label: 'Expandeurs', tags: ['Expandeurs', 'Expandeur', 'Presses a expansion (PEX)', 'Outils d\'expansion'] },
  { label: 'Cisailles', tags: ['Cisailles / Grignoteuses', 'Cisailles'] },
  { label: 'Coupe-rails', tags: ['Coupe-rails de support', 'Coupe-rails'] },
  { label: 'Rainureuses', tags: ['Rainureuses (Roll Groover)', 'Rainureuse', 'Rainureuses'] },
], 'Autres');

// ──── Radios et enceintes ────────────────────────────────────────────────────

const radiosTypeFilter = buildTagFilter('radioType', 'Type', [
  { label: 'Radios', tags: ['Radios', 'Radio'] },
  { label: 'Enceintes', tags: ['Enceintes', 'Enceinte'] },
]);

// ──── Autres ─────────────────────────────────────────────────────────────────

const autresTypeFilter = buildTagFilter('autresType', 'Type', [
  { label: 'Pistolets à mastic', tags: ['Pistolets a mastic / cartouche', 'Pistolets à mastic / cartouche', 'Pompe a silicone', 'Pompe à silicone'] },
  { label: 'Dénudeurs de câble', tags: ['Denudeurs de cable', 'Dénudeurs de câble', 'Tetes de denudage', 'Têtes de dénudage'] },
  { label: 'Pompes de transfert', tags: ['Pompes de transfert', 'Pompe a vide et pompe de transfert', 'Pompe à vide et pompe de transfert'] },
  { label: 'Tire-fils', tags: ['Tire-fils', 'Aiguilles tire-fil / Fish tape'] },
  { label: 'Pulvérisateurs', tags: ['Pulverisateurs', 'Pulvérisateurs'] },
  { label: 'Ventilateurs', tags: ['Ventilateurs de chantier', 'Souffleurs et ventilateurs'] },
  { label: 'Rabots', tags: ['Rabots', 'Rabot'] },
  { label: 'Pompes à graisse', tags: ['Pompes a graisse', 'Pompes à graisse', 'Pompe a graisse', 'Pompe à graisse'] },
  { label: 'Compresseurs & Gonfleurs', tags: ['Compresseur et gonfleur', 'Gonfleurs'] },
  { label: 'Fers à souder', tags: ['Fers a souder', 'Fers à souder', 'Fer a souder', 'Fer à souder'] },
  { label: 'Décapeurs', tags: ['Decapeurs thermiques', 'Décapeurs thermiques', 'Decapeur', 'Décapeur'] },
], 'Autres');

// ──── Batteries, chargeurs et générateurs ────────────────────────────────────

const batteriesTypeFilter = buildTagFilter('batterieType', 'Type', [
  { label: 'Batteries', tags: ['Batteries', 'Batterie'] },
  { label: 'Chargeurs', tags: ['Chargeurs', 'Chargeur'] },
  { label: 'Kits de batteries', tags: ['Kits de batteries', 'Packs NRG (Batterie + Chargeur)', 'Pack NRG'] },
  { label: 'Générateurs & Stations', tags: ['Generateurs et boosters', 'Générateurs et boosters', 'Stations energie / Generateurs', 'Stations énergie / Générateurs'] },
]);

// ──── Extérieurs et espaces verts ────────────────────────────────────────────

const exterieursTypeFilter = buildTagFilter('exterieurType', 'Type', [
  { label: 'Tronçonneuses', tags: ['Tronconneuses', 'Tronçonneuses', 'Tronconneuse'] },
  { label: 'Taille-haies', tags: ['Taille-haies', 'Taille-haie', 'Taille-haies sur perche'] },
  { label: 'Souffleurs', tags: ['Souffleurs', 'Souffleur'] },
  { label: 'Élagueuses', tags: ['Elagueuses', 'Élagueuses', 'Elagueuses sur perche', 'Élagueuses sur perche'] },
  { label: 'Débroussailleuses', tags: ['Debroussailleuses', 'Débroussailleuses', 'Dresse-bordures', 'Coupe-bordures', 'Coupe-bordures / Edger'] },
  { label: 'Tondeuses', tags: ['Tondeuses', 'Tondeuse'] },
  { label: 'Sécateurs', tags: ['Secateurs', 'Sécateurs', 'Secateur', 'Secateurs sur perche', 'Sécateurs sur perche'] },
  { label: 'Système QUIK-LOK', tags: ['Quik-lock', 'QUIK-LOK', 'Accessoires QUIK-LOK', 'Systeme QUIK-LOK', 'Système QUIK-LOK™'] },
  { label: 'Déneigeuses', tags: ['Deneigeuses', 'Déneigeuses', 'Fraise a neige'] },
]);

// ──── Assainissement et nettoyage ────────────────────────────────────────────

const assainissementTypeFilter = buildTagFilter('assainType', 'Type', [
  { label: 'Déboucheurs à tambours', tags: ['Deboucheurs a tambours', 'Déboucheurs à tambours'] },
  { label: 'Déboucheurs à sections', tags: ['Deboucheurs a sections', 'Déboucheurs à sections'] },
  { label: 'Tire-fils', tags: ['Tire-fils', 'Tir fil'] },
]);

// ──── Éclairage ──────────────────────────────────────────────────────────────

const eclairageTypeFilter = buildTagFilter('eclairageType', 'Type', [
  { label: 'Lampes torches', tags: ['Lampes torches', 'Lampe torche'] },
  { label: 'Lampes frontales', tags: ['Lampes frontales', 'Lampes frontales / personnelles', 'Lampe frontale'] },
  { label: 'Lampes de poche', tags: ['Lampes de poches', 'Lampes de poche', 'Lampe de poche'] },
  { label: 'Éclairages de chantier', tags: ['Eclairage de chantier', 'Éclairage de chantier', 'Eclairage portatif', 'Éclairages de chantier', 'Lampes portables'] },
  { label: 'Tours d\'éclairage', tags: ['Tours d\'eclairage', 'Tours d\'éclairage', 'Tour d\'eclairage'] },
]);

// ──── Instruments de mesure ──────────────────────────────────────────────────

const mesureTypeFilter = buildTagFilter('mesureType', 'Type', [
  { label: 'Lasers lignes', tags: ['Lasers lignes', 'Laser lignes', 'Niveaux laser'] },
  { label: 'Lasers rotatifs', tags: ['Lasers rotatifs', 'Laser rotatif'] },
  { label: 'Télémètres', tags: ['Telemetres laser', 'Télémètres laser', 'Lasermetre', 'Lasermètre', 'Lasers metres', 'Lasers mètres'] },
  { label: 'Caméras d\'inspection', tags: ['Cameras d\'inspection', 'Caméras d\'inspection', 'Camera d\'inspection'] },
  { label: 'Détecteurs', tags: ['Detecteurs de tension', 'Détecteurs de tension', 'Detecteur de canalisations'] },
  { label: 'Multimètres', tags: ['Multimetre', 'Multimètre', 'Multimetres', 'Multimètres', 'Outils de test et mesure', 'Outils de mesure / Test'] },
]);

// ──── Aspirateurs ────────────────────────────────────────────────────────────

function classifyAspirPlatform(product: Product): string {
  const title = product.title.toUpperCase();
  const tags = (product.tags || []).map(t => t.toUpperCase());

  const isM18Fuel =
    (title.includes('M18') && /M18\s+(?:F[A-Z]|ONEF|FUEL)/.test(title)) ||
    tags.some(t => t === 'M18 FUEL' || t === 'M18 FUEL™');

  const isM12Fuel =
    (title.includes('M12') && /M12\s+(?:F[A-Z]|ONEF|FUEL)/.test(title)) ||
    tags.some(t => t === 'M12 FUEL' || t === 'M12 FUEL™');

  const isM18 = title.includes('M18') || tags.includes('M18');
  const isM12 = title.includes('M12') || tags.includes('M12');

  if (isM18Fuel) return 'M18 FUEL™';
  if (isM12Fuel) return 'M12 FUEL™';
  if (isM18) return 'M18';
  if (isM12) return 'M12';
  return 'Filaire';
}

const aspirateurPlateformeFilter: ContextualFilterDef = {
  key: 'aspirateurPlateforme',
  label: 'Plateforme',
  extractValues: (products) => {
    const found = new Set<string>();
    for (const p of products) found.add(classifyAspirPlatform(p));
    const order = ['M18 FUEL™', 'M12 FUEL™', 'M18', 'M12', 'Filaire'];
    return order.filter(o => found.has(o));
  },
  matchProduct: (product, selectedValue) => classifyAspirPlatform(product) === selectedValue,
  colorMap: {
    'M18 FUEL™': '#B91C1C',
    'M18':       '#DC2626',
    'M12 FUEL™': '#0E7490',
    'M12':       '#0891B2',
    'Filaire':   '#6B7280',
  },
};

const aspirateurTypeFilter = buildTagFilter('aspirateurType', 'Type', [
  { label: 'Aspirateurs eau et poussières', tags: ['Aspirateurs eau & poussieres', 'Aspirateurs eau et poussieres', 'Aspirateurs cuve', 'Eau et poussière'] },
  { label: 'Aspirateurs portatifs / à main', tags: ['Aspirateurs portatifs', 'Aspirateurs a main', 'Aspirateurs compacts'] },
  { label: 'Aspirateurs dorsaux', tags: ['Aspirateurs dorsaux', 'Aspirateur dorsal'] },
  { label: 'Extracteurs de poussière', tags: ['Extracteurs de poussiere', 'Extracteurs', 'Extracteur', 'Aspiration pour perceuse'] },
], 'Autres');

const aspirateurCapaciteFilter = buildTagFilter('aspirateurCapacite', 'Capacité (Cuve)', [
  { label: 'Petite (< 5L)', tags: ['1 L', '2 L', '3.8 L', '5 L'] },
  { label: 'Moyenne (6L - 15L)', tags: ['6 L', '7.5 L', '9.6 L', '15 L'] },
  { label: 'Grande (> 15L)', tags: ['22.7 L', '25 L', '30 L', '38 L', '40 L'] },
]);

const aspirateurClasseFilter: ContextualFilterDef = {
  key: 'classe',
  label: 'Classe de filtration',
  extractValues: (products) => {
    const classes = new Set<string>();
    for (const p of products) {
      for (const tag of p.tags || []) {
        if (/^classe\s+[lmh]$/i.test(tag.trim())) {
          classes.add(tag.trim());
        }
      }
    }
    const order = ['l', 'm', 'h'];
    return Array.from(classes).sort((a, b) => {
      const aLetter = a.split(/\s+/)[1]?.toLowerCase() || '';
      const bLetter = b.split(/\s+/)[1]?.toLowerCase() || '';
      return order.indexOf(aLetter) - order.indexOf(bLetter);
    });
  },
  matchProduct: (product, selectedValue) => {
    return (product.tags || []).some(
      (tag) => tag.trim().toLowerCase() === selectedValue.toLowerCase()
    );
  },
  colorMap: {
    'Classe L': 'bg-emerald-500',
    'Classe M': 'bg-orange-500',
    'Classe H': 'bg-red-600',
    'classe l': 'bg-emerald-500',
    'classe m': 'bg-orange-500',
    'classe h': 'bg-red-600',
  },
};

// ──── EPI ────────────────────────────────────────────────────────────────────

const epiTypeFilter = buildTagFilter('epiType', 'Type', [
  { label: 'Chaussures de sécurité', tags: ['Chaussures de securite', 'Chaussures de sécurité'] },
  { label: 'Casques de protection', tags: ['Casques de protection', 'Casque de protection', 'Bolt 100'] },
]);

const epiNormeFilter = buildTagFilter('epiNorme', 'Norme', [
  { label: 'S1S', tags: ['S1S', 'S1PS'] },
  { label: 'S3S', tags: ['S3S'] },
  { label: 'S7S', tags: ['S7S'] },
  { label: 'Ventilé', tags: ['Ventile', 'Ventilé'] },
  { label: 'Non ventilé', tags: ['Non ventile', 'Non ventilé'] },
]);

// ──── Vêtements chauffants et de travail ─────────────────────────────────────

const vetementsTypeFilter = buildTagFilter('vetementType', 'Type', [
  { label: 'Vestes chauffantes', tags: ['Vestes chauffantes - HEXON', 'Vestes chauffantes TOUGHSHELL', 'Vestes chauffantes TOUGHSHELL™', 'Vestes chauffantes SOFTSHELL sans manches'] },
  { label: 'Sweats chauffants', tags: ['Sweats a capuche chauffants', 'Sweats à capuche chauffants', 'Sweats a capuche chauffants - HEXON', 'Sweats à capuche chauffants - HEXON'] },
  { label: 'Vêtements de travail', tags: ['Vetements de travail (Hoodies)', 'Vêtements de travail (Hoodies)', 'Vetements de travail (Zip Hoodie)', 'Vêtements de travail (Zip Hoodie)', 'Vetements de travail (Softshell)', 'Vêtements de travail (Softshell)', 'Vestes et sweats'] },
  { label: 'Pantalons de travail', tags: ['Pantalons de travail', 'Pantalon de travail'] },
  { label: 'Bonnets & Casquettes', tags: ['Bonnets / Casquettes / Bandanas', 'Bonnets et casquettes', 'Bonnet', 'Casquette'] },
]);

// ──── Batteries & Chargeurs ──────────────────────────────────────────────────

function classifyBatteriePlatform(product: Product): string {
  const title = product.title.toUpperCase();
  const tags = (product.tags || []).map(t => t.toUpperCase());

  const isMxFuel =
    title.includes('MX FUEL') ||
    tags.some(t => t === 'MX FUEL' || t === 'MX FUEL™');

  const isM18 = title.includes('M18') || tags.includes('M18');
  const isM12 = title.includes('M12') || tags.includes('M12');

  if (isMxFuel) return 'MX FUEL';
  if (isM18) return 'M18';
  if (isM12) return 'M12';
  return 'Autres';
}

const batteriesPlateformeFilter: ContextualFilterDef = {
  key: 'batteriePlateforme',
  label: 'Plateforme',
  extractValues: (products) => {
    const found = new Set<string>();
    for (const p of products) found.add(classifyBatteriePlatform(p));
    const order = ['MX FUEL', 'M18', 'M12', 'Autres'];
    return order.filter(o => found.has(o));
  },
  matchProduct: (product, selectedValue) => classifyBatteriePlatform(product) === selectedValue,
  colorMap: {
    'MX FUEL': '#7C3AED',
    'M18':     '#DC2626',
    'M12':     '#0891B2',
    'Autres':  '#6B7280',
  },
};

// ──── Registry ───────────────────────────────────────────────────────────────

const collectionConfigs: Record<string, CollectionFilterConfig> = {
  // Outils électroportatifs - sous-catégories
  'percage-et-burinage': {
    contextualFilters: [percageTypeFilter],
    showMachineTypeFilter: false,
  },
  'vissage': {
    contextualFilters: [vissageTypeFilter, vissageCoupleFilter],
    showMachineTypeFilter: false,
  },
  'meuleuses-et-polisseuses': {
    contextualFilters: [meuleusesTypeFilter, meuleusesTailleFilter],
    showMachineTypeFilter: false,
  },
  'demolition': {
    contextualFilters: [demolitionAlimFilter],
    showMachineTypeFilter: false,
  },
  'beton': {
    contextualFilters: [betonTypeFilter],
    showMachineTypeFilter: false,
  },
  'sciage-et-decoupe': {
    contextualFilters: [sciageTypeFilter],
    showMachineTypeFilter: false,
  },
  'poncage': {
    contextualFilters: [poncageAlimFilter],
    showMachineTypeFilter: false,
  },
  'sertissage': {
    contextualFilters: [sertissageTypeFilter],
    showMachineTypeFilter: false,
  },
  'radios-et-enceintes': {
    contextualFilters: [radiosTypeFilter],
    showMachineTypeFilter: false,
  },
  'autres': {
    contextualFilters: [autresTypeFilter],
    showMachineTypeFilter: false,
  },

  // Collection parente outils électroportatifs
  'outils-electroportatifs': {
    contextualFilters: [],
    showMachineTypeFilter: true,
  },

  // Collections standalone
  'batteries-chargeurs-et-generateurs': {
    contextualFilters: [batteriesTypeFilter],
    showMachineTypeFilter: false,
  },
  'batteries-chargeurs': {
    contextualFilters: [batteriesPlateformeFilter, batteriesTypeFilter],
    showMachineTypeFilter: false,
    showSystemFilter: false,
  },
  'exterieurs-et-espaces-verts': {
    contextualFilters: [exterieursTypeFilter],
    showMachineTypeFilter: false,
  },
  'assainissement-et-nettoyage': {
    contextualFilters: [assainissementTypeFilter],
    showMachineTypeFilter: false,
  },
  'eclairage': {
    contextualFilters: [eclairageTypeFilter],
    showMachineTypeFilter: false,
  },
  'instruments-de-mesure': {
    contextualFilters: [mesureTypeFilter],
    showMachineTypeFilter: false,
  },
  'aspirateurs': {
    contextualFilters: [aspirateurPlateformeFilter, aspirateurTypeFilter, aspirateurCapaciteFilter, aspirateurClasseFilter],
    showMachineTypeFilter: false,
    showSystemFilter: false,
  },
  'equipements-de-protection-epi': {
    contextualFilters: [epiTypeFilter, epiNormeFilter],
    showMachineTypeFilter: false,
  },
  'vetements-chauffants-et-de-travail': {
    contextualFilters: [vetementsTypeFilter],
    showMachineTypeFilter: false,
  },
};

const defaultConfig: CollectionFilterConfig = {
  contextualFilters: [],
  showMachineTypeFilter: true,
};

export function getCollectionFilterConfig(handle: string): CollectionFilterConfig {
  // Exact match first
  if (collectionConfigs[handle]) return collectionConfigs[handle];
  // Try matching with -N suffix stripped (e.g. "aspirateurs-2" → "aspirateurs")
  const base = handle.replace(/-\d+$/, '');
  if (base !== handle && collectionConfigs[base]) return collectionConfigs[base];
  return defaultConfig;
}
