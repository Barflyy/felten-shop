'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/shopify/types';
import { PriceDisplayCompact } from '@/components/price-display';

export function ProductCardMini({ product }: { product: Product }) {
    const variant = product.variants?.edges[0]?.node;
    const price = product.priceRange?.minVariantPrice || variant?.price;
    const compareAtPrice = variant?.compareAtPrice;
    const image = product.featuredImage || product.images?.edges[0]?.node;

    const title = product.title
        .replace(/M18 FUEL™?\s*/gi, '')
        .replace(/M12 FUEL™?\s*/gi, '')
        .replace(/M18™?\s*/gi, '')
        .replace(/M12™?\s*/gi, '')
        .split(' - ')[0]
        .split(',')[0]
        .trim();

    return (
        <Link
            href={`/produit/${product.handle}`}
            className="group flex flex-col h-full bg-white rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
        >
            <div className="relative bg-[#F7F7F7] aspect-[4/3]">
                {image?.url ? (
                    <Image
                        src={image.url}
                        alt={image.altText || product.title}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                        sizes="(min-width: 1024px) 240px, 200px"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-300 text-sm">Image</span>
                    </div>
                )}
            </div>

            <div className="p-3 flex flex-col flex-1 border-t border-gray-50">
                <h3 className="text-[12px] font-medium text-[#4B5563] line-clamp-2 leading-snug min-h-[calc(2*1.375em)] mb-2 group-hover:text-[#1A1A1A] transition-colors">
                    {title}
                </h3>
                <div className="mt-auto">
                    <PriceDisplayCompact
                        priceHT={price?.amount || '0'}
                        compareAtPriceHT={compareAtPrice?.amount}
                    />
                </div>
            </div>
        </Link>
    );
}
