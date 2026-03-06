'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Menu, MenuItem, Product } from '@/lib/shopify/types';
import { getCollectionFilterConfig } from '@/lib/collection-filters';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeFiltersCount: number;
  onApplyFilters: (filters: FilterState) => void;
  initialFilters?: FilterState;
  menu: Menu | null;
  collectionHandle?: string;
  products?: Product[];
  systemCounts?: Record<string, number>;
}

export interface FilterState {
  priceRange: [number, number];
  system: string[];
  machineType: string[];
  availability: string[];
  contextual: Record<string, string[]>;
}

export const defaultFilters: FilterState = {
  priceRange: [0, 2000],
  system: [],
  machineType: [],
  availability: [],
  contextual: {},
};

function extractAllCategories(menu: Menu | null): string[] {
  if (!menu) return [];
  const categories = new Set<string>();
  function traverse(items: MenuItem[]) {
    for (const item of items) {
      categories.add(item.title);
      if (item.items && item.items.length > 0) traverse(item.items);
    }
  }
  traverse(menu.items);
  return Array.from(categories);
}

const systemOptions = [
  { value: 'M18 FUEL', label: 'M18 FUEL', dot: 'bg-[#DB021D]' },
  { value: 'M12 FUEL', label: 'M12 FUEL', dot: 'bg-[#DB021D]' },
  { value: 'M18 Brushless', label: 'M18', dot: 'bg-emerald-500' },
  { value: 'M12 Brushless', label: 'M12', dot: 'bg-emerald-500' },
  { value: 'MX FUEL', label: 'MX FUEL', dot: 'bg-orange-500' },
  { value: 'Filaire', label: 'Filaire', dot: 'bg-blue-500' },
  { value: 'Autres', label: 'Autres', dot: 'bg-zinc-400' },
];

const pricePresets = [
  { label: '< 100\u20AC', min: 0, max: 100 },
  { label: '100-300\u20AC', min: 100, max: 300 },
  { label: '300-500\u20AC', min: 300, max: 500 },
  { label: '500\u20AC+', min: 500, max: 2000 },
];

/* ── Accordion Section with Framer Motion ── */
function Section({ title, defaultOpen = false, children }: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <span className="text-[13px] font-bold text-[#1A1A1A] uppercase tracking-wide">{title}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Checkbox row ── */
function Checkbox({ checked, label, count, dot, onChange }: {
  checked: boolean;
  label: string;
  count?: number;
  dot?: string;
  onChange: () => void;
}) {
  return (
    <button onClick={onChange} className="w-full flex items-center gap-3 py-2.5 group">
      <span className={`w-[18px] h-[18px] rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${checked ? 'bg-[#DB021D] border-[#DB021D]' : 'border-gray-300 group-hover:border-gray-400'
        }`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      {dot && <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />}
      <span className={`text-[14px] flex-1 text-left ${checked ? 'font-semibold text-[#DB021D]' : 'text-gray-700'}`}>
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span className="text-[12px] text-gray-400 font-medium">{count}</span>
      )}
    </button>
  );
}

/* ════════════════════════════════════════════
   FilterDrawer — Mobile Bottom Sheet
   ════════════════════════════════════════════ */
