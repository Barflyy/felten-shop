'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, X } from 'lucide-react';
import { useCustomer } from '@/context/customer-context';
import { useWishlist } from '@/context/wishlist-context';
import { PriceDisplayCompact } from '@/components/price-display';

interface WishlistProduct {
  handle: string;
  title: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } };
}

export default function FavorisPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useCustomer();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/compte/connexion');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch product data when wishlist items change
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    if (wishlistItems.length === 0) {
      setProducts([]);
      setHasFetched(true);
      return;
    }

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetch('/api/wishlist-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handles: wishlistItems }),
        });
        const data = await response.json();
        if (data.products) {
          // Sort products in the same order as wishlistItems
          const sorted = wishlistItems
            .map((handle) => data.products.find((p: WishlistProduct) => p.handle === handle))
            .filter(Boolean) as WishlistProduct[];
          setProducts(sorted);
        }
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
      } finally {
        setIsLoadingProducts(false);
        setHasFetched(true);
      }
    };

    fetchProducts();
  }, [wishlistItems, authLoading, isAuthenticated]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1A1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/compte" className="w-9 h-9 flex items-center justify-center -ml-1 text-[#1A1A1A]" aria-label="Retour">
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Link>
          <h1 className="text-[15px] font-semibold text-[#1A1A1A]">Mes favoris</h1>
          {wishlistItems.length > 0 && (
            <span className="ml-auto text-[12px] text-[#6B7280]">
              {wishlistItems.length} produit{wishlistItems.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-[640px] mx-auto w-full px-4 py-8">
        {/* Loading products */}
        {isLoadingProducts && !hasFetched && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1A1A1A] rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {hasFetched && wishlistItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-5">
              <Heart className="w-7 h-7 text-[#9CA3AF]" strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-semibold text-[#1A1A1A] mb-2">Aucun favori</p>
            <p className="text-[13px] text-[#6B7280] max-w-[280px] mb-6">
              Sauvegardez vos produits pr&eacute;f&eacute;r&eacute;s pour les retrouver facilement.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center justify-center h-11 px-6 bg-[#DB021D] hover:bg-[#B8011A] text-white text-[13px] font-bold uppercase rounded-lg transition-colors"
            >
              D&eacute;couvrir le catalogue
            </Link>
          </div>
        )}

        {/* Product grid */}
        {hasFetched && products.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const price = product.priceRange.minVariantPrice.amount;
              const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount;
              const hasCompare = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price);

              return (
                <div key={product.handle} className="relative group">
                  {/* Remove button */}
                  <button
                    onClick={() => removeFromWishlist(product.handle)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 border border-gray-100 flex items-center justify-center text-[#6B7280] hover:text-[#DB021D] hover:border-[#DB021D]/20 transition-colors"
                    aria-label={`Retirer ${product.title} des favoris`}
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>

                  <Link
                    href={`/produit/${product.handle}`}
                    className="block border border-gray-100 rounded-lg overflow-hidden hover:border-gray-200 transition-colors"
                  >
                    {/* Image */}
                    <div className="aspect-square bg-[#FAFAFA] relative">
                      {product.featuredImage?.url ? (
                        <Image
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText || product.title}
                          fill
                          sizes="(max-width: 640px) 50vw, 300px"
                          className="object-contain p-3"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[11px] text-[#9CA3AF]">Pas d&apos;image</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="px-3 py-2.5">
                      <p className="text-[13px] text-[#1A1A1A] font-medium line-clamp-2 leading-snug mb-1.5">
                        {product.title}
                      </p>
                      <PriceDisplayCompact
                        priceHT={price}
                        compareAtPriceHT={hasCompare ? compareAtPrice : null}
                      />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
