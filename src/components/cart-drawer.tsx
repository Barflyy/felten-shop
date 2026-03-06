'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  X, Minus, Plus, ShoppingBag, Trash2, ArrowRight,
  Package, Truck, Lock, Loader2, Check, Zap, Tag, ChevronDown,
  RotateCcw, Phone,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';
import { useCustomer } from '@/context/customer-context';
import { useState, useEffect, useCallback, useRef } from 'react';
import { shopifyFetch } from '@/lib/shopify/client';
import { PRODUCT_RECOMMENDATIONS_QUERY } from '@/lib/shopify/queries';

const FREE_SHIPPING_THRESHOLD_HT = 150;
const LU_VAT = 0.17;
const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

interface RecommendedProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText: string | null };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  variants: { edges: { node: { id: string; availableForSale: boolean; price: { amount: string; currencyCode: string } } }[] };
}

/* ─────────────────────────────────────────────
   CART ITEM
   ───────────────────────────────────────────── */

function CartItem({
  line,
  onUpdate,
  onRemove,
  isLoading,
  displayHT,
  closeCart,
}: {
  line: {
    id: string;
    quantity: number;
    merchandise: {
      id: string;
      title: string;
      product: { id: string; title: string; handle: string };
      price: { amount: string; currencyCode: string };
      image?: { url: string; altText: string | null };
    };
  };
  onUpdate: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  isLoading: boolean;
  displayHT: boolean;
  closeCart: () => void;
}) {
  const unitHT = parseFloat(line.merchandise.price.amount);
  const unitDisplay = displayHT ? unitHT : unitHT * (1 + LU_VAT);
  const lineDisplay = unitDisplay * line.quantity;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -200, transition: { duration: 0.18 } }}
      className="flex gap-4 px-5 py-5 group"
    >
      {/* Image */}
      <Link
        href={`/produit/${line.merchandise.product.handle}`}
        onClick={closeCart}
        className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0 shadow-sm"
      >
        {line.merchandise.image ? (
          <Image
            src={line.merchandise.image.url}
            alt={line.merchandise.image.altText || line.merchandise.product.title}
            fill
            className="object-contain p-2"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/produit/${line.merchandise.product.handle}`}
              onClick={closeCart}
              className="text-[14px] font-black uppercase text-[#1A1A1A] leading-tight hover:text-[#DB021D] transition-colors line-clamp-2"
              style={{ fontFamily: 'var(--font-oswald)' }}
            >
              {line.merchandise.product.title}
            </Link>
            <button
              onClick={() => onRemove(line.id)}
              disabled={isLoading}
              className="text-gray-300 hover:text-[#DB021D] transition-colors shrink-0 disabled:opacity-40 p-1 -mr-2 -mt-2"
              aria-label="Supprimer l'article"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {line.merchandise.title !== 'Default Title' && (
            <p className="text-[12px] font-medium text-gray-500 mt-1">
              {line.merchandise.title}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between mt-3">
          {/* Quantity Pill */}
          <div className="flex items-center bg-gray-50 rounded-lg p-0.5 h-8">
            <button
              onClick={() => onUpdate(line.id, line.quantity - 1)}
              disabled={isLoading || line.quantity <= 1}
              className="w-7 h-full flex items-center justify-center text-[#1A1A1A] hover:bg-white hover:shadow-sm rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-[13px] font-bold text-[#1A1A1A] tabular-nums">
              {line.quantity}
            </span>
            <button
              onClick={() => onUpdate(line.id, line.quantity + 1)}
              disabled={isLoading}
              className="w-7 h-full flex items-center justify-center text-[#1A1A1A] hover:bg-white hover:shadow-sm rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Line price */}
          <span className="text-[16px] font-black text-[#1A1A1A] tracking-tight">
            {lineDisplay.toFixed(2).replace('.', ',')} €
          </span>
        </div>
      </div>
    </motion.li>
  );
}

/* ─────────────────────────────────────────────
   COMPACT RECOMMENDATION CARD
   ───────────────────────────────────────────── */

function RecommendationCard({
  product,
  onAddToCart,
  isLoading,
  closeCart,
  displayHT,
}: {
  product: RecommendedProduct;
  onAddToCart: (variantId: string) => void;
  isLoading: boolean;
  closeCart: () => void;
  displayHT: boolean;
}) {
  const variant = product.variants.edges[0]?.node;
  if (!variant?.availableForSale) return null;
  const ht = parseFloat(variant.price.amount);
  const display = displayHT ? ht : ht * (1 + LU_VAT);

  return (
    <div className="shrink-0 w-[120px] snap-start">
      <Link href={`/produit/${product.handle}`} onClick={closeCart} className="block">
        <div className="relative w-[120px] h-[80px] rounded-lg overflow-hidden bg-[#F5F5F5]">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText || product.title}
              fill
              className="object-contain p-2"
              sizes="120px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-300" />
            </div>
          )}
        </div>
        <p className="text-[11px] font-semibold text-[#1A1A1A] mt-1.5 line-clamp-1 leading-tight">
          {product.title}
        </p>
      </Link>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[12px] font-bold text-[#1A1A1A]">
          {display.toFixed(2).replace('.', ',')} €
        </span>
        <button
          onClick={() => onAddToCart(variant.id)}
          disabled={isLoading}
          className="w-6 h-6 flex items-center justify-center border border-gray-300 text-[#6B7280] rounded-md hover:border-[#DB021D] hover:text-[#DB021D] active:scale-95 transition-all disabled:opacity-40"
          aria-label={`Ajouter ${product.title}`}
        >
          <Plus className="w-3 h-3" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCROLL FADE CONTAINER
   ───────────────────────────────────────────── */

function ScrollFadeContainer({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(true);
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 12);
  }, []);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);
  return (
    <div className="relative">
      <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
        {children}
      </div>
      <div className={`pointer-events-none absolute top-0 right-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 ${showFade ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN CART DRAWER
   ───────────────────────────────────────────── */

export function CartDrawer() {
  const { cart, isOpen, isLoading, closeCart, totalItems, updateCartLine, removeCartLine, addToCart, associateCustomer } = useCart();
  const { vatInfo } = useVAT();
  const { customer, accessToken, isAuthenticated } = useCustomer();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const displayHT = vatInfo.displayMode === 'HT';
  const lines = cart?.lines.edges || [];
  const totalHT = lines.reduce((sum, { node: line }) => {
    return sum + parseFloat(line.merchandise.price.amount) * line.quantity;
  }, 0);
  const vatAmount = totalHT * LU_VAT;
  const totalTTC = totalHT + vatAmount;
  const displayTotal = displayHT ? totalHT : totalTTC;

  const shippingProgress = Math.min((totalHT / FREE_SHIPPING_THRESHOLD_HT) * 100, 100);
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD_HT - totalHT, 0);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeCart]);

  /* Recommendations */
  const lastFetchedProductId = useRef<string | null>(null);
  const firstProductId = lines[0]?.node.merchandise.product.id ?? null;

  useEffect(() => {
    if (!isOpen || !firstProductId) return;
    if (lastFetchedProductId.current === firstProductId) return;
    lastFetchedProductId.current = firstProductId;
    let cancelled = false;
    (async () => {
      try {
        const data = await shopifyFetch<{ productRecommendations: RecommendedProduct[] | null }>({
          query: PRODUCT_RECOMMENDATIONS_QUERY,
          variables: { productId: firstProductId },
          revalidate: 0,
        });
        if (cancelled) return;
        if (data.productRecommendations) {
          const cartHandles = new Set(lines.map(l => l.node.merchandise.product.handle));
          setRecommendations(
            data.productRecommendations
              .filter(p => !cartHandles.has(p.handle) && p.variants.edges[0]?.node.availableForSale)
              .slice(0, 6)
          );
        }
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, firstProductId]);

  useEffect(() => {
    if (lines.length === 0) {
      setRecommendations([]);
      lastFetchedProductId.current = null;
    }
  }, [lines.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Overlay ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={closeCart}
          />

          {/* ── Drawer panel ──
               Mobile: full screen
               Desktop: 420px from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-0 z-[60] flex flex-col bg-white lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[420px] lg:shadow-2xl outline-none"
            role="dialog"
            aria-modal="true"
            aria-label="Panier"
          >

            {/* ═══════════════════════════════════
                 STICKY HEADER
                 ═══════════════════════════════════ */}
            <div className="flex-shrink-0 border-b border-gray-100 bg-white z-10">
              {/* Title bar */}
              <div className="flex items-center justify-between px-6 h-16">
                <h2 className="text-xl font-black uppercase tracking-wide text-[#1A1A1A]" style={{ fontFamily: 'var(--font-oswald)' }}>
                  Mon Panier
                  {totalItems > 0 && (
                    <span className="text-gray-400 ml-2 font-medium text-lg normal-case">({totalItems})</span>
                  )}
                </h2>
                <button
                  onClick={closeCart}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-black transition-all"
                  aria-label="Fermer le panier"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              {/* Free shipping progress bar */}
              {lines.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex items-center gap-2 mb-2 text-[13px]">
                    {shippingProgress >= 100 ? (
                      <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                        Livraison offerte !
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        Plus que <span className="font-bold text-[#1A1A1A]">{amountToFreeShipping.toFixed(0)} €</span> pour la livraison gratuite
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingProgress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${shippingProgress >= 100 ? 'bg-emerald-500' : 'bg-[#DB021D]'}`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════
                SCROLLABLE BODY
                ═══════════════════════════════════ */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {lines.length === 0 ? (
                /* ── Empty state ── */
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <div className="w-20 h-20 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mb-5">
                    <ShoppingBag className="w-9 h-9 text-gray-300" />
                  </div>
                  <h3 className="text-[17px] font-black text-[#1A1A1A] mb-2">Votre panier est vide</h3>
                  <p className="text-[13px] text-[#6B7280] mb-7 max-w-[220px] leading-relaxed">
                    Découvrez notre gamme d&apos;outils Milwaukee professionnels
                  </p>
                  <Link
                    href="/collections"
                    onClick={closeCart}
                    className="flex items-center gap-2 px-6 py-3.5 bg-[#DB021D] text-white text-[13px] font-black uppercase tracking-wider rounded-xl hover:bg-[#B8011A] active:scale-[0.98] transition-all"
                  >
                    Voir le catalogue
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <>
                  {/* ── Cart items ── */}
                  <ul className="divide-y divide-gray-100">
                    <AnimatePresence mode="popLayout">
                      {lines.map(({ node: line }) => (
                        <CartItem
                          key={line.id}
                          line={line}
                          onUpdate={updateCartLine}
                          onRemove={removeCartLine}
                          isLoading={isLoading}
                          displayHT={displayHT}
                          closeCart={closeCart}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>

                  {/* ── Cross-sell — compact horizontal scroll ── */}
                  {recommendations.length > 0 && (
                    <div className="px-5 py-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Zap className="w-3 h-3 text-[#6B7280]" strokeWidth={2} />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                          Souvent achetés ensemble
                        </p>
                      </div>
                      <ScrollFadeContainer>
                        {recommendations.map((product) => (
                          <RecommendationCard
                            key={product.id}
                            product={product}
                            onAddToCart={(variantId) => addToCart(variantId)}
                            isLoading={isLoading}
                            closeCart={closeCart}
                            displayHT={displayHT}
                          />
                        ))}
                      </ScrollFadeContainer>
                    </div>
                  )}

                  {/* ── Padding for visual balance ── */}
                  <div className="h-4" />
                </>
              )}
            </div>

            {/* ═══════════════════════════════════
                STICKY FOOTER — always visible
                ═══════════════════════════════════ */}
            {lines.length > 0 && (
              <div className="flex-shrink-0 bg-white border-t border-gray-100 px-6 pt-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20">
                {/* Promo code toggle */}
                <div className="mb-4">
                  <button
                    onClick={() => setPromoOpen(v => !v)}
                    className="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-black transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    <span>Vous avez un code promo ?</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${promoOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {promoOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 mt-3">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={e => setPromoCode(e.target.value.toUpperCase())}
                            placeholder="CODE PROMO"
                            className="flex-1 h-11 px-4 text-sm font-bold border border-gray-200 rounded-xl outline-none focus:border-[#DB021D] transition-colors placeholder:text-gray-300 uppercase bg-gray-50 focus:bg-white"
                          />
                          <button
                            className="h-11 px-5 bg-black text-white text-sm font-bold uppercase rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                            disabled={!promoCode.trim()}
                          >
                            Appliquer
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Price breakdown */}
                <div className="space-y-2 mb-5 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>Sous-total HT</span>
                    <span className="font-semibold text-[#1A1A1A]">{totalHT.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  {!vatInfo.reverseCharge && vatInfo.applicableVATRate > 0 && (
                    <div className="flex justify-between text-[13px] text-gray-500">
                      <span>TVA ({vatInfo.applicableVATRate}%)</span>
                      <span className="font-semibold text-[#1A1A1A]">{(totalHT * vatInfo.applicableVATRate / 100).toFixed(2).replace('.', ',')} €</span>
                    </div>
                  )}
                  {vatInfo.reverseCharge && (
                    <div className="flex justify-between text-[13px] text-gray-500">
                      <span>TVA (autoliquidation)</span>
                      <span className="font-semibold text-emerald-600">0,00 €</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[13px] text-gray-500">
                    <span>Livraison</span>
                    <span className={`font-semibold ${shippingProgress >= 100 ? 'text-emerald-600' : 'text-[#1A1A1A]'}`}>
                      {shippingProgress >= 100 ? 'Offerte' : 'Calculée à l\'étape suivante'}
                    </span>
                  </div>
                </div>

                {/* Total — prominent */}
                <div className="flex justify-between items-end mb-5">
                  <span className="text-base font-bold text-[#1A1A1A] uppercase tracking-wide">
                    Total {displayHT ? 'HT' : 'TTC'}
                  </span>
                  <span className="text-3xl font-black text-[#1A1A1A] leading-none tracking-tight">
                    {displayTotal.toFixed(2).replace('.', ',')} €
                  </span>
                </div>

                {/* CTA */}
                <button
                  onClick={async () => {
                    if (!cart?.checkoutUrl) return;
                    setIsCheckingOut(true);
                    if (isAuthenticated && customer?.email) {
                      await associateCustomer(customer.email, accessToken || undefined);
                    }
                    window.location.href = cart.checkoutUrl;
                  }}
                  disabled={isCheckingOut}
                  className="w-full flex items-center justify-center gap-3 h-14 bg-[#DB021D] hover:bg-[#B8011A] text-white text-[15px] font-black uppercase tracking-wider rounded-xl active:scale-[0.98] transition-all disabled:opacity-70 shadow-lg shadow-[#DB021D]/30"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </>
                  ) : (
                    <>
                      Paiement sécurisé
                      <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                    </>
                  )}
                </button>

                {/* Reassurance */}
                <div className="flex items-center justify-center gap-6 mt-4 opacity-60">
                  {[
                    { icon: Lock, label: 'SSL' },
                    { icon: RotateCcw, label: '14j' },
                    { icon: Truck, label: '24h' },
                  ].map(({ icon: Icon, label }) => (
                    <span key={label} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