export function FilterDrawer({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters = defaultFilters,
  menu,
  collectionHandle = '',
  products = [],
  systemCounts = {},
}: FilterDrawerProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const filterConfig = useMemo(() => getCollectionFilterConfig(collectionHandle), [collectionHandle]);
  const machineTypes = useMemo(() => extractAllCategories(menu), [menu]);

  const contextualValues = useMemo(() => {
    return filterConfig.contextualFilters.map((def) => ({
      def,
      key: def.key,
      label: def.label,
      values: def.extractValues(products),
      colorMap: def.colorMap,
    }));
  }, [filterConfig, products]);

  // Live filtered count
  const filteredCount = useMemo(() => {
    let result = products;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000) {
      result = result.filter((p) => {
        const price = parseFloat(p.priceRange?.minVariantPrice?.amount || '0');
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }
    if (filters.system.length > 0) {
      result = result.filter((p) => {
        const title = p.title.toLowerCase();
        const tags = (p.tags || []).map(t => t.toLowerCase());
        const hasBatteryKw = title.includes('batterie') || title.includes('battery') || title.includes('redlithium') || title.includes('red lithium');
        const hasAh = /\d+[.,]?\d*\s*ah/i.test(title);
        const isBat = hasBatteryKw || hasAh;
        const isMx = title.includes('mx fuel') || title.includes('mxfuel');
        const isM18 = title.includes('m18') || tags.includes('m18');
        const isM12 = title.includes('m12') || tags.includes('m12');
        const hasFuel = title.includes('fuel') || tags.includes('fuel');
        return filters.system.some((s) => {
          if (s === 'MX FUEL') return isMx;
          if (s === 'M18 FUEL') return !isBat && isM18 && hasFuel && !isMx;
          if (s === 'M12 FUEL') return !isBat && isM12 && hasFuel;
          if (s === 'M18 Brushless') return !isBat && isM18 && !hasFuel;
          if (s === 'M12 Brushless') return !isBat && isM12 && !hasFuel;
          if (s === 'Filaire') return title.includes('filaire') || /\b(230|220|240)\s*v\b/i.test(title) || title.includes('secteur') || title.includes('corded') || title.includes('\u00e9lectrique');
          if (s === 'Autres') return !isM18 && !isM12 && !isMx && !title.includes('filaire') && !/\b(230|220|240)\s*v\b/i.test(title);
          return false;
        });
      });
    }
    for (const def of filterConfig.contextualFilters) {
      const selected = filters.contextual[def.key];
      if (selected && selected.length > 0) {
        result = result.filter((p) => selected.some((val) => def.matchProduct(p, val)));
      }
    }
    return result.length;
  }, [products, filters, filterConfig]);

  useEffect(() => {
    if (isOpen) setFilters(initialFilters);
  }, [isOpen, initialFilters]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleSystem = (value: string) => {
    setFilters(prev => ({
      ...prev,
      system: prev.system.includes(value)
        ? prev.system.filter(v => v !== value)
        : [...prev.system, value],
    }));
  };

  const toggleContextual = (key: string, value: string) => {
    setFilters(prev => {
      const current = prev.contextual[key] || [];
      return {
        ...prev,
        contextual: {
          ...prev.contextual,
          [key]: current.includes(value) ? current.filter(v => v !== value) : [...current, value],
        },
      };
    });
  };

  const toggleMachineType = (value: string) => {
    setFilters(prev => ({
      ...prev,
      machineType: prev.machineType.includes(value)
        ? prev.machineType.filter(v => v !== value)
        : [...prev.machineType, value],
    }));
  };

  const handleApply = () => { onApplyFilters(filters); onClose(); };
  const handleReset = () => setFilters(defaultFilters);

  const contextualCount = Object.values(filters.contextual).reduce((sum, arr) => sum + arr.length, 0);
  const activeCount = filters.system.length + filters.machineType.length + filters.availability.length + contextualCount +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000 ? 1 : 0);

  const visibleSystems = systemOptions.filter(opt => (systemCounts[opt.value] || 0) > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onClose}
          />

          {/* Bottom Sheet — slides up */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-2xl flex flex-col shadow-2xl"
            style={{ maxHeight: '85vh' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-[16px] font-bold text-[#1A1A1A]">Filtres</h2>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button onClick={handleReset} className="text-[12px] font-medium text-[#DB021D] hover:underline transition-colors">
                    Tout effacer
                  </button>
                )}
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Fermer">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content — Accordions */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Systeme */}
              {visibleSystems.length > 0 && (
                <Section title="Syst\u00e8me" defaultOpen>
                  {visibleSystems.map((opt) => (
                    <Checkbox
                      key={opt.value}
                      checked={filters.system.includes(opt.value)}
                      label={opt.label}
                      count={systemCounts[opt.value]}
                      dot={opt.dot}
                      onChange={() => toggleSystem(opt.value)}
                    />
                  ))}
                </Section>
              )}

              {/* Contextual Filters */}
              {contextualValues.map((filter) => {
                if (filter.values.length === 0) return null;
                const selected = filters.contextual[filter.key] || [];
                return (
                  <Section key={filter.key} title={filter.label} defaultOpen>
                    {filter.values.map((val) => (
                      <Checkbox
                        key={val}
                        checked={selected.includes(val)}
                        label={val}
                        dot={filter.colorMap?.[val]}
                        onChange={() => toggleContextual(filter.key, val)}
                      />
                    ))}
                  </Section>
                );
              })}

              {/* Budget */}
              <Section title="Budget" defaultOpen>
                <div className="grid grid-cols-2 gap-2">
                  {pricePresets.map((preset) => {
                    const isActive = filters.priceRange[0] === preset.min && filters.priceRange[1] === preset.max;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setFilters(prev => ({
                            ...prev,
                            priceRange: isActive ? [0, 2000] : [preset.min, preset.max],
                          }));
                        }}
                        className={`py-2.5 rounded-lg text-[13px] font-medium border transition-all ${isActive
                            ? 'bg-[#DB021D] text-white border-[#DB021D]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                          }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Categorie */}
              {filterConfig.showMachineTypeFilter && machineTypes.length > 0 && (
                <Section title="Cat\u00e9gorie" defaultOpen>
                  {machineTypes.map((type) => (
                    <Checkbox
                      key={type}
                      checked={filters.machineType.includes(type)}
                      label={type}
                      onChange={() => toggleMachineType(type)}
                    />
                  ))}
                </Section>
              )}

              <div className="h-4" />
            </div>

            {/* Footer — sticky CTA */}
            <div className="border-t border-gray-100 px-5 py-4 flex-shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button
                onClick={handleApply}
                className="w-full h-[52px] bg-[#DB021D] text-white font-bold text-[14px] uppercase tracking-wider rounded-lg hover:bg-[#B8011A] active:scale-[0.98] transition-all"
              >
                Voir {filteredCount} r\u00e9sultat{filteredCount !== 1 ? 's' : ''}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
