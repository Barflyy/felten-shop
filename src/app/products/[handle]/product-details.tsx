'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  ShoppingCart,
  Package,
  AlertTriangle,
  Star,
  Zap,
  Headphones
} from 'lucide-react';
import { Product, BoxContentItem } from '@/lib/shopify/types';
import { useCart } from '@/context/cart-context';
import { getBoxContents } from '@/lib/box-contents';
import { getProductDetailSpecs } from '@/lib/product-specs';
import { PriceDisplay } from '@/components/price-display';
import { StickyAddToCart } from '@/components/mobile/StickyAddToCart';

interface ProductDetailsProps {
  product: Product;
  relatedProducts?: Product[];
}

// =============================================================================
// IMAGE GALLERY — Immersive, edge-to-edge on mobile
// =============================================================================
function ImageGallery({
  images,
  title,
  selectedImageIndex = 0,
  onImageChange,
  isNew = false
}: {
  images: { url: string; altText: string | null }[];
  title: string;
  selectedImageIndex?: number;
  onImageChange?: (index: number) => void;
  isNew?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(selectedImageIndex);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedImageIndex === activeIndex) return;
    setActiveIndex(selectedImageIndex);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: selectedImageIndex * scrollRef.current.offsetWidth,
        behavior: 'instant'
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageIndex]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
        onImageChange?.(newIndex);
      }
    }
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
    onImageChange?.(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-2xl flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-zinc-300 mb-2" />
        <span className="text-zinc-400 text-sm">{title}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile: Full-screen edge-to-edge immersive slider */}
      <div className="lg:hidden -mx-4">
        <div className="relative bg-gradient-to-b from-zinc-100/80 to-white">
          {isNew && (
            <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#111] text-white text-[10px] font-black uppercase tracking-wider rounded-md">
              Nouveau
            </span>
          )}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full snap-center"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt={image.altText || title}
                    fill
                    className="object-contain p-6"
                    sizes="100vw"
                    priority={index === 0}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Floating pagination capsule — inside the image area */}
          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-[5px] bg-black/20 backdrop-blur-md px-2.5 py-1.5"
              style={{ borderRadius: 20 }}
            >
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    scrollRef.current?.scrollTo({
                      left: index * (scrollRef.current?.offsetWidth || 0),
                      behavior: 'smooth'
                    });
                  }}
                  className="transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    width: activeIndex === index ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: activeIndex === index ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  }}
                  aria-label={`Image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Spacious gallery with thumbnails */}
      <div className="hidden lg:block space-y-4">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-zinc-50 to-white rounded-2xl overflow-hidden group">
          {isNew && (
            <span className="absolute top-5 left-5 z-10 px-3.5 py-1.5 bg-[#111] text-white text-xs font-black uppercase tracking-wider rounded-md">
              Nouveau
            </span>
          )}
          <div className="absolute inset-0">
            <Image
              key={activeIndex}
              src={images[activeIndex]?.url || images[0].url}
              alt={images[activeIndex]?.altText || title}
              fill
              className="object-contain p-12 transition-transform duration-500 group-hover:scale-105"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative w-[72px] h-[72px] xl:w-[88px] xl:h-[88px] flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  activeIndex === index
                    ? 'border-[#DB021D] ring-1 ring-[#DB021D]/20 shadow-sm'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.altText || `${title} ${index + 1}`}
                  fill
                  className="object-contain p-2"
                  sizes="88px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// QUANTITY SELECTOR — Pill style
// =============================================================================
function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 99
}: {
  quantity: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center bg-zinc-100 rounded-xl h-11 min-[375px]:h-12">
      <button
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className="w-10 min-[375px]:w-12 h-full flex items-center justify-center text-zinc-500 hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Diminuer la quantité"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span
        className="w-7 min-[375px]:w-8 text-center font-black text-[15px] text-[#1A1A1A] tabular-nums select-none"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {quantity}
      </span>
      <button
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="w-10 min-[375px]:w-12 h-full flex items-center justify-center text-zinc-500 hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Augmenter la quantité"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// =============================================================================
// ACCORDION — Clean with animated +/- icon
// =============================================================================
function Accordion({
  title,
  children,
  defaultOpen = false
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span
          className={`font-bold uppercase tracking-wide text-sm transition-colors ${
            isOpen ? 'text-[#1A1A1A]' : 'text-zinc-500 group-hover:text-[#1A1A1A]'
          }`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </span>
        {/* Animated +/- icon */}
        <span className={`relative w-5 h-5 flex items-center justify-center transition-colors ${isOpen ? 'text-[#DB021D]' : 'text-zinc-400'}`}>
          <span className="absolute w-3 h-[1.5px] bg-current rounded-sm" />
          <span className={`absolute w-3 h-[1.5px] bg-current rounded-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? '' : 'rotate-90'}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-sm text-zinc-600 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// BOX CONTENTS CARD — Expandable with first item preview
