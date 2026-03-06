'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/lib/shopify/types';
import { useCart } from '@/context/cart-context';
import { Star, ShoppingCart } from 'lucide-react';

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

  // Simplify product title and extract power specs
  const simplifyTitle = (title: string) => {
    let clean = title
      .replace(/M18 FUEL™?\s*/gi, '')
      .replace(/M12 FUEL™?\s*/gi, '')
      .replace(/M18™?\s*/gi, '')
      .replace(/M12™?\s*/gi, '');
    const parts = clean.split(' - ');
    return parts[0].split(',')[0].trim();
  };

  // Extract power specs from title (Nm, J, W, mm, kg, etc.) to display in gray
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

  // Extract metafield (if injected by GraphQL)
  const getMetafieldValue = (key: string) => {
    const mfs = variant?.metafields || [];
    const field = mfs.find((m) => m?.key === key);
    return field?.value;
  };

  const metafieldMetric = getMetafieldValue('card_metric');
  const metafieldLabel = getMetafieldValue('card_metric_label') || '';

  // Extract real specs from title + description combined
  const extractSpecs = (title: string, desc: string): { icon: string; value: string }[] => {
    const source = `${title} ${desc || ''}`;
    const found: { icon: string; value: string; priority: number }[] = [];
    const seen = new Set<string>();

    const patterns: { key: string; icon: string; pattern: RegExp; format: (m: RegExpMatchArray) => string; priority: number }[] = [
      { key: 'torque', icon: '💪', pattern: /(\d+(?:[.,]\d+)?)\s*(?:Nm|N\.m)\b/i, format: m => `${m[1]} Nm`, priority: 1 },
      { key: 'energy', icon: '🔨', pattern: /(\d+(?:[.,]\d+)?)\s*(?:J|Joules?)\b/i, format: m => `${m[1]} J`, priority: 2 },
      { key: 'ah', icon: '🔋', pattern: /(\d+(?:[.,]\d+)?)\s*Ah\b/i, format: m => `${m[1]} Ah`, priority: 3 },
      { key: 'capacity', icon: '🪣', pattern: /(\d+(?:[.,]\d+)?)\s*(?:litres?)\b/i, format: m => `${m[1]} L`, priority: 4 },
      { key: 'diameter', icon: '📐', pattern: /(\d{3,})\s*mm\b/i, format: m => `${m[1]} mm`, priority: 5 },
      { key: 'speed', icon: '🔄', pattern: /(\d[\d\s]*\d)\s*(?:tr\/min|rpm|min-1)\b/i, format: m => `${m[1].replace(/\s/g, '')} tr/min`, priority: 6 },
      { key: 'power', icon: '⚡', pattern: /(\d+)\s*(?:W|Watts?)\b/i, format: m => `${m[1]} W`, priority: 7 },
      { key: 'weight', icon: '⚖️', pattern: /(\d+(?:[.,]\d+)?)\s*kg\b/i, format: m => `${m[1]} kg`, priority: 8 },
      { key: 'voltage', icon: '⚡', pattern: /(?:Tension|Voltage)\s*:?\s*(\d+(?:[.,]\d+)?)\s*V\b/i, format: m => `${m[1]}V`, priority: 9 },
      { key: 'class', icon: '🏷️', pattern: /CLASSE\s+([LMH])\b/i, format: m => `Classe ${m[1].toUpperCase()}`, priority: 10 },
    ];

    for (const { key, icon, pattern, format, priority } of patterns) {
      if (seen.has(key)) continue;
      const match = source.match(pattern);
      if (match) {
        found.push({ icon, value: format(match), priority });
        seen.add(key);
      }
    }

    return found.sort((a, b) => a.priority - b.priority).map(({ icon, value }) => ({ icon, value }));
  };

  // Generate Tech Badges (Specs) from real product data
  const getTechBadges = () => {
    const specs: { icon: string; value: string }[] = [];
    const lowerTitle = product.title.toLowerCase();

    // Voltage from title prefix (M18/M12/M4/MXF)
    if (lowerTitle.includes('m18')) specs.push({ icon: '⚡', value: '18V' });
    else if (lowerTitle.includes('m12')) specs.push({ icon: '⚡', value: '12V' });
    else if (lowerTitle.includes('m4')) specs.push({ icon: '⚡', value: '4V' });
    else if (lowerTitle.includes('mxf') || lowerTitle.includes('mx fuel')) specs.push({ icon: '⚡', value: 'MX FUEL' });

    // 1. Use metafield if available
    if (metafieldMetric) {
      let icon = '⚙️';
      const mLabel = metafieldLabel.toLowerCase();
      const mVal = metafieldMetric.toLowerCase();

      if (mVal.includes('nm') || mLabel.includes('couple')) icon = '💪';
      else if (mVal.includes('j') || mVal.includes('joule')) icon = '🔨';
      else if (mVal.includes('w ') || mVal.includes(' w') || mLabel.includes('puissance')) icon = '⚡';
      else if (mVal.includes('kg') || mLabel.includes('poids')) icon = '⚖️';
      else if (mVal.includes('l ') || mVal.includes(' l') || mLabel.includes('capacité')) icon = '🪣';
      else if (mVal.includes('ah')) icon = '🔋';
      else if (mVal.includes('tr/min') || mLabel.includes('vitesse')) icon = '🔄';

      specs.push({ icon, value: metafieldMetric });
    }
    // 2. Use extracted spec from title
    else if (titleSpecPart) {
      if (titleSpecPart.includes('Nm')) specs.push({ icon: '💪', value: titleSpecPart });
      else if (titleSpecPart.includes('J')) specs.push({ icon: '🔨', value: titleSpecPart });
      else if (titleSpecPart.includes('W')) specs.push({ icon: '⚡', value: titleSpecPart });
      else if (titleSpecPart.includes('kg')) specs.push({ icon: '⚖️', value: titleSpecPart });
      else if (titleSpecPart.includes('AH')) specs.push({ icon: '🔋', value: titleSpecPart });
      else specs.push({ icon: '⚙️', value: titleSpecPart });
    }

    // 3. Fill remaining slots from title + description
    if (specs.length < 3) {
      const allSpecs = extractSpecs(product.title, product.description || '');
      for (const ds of allSpecs) {
        if (specs.length >= 3) break;
        // Skip duplicates (same value or same icon already present)
        if (specs.some(s => s.value === ds.value || s.icon === ds.icon)) continue;
        specs.push(ds);
      }
    }

    // 4. Fallback: always show productType if nothing else
    if (specs.length === 0 && product.productType) {
      specs.push({ icon: '🔧', value: product.productType });
    }

    return specs.slice(0, 3);
  };

  const techBadges = getTechBadges();

  // Get product badges
  const getBadges = () => {
    const badges: { label: string; color: string }[] = [];
    const title = product.title.toLowerCase();

    if (title.includes('fuel')) {
      badges.push({ label: 'FUEL', color: 'bg-[#DB021D]' });
    }
    if (title.includes('m18')) {
      badges.push({ label: 'M18', color: 'bg-zinc-900' });
    } else if (title.includes('m12')) {
      badges.push({ label: 'M12', color: 'bg-zinc-700' });
    }
    if (hasDiscount) {
      const discount = Math.round((1 - parseFloat(price?.amount || '0') / parseFloat(compareAtPrice.amount)) * 100);
      badges.push({ label: `-${discount}%`, color: 'bg-emerald-600' });
    }

    return badges;
  };

  const badges = getBadges();
  const isInStock = variant?.availableForSale !== false;
  const isBestSeller = index < 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/produit/${product.handle}`}
        className="group relative block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#DB021D]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-[#F5F5F5] overflow-hidden">
          {/* Top Badges Row */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
            {/* Left Badges */}
            <div className="flex flex-col gap-1.5">
              {badges.map((badge, idx) => (
                <span
                  key={idx}
                  className={`${badge.color} text-white text-[10px] font-black px-2 py-1 rounded-md uppercase`}
                >
                  {badge.label}
                </span>
              ))}
            </div>

            {/* Right side: stock badge */}
            <div className="flex flex-col items-end gap-1.5">
              {isBestSeller ? (
                <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase">
                  BEST SELLER
                </span>
              ) : isInStock && (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase">
                  EN STOCK
                </span>
              )}
            </div>
          </div>

          {/* Product Image */}
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 fill-zinc-300" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            </div>
          )}

          {/* QUICK ADD BUTTON - Slides up on hover */}
          <motion.button
            onClick={handleAddToCart}
            initial={{ y: '100%', opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 py-3 bg-[#DB021D] text-white text-sm font-black uppercase tracking-wide translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
          >
            <ShoppingCart className="w-4 h-4" />
            AJOUT RAPIDE
          </motion.button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Vendor */}
          <p className="text-[10px] font-black uppercase tracking-wider text-[#DB021D] mb-1">
            MILWAUKEE
          </p>

          {/* Title */}
          <h3 className="text-sm font-bold text-zinc-900 line-clamp-2 min-h-[40px] group-hover:text-[#DB021D] transition-colors uppercase">
            {displayTitle}
          </h3>

          {/* Tech Badges (Specs) */}
          {techBadges.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
              {techBadges.map((spec, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-[#F5F5F5] border border-gray-200 px-2 py-1 rounded text-[10px] font-black text-[#1A1A1A] uppercase tracking-wider"
                >
                  <span className="text-[12px] opacity-80">{spec.icon}</span>
                  {spec.value}
                </span>
              ))}
            </div>
          ) : (
            <div className="h-8" /> // Spacer to keep card heights consistent
          )}

          {/* STAR RATINGS */}
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-3.5 h-3.5 text-amber-400"
                fill="currentColor"
              />
            ))}
            <span className="text-xs text-zinc-500 ml-1">(24)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-[#DB021D]">
              {parseFloat(price?.amount || '0').toFixed(2)} €
            </span>
            {hasDiscount && (
              <span className="text-sm text-zinc-400 line-through">
                {parseFloat(compareAtPrice.amount).toFixed(2)} €
              </span>
            )}
          </div>

          {/* Stock indicator */}
          {isInStock && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-sm" />
              <span className="text-xs text-zinc-600 font-semibold uppercase">En stock</span>
            </div>
          )}
        </div>

        {/* Bottom Red Line on Hover */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#DB021D] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </Link>
    </motion.div>
  );
}
