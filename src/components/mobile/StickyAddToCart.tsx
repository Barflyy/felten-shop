'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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

  const shouldShow = !mainButtonVisible;

  // Communicate sticky bar presence to WhatsApp button via CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sticky-bar-offset',
      shouldShow ? '60px' : '0px',
    );
    return () => {
      document.documentElement.style.setProperty('--sticky-bar-offset', '0px');
    };
  }, [shouldShow]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ${
        shouldShow ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div
        className="bg-white border-t border-gray-100"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center gap-3 px-4 py-2.5">
          {/* Product Thumbnail */}
          <div className="relative w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0">
            {productImage ? (
              <Image
                src={productImage}
                alt={productTitle}
                fill
                className="object-contain p-0.5"
                sizes="40px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-gray-200" />
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#9CA3AF] truncate leading-tight">{productTitle}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[15px] font-bold text-[#1A1A1A]">
                {displayPrice.toFixed(2).replace('.', ',')} &euro;
              </span>
              <span className="text-[10px] text-[#9CA3AF]">{isPro ? 'HT' : 'TTC'}</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable || isLoading}
            className={`flex-shrink-0 h-10 px-5 rounded-lg font-semibold text-[13px] flex items-center justify-center gap-2 transition-all duration-300 ${justAdded
              ? 'bg-emerald-500 text-white'
              : isAvailable
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : justAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Ajouter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
