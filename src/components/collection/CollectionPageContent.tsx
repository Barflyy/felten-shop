'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, ArrowUpDown, ChevronDown, X, Check } from 'lucide-react';
import { Product, Menu } from '@/lib/shopify/types';
import { ProductCardCompact } from './ProductCardCompact';
import { FilterDrawer, FilterState, defaultFilters } from './FilterDrawer';
import { getCollectionFilterConfig } from '@/lib/collection-filters';
import { SortDrawer, SortOption } from './SortDrawer';
import { mainNavigation } from '@/lib/navigation';
import Link from 'next/link';

interface CollectionPageContentProps {
  products: Product[];
  collectionTitle: string;
  collectionHandle: string;
  menu: Menu | null;
}

// Machine type keywords mapping - expanded with more synonyms
const machineTypeKeywords: Record<string, string[]> = {
  // Perçage
  'perceuses': ['perceuse', 'perçage', 'drill'],
  'perforateurs': ['perforateur', 'burineur', 'rotary hammer', 'sds', 'burinage'],
  'perçage et burinage': ['perceuse', 'perforateur', 'perçage', 'burineur', 'drill', 'sds'],
  // Vissage
  'visseuses': ['visseuse', 'tournevis', 'screwdriver'],
  'visseuses à chocs': ['visseuse à chocs', 'impact', 'chocs', 'boulonneuse'],
  'visseuses à percussion': ['visseuse à percussion', 'percussion', 'impact'],
  'vissage': ['visseuse', 'vissage', 'tournevis'],
  // Découpe
  'scies': ['scie', 'saw', 'circulaire', 'sabre', 'sauteuse', 'onglet', 'découpe'],
  'scies circulaires': ['scie circulaire', 'circulaire'],
  'scies sabres': ['scie sabre', 'sabre'],
  'scies sauteuses': ['scie sauteuse', 'sauteuse'],
  'découpe': ['scie', 'découpe', 'coupe', 'saw'],
  // Meulage
  'meuleuses': ['meuleuse', 'grinder', 'disqueuse'],
  'meulage': ['meuleuse', 'meulage', 'grinder'],
  // Ponçage
  'ponceuses': ['ponceuse', 'sander', 'polisseuse', 'ponçage'],
  'ponçage': ['ponceuse', 'ponçage', 'sander'],
  // Fixation
  'riveteuses': ['riveteuse', 'rivet'],
  'cloueuses': ['cloueuse', 'agrafeuse', 'nailer', 'clouage'],
  'fixation': ['riveteuse', 'cloueuse', 'agrafeuse', 'fixation'],
  // Aspiration
  'aspirateurs': ['aspirateur', 'vacuum', 'extracteur', 'aspiration'],
  'aspiration': ['aspirateur', 'aspiration', 'extracteur'],
  // Éclairage
  'éclairage': ['lampe', 'projecteur', 'light', 'éclairage', 'lanterne', 'torche'],
  // Audio
  'radio': ['radio', 'enceinte', 'bluetooth', 'speaker'],
  // Énergie
  'batteries': ['batterie', 'battery', 'accu'],
  'chargeurs': ['chargeur', 'charger'],
  'énergie': ['batterie', 'chargeur', 'energy'],
  // Électroportatif
  'outils électroportatifs': ['électroportatif', 'sans fil', 'cordless'],
  // Autres
  'accessoires': ['accessoire', 'embout', 'lame', 'disque', 'foret'],
  'rangement': ['rangement', 'caisse', 'coffret', 'packout'],
  'mesure': ['mesure', 'niveau', 'laser', 'mètre', 'télémètre'],
  'plomberie': ['plomberie', 'déboucheur', 'sertisseuse', 'coupe-tube'],
  'électricité': ['électricité', 'pince', 'dénudeur', 'sertissage'],
};

// System options for sidebar
const systemOptions = [
  { value: 'M18 FUEL', label: 'M18 FUEL', sublabel: '18V Brushless Pro', color: 'bg-[#DB021D]' },
  { value: 'M12 FUEL', label: 'M12 FUEL', sublabel: '12V Brushless Pro', color: 'bg-[#DB021D]' },
  { value: 'M18 Brushless', label: 'M18 Brushless', sublabel: '18V Sans balais', color: 'bg-emerald-500' },
  { value: 'M12 Brushless', label: 'M12 Brushless', sublabel: '12V Sans balais', color: 'bg-emerald-500' },
  { value: 'MX FUEL', label: 'MX FUEL', sublabel: 'Puissance max', color: 'bg-orange-500' },
  { value: 'Filaire', label: 'Filaire', sublabel: 'Secteur 230V', color: 'bg-blue-500' },
  { value: 'Autres', label: 'Autres', sublabel: 'Accessoires & divers', color: 'bg-gray-400' },
];

const PRODUCTS_PER_LOAD = 20;