// =============================================================================
function BoxContentsCard({
  items,
  fallbackImage
}: {
  items: BoxContentItem[];
  fallbackImage?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const showToggle = items.length > 1;
  const visibleItems = expanded ? items : items.slice(0, 1);

  return (
    <div className="pt-3">
      <div className="flex items-center gap-2 mb-2.5">
        <Package className="w-4 h-4 text-[#DB021D]" />
        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
          Contenu du kit
        </label>
        <span className="text-[11px] text-zinc-400 font-medium">
          ({items.length} {items.length > 1 ? 'éléments' : 'élément'})
        </span>
      </div>
      <div className="bg-zinc-50 rounded-xl border border-zinc-200/80 overflow-hidden">
        <div className="divide-y divide-zinc-200/60">
          {visibleItems.map((item, index) => {
            const imgSrc = item.image || (index === 0 ? fallbackImage : null);
            return (
              <div key={index} className="flex items-center gap-3 px-3 py-2.5">
                <div className="relative w-10 h-10 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={item.label}
                      fill
                      className="object-contain p-1"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-zinc-300" />
                    </div>
                  )}
                </div>
                <span className="text-[13px] text-zinc-700 font-medium flex-1 leading-snug">
                  {item.label}
                </span>
                {item.qty > 1 && (
                  <span className="flex-shrink-0 min-w-[24px] h-6 bg-[#DB021D] text-white text-[11px] font-bold flex items-center justify-center rounded-md px-1.5">
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
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// KIT SUMMARY HELPER
// =============================================================================
function getKitSummary(items: BoxContentItem[]): { type: 'full' | 'partial' | 'bare' | 'bare-case'; summary: string } {
  if (!items || items.length === 0) {
    return { type: 'bare', summary: '' };
  }

  const lowerItems = items.map(i => ({ ...i, labelLower: i.label.toLowerCase() }));

  const batteries = lowerItems.filter(i =>
    i.labelLower.includes('batterie') ||
    i.labelLower.includes('battery') ||
    i.labelLower.includes('accu')
  );

  const hasCharger = lowerItems.some(i =>
    i.labelLower.includes('chargeur') ||
    i.labelLower.includes('charger')
  );

  const caseItem = lowerItems.find(i =>
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
        summary: `Machine nue en ${caseType} (sans batterie ni chargeur)`
      };
    }
    return {
      type: 'bare',
      summary: 'Machine nue (sans coffret, batterie ni chargeur)'
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
    summary: parts.join(' + ')
  };
}

function getVariantLabel(kitInfo: { type: string; summary: string }): string {
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

// Extract key features as bullet points from HTML description
function extractKeyFeatures(html: string): string[] {
  if (!html) return [];

  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const sentences = text.split(/(?<=\.)\s+/).map(s => s.trim()).filter(s => s.length > 15);

  const features: string[] = [];
  const seen = new Set<string>();

  const specPatterns: { key: string; pattern: RegExp }[] = [
    { key: 'capacity', pattern: /\d+[.,]?\d*\s*(litres?|L)\b/i },
    { key: 'torque', pattern: /\d+[.,]?\d*\s*(Nm|N\.m)\b/i },
    { key: 'flow', pattern: /\d+[.,]?\d*\s*(L\/min|m³\/h)\b/i },
    { key: 'speed', pattern: /\d+[.,]?\d*\s*(tr\/min|rpm|min-1)\b/i },
    { key: 'hepa', pattern: /filtre\s+HEPA/i },
    { key: 'class', pattern: /classe\s+[LMH]\b/i },
    { key: 'motor', pattern: /(brushless|POWERSTATE)/i },
    { key: 'battery', pattern: /(sans[\s-]fil|autonomie|batterie\s+\d)/i },
    { key: 'diameter', pattern: /(?:jusqu|diamètre).{0,15}\d+\s*mm/i },
    { key: 'weight', pattern: /\d+[.,]?\d*\s*kg\b/i },
  ];

  for (const { key, pattern } of specPatterns) {
    if (seen.has(key) || features.length >= 4) break;

    for (const sentence of sentences) {
      if (pattern.test(sentence) && !seen.has(key)) {
        const cleaned = sentence.length > 120
          ? sentence.substring(0, sentence.lastIndexOf(' ', 120)) + '\u2026'
          : sentence.replace(/\.$/, '');
        features.push(cleaned);
        seen.add(key);
        break;
      }
    }
  }

  return features;
}

// =============================================================================
// PRODUCT CARD FOR CROSS-SELLING
// =============================================================================
function RelatedProductCard({ product }: { product: Product }) {
  const { addToCart, isLoading } = useCart();
  const price = product.priceRange?.minVariantPrice;
  const image = product.featuredImage || product.images?.edges[0]?.node;
  const variantId = product.variants?.edges?.[0]?.node?.id;

  return (
    <div className="flex-shrink-0 w-[160px] lg:w-[220px] group">
      <Link href={`/products/${product.handle}`}>
        <div className="relative aspect-square bg-gradient-to-br from-zinc-50 to-white rounded-xl overflow-hidden border border-zinc-200/80 group-hover:border-[#DB021D]/40 group-hover:shadow-md transition-all duration-300">
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              sizes="220px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-10 h-10 text-zinc-300" />
            </div>
          )}
        </div>
        <h4 className="mt-2.5 text-xs font-bold text-[#1A1A1A] line-clamp-2 leading-tight group-hover:text-[#DB021D] transition-colors">
          {product.title}
        </h4>
      </Link>
      {price && (
        <p className="mt-1.5 text-sm font-black text-[#DB021D] whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
          {parseFloat(price.amount).toFixed(2).replace('.', ',')} &euro;
        </p>
      )}
      {variantId && (
        <button
          onClick={() => addToCart(variantId)}
          disabled={isLoading}
          className="mt-2 w-full h-11 flex items-center justify-center gap-2 bg-[#DB021D] text-white text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-[#b80000] active:scale-95 transition-all disabled:opacity-50 shadow-sm"
          aria-label={`Ajouter ${product.title}`}
        >
          <ShoppingCart className="w-4 h-4" />
          Ajouter
        </button>
      )}
    </div>
  );
}

// =============================================================================
// PRODUCT REVIEWS (seeded random per product)
// =============================================================================

const REVIEW_POOL = [
  { name: 'Pierre D.', city: 'Lyon', rating: 5, text: 'Excellent rapport qualit\u00e9/prix. Robuste et fiable, exactement ce qu\'il faut sur chantier.' },
  { name: 'Marc L.', city: 'Bruxelles', rating: 5, text: 'Livraison rapide, produit conforme. Je recommande ce vendeur les yeux ferm\u00e9s.' },
  { name: 'Jean-Fran\u00e7ois R.', city: 'Luxembourg', rating: 4, text: 'Tr\u00e8s bon produit Milwaukee comme d\'habitude. Un peu lourd mais la puissance est l\u00e0.' },
  { name: 'S\u00e9bastien M.', city: 'Li\u00e8ge', rating: 5, text: 'D\u00e9j\u00e0 mon 3e achat chez Felten. Service client au top et garantie 3 ans tr\u00e8s appr\u00e9ciable.' },
  { name: 'Thomas B.', city: 'Strasbourg', rating: 5, text: 'Utilis\u00e9 quotidiennement depuis 6 mois, aucun souci. La qualit\u00e9 Milwaukee n\'est plus \u00e0 prouver.' },
  { name: 'Laurent K.', city: 'Metz', rating: 4, text: 'Bon produit, fait le job. L\'autonomie sur batterie est correcte pour une utilisation intensive.' },
  { name: 'Nicolas W.', city: 'Namur', rating: 5, text: 'Commande trait\u00e9e en 24h, emballage soign\u00e9. Le produit est exactement comme d\u00e9crit.' },
  { name: 'Christophe A.', city: 'Mulhouse', rating: 5, text: 'Top ! Batterie compatible avec tout mon parc M18. \u00c7a c\'est un vrai avantage Milwaukee.' },
  { name: 'David P.', city: 'Arlon', rating: 4, text: 'Solide et bien con\u00e7u. Petit b\u00e9mol sur le poids mais sinon rien \u00e0 redire.' },
  { name: 'Yannick G.', city: 'Nancy', rating: 5, text: 'Pro depuis 15 ans, j\'ai tout essay\u00e9. Milwaukee c\'est ce qui tient le mieux dans la dur\u00e9e.' },
  { name: 'Fr\u00e9d\u00e9ric V.', city: 'Thionville', rating: 5, text: 'Enregistrement garantie g\u00e9r\u00e9 par Felten, c\'est un vrai plus. Produit impeccable.' },
  { name: 'Olivier H.', city: 'Charleroi', rating: 4, text: 'Bonne finition, bonne prise en main. Conforme \u00e0 mes attentes pour un usage professionnel.' },
  { name: 'Alexandre C.', city: 'Reims', rating: 5, text: 'J\'\u00e9quipe toute mon \u00e9quipe chez Felten. Prix pros comp\u00e9titifs et stock toujours dispo.' },
  { name: 'St\u00e9phane J.', city: 'Dijon', rating: 5, text: 'Super exp\u00e9rience d\'achat. Site clair, paiement facile, et le produit est arriv\u00e9 nickel.' },
  { name: 'Beno\u00eet F.', city: 'Tournai', rating: 4, text: 'Produit de qualit\u00e9 pro. Un peu cher mais on en a pour son argent avec Milwaukee.' },
  { name: 'Julien T.', city: 'Esch-sur-Alzette', rating: 5, text: 'Parfait pour mon activit\u00e9 d\'artisan. Fiable et endurant, je ne changerais pour rien.' },
  { name: 'Maxime N.', city: 'Lille', rating: 5, text: 'Commande re\u00e7ue le lendemain. Emballage costaud et produit en parfait \u00e9tat.' },
  { name: 'Patrick S.', city: 'Mons', rating: 4, text: 'Bonne machine, solide. Le syst\u00e8me PACKOUT pour le rangement est un vrai gain de temps.' },
];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = ((s >>> 0) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function ProductReviews({ handle }: { handle: string }) {
  const seed = hashString(handle);
  const reviews = seededShuffle(REVIEW_POOL, seed).slice(0, 3 + (seed % 2));
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const reviewDates = reviews.map((_, i) => {
    const daysAgo = ((seed * (i + 1) * 7) % 180) + 5;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  });

  return (
    <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 sm:py-10 lg:py-14">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-6 lg:mb-8">
        <div>
          <h2 className="text-xl lg:text-2xl font-black text-[#1A1A1A] uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Avis clients
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
                />
              ))}
            </div>
            <span className="text-sm text-zinc-500 font-medium">
              {avgRating.toFixed(1)} / 5
            </span>
            <span className="text-xs text-zinc-400">
              ({reviews.length} avis)
            </span>
          </div>
        </div>
        {/* Verified badge — green pill */}
        <span className="inline-flex items-center gap-1.5 bg-zinc-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg self-start sm:self-auto">
          <Check className="w-3.5 h-3.5" />
          Achats v&eacute;rifi&eacute;s
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-3 lg:gap-4">
        {reviews.map((review, i) => (
          <div
            key={i}
            className="bg-white border border-zinc-100 rounded-lg p-4 lg:p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center">
                  <span className="text-xs font-black text-zinc-500">{review.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A1A1A]">{review.name}</p>
                  <p className="text-[10px] text-zinc-400 font-medium">{review.city} &bull; {reviewDates[i]}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[13px] text-zinc-600 leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// CROSS-SELL SECTION
// =============================================================================
function CrossSellSection({ products }: { products: Product[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 lg:px-8 xl:px-12 pt-6 pb-8 sm:pt-10 sm:pb-16 lg:pt-14 lg:pb-14"
    >
      <div className="flex items-center gap-3 mb-5 lg:mb-7">
        <span className="w-1 h-6 bg-[#DB021D] rounded-sm" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-xl lg:text-2xl font-black text-[#1A1A1A] uppercase tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Souvent achet&eacute; avec
        </motion.h2>
      </div>
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-3 lg:gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
        >
          {products.slice(0, 6).map((relProduct, index) => (
            <motion.div
              key={relProduct.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
              className="snap-start"
            >
              <RelatedProductCard product={relProduct} />
            </motion.div>
          ))}
          {/* Spacer so last card isn't flush against screen edge */}
          <div className="w-1 flex-shrink-0 lg:hidden" aria-hidden="true" />
        </motion.div>
        <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none lg:hidden" />
      </div>
    </section>
  );
}

// =============================================================================
// TECH GRID — Extract 3 hero specs from product data
// =============================================================================
function extractTechGrid(title: string, description: string, specs: { label: string; value: string }[]): { label: string; value: string }[] {
  const grid: { label: string; value: string }[] = [];
  const text = `${title} ${description}`.toUpperCase();

  // 1. Voltage (M18 = 18V, M12 = 12V, M28 = 28V)
  const voltMatch = text.match(/\bM(\d{2})\b/) || text.match(/(\d{2})\s*V(?:OLT)?/);
  if (voltMatch) {
    grid.push({ label: 'Voltage', value: `${voltMatch[1]}V` });
  }

  // 2. Try specs table for capacity, torque, diameter, etc.
  const heroSpecs = [
    { labels: ['capacité', 'volume', 'cuve'], unit: 'L', displayLabel: 'Capacité' },
    { labels: ['couple max', 'couple'], unit: 'Nm', displayLabel: 'Couple' },
    { labels: ['diamètre', 'disque'], unit: 'mm', displayLabel: 'Diamètre' },
    { labels: ['vitesse', 'rotation'], unit: 'tr/min', displayLabel: 'Vitesse' },
    { labels: ['poids'], unit: 'kg', displayLabel: 'Poids' },
    { labels: ['energie', 'énergie', 'impact'], unit: 'J', displayLabel: 'Énergie' },
    { labels: ['classe'], unit: '', displayLabel: 'Classe' },
  ];

  for (const hero of heroSpecs) {
    if (grid.length >= 3) break;
    const found = specs.find(s =>
      hero.labels.some(l => s.label.toLowerCase().includes(l))
    );
    if (found && !grid.some(g => g.label === hero.displayLabel)) {
      grid.push({ label: hero.displayLabel, value: found.value });
    }
  }

  // 3. Fallback: extract from title/description
  if (grid.length < 3) {
    const capacityMatch = text.match(/(\d+)\s*L(?:ITRES?)?\b/);
    if (capacityMatch && !grid.some(g => g.label === 'Capacité')) {
      grid.push({ label: 'Capacité', value: `${capacityMatch[1]} L` });
    }
  }
  if (grid.length < 3) {
    const classMatch = text.match(/CLASSE\s+([LMH])\b/);
    if (classMatch && !grid.some(g => g.label === 'Classe')) {
      grid.push({ label: 'Classe', value: `Classe ${classMatch[1]}` });
    }
  }

  return grid.slice(0, 3);
}

// =============================================================================
// MAIN PRODUCT DETAILS COMPONENT
// =============================================================================
export function ProductDetails({ product, relatedProducts = [] }: ProductDetailsProps) {
  const { addToCart, isLoading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { margin: '0px' });

  // Detect ONE-KEY variants
  const variants = product.variants?.edges?.map((e) => e.node) || [];
  const hasOneKeyVariants = variants.some(v =>
    v.title?.toUpperCase().includes('ONE') ||
    v.selectedOptions?.some(opt => opt.value.toUpperCase().includes('ONE'))
  );
  const hasStandardVariants = variants.some(v =>
    !v.title?.toUpperCase().includes('ONE') &&
    !v.selectedOptions?.some(opt => opt.value.toUpperCase().includes('ONE'))
  );

  const [variantFilter, setVariantFilter] = useState<'standard' | 'onekey'>('standard');

  const getFilteredOptionValues = (optionName: string, values: string[]) => {
    if (!hasOneKeyVariants || !hasStandardVariants) return values;

    return values.filter(value => {
      const isOneKey = value.toUpperCase().includes('ONE');
      return variantFilter === 'onekey' ? isOneKey : !isOneKey;
    });
  };

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.options?.forEach((option) => {
      const filteredValues = getFilteredOptionValues(option.name, option.values);
      initial[option.name] = filteredValues[0] || option.values[0];
    });
    return initial;
  });

  useEffect(() => {
    if (hasOneKeyVariants && hasStandardVariants) {
      setSelectedOptions(prev => {
        const updated: Record<string, string> = {};
        product.options?.forEach((option) => {
          const filteredValues = getFilteredOptionValues(option.name, option.values);
          if (!filteredValues.includes(prev[option.name])) {
            updated[option.name] = filteredValues[0] || option.values[0];
          } else {
            updated[option.name] = prev[option.name];
          }
        });
        return updated;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantFilter]);

  const images = useMemo(() => product.images?.edges?.map((e) => e.node) || [], [product.images?.edges]);

  const selectedVariant = variants.find((variant) =>
    variant.selectedOptions?.every(
      (opt) => selectedOptions[opt.name] === opt.value
    )
  ) || variants[0];

  const variantImageUrl = selectedVariant?.image?.url;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (variantImageUrl) {
      const variantImageIndex = images.findIndex(
        (img) => img.url === variantImageUrl
      );
      setSelectedImageIndex(variantImageIndex !== -1 ? variantImageIndex : 0);
    }
  }, [variantImageUrl, images]);

  const price = selectedVariant?.price || product.priceRange?.minVariantPrice;
  const compareAtPrice = selectedVariant?.compareAtPrice;

  const titleParts = product.title.split(' - ');
  const mainTitle = titleParts[0];

  const modelMatch = selectedVariant?.title?.match(/([A-Z]{2,}\d+[A-Z]?\d*)/i);
  const modelRef = modelMatch ? modelMatch[1].split('-')[0] : null;

  const isAvailable = selectedVariant?.availableForSale ?? true;

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return;

    try {
      await addToCart(selectedVariant.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const technicalSpecs = getProductDetailSpecs(
    product.title,
    selectedVariant?.selectedOptions?.find(o => o.name === 'Mod\u00e8le')?.value || selectedVariant?.sku || '',
    product.productType || '',
    product.tags || []
  );

  // Detect "nouveau" from tags
  const isNew = product.tags?.some(t => ['nouveau', 'new', 'nouveauté'].includes(t.toLowerCase())) ?? false;

  // Extract hero specs for the Tech Grid
  const techGrid = extractTechGrid(
    product.title,
    product.description || '',
    technicalSpecs
  );

  return (
    <>
      <main data-product-page="true" className="bg-white lg:min-h-screen lg:pb-12">
        {/* Main Content */}
        <div className="max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 lg:px-8 xl:px-12 pt-18 lg:pt-26">

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 xl:gap-16">

            {/* Left — Image Gallery */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="lg:sticky lg:top-28 lg:self-start"
            >
              <ImageGallery
                images={images}
                title={product.title}
                selectedImageIndex={selectedImageIndex}
                onImageChange={setSelectedImageIndex}
                isNew={isNew}
              />
            </motion.div>

            {/* Right — Buy Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4 min-[375px]:space-y-5 sm:space-y-6"
            >
              {/* Product Type Tag + SKU */}
              <div className="flex items-center gap-3">
                {product.productType && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                    {product.productType}
                  </span>
                )}
                {selectedVariant?.sku && (
                  <span className="text-[11px] text-zinc-400 font-medium">
                    R&eacute;f. {selectedVariant.sku}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black text-[#1A1A1A] uppercase leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {mainTitle}
                {modelRef && (
                  <span className="text-zinc-300 font-bold text-lg lg:text-xl ml-2">({modelRef})</span>
                )}
              </h1>

              {/* Price */}
              <div className="flex items-end gap-3">
                <PriceDisplay
                  priceHT={price?.amount || '0'}
                  compareAtPriceHT={compareAtPrice?.amount}
                  size="xl"
                />
              </div>

              {/* Availability + Shipping */}
              <div className="flex items-center gap-2 flex-wrap">
                {isAvailable ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold rounded-lg">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-sm animate-pulse" />
                      En stock
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-bold rounded-lg">
                      <Zap className="w-3 h-3" />
                      Exp&eacute;di&eacute; sous 24h
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-500 text-xs font-bold rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Rupture de stock
                  </span>
                )}
              </div>

              {/* Tech Grid — Hero specs */}
              {techGrid.length > 0 && (
                <div className={`grid gap-2.5 ${techGrid.length === 3 ? 'grid-cols-3' : techGrid.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {techGrid.map((spec, i) => (
                    <div
                      key={i}
                      className="bg-[#F3F4F6] border border-zinc-200 rounded-lg px-3 py-2.5 text-center"
                    >
                      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
                        {spec.label}
                      </p>
                      <p className="text-lg font-black text-[#111] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Version Filter: Standard / ONE-KEY */}
              {hasOneKeyVariants && hasStandardVariants && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                    Version
                  </label>
                  <div className="inline-flex rounded-xl bg-zinc-100 p-0.5">
                    <button
                      onClick={() => setVariantFilter('standard')}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-xl transition-all ${
                        variantFilter === 'standard'
                          ? 'bg-white text-[#1A1A1A] shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      onClick={() => setVariantFilter('onekey')}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-xl transition-all ${
                        variantFilter === 'onekey'
                          ? 'bg-white text-[#1A1A1A] shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      ONE-KEY&trade;
                    </button>
                  </div>
                </div>
              )}

              {/* Variant Options — chip/pill style */}
              {product.options && product.options.length > 0 && product.options[0].values.length > 1 && (
                <div className="space-y-4">
                  {product.options.map((option) => {
                    const filteredValues = getFilteredOptionValues(option.name, option.values);
                    if (filteredValues.length <= 1) return null;

                    return (
                      <div key={option.name}>
                        <label className="block text-[11px] font-bold text-zinc-500 mb-2 uppercase tracking-wider">
                          {option.name} :
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {filteredValues.map((value) => {
                            const isSelected = selectedOptions[option.name] === value;
                            return (
                              <button
                                key={value}
                                onClick={() =>
                                  setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))
                                }
                                className={`px-4 py-2 text-sm font-bold rounded-full border transition-all active:scale-95 ${
                                  isSelected
                                    ? 'bg-[#DB021D] text-white border-[#DB021D]'
                                    : 'bg-white text-[#1A1A1A] border-zinc-300 hover:border-zinc-400'
                                }`}
                              >
                                {value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div ref={ctaRef} className="flex items-center gap-2 min-[375px]:gap-3 pt-2">
                <QuantitySelector quantity={quantity} onChange={setQuantity} />
                <motion.button
                  onClick={handleAddToCart}
                  disabled={!isAvailable || isLoading}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex-1 h-14 font-bold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 overflow-hidden transition-all duration-500 ${
                    addedToCart
                      ? 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)]'
                      : 'bg-[#DB021D] text-white hover:bg-[#b80000] disabled:bg-zinc-300 disabled:shadow-none disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(219,0,0,0.3)]'
                  }`}
                >
                  {/* Shine sweep on initial load */}
                  <motion.span className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
                    <motion.span
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                      style={{ skewX: '-20deg' }}
                      initial={{ left: '-33%' }}
                      animate={{ left: '133%' }}
                      transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </motion.span>

                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Ajout...
                    </span>
                  ) : addedToCart ? (
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Ajout&eacute; !
                    </motion.span>
                  ) : (
                    <>
                      <ShoppingCart className="w-4.5 h-4.5" />
                      Ajouter au panier
                    </>
                  )}
                </motion.button>
              </div>

              {/* Reassurance Strip */}
              <div className="pt-4 min-[375px]:pt-5 mt-1 border-t border-zinc-100">
                <div className="grid grid-cols-3 gap-1.5 min-[375px]:gap-2">
                  {[
                    { icon: Truck, label: 'Livraison 24h', sublabel: "D\u00e8s 100\u20ac d'achat" },
                    { icon: Shield, label: 'Garantie 3 ans', sublabel: 'Enregistr\u00e9e' },
                    { icon: Headphones, label: 'SAV Expert', sublabel: 'Support Pro' },
                  ].map(({ icon: Icon, label, sublabel }, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1 min-[375px]:gap-1.5 text-center px-1 min-[375px]:px-2 py-2.5 min-[375px]:py-3 bg-zinc-50 rounded-xl"
                    >
                      <div className="w-8 h-8 min-[375px]:w-10 min-[375px]:h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Icon className="w-4 h-4 min-[375px]:w-[18px] min-[375px]:h-[18px] text-[#DB021D]" />
                      </div>
                      <div>
                        <p className="text-[10px] min-[375px]:text-[11px] font-bold text-[#1A1A1A] leading-tight">{label}</p>
                        <p className="text-[9px] min-[375px]:text-[10px] text-zinc-400">{sublabel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        </div>

        {/* Reviews Section — zinc-50 background for separation */}
        <div className="bg-zinc-50 mt-8 sm:mt-14 lg:mt-20">
          <ProductReviews handle={product.handle} />
        </div>

        {/* Cross-Selling Section */}
        {relatedProducts.length > 0 && (
          <CrossSellSection products={relatedProducts} />
        )}

      </main>

      {/* Mobile Sticky Add to Cart Bar */}
      <StickyAddToCart
        productTitle={mainTitle}
        productImage={selectedVariant?.image?.url || images[0]?.url}
        variantId={selectedVariant?.id || ''}
        priceHT={parseFloat(price?.amount || '0')}
        compareAtPriceHT={compareAtPrice ? parseFloat(compareAtPrice.amount) : undefined}
        isAvailable={isAvailable}
        onAddToCart={handleAddToCart}
        mainButtonVisible={ctaInView}
      />
    </>
  );
}
