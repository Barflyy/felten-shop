'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Package } from 'lucide-react';
import type { Product } from '@/lib/shopify/types';
import { formatPrice } from './utils/format';

interface ProductCardProps {
  product: Product;
  size?: 'default' | 'large';
  addingId: string | null;
  onAddToCart: (variantId: string, productId: string) => void;
  priority?: boolean;
}

export default function ProductCard({
  product,
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
  const isAdding = addingId === product.id;

  return (
    <article className="group/card flex-shrink-0 bg-white rounded-lg overflow-hidden flex flex-col border border-gray-100 hover:shadow-md transition-shadow duration-200 h-full">
      <Link href={`/produit/${product.handle}`} className="block relative">
        <div className="aspect-square lg:aspect-[4/3] bg-white relative overflow-hidden">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              fill
              priority={priority}
              className="object-contain p-3 lg:p-4 transition-transform duration-300 group-hover/card:scale-[1.03]"
              sizes="(max-width: 640px) 44vw, (max-width: 1024px) 45vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 lg:p-4 flex flex-col flex-grow">
        {product.productType && (
          <span className="text-[9px] lg:text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest mb-1">
            {product.productType}
          </span>
        )}
        <Link href={`/produit/${product.handle}`}>
          <h3 className="text-[12px] lg:text-sm font-semibold text-[#1A1A1A] line-clamp-2 leading-snug mb-2 lg:mb-3 group-hover/card:text-[#DB021D] transition-colors duration-200">
            {product.title}
          </h3>
        </Link>
        <div className="flex-grow" />

        {/* Variant Toggle */}
        {hasVariants && (
          <div className="flex bg-[#F5F5F5] p-0.5 rounded-lg mb-2 lg:mb-3" onClick={(e) => e.preventDefault()}>
            {variants.slice(0, 2).map((edge, idx) => {
              const isNu = edge.node.title.toLowerCase().match(/nu|seule|z|0$/);
              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedVariantIdx(idx);
                  }}
                  className={`flex-1 text-[9px] lg:text-[10px] font-semibold uppercase tracking-wider py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                    selectedVariantIdx === idx
                      ? 'bg-white text-[#1A1A1A] shadow-sm'
                      : 'text-[#9CA3AF] hover:text-[#6B7280]'
                  }`}
                >
                  {isNu ? 'Outil Nu' : 'Kit'}
                </button>
              );
            })}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-base lg:text-xl font-bold text-[#1A1A1A] tabular-nums">
            {formatPrice(price)}&nbsp;€
          </span>
          {comparePrice && parseFloat(comparePrice) > parseFloat(price) && (
            <span className="text-[10px] lg:text-xs text-[#9CA3AF] line-through tabular-nums">
              {formatPrice(comparePrice)}&nbsp;€
            </span>
          )}
          <span className="text-[9px] lg:text-[10px] font-medium text-[#9CA3AF] ml-auto">TTC</span>
        </div>

        {/* Stock */}
        <div className="flex items-center gap-1 mt-1 mb-2 lg:mb-3">
          <span className="relative flex h-1.5 w-1.5">
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#16A34A]" />
          </span>
          <span className="text-[10px] lg:text-[11px] font-medium text-[#16A34A]">
            En stock
          </span>
        </div>

        {/* CTA */}
        <button
          disabled={!variantId || isAdding}
          onClick={() => {
            if (variantId) onAddToCart(variantId, product.id);
          }}
          className="w-full py-2.5 lg:py-3 text-[10px] lg:text-[11px] font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-200 disabled:opacity-50 cursor-pointer bg-[#DB021D] text-white hover:bg-[#B8011A] active:bg-[#9A0116]"
        >
          {isAdding ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full inline-block animate-spin" />
              Ajout…
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" strokeWidth={2} />
              <span className="hidden min-[200px]:inline">Ajouter</span>
            </span>
          )}
        </button>
      </div>
    </article>
  );
}