/* ── Desktop Sidebar Accordion with Framer Motion ── */
function SidebarAccordion({ title, defaultOpen = true, sectionKey, openSections, onToggle, children }: {
  title: string;
  defaultOpen?: boolean;
  sectionKey: string;
  openSections: string[];
  onToggle: (key: string) => void;
  children: React.ReactNode;
}) {
  const isOpen = openSections.includes(sectionKey);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between px-3.5 py-3"
      >
        <span className="text-[13px] font-bold text-[#1A1A1A]">{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ChevronDown className="w-4 h-4 text-[#6B7280]" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CollectionPageContent({
  products,
  collectionTitle,
  collectionHandle,
  menu,
}: CollectionPageContentProps) {
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false); // Mobile sort drawer
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false); // Desktop sort dropdown
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    priceRange: [0, 2000],
    system: [],
    machineType: [],
    availability: [],
    contextual: {},
  });

  const filterConfig = useMemo(() => getCollectionFilterConfig(collectionHandle), [collectionHandle]);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD);
  // Open system + all contextual filters + budget by default
  const [sidebarSections, setSidebarSections] = useState<string[]>(() => {
    const initial = ['system', 'price'];
    const cfg = getCollectionFilterConfig(collectionHandle);
    for (const f of cfg.contextualFilters) initial.push(f.key);
    if (cfg.showMachineTypeFilter) initial.push('machineType');
    return initial;
  });

  // Count products per system option (for sidebar counts)
  const systemCounts = useMemo(() => {
    const classify = (product: Product) => {
      const title = product.title.toLowerCase();
      const tags = (product.tags || []).map(t => t.toLowerCase());
      const hasBatteryKw = title.includes('batterie') || title.includes('battery') || title.includes('redlithium') || title.includes('red lithium');
      const hasAh = /\d+[.,]?\d*\s*ah/i.test(title);
      const isBat = hasBatteryKw || hasAh;
      const isMx = title.includes('mx fuel') || title.includes('mxfuel');
      const isM18 = title.includes('m18') || tags.includes('m18');
      const isM12 = title.includes('m12') || tags.includes('m12');
      const hasFuel = title.includes('fuel') || tags.includes('fuel');

      if (isMx) return 'MX FUEL';
      if (!isBat && isM18 && hasFuel && !isMx) return 'M18 FUEL';
      if (!isBat && isM12 && hasFuel) return 'M12 FUEL';
      if (!isBat && isM18 && !hasFuel) return 'M18 Brushless';
      if (!isBat && isM12 && !hasFuel) return 'M12 Brushless';
      if (title.includes('filaire') || /\b(230|220|240)\s*v\b/i.test(title) || title.includes('secteur') || title.includes('corded') || title.includes('électrique')) return 'Filaire';
      return 'Autres';
    };

    const counts: Record<string, number> = {};
    for (const opt of systemOptions) {
      counts[opt.value] = products.filter(p => classify(p) === opt.value).length;
    }
    return counts;
  }, [products]);

  // Extract available contextual filter values for quick chips
  const contextualFilterValues = useMemo(() => {
    return filterConfig.contextualFilters.map((def) => ({
      key: def.key,
      label: def.label,
      values: def.extractValues(products),
      colorMap: def.colorMap,
    }));
  }, [filterConfig, products]);

  // Toggle a contextual filter chip
  const toggleContextualChip = (filterKey: string, value: string) => {
    const current = activeFilters.contextual[filterKey] || [];
    const isActive = current.includes(value);
    const updated = isActive
      ? current.filter((v) => v !== value)
      : [...current, value];
    setActiveFilters({
      ...activeFilters,
      contextual: {
        ...activeFilters.contextual,
        [filterKey]: updated,
      },
    });
    setVisibleCount(PRODUCTS_PER_LOAD);
  };

  // Toggle sidebar section expand/collapse
  const toggleSidebarSection = (section: string) => {
    setSidebarSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // Toggle a system filter (immediate apply for sidebar)
  const toggleSystem = (value: string) => {
    const updated = activeFilters.system.includes(value)
      ? activeFilters.system.filter(v => v !== value)
      : [...activeFilters.system, value];
    setActiveFilters({ ...activeFilters, system: updated });
    setVisibleCount(PRODUCTS_PER_LOAD);
  };

  // Toggle a price preset
  const setPriceRange = (min: number, max: number) => {
    setActiveFilters({ ...activeFilters, priceRange: [min, max] });
    setVisibleCount(PRODUCTS_PER_LOAD);
  };

  // Calculate active filters count
  const contextualCount = Object.values(activeFilters.contextual).reduce((sum, arr) => sum + arr.length, 0);
  const activeFiltersCount =
    activeFilters.system.length +
    activeFilters.machineType.length +
    activeFilters.availability.length +
    contextualCount +
    (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 2000 ? 1 : 0);

  // Sort and filter products
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by price
    if (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 2000) {
      result = result.filter((product) => {
        const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');
        return price >= activeFilters.priceRange[0] && price <= activeFilters.priceRange[1];
      });
    }

    // Filter by system — uses same classify logic as systemCounts
    if (activeFilters.system.length > 0) {
      result = result.filter((product) => {
        const title = product.title.toLowerCase();
        const tags = (product.tags || []).map(t => t.toLowerCase());
        const hasBatteryKw = title.includes('batterie') || title.includes('battery') || title.includes('redlithium') || title.includes('red lithium');
        const hasAh = /\d+[.,]?\d*\s*ah/i.test(title);
        const isBat = hasBatteryKw || hasAh;
        const isMx = title.includes('mx fuel') || title.includes('mxfuel');
        const isM18 = title.includes('m18') || tags.includes('m18');
        const isM12 = title.includes('m12') || tags.includes('m12');
        const hasFuel = title.includes('fuel') || tags.includes('fuel');

        return activeFilters.system.some((s) => {
          if (s === 'MX FUEL') return isMx;
          if (s === 'M18 FUEL') return !isBat && isM18 && hasFuel && !isMx;
          if (s === 'M12 FUEL') return !isBat && isM12 && hasFuel;
          if (s === 'M18 Brushless') return !isBat && isM18 && !hasFuel;
          if (s === 'M12 Brushless') return !isBat && isM12 && !hasFuel;
          if (s === 'Filaire') return title.includes('filaire') || /\b(230|220|240)\s*v\b/i.test(title) || title.includes('secteur') || title.includes('corded') || title.includes('électrique');
          if (s === 'Autres') return !isM18 && !isM12 && !isMx && !title.includes('filaire') && !/\b(230|220|240)\s*v\b/i.test(title);
          return false;
        });
      });
    }

    // Filter by machine type
    if (activeFilters.machineType.length > 0) {
      result = result.filter((product) => {
        const title = product.title.toLowerCase();
        const description = (product.description || '').toLowerCase();
        const searchText = `${title} ${description}`;

        return activeFilters.machineType.some((type) => {
          // Look up keywords using lowercase key
          const keywords = machineTypeKeywords[type.toLowerCase()] || [type.toLowerCase()];
          return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
        });
      });
    }

    // Contextual filters
    for (const def of filterConfig.contextualFilters) {
      const selected = activeFilters.contextual[def.key];
      if (selected && selected.length > 0) {
        result = result.filter((product) =>
          selected.some((val) => def.matchProduct(product, val))
        );
      }
    }

    // Helper function to check if product is a battery
    const isBatteryProduct = (title: string): boolean => {
      const t = title.toLowerCase();
      const hasBatteryKw = t.includes('batterie') || t.includes('battery') || t.includes('redlithium') || t.includes('red lithium');
      const hasChargerKw = t.includes('chargeur') || t.includes('charger');
      const hasPackKw = t.includes('pack nrg') || t.includes('pack forge') || t.includes('pack hnrg');
      const hasAh = /\d+[.,]?\d*\s*ah/i.test(t);
      return hasBatteryKw || hasChargerKw || hasPackKw || hasAh;
    };

    // Helper function to get battery type priority (Forge > High Output > Red Lithium)
    const getBatteryTypePriority = (title: string): number => {
      const t = title.toLowerCase();
      if (t.includes('forge')) return 0;
      if (t.includes('high output') || t.includes('high-output') || t.includes('highoutput') || t.includes('ho ') || t.includes(' ho')) return 1;
      return 2; // Red Lithium (default)
    };

    // Helper function to get system priority for sorting
    const getSystemPriority = (title: string, tags?: string[]): number => {
      const t = title.toLowerCase();
      const tagsLower = (tags || []).map(tag => tag.toLowerCase());
      const isBattery = isBatteryProduct(t);

      // Batteries: MX FUEL > M18 > M12
      if (isBattery) {
        if (t.includes('mx fuel') || t.includes('mxfuel') || t.startsWith('mxf ') || t.startsWith('mxf-') || tagsLower.includes('mx fuel')) return 0;
        if (t.includes('m18')) return 1;
        if (t.includes('m12')) return 2;
        return 6; // Other batteries
      }

      // Tools — check title AND tags
      if (t.includes('mx fuel') || t.includes('mxfuel') || t.startsWith('mxf ') || t.startsWith('mxf-') || tagsLower.includes('mx fuel')) return 0;
      if ((t.includes('m18') || tagsLower.includes('m18')) && (t.includes('fuel') || tagsLower.includes('fuel'))) return 1;
      if ((t.includes('m12') || tagsLower.includes('m12')) && (t.includes('fuel') || tagsLower.includes('fuel'))) return 2;
      if (t.includes('m18') || tagsLower.includes('m18')) return 3;
      if (t.includes('m12') || tagsLower.includes('m12')) return 4;
      if (t.includes('filaire') || tagsLower.includes('filaire') || t.includes('230v') || t.includes('220v') || t.includes('240v') || t.includes('secteur') || t.includes('corded') || t.includes('électrique')) return 5;
      return 6; // Autres
    };

    // Helper function to extract Ah value from battery title
    const extractAhValue = (title: string): number => {
      const t = title.toLowerCase();
      const ahMatch = t.match(/(\d+(?:[.,]\d+)?)\s*ah/);
      if (ahMatch) return parseFloat(ahMatch[1].replace(',', '.'));
      return 0;
    };

    // Mapping of Milwaukee wireless tool specs for sorting (Nm values)
    const wirelessToolSpecs: Record<string, number> = {
      // M18 FUEL Perceuses à percussion (Nm)
      'FPD3': 158, 'FPD2': 135, 'ONEPD2': 135, 'FPDX': 158, 'FPD': 135,
      // M18 FUEL Visseuses à chocs (Nm)
      'FID3': 226, 'FID2': 203, 'ONEFID': 203, 'FID': 180,
      // M18 Brushless
      'BLPD2': 82, 'BLDD2': 60, 'BLPD': 82, 'BLDD': 60,
      // M18 FUEL Boulonneuses (Nm)
      'FHIWF1': 2033, 'FHIWF34': 1627, 'ONEFHIWF1': 2033, 'ONEFHIWF34': 1627,
      'FMTIW2F12': 1356, 'FMTIW2F38': 881, 'FIW2F12': 339, 'FIW2F38': 271, 'FIW2P12': 339,
      'CHIW': 610, 'CHIWF': 610, // Compact High Torque
      // M18 FUEL Clés à cliquet
      'FTR': 203, 'FIR': 271, 'FHIR': 340,
      // M12 FUEL (Nm)
      'M12FPD': 45, 'M12FPDX': 45, 'M12FID': 163, 'M12FQID': 135,
      'M12BLPD': 40, 'M12BLDD': 30, 'M12FIR': 68, 'M12FHIR': 102,
      // Visseuses placo
      'FSG': 26, 'FSGC': 26,
    };

    // Mapping of tool Joules specs for perforateurs/démolition
    const toolJoulesSpecs: Record<string, number> = {
      // MX FUEL Perforateurs/Démolition (les plus puissants)
      'MXFDHB': 20, 'MXFDH': 9, 'MXF DH': 9, 'MXFDB': 25,
      // M18 FUEL Perforateurs SDS-Max
      'FHM': 9.0, 'FHX': 12.5, 'ONEFHX': 12.5,
      // M18 FUEL Perforateurs SDS-Plus
      'FH': 2.5, 'ONEFHPX': 3.5, 'FHP': 2.0, 'FHPX': 3.5,
      'CHX': 5.0, 'CHPX': 4.0, 'CH': 2.5,
      // M12 Perforateurs
      'M12FH': 1.4, 'M12CH': 1.1,
      // Marteaux démolisseurs
      'FBH': 6.0, 'FBHX': 8.0,
      // Corded perforateurs
      'PH30': 6.1, 'PH28': 4.8, 'PH27': 3.8, 'PH26': 3.0,
      'K850S': 10.0, 'K750S': 7.5, 'K545S': 6.0, 'K500S': 5.0,
      'PLH32': 4.8, 'PLHX': 6.0,
    };

    // Mapping for meuleuses (mm disc size)
    const meuleuseSizes: Record<string, number> = {
      'CAG': 125, 'FCAG': 125, 'ONEFSAG': 125, // Compact Angle Grinder
      'FLAG': 125, 'FHSAG': 125, // Full-size grinders
      'FSAG': 180, 'ONELSAG': 180, // Large grinders
      'AGV': 125, 'AG': 125, // Corded
    };

    // Mapping for scies (mm blade size or courses/min)
    const scieSpecs: Record<string, number> = {
      // Scies circulaires (mm lame)
      'FCS': 190, 'CCS': 165, 'FCCS': 190, 'M12FCOT': 140,
      'FPS': 305, // Scie à onglet
      // Scies sabres (courses/min)
      'FSZ': 3000, 'ONEFSZ': 3000, 'CSX': 3000, 'SSPE': 3000,
      // Scies sauteuses (courses/min)
      'FJS': 3500, 'JS': 3000,
      // Scies à ruban
      'FBS': 150, 'CBS': 127, 'DBS': 127,
    };

    // Categories that should sort by Joules
    const joulesCategories = [
      'perforateur', 'sds-max', 'sds-plus', 'demolition', 'burineur', 'marteau'
    ];

    // Categories that should sort by mm (disc/blade size)
    const mmCategories = [
      'meuleuse', 'scie-circulaire', 'scie-plongeante', 'scie-radiale',
      'tronconneuse', 'rainureuse', 'carotteuse'
    ];

    // Categories that should sort by Nm
    const nmCategories = [
      'perceuse', 'visseuse', 'boulonneuse', 'cle', 'cliquet', 'vissage'
    ];

    // Helper function to extract power value based on category
    const extractPowerValue = (title: string, handle: string = ''): number => {
      const t = title.toLowerCase();
      const h = handle.toLowerCase();
      const titleUpper = title.toUpperCase();
      const refMatch = title.match(/-\s*([A-Z0-9-]+)$/);
      const ref = refMatch ? refMatch[1].toUpperCase() : '';

      // Determine category type from collection handle
      const isJoulesCategory = joulesCategories.some(cat => h.includes(cat) || t.includes(cat));
      const isMmCategory = mmCategories.some(cat => h.includes(cat));
      const isNmCategory = nmCategories.some(cat => h.includes(cat) || t.includes(cat));

      // === JOULES (Perforateurs, Démolition) ===
      if (isJoulesCategory || t.includes('perforateur') || t.includes('burineur') ||
        t.includes('sds-max') || t.includes('sds max') || t.includes('sds-plus') || t.includes('sds plus') ||
        t.includes('démolisseur') || t.includes('demolisseur')) {

        // Try to extract Joules from title
        const jMatch = t.match(/(\d+(?:[.,]\d+)?)\s*j(?:oules?)?(?:\s|$|,)/i);
        if (jMatch) return parseFloat(jMatch[1].replace(',', '.')) * 10000;

        // Try from specs mapping
        for (const [pattern, joules] of Object.entries(toolJoulesSpecs)) {
          if (titleUpper.includes(pattern) || ref.includes(pattern)) {
            return joules * 10000;
          }
        }
      }

      // === NM (Perceuses, Visseuses, Boulonneuses) ===
      if (isNmCategory || t.includes('perceuse') || t.includes('visseuse') ||
        t.includes('boulonneuse') || t.includes('cliquet')) {

        // Try to extract Nm from title
        const nmMatch = t.match(/(\d+)\s*nm/i);
        if (nmMatch) return parseInt(nmMatch[1], 10) * 1000;

        // Try from wireless tool specs mapping
        for (const [pattern, nm] of Object.entries(wirelessToolSpecs)) {
          if (titleUpper.includes(pattern) || ref.includes(pattern)) {
            return nm * 1000;
          }
        }
      }

      // === MM (Meuleuses, Scies) ===
      if (isMmCategory || t.includes('meuleuse') || t.includes('scie') ||
        t.includes('rainureuse') || t.includes('tronçonneuse')) {

        // Try to extract mm from title
        const mmMatch = t.match(/(\d{2,3})\s*mm/i);
        if (mmMatch) {
          const mm = parseInt(mmMatch[1], 10);
          // For grinders: bigger disc = more powerful (multiply by 100)
          if (t.includes('meuleuse') || h.includes('meuleuse')) {
            return mm * 100;
          }
          // For saws: bigger blade = more powerful
          return mm * 10;
        }

        // Try from meuleuse mapping
        for (const [pattern, mm] of Object.entries(meuleuseSizes)) {
          if (titleUpper.includes(pattern) || ref.includes(pattern)) {
            return mm * 100;
          }
        }

        // Try from scie mapping
        for (const [pattern, value] of Object.entries(scieSpecs)) {
          if (titleUpper.includes(pattern) || ref.includes(pattern)) {
            return value * 10;
          }
        }
      }

      // === FALLBACK: Try all metrics ===

      // Joules
      const jMatch = t.match(/(\d+(?:[.,]\d+)?)\s*j(?:oules?)?(?:\s|$|,)/i);
      if (jMatch) return parseFloat(jMatch[1].replace(',', '.')) * 10000;

      // Nm
      const nmMatch = t.match(/(\d+)\s*nm/i);
      if (nmMatch) return parseInt(nmMatch[1], 10) * 1000;

      // Try wireless specs
      for (const [pattern, nm] of Object.entries(wirelessToolSpecs)) {
        if (titleUpper.includes(pattern) || ref.includes(pattern)) {
          return nm * 1000;
        }
      }

      // Watts
      const wMatch = t.match(/(\d+)\s*w(?:atts?)?(?:\s|$|,|\.)/i);
      if (wMatch) return parseInt(wMatch[1], 10);

      // mm
      const mmMatch = t.match(/(\d{2,3})\s*mm/i);
      if (mmMatch) return parseInt(mmMatch[1], 10);

      return 0;
    };

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort(
          (a, b) =>
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0')
        );
        break;
      case 'price-desc':
        result.sort(
          (a, b) =>
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0')
        );
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'capacity-desc':
        // Sort by Ah capacity (highest first)
        result.sort((a, b) => {
          const ahA = extractAhValue(a.title);
          const ahB = extractAhValue(b.title);
          if (ahA !== ahB) return ahB - ahA;
          return a.title.localeCompare(b.title);
        });
        break;
      default:
        // Default: sort by system priority, then by power/capacity (descending)
        result.sort((a, b) => {
          const priorityA = getSystemPriority(a.title, a.tags);
          const priorityB = getSystemPriority(b.title, b.tags);
          if (priorityA !== priorityB) return priorityA - priorityB;

          // Group products by product line (ordered by priority)
          const getProductLine = (title: string): number => {
            const t = title.toLowerCase();
            // Battery/charger product lines
            if (t.includes('forge') && !t.includes('chargeur') && !t.includes('pack') && !t.includes('kit')) return 1;  // Batteries Forge
            if (t.includes('high output') && !t.includes('pack')) return 2;  // Batteries High Output
            if (t.includes('red lithium') || t.includes('redlithium')) return 3;  // Batteries Red Lithium
            if (t.includes('pack') && t.includes('forge')) return 4;  // Pack Forge NRG
            if (t.includes('pack') && t.includes('high output')) return 5;  // Pack High Output
            if (t.includes('pack') && t.includes('nrg')) return 6;  // Pack NRG
            if (t.includes('kit') && t.includes('forge')) return 7;  // Kit Forge
            if (t.includes('super chargeur')) return 8;  // Super Chargeurs
            if (t.includes('chargeur')) return 9;  // Chargeurs
            if (t.includes('mini chargeur') || t.includes('top-off') || t.includes('top off')) return 10;
            // Tool product lines
            if (t.includes('extracteur')) return 20;
            if (t.includes('nexus')) return 21;
            if (t.includes('packout')) return 22;
            if (t.includes('one-key') || t.includes('onekey') || t.includes('one key')) return 23;
            return 15; // Others
          };
          const lineA = getProductLine(a.title);
          const lineB = getProductLine(b.title);
          if (lineA !== lineB) return lineA - lineB;

          // Check if both are batteries
          const isBatteryA = isBatteryProduct(a.title);
          const isBatteryB = isBatteryProduct(b.title);

          if (isBatteryA && isBatteryB) {
            // Same line: sort by Ah (highest first)
            const ahA = extractAhValue(a.title);
            const ahB = extractAhValue(b.title);
            if (ahA !== ahB) return ahB - ahA;

            return a.title.localeCompare(b.title);
          }

          // Not batteries: sort by power (highest first)
          const powerA = extractPowerValue(a.title, collectionHandle);
          const powerB = extractPowerValue(b.title, collectionHandle);
          if (powerA !== powerB) return powerB - powerA;

          // Same power: sort alphabetically
          return a.title.localeCompare(b.title);
        });
        break;
    }

    return result;
  }, [products, sortBy, activeFilters, filterConfig]);

  // Handler to apply filters and reset visible count
  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters);
    setVisibleCount(PRODUCTS_PER_LOAD);
  };

  // Handler for sort change
  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setVisibleCount(PRODUCTS_PER_LOAD);
  };

  // Visible products (load more approach)
  const visibleProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, visibleCount);
  }, [filteredAndSortedProducts, visibleCount]);

  const hasMoreProducts = visibleCount < filteredAndSortedProducts.length;
  const remainingProducts = filteredAndSortedProducts.length - visibleCount;

  // Handle load more
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + PRODUCTS_PER_LOAD);
  };

  // Build breadcrumb from navigation hierarchy
  const breadcrumb = useMemo(() => {
    const crumbs: { label: string; href?: string }[] = [{ label: 'Accueil', href: '/' }];
    if (collectionHandle === 'all') {
      crumbs.push({ label: 'Tous les produits' });
      return crumbs;
    }
    // Find parent category matching this collection
    for (const parent of mainNavigation) {
      const parentHandle = parent.url.replace('/collections/', '');
      // Check if current handle matches parent (with possible -1, -2 suffix)
      if (collectionHandle === parentHandle || collectionHandle.startsWith(parentHandle + '-')) {
        crumbs.push({ label: parent.title });
        return crumbs;
      }
      // Check subcategories
      if (parent.items) {
        for (const child of parent.items) {
          const childHandle = child.url.replace('/collections/', '');
          if (collectionHandle === childHandle || collectionHandle.startsWith(childHandle + '-')) {
            crumbs.push({ label: parent.title, href: parent.url });
            crumbs.push({ label: child.title });
            return crumbs;
          }
        }
      }
    }
    // Fallback: just show collection title
    crumbs.push({ label: collectionTitle });
    return crumbs;
  }, [collectionHandle, collectionTitle]);

  return (
    <>
      {/* Collection Header — Premium App-Like Design */}
      <section className="bg-[#FAFAFA] border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 pt-6 lg:pt-14 pb-6 lg:pb-8">
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" className="mb-4 lg:mb-8">
            <ol className="flex items-center gap-2 text-[12px] lg:text-[13px] font-medium text-[#6B7280]">
              {breadcrumb.map((crumb, i) => (
                <li key={i} className="flex items-center gap-2">
                  {i > 0 && <ChevronDown className="w-3 h-3 -rotate-90 text-gray-400" />}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-[#DB021D] transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-[#1A1A1A] font-bold">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Title row + Sort (desktop) */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex flex-col gap-2"
            >
              <h1
                className="text-[32px] lg:text-[48px] font-black uppercase text-[#1A1A1A] leading-none tracking-tight"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                {collectionTitle}
              </h1>
              <span className="inline-flex items-center gap-2 text-[13px] lg:text-sm font-semibold text-[#6B7280] uppercase tracking-wider">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#DB021D]" />
                {filteredAndSortedProducts.length} produit{filteredAndSortedProducts.length > 1 ? 's' : ''}
              </span>
            </motion.div>

            {/* Desktop sort — Sleek Dropdown */}
            <div className="hidden lg:block relative z-30">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-bold text-[#1A1A1A] hover:border-[#1A1A1A] hover:shadow-sm transition-all"
              >
                <ArrowUpDown className="w-4 h-4 text-[#DB021D]" />
                <span>
                  Trier par : {sortBy === 'featured' && 'Par défaut'}
                  {sortBy === 'popular' && 'Popularité'}
                  {sortBy === 'capacity-desc' && 'Capacité'}
                  {sortBy === 'price-asc' && 'Prix ↑'}
                  {sortBy === 'price-desc' && 'Prix ↓'}
                  {sortBy === 'name-asc' && 'A-Z'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isSortDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSortDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white border border-gray-100 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] z-50 py-1.5 overflow-hidden"
                    >
                      {([
                        { value: 'featured' as SortOption, label: 'Par défaut' },
                        { value: 'popular' as SortOption, label: 'Popularité' },
                        { value: 'capacity-desc' as SortOption, label: 'Capacité (Ah)' },
                        { value: 'price-asc' as SortOption, label: 'Prix croissant' },
                        { value: 'price-desc' as SortOption, label: 'Prix décroissant' },
                        { value: 'name-asc' as SortOption, label: 'Nom A-Z' },
                      ]).map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleSortChange(option.value);
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors ${sortBy === option.value
                            ? 'text-[#DB021D] font-bold bg-[#F9F9F9]'
                            : 'text-[#1A1A1A] font-medium hover:bg-[#F5F5F5]'
                            }`}
                        >
                          {option.label}
                          {sortBy === option.value && <Check className="w-4 h-4" strokeWidth={3} />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Quick Filter Chips ── */}
          {(contextualFilterValues.some(f => f.values.length > 1) || products.length > 5) && (
            <div className="flex items-center gap-2 overflow-x-auto mt-3 pb-1 snap-x" style={{ scrollbarWidth: 'none' }}>
              {contextualFilterValues.map((filter) => {
                if (filter.values.length <= 1) return null;
                const activeValues = activeFilters.contextual[filter.key] || [];
                return filter.values.map((value) => {
                  const isActive = activeValues.includes(value);
                  const dotColor = filter.colorMap?.[value];
                  const hasDot = dotColor?.startsWith('#');
                  return (
                    <button
                      key={`${filter.key}-${value}`}
                      onClick={() => toggleContextualChip(filter.key, value)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] lg:text-[13px] font-bold transition-all duration-200 active:scale-95 border ${isActive
                        ? 'text-white border-[#DB021D] shadow-[0_2px_8px_rgba(219,2,29,0.25)]'
                        : 'bg-white text-[#1A1A1A] border-gray-200 hover:border-[#1A1A1A] shadow-sm hover:shadow'
                        }`}
                      style={isActive ? {
                        backgroundColor: hasDot ? dotColor : '#DB021D',
                        borderColor: hasDot ? dotColor : '#DB021D',
                        boxShadow: hasDot ? `0 2px 8px ${dotColor}40` : undefined,
                      } : undefined}
                    >
                      {hasDot && (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.6)' : dotColor }}
                        />
                      )}
                      {value}
                    </button>
                  );
                });
              })}
              {['M18', 'M12'].map((sys) => {
                const fuelVal = `${sys} FUEL`;
                const blVal = `${sys} Brushless`;
                const isActive = activeFilters.system.includes(fuelVal) || activeFilters.system.includes(blVal);
                return (
                  <button
                    key={sys}
                    onClick={() => {
                      const hasEither = activeFilters.system.includes(fuelVal) || activeFilters.system.includes(blVal);
                      const updated = hasEither
                        ? activeFilters.system.filter(s => s !== fuelVal && s !== blVal)
                        : [...activeFilters.system, fuelVal, blVal];
                      setActiveFilters({ ...activeFilters, system: updated });
                      setVisibleCount(PRODUCTS_PER_LOAD);
                    }}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] lg:text-[13px] font-bold border transition-all duration-200 active:scale-95 shadow-sm ${isActive
                      ? 'bg-[#DB021D] text-white border-[#DB021D] shadow-[0_2px_8px_rgba(219,2,29,0.25)]'
                      : 'bg-white text-[#1A1A1A] border-gray-200 hover:border-[#1A1A1A] hover:bg-[#F9F9F9]'
                      }`}
                  >
                    {sys}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ── Fixed Bottom Bar (Mobile) — CLEAN WHITE DESIGN ── */}
      <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
        <div className="flex items-center bg-[#1A1A1A] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.25)] overflow-hidden h-14 border border-white/10">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2.5 h-full active:bg-white/10 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-white" strokeWidth={2.5} />
            <span className="text-[13px] font-bold text-white uppercase tracking-wider">
              Filtres
            </span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 bg-[#DB021D] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="w-[1px] h-6 bg-white/20" />

          <button
            onClick={() => setIsSortOpen(true)}
            className="flex-1 flex items-center justify-center gap-2.5 h-full active:bg-white/10 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4 text-white" strokeWidth={2.5} />
            <span className="text-[13px] font-bold text-white uppercase tracking-wider">
              Trier
            </span>
          </button>
        </div>
      </div>

      {/* Desktop sort toolbar removed — sort is now inline in header */}

      {/* Mobile Active Filters Tags */}
      {activeFiltersCount > 0 && (
        <div className="bg-[#F5F5F5] border-b border-gray-100 lg:hidden">
          <div className="px-4 py-2.5">
            <div className="flex flex-wrap gap-1.5 items-center">
              {activeFilters.system.map((s) => (
                <button
                  key={s}
                  onClick={() => handleApplyFilters({
                    ...activeFilters,
                    system: activeFilters.system.filter(x => x !== s)
                  })}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#DB021D] rounded-lg text-[11px] font-semibold text-white"
                >
                  {s}
                  <X className="w-3 h-3" />
                </button>
              ))}
              {Object.entries(activeFilters.contextual).map(([key, values]) =>
                values.map((val) => (
                  <button
                    key={`${key}-${val}`}
                    onClick={() => handleApplyFilters({
                      ...activeFilters,
                      contextual: {
                        ...activeFilters.contextual,
                        [key]: activeFilters.contextual[key]!.filter(v => v !== val),
                      },
                    })}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#DB021D] rounded-lg text-[11px] font-semibold text-white"
                  >
                    {val}
                    <X className="w-3 h-3" />
                  </button>
                ))
              )}
              {activeFilters.machineType.map((type) => (
                <button
                  key={type}
                  onClick={() => handleApplyFilters({
                    ...activeFilters,
                    machineType: activeFilters.machineType.filter(t => t !== type)
                  })}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#DB021D] rounded-lg text-[11px] font-semibold text-white"
                >
                  {type}
                  <X className="w-3 h-3" />
                </button>
              ))}
              {(activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 2000) && (
                <button
                  onClick={() => handleApplyFilters({
                    ...activeFilters,
                    priceRange: [0, 2000]
                  })}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#DB021D] rounded-lg text-[11px] font-semibold text-white"
                >
                  {activeFilters.priceRange[0]}&euro; - {activeFilters.priceRange[1]}&euro;
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => handleApplyFilters(defaultFilters)}
                className="text-[11px] text-[#DB021D] font-semibold ml-auto py-1"
              >
                Tout effacer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid + Desktop Sidebar */}
      <section className="bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-4 lg:py-6 pb-32 lg:pb-8">
          <div className="lg:flex lg:gap-6">

            {/* ===== Desktop Sidebar ===== */}
            <aside className="hidden lg:block lg:w-[260px] lg:flex-shrink-0">
              <div className="sticky top-[84px] space-y-3 pb-8">
                {/* Reset button — only when filters active */}
                <AnimatePresence>
                  {activeFiltersCount > 0 && (
                    <motion.button
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleApplyFilters(defaultFilters)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#DB021D]/10 text-[#DB021D] hover:bg-[#DB021D]/15 transition-colors text-[12px] font-bold"
                    >
                      <X className="w-3 h-3" />
                      R&eacute;initialiser les filtres ({activeFiltersCount})
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Active filter tags */}
                <AnimatePresence>
                  {activeFiltersCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-wrap gap-1.5"
                    >
                      {activeFilters.system.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleApplyFilters({ ...activeFilters, system: activeFilters.system.filter(x => x !== s) })}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[#DB021D] rounded-md text-[11px] font-semibold text-white hover:bg-[#B8011A] transition-colors"
                        >
                          {s}
                          <X className="w-3 h-3" />
                        </button>
                      ))}
                      {Object.entries(activeFilters.contextual).map(([key, values]) =>
                        values.map((val) => (
                          <button
                            key={`${key}-${val}`}
                            onClick={() => handleApplyFilters({
                              ...activeFilters,
                              contextual: { ...activeFilters.contextual, [key]: activeFilters.contextual[key]!.filter(v => v !== val) },
                            })}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-[#DB021D] rounded-md text-[11px] font-semibold text-white hover:bg-[#B8011A] transition-colors"
                          >
                            {val}
                            <X className="w-3 h-3" />
                          </button>
                        ))
                      )}
                      {(activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 2000) && (
                        <button
                          onClick={() => handleApplyFilters({ ...activeFilters, priceRange: [0, 2000] })}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[#DB021D] rounded-md text-[11px] font-semibold text-white hover:bg-[#B8011A] transition-colors"
                        >
                          {activeFilters.priceRange[0]}&euro; - {activeFilters.priceRange[1]}&euro;
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── All filter groups in one card ── */}
                <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden">

                  {/* Systeme */}
                  {(filterConfig.showSystemFilter !== false) && <SidebarAccordion title="Syst&egrave;me" defaultOpen sectionKey="system" openSections={sidebarSections} onToggle={toggleSidebarSection}>
                    <div className="space-y-0.5">
                      {systemOptions.map((opt) => {
                        const count = systemCounts[opt.value] || 0;
                        if (count === 0) return null;
                        const isSelected = activeFilters.system.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            onClick={() => toggleSystem(opt.value)}
                            className="w-full group flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors hover:bg-[#F9F9F9]"
                          >
                            <div className={`w-4 h-4 rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#DB021D] border-[#DB021D]' : 'bg-white border-gray-300 group-hover:border-[#DB021D]'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </div>
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.color}`} />
                            <span className={`flex-1 text-[13px] ${isSelected ? 'font-bold text-[#1A1A1A]' : 'font-medium text-[#4B5563]'}`}>{opt.label}</span>
                            <span className={`text-[11px] ${isSelected ? 'font-bold text-[#1A1A1A]' : 'font-medium text-[#9CA3AF]'}`}>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </SidebarAccordion>}

                  {/* Contextual Filters */}
                  {contextualFilterValues.map((filter) => {
                    if (filter.values.length <= 1) return null;
                    const activeValues = activeFilters.contextual[filter.key] || [];
                    return (
                      <SidebarAccordion key={filter.key} title={filter.label} defaultOpen sectionKey={filter.key} openSections={sidebarSections} onToggle={toggleSidebarSection}>
                        <div className="space-y-0.5">
                          {filter.values.map((value) => {
                            const isActive = activeValues.includes(value);
                            const count = products.filter(p => {
                              const def = filterConfig.contextualFilters.find(d => d.key === filter.key);
                              return def ? def.matchProduct(p, value) : false;
                            }).length;
                            return (
                              <button
                                key={value}
                                onClick={() => toggleContextualChip(filter.key, value)}
                                className="w-full group flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors hover:bg-[#F9F9F9]"
                              >
                                <div className={`w-4 h-4 rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-colors ${isActive ? 'bg-[#DB021D] border-[#DB021D]' : 'bg-white border-gray-300 group-hover:border-[#DB021D]'}`}>
                                  {isActive && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <span className={`flex-1 text-[13px] ${isActive ? 'font-bold text-[#1A1A1A]' : 'font-medium text-[#4B5563]'}`}>{value}</span>
                                <span className={`text-[11px] ${isActive ? 'font-bold text-[#1A1A1A]' : 'font-medium text-[#9CA3AF]'}`}>{count}</span>
                              </button>
                            );
                          })}
                        </div>
                      </SidebarAccordion>
                    );
                  })}

                  {/* Budget */}
                  <SidebarAccordion title="Budget" defaultOpen sectionKey="price" openSections={sidebarSections} onToggle={toggleSidebarSection}>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: '< 100\u20AC', min: 0, max: 100 },
                        { label: '100-300\u20AC', min: 100, max: 300 },
                        { label: '300-500\u20AC', min: 300, max: 500 },
                        { label: '500\u20AC+', min: 500, max: 2000 },
                      ].map((preset) => {
                        const isActive = activeFilters.priceRange[0] === preset.min && activeFilters.priceRange[1] === preset.max;
                        return (
                          <button
                            key={preset.label}
                            onClick={() => setPriceRange(isActive ? 0 : preset.min, isActive ? 2000 : preset.max)}
                            className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${isActive
                              ? 'bg-[#DB021D]/5 border-[#DB021D] text-[#DB021D] shadow-[0_2px_8px_rgba(219,2,29,0.12)]'
                              : 'bg-white border-gray-200 text-[#4B5563] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
                              }`}
                          >
                            <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-semibold'}`}>
                              {preset.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </SidebarAccordion>

                </div>{/* end filter card */}
              </div>
            </aside>

            {/* ===== Product Grid ===== */}
            <div className="flex-1 min-w-0">
              {visibleProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    <AnimatePresence mode="popLayout">
                      {visibleProducts.map((product, idx) => (
                        <ProductCardCompact
                          key={product.id}
                          product={product}
                          index={idx < PRODUCTS_PER_LOAD ? idx : 0}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Load More Button */}
                  {hasMoreProducts && (
                    <div className="mt-8 lg:mt-10 px-2 lg:px-0">
                      <div className="flex items-center justify-between text-[12px] text-[#6B7280] mb-3 px-1">
                        <span>
                          <span className="font-bold text-[#1A1A1A]">{visibleProducts.length}</span> produits affichés
                        </span>
                        <span>
                          <span className="font-bold text-[#1A1A1A]">{filteredAndSortedProducts.length}</span> au total
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full mb-4 overflow-hidden">
                        <div
                          className="h-full bg-[#DB021D] rounded-full transition-all duration-500"
                          style={{ width: `${(visibleProducts.length / filteredAndSortedProducts.length) * 100}%` }}
                        />
                      </div>
                      <motion.button
                        onClick={handleLoadMore}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="group w-full py-4 bg-[#1A1A1A] text-white text-[13px] font-black uppercase tracking-wider rounded-2xl hover:bg-[#DB021D] transition-colors duration-300 flex items-center justify-center gap-3"
                      >
                        <motion.svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          animate={{ y: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </motion.svg>
                        <span>Charger {Math.min(PRODUCTS_PER_LOAD, remainingProducts)} produits de plus</span>
                      </motion.button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#F5F5F5] rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 fill-gray-400" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                  </div>
                  <p className="text-[#1A1A1A] font-bold mb-2">Aucun produit trouvé</p>
                  <p className="text-[#6B7280] text-[13px] mb-4">Essayez d&apos;ajuster vos filtres</p>
                  <button
                    onClick={() => handleApplyFilters(defaultFilters)}
                    className="text-[#DB021D] font-bold text-[13px] hover:underline uppercase tracking-wide"
                  >
                    R&eacute;initialiser les filtres
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Trust Banner - Premium Dark Mode */}
      <section className="bg-[#1A1A1A] pt-6 lg:pt-8 pb-20 lg:pb-8 border-t-2 border-[#DB021D]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { icon: 'shield', title: 'Garantie 3 ans', desc: 'Enregistrée' },
              { icon: 'truck', title: 'Livraison 24h', desc: 'Express' },
              { icon: 'refresh', title: 'SAV Premium', desc: 'À domicile' },
              { icon: 'check', title: 'Agréé Milwaukee', desc: 'Officiel' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 lg:p-5 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-[#DB021D]/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#DB021D]/30 group-hover:bg-[#DB021D]/20 transition-colors">
                  {item.icon === 'shield' && (
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 fill-[#DB021D]" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                  )}
                  {item.icon === 'truck' && (
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 fill-[#DB021D]" viewBox="0 0 24 24">
                      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                    </svg>
                  )}
                  {item.icon === 'refresh' && (
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 fill-[#DB021D]" viewBox="0 0 24 24">
                      <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                  )}
                  {item.icon === 'check' && (
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 fill-[#DB021D]" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] lg:text-[15px] font-bold text-white truncate tracking-wide">{item.title}</p>
                  <p className="text-[12px] text-gray-400 truncate">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drawers */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        activeFiltersCount={activeFiltersCount}
        onApplyFilters={handleApplyFilters}
        initialFilters={activeFilters}
        menu={menu}
        collectionHandle={collectionHandle}
        products={products}
        systemCounts={systemCounts}
      />

      <SortDrawer
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        currentSort={sortBy}
        onSortChange={handleSortChange}
      />

    </>
  );
}
