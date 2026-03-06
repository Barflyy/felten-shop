'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Check,
  X,
  Shield,
  Truck,
  Package,
  Zap,
  Battery,
  MapPin,
  Lock,
  FileText,
  ChevronRight
} from 'lucide-react';

// =============================================================================
// MOCK DATA
// =============================================================================

const productData = {
  title: 'M18 FUEL™ FPD3',
  subtitle: 'Perceuse à Percussion',
  sku: 'M18-FPD3-502X',
  rating: 4.9,
  reviewCount: 247,
  basePrice: 189,
  oneKeyPrice: 40,
  badges: ['Best Seller', 'FUEL™'],

  images: [
    { id: 1, src: '/products/drill-1.png', alt: 'Vue principale' },
    { id: 2, src: '/products/drill-2.png', alt: 'Vue latérale' },
    { id: 3, src: '/products/drill-3.png', alt: 'Vue détail' },
    { id: 4, src: '/products/drill-4.png', alt: 'En action' },
  ],

  specs: [
    { label: 'Couple max', value: '135 Nm' },
    { label: 'Vitesse', value: '0-2100 RPM' },
    { label: 'Mandrin', value: '13 mm' },
    { label: 'Poids', value: '2.1 kg' },
  ],

  variants: [
    {
      id: 'solo',
      name: 'Outil Nu',
      description: 'Sans batterie ni chargeur',
      priceAdd: 0,
      boxContents: [
        { name: 'Perceuse M18 FPD3', quantity: 1, included: true },
        { name: 'Poignée latérale', quantity: 1, included: true },
        { name: 'Coffret HD BOX', quantity: 1, included: true },
        { name: 'Batterie M18', quantity: 0, included: false },
        { name: 'Chargeur', quantity: 0, included: false },
      ],
    },
    {
      id: 'kit-2ah',
      name: 'Kit 2x 2.0Ah',
      description: 'Avec 2 batteries compactes',
      priceAdd: 80,
      boxContents: [
        { name: 'Perceuse M18 FPD3', quantity: 1, included: true },
        { name: 'Poignée latérale', quantity: 1, included: true },
        { name: 'Coffret HD BOX', quantity: 1, included: true },
        { name: 'Batterie M18 B2 (2.0Ah)', quantity: 2, included: true },
        { name: 'Chargeur rapide M12-M18', quantity: 1, included: true },
      ],
    },
    {
      id: 'kit-5ah',
      name: 'Kit 2x 5.0Ah',
      description: 'Autonomie maximale',
      priceAdd: 160,
      recommended: true,
      badge: 'Choix des Pros',
      boxContents: [
        { name: 'Perceuse M18 FPD3', quantity: 1, included: true },
        { name: 'Poignée latérale', quantity: 1, included: true },
        { name: 'Coffret HD BOX', quantity: 1, included: true },
        { name: 'Batterie M18 B5 (5.0Ah)', quantity: 2, included: true },
        { name: 'Chargeur rapide M12-M18', quantity: 1, included: true },
      ],
    },
  ],
};

// =============================================================================
// COMPONENTS
// =============================================================================

// Image Gallery
function ImageGallery({
  images,
  hasOneKey,
  badges
}: {
  images: typeof productData.images;
  hasOneKey: boolean;
  badges: string[];
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative aspect-square bg-zinc-900 rounded-sm border border-zinc-800 overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className={`px-3 py-1 text-xs font-bold rounded-sm ${
                badge === 'Best Seller'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-white'
              }`}
            >
              {badge}
            </span>
          ))}
          {hasOneKey && (
            <span className="px-3 py-1 text-xs font-bold rounded-sm bg-blue-600 text-white flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              ONE-KEY™
            </span>
          )}
        </div>

        {/* Image */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center p-8"
          animate={{ scale: isZoomed ? 1.1 : 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Placeholder - en production, utiliser next/image */}
          <div className="w-full h-full bg-zinc-800 rounded-sm flex items-center justify-center">
            <Zap className="w-32 h-32 text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setActiveImage(index)}
            className={`relative w-20 h-20 rounded-sm border-2 overflow-hidden transition-all ${
              activeImage === index
                ? 'border-red-600'
                : 'border-zinc-800 hover:border-zinc-600'
            }`}
          >
            <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
              <Zap className="w-8 h-8 text-zinc-600" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Star Rating
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.floor(rating)
                ? 'fill-yellow-500 text-yellow-500'
                : 'fill-zinc-700 text-zinc-700'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-zinc-400">
        {rating} ({count} avis)
      </span>
    </div>
  );
}

