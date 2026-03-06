'use client';

import { AnimatePresence, motion } from 'framer-motion';
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
  { value: 'M18 FUEL', label: 'M18 FUEL' },
  { value: 'M12 FUEL', label: 'M12 FUEL' },
  { value: 'M18 Brushless', label: 'M18' },
  { value: 'M12 Brushless', label: 'M12' },
  { value: 'MX FUEL', label: 'MX FUEL' },
  { value: 'Filaire', label: 'Filaire' },
  { value: 'Autres', label: 'Autres' },
];

const pricePresets = [
  { label: '< 100\u20AC', min: 0, max: 100 },
  { label: '100-300\u20AC', min: 100, max: 300 },
  { label: '300-500\u20AC', min: 300, max: 500 },
  { label: '500\u20AC+', min: 500, max: 2000 },
];

/* ── Accordion Section ── */
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
        className="w-full flex items-center justify-between px-5 py-3"
      >
        <span className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide">{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-3">
          {children}
        </div>
      )}
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
    <button onClick={onChange} className="w-full flex items-center gap-2.5 py-2">
      <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${checked ? 'bg-[#1A1A1A] border-[#1A1A1A]' : 'border-gray-300'
        }`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className={`text-[14px] flex-1 text-left ${checked ? 'font-semibold text-[#1A1A1A]' : 'text-[#4B5563]'}`}>
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span className="text-[11px] text-[#9CA3AF]">{count}</span>
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
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-xl flex flex-col"
            style={{ maxHeight: '85vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-[15px] font-bold text-[#1A1A1A]">Filtres</h2>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button onClick={handleReset} className="text-[12px] text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors">
                    Effacer
                  </button>
                )}
                <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Fermer">
                  <X className="w-4 h-4 text-[#9CA3AF]" />
                </button>
              </div>
            </div>

            {/* Content — Accordions */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Systeme */}
              {visibleSystems.length > 0 && (
                <Section title="Système" defaultOpen>
                  {visibleSystems.map((opt) => (
                    <Checkbox
                      key={opt.value}
                      checked={filters.system.includes(opt.value)}
                      label={opt.label}
                      count={systemCounts[opt.value]}
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
                        className={`py-2 rounded-md text-[13px] font-medium transition-colors ${isActive
                            ? 'bg-[#1A1A1A] text-white'
                            : 'bg-[#F5F5F5] text-[#4B5563]'
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
                <Section title="Catégorie" defaultOpen>
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

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-3 flex-shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <button
                onClick={handleApply}
                className="w-full h-11 bg-[#1A1A1A] text-white font-semibold text-[14px] rounded-lg hover:bg-[#333] transition-colors"
              >
                Voir {filteredCount} résultat{filteredCount !== 1 ? 's' : ''}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
