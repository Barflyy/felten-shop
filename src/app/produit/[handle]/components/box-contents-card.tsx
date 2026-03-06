'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Package } from 'lucide-react';
import { BoxContentItem } from '@/lib/shopify/types';

export function BoxContentsCard({
  items,
  fallbackImage,
}: {
  items: BoxContentItem[];
  fallbackImage?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const showToggle = items.length > 1;
  const visibleItems = expanded ? items : items.slice(0, 1);

  return (
    <div>
      <div className="bg-zinc-50 rounded-xl border border-zinc-200/80 overflow-hidden">
        <div className="divide-y divide-zinc-200/60">
          {visibleItems.map((item, index) => {
            const imgSrc = item.image || (index === 0 ? fallbackImage : null);
            return (
              <div
                key={index}
                className="flex items-center gap-3 px-3 py-3 hover:bg-zinc-50 transition-colors group"
              >
                <div className="relative w-10 h-10 flex-shrink-0 bg-white border border-zinc-100 rounded-lg overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={item.label}
                      fill
                      className="object-contain p-1"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                      <Package className="w-4 h-4 text-zinc-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-zinc-700 font-medium leading-snug truncate">
                    {item.label}
                  </p>
                </div>
                {item.qty > 1 && (
                  <span className="flex-shrink-0 h-6 bg-zinc-100 text-zinc-600 border border-zinc-200 text-[11px] font-bold flex items-center justify-center rounded-md px-2">
                    x{item.qty}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {showToggle && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-zinc-200/60 text-[12px] font-semibold text-[#DB021D] hover:bg-zinc-100/50 transition-colors"
          >
            {expanded ? 'Masquer' : `Voir le détail (${items.length - 1} de plus)`}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}

export function getKitSummary(
  items: BoxContentItem[]
): { type: 'full' | 'partial' | 'bare' | 'bare-case'; summary: string } {
  if (!items || items.length === 0) {
    return { type: 'bare', summary: '' };
  }

  const lowerItems = items.map(i => ({ ...i, labelLower: i.label.toLowerCase() }));

  const batteries = lowerItems.filter(
    i =>
      i.labelLower.includes('batterie') ||
      i.labelLower.includes('battery') ||
      i.labelLower.includes('accu')
  );

  const hasCharger = lowerItems.some(
    i => i.labelLower.includes('chargeur') || i.labelLower.includes('charger')
  );

  const caseItem = lowerItems.find(
    i =>
      i.labelLower.includes('coffret') ||
      i.labelLower.includes('coffre') ||
      i.labelLower.includes('hd box') ||
      i.labelLower.includes('packout') ||
      i.labelLower.includes('caisse') ||
      i.labelLower.includes('mallette') ||
      i.labelLower.includes('dynacase')
  );

  const hasCase = !!caseItem;
  const caseType = caseItem?.labelLower.includes('packout')
    ? 'PACKOUT'
    : caseItem?.labelLower.includes('dynacase')
      ? 'Dynacase'
      : 'Coffret';

  if (batteries.length === 0) {
    if (hasCase) {
      return {
        type: 'bare-case',
        summary: `Machine nue en ${caseType} (sans batterie ni chargeur)`,
      };
    }
    return {
      type: 'bare',
      summary: 'Machine nue (sans coffret, batterie ni chargeur)',
    };
  }

  const parts: string[] = [];
  const totalBatteries = batteries.reduce((sum, b) => sum + b.qty, 0);
  const ahMatch = batteries[0]?.label.match(/(\d+[.,]?\d*)\s*ah/i);
  const ah = ahMatch ? ahMatch[1].replace(',', '.') : null;

  if (totalBatteries === 1) {
    parts.push(ah ? `1 Batterie ${ah}Ah` : '1 Batterie');
  } else {
    parts.push(ah ? `${totalBatteries} Batteries ${ah}Ah` : `${totalBatteries} Batteries`);
  }

  if (hasCharger) {
    parts.push('Chargeur');
  }

  if (hasCase) {
    parts.push(caseType);
  }

  const isFullKit = batteries.length > 0 && hasCharger;

  return {
    type: isFullKit ? 'full' : 'partial',
    summary: parts.join(' + '),
  };
}

export function getVariantLabel(kitInfo: { type: string; summary: string }): string {
  switch (kitInfo.type) {
    case 'bare':
      return 'Outil Seul';
    case 'bare-case':
      return 'Outil Seul + Coffret';
    case 'full':
      return 'Kit Complet';
    case 'partial':
      return 'Kit';
    default:
      return 'Outil Seul';
  }
}
