'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { Product } from '@/lib/shopify/types';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';
import { useState } from 'react';

interface ProductCardCompactProps {
  product: Product;
  index?: number;
  onQuickView?: (product: Product) => void;
}

export function ProductCardCompact({ product, index = 0, onQuickView }: ProductCardCompactProps) {
  const { addToCart } = useCart();
  const { vatInfo } = useVAT();
  const isPro = vatInfo.displayMode === 'HT';
  const vatRate = vatInfo.applicableVATRate || 21;
  const [added, setAdded] = useState(false);

  const variants = product.variants?.edges || [];
  const variant = variants[0]?.node;
  const price = product.priceRange?.minVariantPrice || variant?.price;
  const compareAtPrice = variant?.compareAtPrice;

  const priceHT = parseFloat(price?.amount || '0');
  const priceTTC = priceHT * (1 + vatRate / 100);
  const compareAtPriceHT = compareAtPrice ? parseFloat(compareAtPrice.amount) : null;
  const compareAtPriceTTC = compareAtPriceHT ? compareAtPriceHT * (1 + vatRate / 100) : null;
  const image = product.featuredImage || product.images?.edges[0]?.node;
  const hasVariants = variants.length > 1;

  const hasDiscount = compareAtPriceHT && compareAtPriceHT > priceHT;
  const discountPercent = hasDiscount
    ? Math.round((1 - priceHT / compareAtPriceHT) * 100)
    : 0;

  // Clean title: if "MODEL_CODE - Description" format, use the description part
  const _titleParts = product.title.split(' - ');
  const _firstPart = _titleParts[0].trim();
  const _isModelCode = _titleParts.length > 1 && /^[A-Z0-9 .\-]+$/.test(_firstPart);
  const _baseTitle = _isModelCode ? _titleParts.slice(1).join(' - ').trim() : _firstPart;

  const cleanTitle = _baseTitle
    .replace(/^M18\s*FUEL™?\s*/i, '')
    .replace(/^M12\s*FUEL™?\s*/i, '')
    .replace(/^MX\s*FUEL™?\s*/i, '')
    .replace(/^M18™?\s*/i, '')
    .replace(/^M12™?\s*/i, '')
    .replace(/^M4™?\s*/i, '')
    .replace(/^Brushless\s*/i, '')
    .trim();

  // Extract model ref
  const _strippedCode = _isModelCode
    ? _firstPart
        .replace(/^(?:M(?:18|12|4)\s*(?:FUEL™?\s*)?|MX\s*FUEL™?\s*)/i, '')
        .trim()
    : null;
  const _titleModelRef = _strippedCode && !/\s/.test(_strippedCode)
    ? _strippedCode.replace(/-\d*[A-Z]*$/, '') || null
    : null;
  const _variantTitle = variant?.title && variant.title !== 'Default Title' ? variant.title : null;
  const modelRef = _titleModelRef || _variantTitle;

  // System detection
  const titleLower = product.title.toLowerCase();
  const tagsLower = (product.tags || []).map(t => t.toLowerCase());
  const isMxFuel = titleLower.includes('mx fuel') || titleLower.includes('mxfuel') || titleLower.startsWith('mxf ')  || titleLower.startsWith('mxf-') || tagsLower.includes('mx fuel');
  const hasFuel = titleLower.includes('fuel') || tagsLower.some(t => t === 'fuel');
  const isM18 = titleLower.includes('m18') || tagsLower.includes('m18');
  const isM12 = titleLower.includes('m12') || tagsLower.includes('m12');
  const isFilaire = tagsLower.includes('filaire');

  let badgeLabel = '';
  let badgeBg = 'bg-[#1A1A1A]';
  if (isMxFuel) { badgeLabel = 'MX FUEL'; badgeBg = 'bg-orange-600'; }
  else if (isM18 && hasFuel) { badgeLabel = 'M18 FUEL'; badgeBg = 'bg-[#DB021D]'; }
  else if (isM12 && hasFuel) { badgeLabel = 'M12 FUEL'; badgeBg = 'bg-[#DB021D]'; }
  else if (isM18) { badgeLabel = 'M18'; badgeBg = 'bg-[#1A1A1A]'; }
  else if (isM12) { badgeLabel = 'M12'; badgeBg = 'bg-[#1A1A1A]'; }
  else if (isFilaire) { badgeLabel = 'FILAIRE'; badgeBg = 'bg-[#6B7280]'; }

  const displayPrice = isPro ? priceHT : priceTTC;
  const displayCompareAt = isPro ? compareAtPriceHT : compareAtPriceTTC;
  const priceLabel = isPro ? 'ht' : 'ttc';

  // ━━ EXTRACT KEY SPEC (Nm, J, mm, W, Ah, etc.) ━━
  const extractPowerSpec = (): string | null => {
    // 1. Try metafield first
    const mfs = variant?.metafields || [];
    const metafieldMetric = mfs.find((m) => m?.key === 'card_metric')?.value;
    if (metafieldMetric) return metafieldMetric;

    // 2. Try title extraction
    const specPattern = /(\d+(?:[.,]\d+)?)\s*(nm|n\.m|joules?|j|watts?|w|mm|kg|ah|ga|kn|cpm|rpm)\b/i;
    const match = cleanTitle.match(specPattern) || product.title.match(specPattern);
    if (match) {
      const number = match[1];
      let unit = match[2].toLowerCase();
      if (unit === 'n.m' || unit === 'nm') unit = 'Nm';
      else if (unit === 'joules' || unit === 'joule' || unit === 'j') unit = 'J';
      else if (unit === 'watts' || unit === 'watt' || unit === 'w') unit = 'W';
      else if (unit === 'ah') unit = 'Ah';
      else unit = unit.toUpperCase();
      return `${number} ${unit}`;
    }
    return null;
  };

  const keySpec = extractPowerSpec();

  // ━━ KIT vs NU detection ━━
  const getKitNuInfo = (): { hasKit: boolean; hasNu: boolean; minPrice: number; maxPrice: number } | null => {
    if (variants.length < 2) return null;

    let hasKit = false;
    let hasNu = false;
    let minPrice = Infinity;
    let maxPrice = 0;

    for (const edge of variants) {
      const v = edge.node;
      const vTitle = (v.title || '').toLowerCase();
      const vPrice = parseFloat(v.price?.amount || '0');

      // Detect "nu" variants: title ends with 0, -0, contains "nu", "seule", or is the cheapest
      const isNu = /\b(nu|seule|0|z)\b/i.test(vTitle) || vTitle.endsWith('-0') || vTitle === '0';

      if (isNu) {
        hasNu = true;
        minPrice = Math.min(minPrice, vPrice);
      } else {
        hasKit = true;
        maxPrice = Math.max(maxPrice, vPrice);
      }
    }

    if (hasKit && hasNu && minPrice < maxPrice) {
      return { hasKit, hasNu, minPrice, maxPrice };
    }
    return null;
  };

  const kitNuInfo = getKitNuInfo();

  // ━━ STOCK STATUS ━━
  const isAvailable = variant?.availableForSale !== false;

  // Voltage badge
  let voltage = '';
  if (isMxFuel) voltage = '72V';
  else if (isM18) voltage = '18V';
  else if (isM12) voltage = '12V';

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVariants && onQuickView) {
      onQuickView(product);
      return;
    }
    if (variant?.id) {
      setAdded(true);
      await addToCart(variant.id, 1);
      setTimeout(() => setAdded(false), 1200);
    }
  };

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/produit/${product.handle}`}
        className="group flex flex-col h-full bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-md"
      >
        {/* ━━ Image Zone ━━ */}
        <div className="relative aspect-square bg-[#FAFAFA]">
          {/* System badge — top-left */}
          {badgeLabel && (
            <span className={`absolute top-2 left-2 z-10 ${badgeBg} text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[3px]`}>
              {badgeLabel}
            </span>
          )}

          {/* Promo badge — top-right */}
          {hasDiscount && (
            <span className="absolute top-2 right-2 z-10 bg-[#DB021D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]">
              -{discountPercent}%
            </span>
          )}

          {/* Product image */}
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              fill
              className="object-contain p-4 lg:p-5 group-hover:scale-[1.03] transition-transform duration-300 ease-out"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 fill-gray-200" viewBox="0 0 24 24">
                <path d="M22 13h-8v-2h8v2zm0-6h-8v2h8V7zm-8 10h8v-2h-8v2zm-2-8v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2zm-1.5 6l-2.25-3-1.75 2.26-1.25-1.51L3.5 15h7z" />
              </svg>
            </div>
          )}

          {/* Quick-add — subtle, appears on hover */}
          <button
            onClick={handleQuickAdd}
            className={`absolute bottom-2 right-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${added
              ? 'bg-emerald-500 text-white scale-110'
              : 'bg-white/90 text-[#1A1A1A] border border-gray-200 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A]'
              }`}
            aria-label="Ajouter au panier"
          >
            {added ? (
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
            ) : (
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* ━━ Info Zone ━━ */}
        <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 lg:px-3.5 lg:pb-3.5">
          {/* Title */}
          <h3 className="text-[12px] lg:text-[13px] font-semibold text-[#1A1A1A] leading-[1.4] line-clamp-2 min-h-[2.2rem] lg:min-h-[2.4rem] group-hover:text-[#DB021D] transition-colors">
            {cleanTitle}
          </h3>

          {/* Key spec only (voltage is already visible via system badge on image) */}
          {keySpec && (
            <span className="inline-flex self-start items-center mt-1.5 text-[10px] font-bold text-[#6B7280] tracking-wide">
              {keySpec}
            </span>
          )}

          {/* Spacer to push price to bottom */}
          <div className="flex-grow" />

          {/* Price */}
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-[15px] lg:text-base font-black text-[#1A1A1A] leading-none tracking-tight">
                {displayPrice.toFixed(2).replace('.', ',')} €
              </span>
              <span className="text-[9px] text-[#9CA3AF] font-medium uppercase">{priceLabel}</span>
            </div>
            {hasDiscount && displayCompareAt && (
              <span className="text-[10px] text-[#9CA3AF] line-through mt-0.5 block">
                {displayCompareAt.toFixed(2).replace('.', ',')} €
              </span>
            )}
          </div>

          {/* Stock — only show "Sur commande" (in stock is implied) */}
          {!isAvailable && (
            <p className="text-[9px] font-semibold mt-1 text-orange-500 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-orange-400" />
              Sur commande
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
