'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';

interface StickyAddToCartProps {
  productTitle: string;
  productImage?: string;
  variantId: string;
  priceHT: number;
  compareAtPriceHT?: number;
  isAvailable: boolean;
  onAddToCart: () => void;
  mainButtonVisible: boolean;
}

export function StickyAddToCart({
  productTitle,
  productImage,
  variantId,
  priceHT,
  isAvailable,
  mainButtonVisible,
}: StickyAddToCartProps) {
  const { addToCart, isLoading } = useCart();
  const { vatInfo } = useVAT();
  const isPro = vatInfo.displayMode === 'HT';
  const vatRate = vatInfo.applicableVATRate || 21;
  const [justAdded, setJustAdded] = useState(false);

  const displayPrice = isPro ? priceHT : priceHT * (1 + vatRate / 100);

  const handleAddToCart = async () => {
    if (!isAvailable || isLoading || !variantId) return;

    // Haptic feedback for a native app feel
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    try {
      await addToCart(variantId, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Only show when the main "Ajouter au panier" button is NOT visible
  const shouldShow = !mainButtonVisible;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          <div
            className="bg-white/90 backdrop-blur-md border-t border-gray-200/60 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]"
            style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="flex items-center gap-3 px-4 py-2.5">
              {/* Product Thumbnail */}
              <div className="relative w-11 h-11 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                {productImage ? (
                  <Image
                    src={productImage}
                    alt={productTitle}
                    fill
                    className="object-contain p-0.5"
                    sizes="44px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-500 truncate leading-tight">{productTitle}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[16px] font-bold text-[#1A1A1A]">
                    {displayPrice.toFixed(2).replace('.', ',')} &euro;
                  </span>
                  <span className="text-[10px] text-gray-400">{isPro ? 'HT' : 'TTC'}</span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                onClick={handleAddToCart}
                disabled={!isAvailable || isLoading}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 h-11 px-5 rounded-lg font-bold text-[13px] uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${justAdded
                  ? 'bg-emerald-500 text-white'
                  : isAvailable
                    ? 'bg-[#DB021D] text-white shadow-lg shadow-red-500/20'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : justAdded ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Ajouter
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
