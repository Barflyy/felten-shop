'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/shopify/types';
import { useCart } from '@/context/cart-context';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const variant = product.variants?.edges[0]?.node;
  const price = product.priceRange?.minVariantPrice || variant?.price;
  const compareAtPrice = variant?.compareAtPrice;
  const hasDiscount = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price?.amount || '0');
  const image = product.featuredImage || product.images?.edges[0]?.node;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (variant?.id) {
      await addToCart(variant.id, 1);
    }
  };

  const simplifyTitle = (title: string) => {
    let clean = title
      .replace(/M18 FUEL™?\s*/gi, '')
      .replace(/M12 FUEL™?\s*/gi, '')
      .replace(/M18™?\s*/gi, '')
      .replace(/M12™?\s*/gi, '');
    const parts = clean.split(' - ');
    return parts[0].split(',')[0].trim();
  };

  const extractPowerSpec = (title: string): { mainPart: string; specPart: string | null } => {
    const cleanTitle = simplifyTitle(title);
    const specPattern = /\s*(\d+(?:[.,]\d+)?)\s*(nm|n\.m|joules?|j|watts?|w|mm|kg|cpm|opm|rpm|ah|ga|kn)\s*$/i;
    const match = cleanTitle.match(specPattern);

    if (match) {
      const number = match[1];
      let unit = match[2].toLowerCase();
      if (unit === 'n.m') unit = 'Nm';
      else if (unit === 'nm') unit = 'Nm';
      else if (unit === 'joules' || unit === 'joule') unit = 'J';
      else if (unit === 'j') unit = 'J';
      else if (unit === 'watts' || unit === 'watt') unit = 'W';
      else if (unit === 'w') unit = 'W';
      else unit = unit.toUpperCase();

      const specPart = `${number} ${unit}`;
      const mainPart = cleanTitle.slice(0, match.index).trim();
      return { mainPart, specPart };
    }

    return { mainPart: cleanTitle, specPart: null };
  };

  const { mainPart: displayTitle, specPart: titleSpecPart } = extractPowerSpec(product.title);

  const getMetafieldValue = (key: string) => {
    const mfs = variant?.metafields || [];
    const field = mfs.find((m) => m?.key === key);
    return field?.value;
  };

  const metafieldMetric = getMetafieldValue('card_metric');

  const extractSpecs = (title: string, desc: string): { value: string }[] => {
    const source = `${title} ${desc || ''}`;
    const found: { value: string; priority: number }[] = [];
    const seen = new Set<string>();

    const patterns: { key: string; pattern: RegExp; format: (m: RegExpMatchArray) => string; priority: number }[] = [
      { key: 'torque', pattern: /(\d+(?:[.,]\d+)?)\s*(?:Nm|N\.m)\b/i, format: m => `${m[1]} Nm`, priority: 1 },
      { key: 'energy', pattern: /(\d+(?:[.,]\d+)?)\s*(?:J|Joules?)\b/i, format: m => `${m[1]} J`, priority: 2 },
      { key: 'ah', pattern: /(\d+(?:[.,]\d+)?)\s*Ah\b/i, format: m => `${m[1]} Ah`, priority: 3 },
      { key: 'capacity', pattern: /(\d+(?:[.,]\d+)?)\s*(?:litres?)\b/i, format: m => `${m[1]} L`, priority: 4 },
      { key: 'diameter', pattern: /(\d{3,})\s*mm\b/i, format: m => `${m[1]} mm`, priority: 5 },
      { key: 'speed', pattern: /(\d[\d\s]*\d)\s*(?:tr\/min|rpm|min-1)\b/i, format: m => `${m[1].replace(/\s/g, '')} tr/min`, priority: 6 },
      { key: 'power', pattern: /(\d+)\s*(?:W|Watts?)\b/i, format: m => `${m[1]} W`, priority: 7 },
      { key: 'weight', pattern: /(\d+(?:[.,]\d+)?)\s*kg\b/i, format: m => `${m[1]} kg`, priority: 8 },
    ];

    for (const { key, pattern, format, priority } of patterns) {
      if (seen.has(key)) continue;
      const match = source.match(pattern);
      if (match) {
        found.push({ value: format(match), priority });
        seen.add(key);
      }
    }

    return found.sort((a, b) => a.priority - b.priority).map(({ value }) => ({ value }));
  };

  const getTechBadges = () => {
    const specs: { value: string }[] = [];
    const lowerTitle = product.title.toLowerCase();

    if (lowerTitle.includes('m18')) specs.push({ value: '18V' });
    else if (lowerTitle.includes('m12')) specs.push({ value: '12V' });
    else if (lowerTitle.includes('m4')) specs.push({ value: '4V' });
    else if (lowerTitle.includes('mxf') || lowerTitle.includes('mx fuel')) specs.push({ value: 'MX FUEL' });

    if (metafieldMetric) {
      specs.push({ value: metafieldMetric });
    } else if (titleSpecPart) {
      specs.push({ value: titleSpecPart });
    }

    if (specs.length < 3) {
      const allSpecs = extractSpecs(product.title, product.description || '');
      for (const ds of allSpecs) {
        if (specs.length >= 3) break;
        if (specs.some(s => s.value === ds.value)) continue;
        specs.push(ds);
      }
    }

    if (specs.length === 0 && product.productType) {
      specs.push({ value: product.productType });
    }

    return specs.slice(0, 3);
  };

  const techBadges = getTechBadges();

  const getBadges = () => {
    const badges: { label: string; color: string }[] = [];
    const title = product.title.toLowerCase();

    if (title.includes('fuel')) {
      badges.push({ label: 'FUEL', color: 'bg-[#DB021D]' });
    }
    if (title.includes('m18')) {
      badges.push({ label: 'M18', color: 'bg-[#1A1A1A]' });
    } else if (title.includes('m12')) {
      badges.push({ label: 'M12', color: 'bg-[#4B5563]' });
    }
    if (hasDiscount) {
      const discount = Math.round((1 - parseFloat(price?.amount || '0') / parseFloat(compareAtPrice.amount)) * 100);
      badges.push({ label: `-${discount}%`, color: 'bg-emerald-600' });
    }

    return badges;
  };

  const badges = getBadges();
  const isInStock = variant?.availableForSale !== false;

  return (
    <Link
      href={`/produit/${product.handle}`}
      className="group relative block bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          <div className="flex flex-col gap-1">
            {badges.map((badge, idx) => (
              <span
                key={idx}
                className={`${badge.color} text-white text-[10px] font-semibold px-2 py-0.5 rounded`}
              >
                {badge.label}
              </span>
            ))}
          </div>
          {isInStock && (
            <span className="bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
              En stock
            </span>
          )}
        </div>

        {image?.url ? (
          <Image
            src={image.url}
            alt={image.altText || product.title}
            fill
            className="object-contain p-4 group-hover:scale-[1.03] transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 fill-gray-300" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          </div>
        )}

        {/* Quick add button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-3 bg-[#DB021D] text-white text-[12px] font-semibold translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
        >
          <ShoppingCart className="w-4 h-4" strokeWidth={2} />
          Ajout rapide
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        {product.productType && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">
            {product.productType}
          </p>
        )}

        <h3 className="text-[13px] font-semibold text-[#1A1A1A] line-clamp-2 min-h-[36px] group-hover:text-[#DB021D] transition-colors">
          {displayTitle}
        </h3>

        {techBadges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
            {techBadges.map((spec, i) => (
              <span
                key={i}
                className="inline-flex items-center bg-[#F5F5F5] border border-gray-100 px-2 py-0.5 rounded text-[10px] font-medium text-[#4B5563]"
              >
                {spec.value}
              </span>
            ))}
          </div>
        ) : (
          <div className="h-8" />
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-bold text-[#1A1A1A]">
            {parseFloat(price?.amount || '0').toFixed(2)} €
          </span>
          {hasDiscount && (
            <span className="text-[12px] text-[#9CA3AF] line-through">
              {parseFloat(compareAtPrice.amount).toFixed(2)} €
            </span>
          )}
        </div>

        {isInStock && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-[11px] text-emerald-600 font-medium">En stock</span>
          </div>
        )}
      </div>
    </Link>
  );
}
