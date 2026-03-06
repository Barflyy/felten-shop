'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/lib/shopify/types';
import { formatPrice } from './utils/format';

interface ProductCardProps {
  product: Product;
  badge?: 'nouveau';
  size?: 'default' | 'large';
  addingId: string | null;
  onAddToCart: (variantId: string, productId: string) => void;
  priority?: boolean;
}

export default function ProductCard({
  product,
  badge,
  size = 'default',
  addingId,
  onAddToCart,
  priority = false,
}: ProductCardProps) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

  const variants = product.variants?.edges || [];
  const hasVariants = variants.length > 1;
  const currentVariant = variants[selectedVariantIdx]?.node || variants[0]?.node;

  const variantId = currentVariant?.id;
  const price = currentVariant?.price?.amount || product.priceRange.minVariantPrice.amount;
  const comparePrice = currentVariant?.compareAtPrice?.amount || product.compareAtPrice?.amount;

  const discount =
    comparePrice && parseFloat(comparePrice) > parseFloat(price)
      ? Math.round(
        ((parseFloat(comparePrice) - parseFloat(price)) /
          parseFloat(comparePrice)) *
        100
      )
      : null;
  const isFuel =
    product.title.toLowerCase().includes('fuel') ||
    (product.tags || []).some((t) => t.toLowerCase() === 'fuel');
  const isAdding = addingId === product.id;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`group/card flex-shrink-0 snap-start bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col transition-shadow duration-300 hover:shadow-xl ${size === 'large'
        ? 'w-[85%] min-[480px]:w-[60%] md:w-auto lg:w-auto'
        : 'w-[78%] min-[480px]:w-[55%] md:w-auto lg:w-auto'
        }`}
    >
      <Link href={`/produit/${product.handle}`} className="block group">
        <div className="aspect-square bg-[#F8F8F8] relative overflow-hidden">
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
            {discount && (
              <span className="bg-[#DB021D] text-white text-[11px] font-black px-2.5 py-1 rounded-md uppercase">
                -{discount}%
              </span>
            )}
            {badge === 'nouveau' && (
              <span className="bg-[#16A34A] text-white text-[11px] font-black px-2.5 py-1 rounded-md uppercase">
                NOUVEAU
              </span>
            )}
            {isFuel && !badge && (
              <span className="bg-[#1A1A1A] text-white text-[11px] font-black px-2.5 py-1 rounded-md uppercase">
                FUEL
              </span>
            )}
          </div>
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              fill
              priority={priority}
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        {product.productType && (
          <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
            {product.productType}
          </span>
        )}
        <Link href={`/produit/${product.handle}`}>
          <h3 className="text-[13px] font-bold text-[#1A1A1A] line-clamp-2 leading-snug mb-2 hover:text-[#DB021D] transition-colors">
            {product.title}
          </h3>
        </Link>
        <div className="flex-grow" />

        {/* Variant Toggle */}
        {hasVariants && (
          <div className="flex bg-[#F5F5F5] p-1 rounded-md mb-2 mt-2" onClick={(e) => e.preventDefault()}>
            {variants.slice(0, 2).map((edge, idx) => {
              const isNu = edge.node.title.toLowerCase().match(/nu|seule|z|0$/);
              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedVariantIdx(idx);
                  }}
                  className={`flex-1 text-[10px] font-black uppercase tracking-wider py-1.5 rounded transition-all ${selectedVariantIdx === idx
                    ? 'bg-white text-[#DB021D] shadow-sm'
                    : 'text-gray-500 hover:text-[#1A1A1A]'
                    }`}
                >
                  {isNu ? 'Outil Nu' : 'Kit'}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-lg font-black text-[#1A1A1A]">
            {formatPrice(price)} €{' '}
            <span className="text-[11px] font-semibold text-[#6B7280]">TTC</span>
          </span>
          {comparePrice && parseFloat(comparePrice) > parseFloat(price) && (
            <span className="text-[12px] text-[#6B7280] line-through">
              {formatPrice(comparePrice)} €
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#16A34A] font-semibold mt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full" />
          En stock · Expédition J+1
        </p>

        {/* Button: outline by default → red on card hover */}
        <motion.button
          disabled={!variantId || isAdding}
          onClick={() => {
            if (variantId) onAddToCart(variantId, product.id);
          }}
          whileTap={{ scale: 0.92 }}
          className="group/cart w-full mt-3 py-3.5 text-[11px] min-[400px]:text-[12px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all duration-300 ease-out disabled:opacity-60 cursor-pointer overflow-hidden relative border-2 border-[#DB021D] text-[#DB021D] bg-transparent group-hover/card:bg-[#DB021D] group-hover/card:text-white group-hover/card:shadow-sm group-hover/card:shadow-[#DB021D]/25 whitespace-nowrap px-2"
        >
          <span className="absolute inset-0 -translate-x-full group-hover/cart:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.span
                key="adding"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                  className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full inline-block"
                />
                Ajout…
              </motion.span>
            ) : (
              <motion.span
                key="default"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 truncate"
              >
                <ShoppingCart className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
                <span className="truncate">AJOUTER AU PANIER</span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.article>
  );
}
