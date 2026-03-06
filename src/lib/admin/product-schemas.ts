import {
  Hammer,
  Zap,
  Ruler,
  Wind,
  Shirt,
  Sun,
  TreePine,
  Fan,
  Wrench,
  Target,
  ListFilter,
  type LucideIcon,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SpecField = {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
  type: string; // Shopify metafield type: number_decimal, number_integer, single_line_text_field
  step?: string;
};

export type ProductSchema = {
  label: string;
  icon: LucideIcon;
  fields: SpecField[];
};

// ─── Schemas ─────────────────────────────────────────────────────────────────
//
// Pour ajouter une nouvelle catégorie :
// 1. Ajouter une entrée ci-dessous
// 2. Ajouter un pattern de détection dans DETECTION_RULES
// 3. C'est tout — l'interface s'adapte automatiquement
//

export const PRODUCT_SCHEMAS: Record<string, ProductSchema> = {
  DEFAULT: {
    label: 'Standard / Autre',
    icon: ListFilter,
    fields: [],
  },

  VISSEUSE: {
    label: 'Visseuse & Boulonneuse',
    icon: Hammer,
    fields: [
      { key: 'couple', label: 'Couple Max', unit: 'Nm', placeholder: 'ex: 1356', type: 'number_decimal', step: '0.1' },
      { key: 'vitesse_rotation', label: 'Vitesse à vide', unit: 'tr/min', placeholder: 'ex: 2000', type: 'number_integer', step: '1' },
      { key: 'cadence_frappe', label: 'Cadence', unit: 'cps/min', placeholder: 'ex: 950', type: 'number_integer', step: '1' },
      { key: 'reception', label: 'Réception', unit: '', placeholder: 'ex: ½″ Carré', type: 'single_line_text_field' },
      { key: 'voltage', label: 'Voltage', unit: 'V', placeholder: 'ex: 18', type: 'number_decimal', step: '1' },
    ],
  },

  PERFORATEUR: {
    label: 'Perforateur & Burineur',
    icon: Zap,
    fields: [
      { key: 'force_de_frappe', label: 'Force de frappe', unit: 'J', placeholder: 'ex: 2.6', type: 'number_decimal', step: '0.1' },
      { key: 'bpm', label: 'Cadence de frappe', unit: 'cps/min', placeholder: 'ex: 4600', type: 'number_integer', step: '1' },
      { key: 'cap_beton', label: 'Capacité Béton', unit: 'mm', placeholder: 'ex: 26', type: 'number_integer', step: '1' },
      { key: 'vibrations', label: 'Vibrations', unit: 'm/s²', placeholder: 'ex: 8.9', type: 'number_decimal', step: '0.1' },
      { key: 'voltage', label: 'Voltage', unit: 'V', placeholder: 'ex: 18', type: 'number_decimal', step: '1' },
    ],
  },

  SCIE: {
    label: 'Scie & Meuleuse',
    icon: Ruler,
    fields: [
      { key: 'diametre_disque', label: 'Diamètre disque/lame', unit: 'mm', placeholder: 'ex: 125', type: 'number_integer', step: '1' },
      { key: 'profondeur_coupe', label: 'Profondeur de coupe', unit: 'mm', placeholder: 'ex: 66', type: 'number_integer', step: '1' },
      { key: 'vitesse_lame', label: 'Vitesse lame', unit: 'm/s', placeholder: 'ex: 60', type: 'number_decimal', step: '0.1' },
      { key: 'alesage', label: 'Alésage', unit: 'mm', placeholder: 'ex: 20', type: 'number_integer', step: '1' },
      { key: 'voltage', label: 'Voltage', unit: 'V', placeholder: 'ex: 18', type: 'number_decimal', step: '1' },
    ],
  },

  ELAGUEUSE: {
    label: 'Élagueuse & Tronçonneuse',
    icon: TreePine,
    fields: [
      { key: 'vitesse_chaine', label: 'Vitesse chaîne', unit: 'm/s', placeholder: 'ex: 25', type: 'number_decimal', step: '0.1' },
      { key: 'longueur_guide', label: 'Longueur guide', unit: 'cm', placeholder: 'ex: 30', type: 'number_integer', step: '1' },
      { key: 'voltage', label: 'Voltage', unit: 'V', placeholder: 'ex: 18', type: 'number_decimal', step: '1' },
    ],
  },

  ECLAIRAGE: {
    label: 'Éclairage',
    icon: Sun,
    fields: [
      { key: 'lumens', label: 'Lumens', unit: 'lm', placeholder: 'ex: 3000', type: 'number_integer', step: '1' },
      { key: 'autonomie_lumiere', label: 'Autonomie', unit: 'h', placeholder: 'ex: 12', type: 'number_decimal', step: '0.5' },
      { key: 'voltage', label: 'Voltage', unit: 'V', placeholder: 'ex: 18', type: 'number_decimal', step: '1' },
    ],
  },

  SOUFFLEUR: {
    label: 'Souffleur & Aspirateur',
    icon: Fan,
    fields: [
      { key: 'debit_air', label: "Débit d'air", unit: 'm³/h', placeholder: 'ex: 720', type: 'number_integer', step: '1' },
      { key: 'vitesse_air', label: 'Vitesse air', unit: 'km/h', placeholder: 'ex: 200', type: 'number_integer', step: '1' },
      { key: 'niveau_sonore', label: 'Niveau sonore', unit: 'dB', placeholder: 'ex: 68', type: 'number_decimal', step: '0.1' },
      { key: 'voltage', label: 'Voltage', unit: 'V', placeholder: 'ex: 18', type: 'number_decimal', step: '1' },
    ],
  },

  COMPRESSEUR: {
    label: 'Compresseur & Air',
    icon: Wind,
    fields: [
      { key: 'pression_max', label: 'Pression Max', unit: 'Bar', placeholder: 'ex: 9.3', type: 'number_decimal', step: '0.1' },
      { key: 'reservoir', label: 'Réservoir', unit: 'L', placeholder: 'ex: 6', type: 'number_integer', step: '1' },
      { key: 'debit_air', label: "Débit d'air", unit: 'L/min', placeholder: 'ex: 48', type: 'number_integer', step: '1' },
      { key: 'niveau_sonore', label: 'Niveau Sonore', unit: 'dB', placeholder: 'ex: 68', type: 'number_decimal', step: '0.1' },
    ],
  },

  VETEMENT: {
    label: 'Vêtements & EPI',
    icon: Shirt,
    fields: [
      { key: 'matiere', label: 'Matière', unit: '', placeholder: 'ex: Polyester Ripstop', type: 'single_line_text_field' },
      { key: 'zones_chaleur', label: 'Zones de chaleur', unit: '', placeholder: 'ex: Poitrine, Dos', type: 'single_line_text_field' },
      { key: 'autonomie_vetement', label: 'Autonomie estimée', unit: 'h', placeholder: 'ex: 8 (M12 2.0Ah)', type: 'single_line_text_field' },
    ],
  },

  LASER: {
    label: 'Lasers & Mesure',
    icon: Target,
    fields: [
      { key: 'portee', label: 'Portée', unit: 'm', placeholder: 'ex: 30', type: 'number_integer', step: '1' },
      { key: 'couleur_faisceau', label: 'Couleur Faisceau', unit: '', placeholder: 'ex: Vert', type: 'single_line_text_field' },
      { key: 'precision', label: 'Précision', unit: 'mm/m', placeholder: 'ex: 0.3', type: 'number_decimal', step: '0.01' },
    ],
  },

  PLOMBERIE: {
    label: 'Plomberie & Sertissage',
    icon: Wrench,
    fields: [
      { key: 'diametre_sertissage', label: 'Diamètre sertissage', unit: 'mm', placeholder: 'ex: 12-108', type: 'single_line_text_field' },
      { key: 'force_sertissage', label: 'Force de sertissage', unit: 'kN', placeholder: 'ex: 32', type: 'number_decimal', step: '0.1' },
      { key: 'voltage', label: 'Voltage', unit: 'V', placeholder: 'ex: 18', type: 'number_decimal', step: '1' },
    ],
  },
};

// ─── Auto-detection ──────────────────────────────────────────────────────────

const DETECTION_RULES: [RegExp, string][] = [
  [/visseuse|boulonneuse|clé.?à.?choc|impact.?wrench/i, 'VISSEUSE'],
  [/perfo|burineur|sds/i, 'PERFORATEUR'],
  [/scie|meuleuse|disqueuse|rainureuse|tronçonneuse.?métal/i, 'SCIE'],
  [/élagueuse|tronçonneuse|hatchet|sécateur|taille/i, 'ELAGUEUSE'],
  [/éclairage|lampe|lumière|projecteur|lanterne|trueview/i, 'ECLAIRAGE'],
  [/souffleur|aspirateur/i, 'SOUFFLEUR'],
  [/compresseur/i, 'COMPRESSEUR'],
  [/veste|pull|hoodie|pantalon|gant|chaussure|epi/i, 'VETEMENT'],
  [/laser|télémètre|niveau/i, 'LASER'],
  [/sertisseuse|presse|plomberie/i, 'PLOMBERIE'],
];

export function detectSchema(title: string, tags: string[], productType: string): string {
  const text = `${title} ${tags.join(' ')} ${productType}`;
  for (const [pattern, key] of DETECTION_RULES) {
    if (pattern.test(text)) return key;
  }
  return 'DEFAULT';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retourne toutes les clés de metafields utilisées dans tous les schemas */
export function getAllMetafieldKeys(): string[] {
  const keys = new Set<string>();
  for (const schema of Object.values(PRODUCT_SCHEMAS)) {
    for (const field of schema.fields) {
      keys.add(field.key);
    }
  }
  return Array.from(keys);
}