// ONE-KEY Toggle
function OneKeyToggle({
  enabled,
  onChange,
  priceAdd
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  priceAdd: number;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-full p-4 rounded-sm border-2 transition-all text-left ${
        enabled
          ? 'border-red-600 bg-red-600/10'
          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${
            enabled ? 'bg-red-600' : 'bg-zinc-800'
          }`}>
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">ONE-KEY™</span>
              <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-sm">
                Optionnel
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Tracking GPS, verrouillage à distance, personnalisation
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-white">+{priceAdd}€</span>
          {/* Toggle Switch */}
          <div className={`mt-2 w-12 h-6 rounded-full p-1 transition-colors ${
            enabled ? 'bg-red-600' : 'bg-zinc-700'
          }`}>
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: enabled ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}

// Variant Selector
function VariantSelector({
  variants,
  selected,
  onChange
}: {
  variants: typeof productData.variants;
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
        Configuration
      </label>
      <div className="space-y-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => onChange(variant.id)}
            className={`w-full p-4 rounded-sm border-2 transition-all text-left relative ${
              selected === variant.id
                ? 'border-red-600 bg-zinc-900'
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
            }`}
          >
            {/* Recommended Badge */}
            {variant.badge && (
              <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-sm">
                {variant.badge}
              </span>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Radio */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selected === variant.id ? 'border-red-600' : 'border-zinc-600'
                }`}>
                  {selected === variant.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 bg-red-600 rounded-full"
                    />
                  )}
                </div>

                <div>
                  <div className="font-bold text-white">{variant.name}</div>
                  <div className="text-sm text-zinc-500">{variant.description}</div>
                </div>
              </div>

              <div className="text-right">
                {variant.priceAdd > 0 ? (
                  <span className="font-bold text-white">+{variant.priceAdd}€</span>
                ) : (
                  <span className="text-sm text-zinc-500">Inclus</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Box Contents
function BoxContents({
  contents
}: {
  contents: { name: string; quantity: number; included: boolean }[];
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
        Contenu de la boîte
      </label>
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
        <AnimatePresence mode="popLayout">
          {contents.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 py-2 ${
                index !== contents.length - 1 ? 'border-b border-zinc-800' : ''
              }`}
            >
              <div className={`w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0 ${
                item.included ? 'bg-green-600/20' : 'bg-zinc-800'
              }`}>
                {item.included ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-zinc-600" />
                )}
              </div>
              <span className={`flex-1 text-sm ${
                item.included ? 'text-white' : 'text-zinc-600 line-through'
              }`}>
                {item.name}
              </span>
              {item.included && item.quantity > 1 && (
                <span className="text-sm font-bold text-red-500">
                  x{item.quantity}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Price Display with Animation
function PriceDisplay({ price, comparePrice }: { price: number; comparePrice?: number }) {
  return (
    <div className="flex items-baseline gap-3">
      <motion.span
        key={price}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-black text-red-600"
      >
        {price}€
      </motion.span>
      {comparePrice && comparePrice > price && (
        <span className="text-lg text-zinc-500 line-through">
          {comparePrice}€
        </span>
      )}
      <span className="text-sm text-zinc-500">HT</span>
    </div>
  );
}

// Quick Specs
function QuickSpecs({ specs }: { specs: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {specs.map((spec) => (
        <div key={spec.label} className="bg-zinc-900 border border-zinc-800 rounded-sm p-3">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{spec.label}</div>
          <div className="text-sm font-bold text-white mt-0.5">{spec.value}</div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ProductPage() {
  const [hasOneKey, setHasOneKey] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState('kit-5ah');

  // Calculate total price
  const totalPrice = useMemo(() => {
    const variant = productData.variants.find(v => v.id === selectedVariant);
    let price = productData.basePrice;
    if (variant) price += variant.priceAdd;
    if (hasOneKey) price += productData.oneKeyPrice;
    return price;
  }, [selectedVariant, hasOneKey]);

  // Get current variant
  const currentVariant = useMemo(() => {
    return productData.variants.find(v => v.id === selectedVariant) || productData.variants[0];
  }, [selectedVariant]);

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Left - Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ImageGallery
              images={productData.images}
              hasOneKey={hasOneKey}
              badges={productData.badges}
            />

            {/* Quick Specs - Desktop */}
            <div className="hidden lg:block mt-6">
              <QuickSpecs specs={productData.specs} />
            </div>
          </div>

          {/* Right - Buy Box */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-zinc-500 font-mono">{productData.sku}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase text-white">
                {productData.title}
              </h1>
              <p className="text-lg text-zinc-400 mt-1">{productData.subtitle}</p>

              <div className="mt-3">
                <StarRating rating={productData.rating} count={productData.reviewCount} />
              </div>
            </div>

            {/* Price */}
            <PriceDisplay price={totalPrice} comparePrice={449} />

            {/* Quick Specs - Mobile */}
            <div className="lg:hidden">
              <QuickSpecs specs={productData.specs} />
            </div>

            {/* Divider */}
            <div className="h-px bg-zinc-800" />

            {/* ONE-KEY Toggle */}
            <OneKeyToggle
              enabled={hasOneKey}
              onChange={setHasOneKey}
              priceAdd={productData.oneKeyPrice}
            />

            {/* Variant Selector */}
            <VariantSelector
              variants={productData.variants}
              selected={selectedVariant}
              onChange={setSelectedVariant}
            />

            {/* Box Contents */}
            <BoxContents contents={currentVariant.boxContents} />

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-sm transition-colors flex items-center justify-center gap-2">
                <Package className="w-5 h-5" />
                AJOUTER AU PANIER
              </button>

              <button className="w-full py-3 border-2 border-zinc-700 hover:border-zinc-600 text-white font-medium rounded-sm transition-colors flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Ajouter au devis
              </button>
            </div>

            {/* Reassurance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-green-600/20 rounded-sm flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <div className="text-white font-medium">En stock</div>
                  <div className="text-zinc-500 text-xs">Expédié sous 24h</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-red-600/20 rounded-sm flex items-center justify-center">
                  <Shield className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <div className="text-white font-medium">Garantie</div>
                  <div className="text-zinc-500 text-xs">3 ans Milwaukee</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-zinc-800 rounded-sm flex items-center justify-center">
                  <Truck className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Livraison</div>
                  <div className="text-zinc-500 text-xs">Gratuite dès 100€</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 bg-zinc-800 rounded-sm flex items-center justify-center">
                  <Lock className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Paiement</div>
                  <div className="text-zinc-500 text-xs">100% sécurisé</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
