'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus, Plus, Trash2, Package, ArrowRight, ArrowLeft,
  Truck, Shield, Lock, RotateCcw, Phone, Check, Tag,
  ChevronDown, Loader2, ShoppingBag, Zap,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';
import { useCustomer } from '@/context/customer-context';

const FREE_SHIPPING_THRESHOLD_HT = 150;

export default function PanierPage() {
  const { cart, isLoading, updateCartLine, removeCartLine, addToCart, associateCustomer } = useCart();
  const { vatInfo } = useVAT();
  const { customer, accessToken, isAuthenticated } = useCustomer();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const displayHT = vatInfo.displayMode === 'HT';
  const lines = cart?.lines.edges || [];

  const totalHT = lines.reduce((sum, { node: line }) => {
    return sum + parseFloat(line.merchandise.price.amount) * line.quantity;
  }, 0);
  const vatRate = vatInfo.applicableVATRate;
  const vatAmount = vatInfo.reverseCharge ? 0 : totalHT * vatRate / 100;
  const totalTTC = totalHT + vatAmount;
  const displayTotal = displayHT ? totalHT : totalTTC;

  const shippingProgress = Math.min((totalHT / FREE_SHIPPING_THRESHOLD_HT) * 100, 100);
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD_HT - totalHT, 0);
  const shippingFree = shippingProgress >= 100;

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center px-6 text-center">
        {/* Header — Clean & Premium */}
        <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
          <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="w-10 h-10 flex items-center justify-center -ml-2 text-[#1A1A1A] hover:bg-gray-50 rounded-full transition-colors" aria-label="Retour à la boutique">
              <ArrowLeft className="w-6 h-6" strokeWidth={2} />
            </Link>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[17px] font-black uppercase tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>
                Mon Panier
              </span>
            </div>
            <div className="w-10" />
          </div>
        </header>

        <div className="w-20 h-20 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-6 mt-16">
          <ShoppingBag className="w-8 h-8 text-gray-300" strokeWidth={2} />
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-[#1A1A1A] mb-3 uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Votre panier est vide</h1>
        <p className="text-[15px] font-medium text-gray-500 mb-8 max-w-sm">
          Découvrez notre catalogue d&apos;outillage professionnel Milwaukee et équipez-vous avec les meilleurs outils.
        </p>
        <Link
          href="/collections"
          className="group flex items-center justify-center gap-2.5 h-14 px-10 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-[14px] lg:text-[15px] font-black uppercase tracking-[0.15em] rounded-xl active:scale-[0.98] transition-all shadow-md relative overflow-hidden"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 flex items-center gap-2.5">
            Découvrir le catalogue
            <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      {/* Header — Clean & Premium */}
      <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="w-10 h-10 flex items-center justify-center -ml-2 text-[#1A1A1A] hover:bg-gray-50 rounded-full transition-colors" aria-label="Continuer mes achats">
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </Link>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[17px] font-black uppercase tracking-tight text-[#1A1A1A] translate-y-[1px]" style={{ fontFamily: 'var(--font-display)' }}>
              Mon Panier
            </span>
            <span className="text-[12px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {lines.length}
            </span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Free shipping bar */}
      <div className="mt-16 bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 flex items-center gap-3 mb-1.5 md:mb-0">
            {shippingFree ? (
              <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-green-600" strokeWidth={3} />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4 text-[#DB021D]" strokeWidth={2} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {shippingFree ? (
                <p className="text-[14px] font-bold text-green-700">Félicitations, la livraison vous est offerte !</p>
              ) : (
                <p className="text-[14px] font-semibold text-[#1A1A1A]">
                  Plus que <strong className="text-[#DB021D] font-black">{amountToFreeShipping.toFixed(2).replace('.', ',')} €</strong> pour la livraison gratuite
                </p>
              )}
              <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${shippingProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${shippingFree ? 'bg-green-500' : 'bg-[#DB021D]'}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 lg:px-6 py-6 lg:py-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">

        {/* ── Left: Articles ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3 mb-6 lg:mb-0">
          <AnimatePresence mode="popLayout">
            {lines.map(({ node: line }) => {
              const unitHT = parseFloat(line.merchandise.price.amount);
              const unitDisplay = displayHT ? unitHT : unitHT * (1 + vatRate / 100);
              const lineHT = unitHT * line.quantity;
              const lineDisplay = unitDisplay * line.quantity;

              return (
                <motion.div
                  key={line.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -300, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="flex gap-4 p-4">
                    {/* Image */}
                    <Link
                      href={`/produit/${line.merchandise.product.handle}`}
                      className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#F5F5F5] shrink-0 overflow-hidden border border-gray-100"
                    >
                      {line.merchandise.image ? (
                        <Image
                          src={line.merchandise.image.url}
                          alt={line.merchandise.image.altText || line.merchandise.product.title}
                          fill
                          className="object-contain p-2.5"
                          sizes="120px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-[12px] font-black uppercase tracking-widest text-[#DB021D] mb-1">MILWAUKEE</p>
                          <Link
                            href={`/produit/${line.merchandise.product.handle}`}
                            className="text-[15px] font-bold text-[#1A1A1A] hover:text-[#DB021D] transition-colors line-clamp-2 leading-snug block"
                          >
                            {line.merchandise.product.title}
                          </Link>
                          {line.merchandise.title !== 'Default Title' && (
                            <span className="inline-block mt-1 text-[11px] font-medium text-[#6B7280] bg-[#F5F5F5] px-2 py-0.5 rounded-full">
                              {line.merchandise.title}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeCartLine(line.id)}
                          disabled={isLoading}
                          className="p-1.5 -mt-1 -mr-1 text-gray-300 hover:text-[#DB021D] transition-colors disabled:opacity-40 shrink-0"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price + Qty row */}
                      <div className="flex items-end justify-between mt-3">
                        <div>
                          <p className="text-[11px] text-[#6B7280] mb-0.5">
                            {unitHT.toFixed(2).replace('.', ',')} € HT × {line.quantity}
                          </p>
                          <p className="text-[17px] font-black text-[#DB021D]">
                            {lineDisplay.toFixed(2).replace('.', ',')} €
                            <span className="text-[11px] font-normal text-[#6B7280] ml-1">
                              {displayHT ? 'HT' : 'TTC'}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => updateCartLine(line.id, line.quantity - 1)}
                            disabled={isLoading || line.quantity <= 1}
                            className="w-9 h-9 flex items-center justify-center bg-[#F5F5F5] text-[#1A1A1A] hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center text-[14px] font-bold text-[#1A1A1A] bg-white">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => updateCartLine(line.id, line.quantity + 1)}
                            disabled={isLoading}
                            className="w-9 h-9 flex items-center justify-center bg-[#F5F5F5] text-[#1A1A1A] hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Promo code */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setPromoOpen(v => !v)}
              className="flex items-center gap-2.5 w-full px-5 py-4 text-[13px] font-semibold text-[#1A1A1A] hover:text-[#DB021D] transition-colors"
            >
              <Tag className="w-4 h-4 text-[#DB021D]" strokeWidth={2} />
              Ajouter un code promo
              <ChevronDown className={`w-4 h-4 text-[#6B7280] ml-auto transition-transform duration-200 ${promoOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {promoOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 px-5 pb-4 border-t border-gray-50 pt-3">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Entrez votre code"
                      className="flex-1 h-11 px-4 text-[13px] font-medium border border-gray-200 rounded-xl outline-none focus:border-[#DB021D] transition-colors placeholder:text-gray-300 uppercase"
                    />
                    <button
                      disabled={!promoCode.trim()}
                      className="h-11 px-5 bg-[#1A1A1A] text-white text-[12px] font-black uppercase rounded-xl hover:bg-[#DB021D] transition-colors disabled:opacity-40"
                    >
                      Appliquer
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right: Recap sidebar ──────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-24">
            <div className="px-5 pt-5 pb-4 border-b border-gray-50">
              <p className="text-[11px] font-black uppercase tracking-wider text-[#6B7280] mb-4">Récapitulatif</p>

              <div className="space-y-2.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6B7280]">Sous-total HT</span>
                  <span className="font-semibold text-[#1A1A1A]">{totalHT.toFixed(2).replace('.', ',')} €</span>
                </div>

                {vatInfo.reverseCharge ? (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#6B7280]">TVA (autoliquidation)</span>
                    <span className="font-semibold text-green-600">0,00 €</span>
                  </div>
                ) : vatRate > 0 ? (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#6B7280]">TVA ({vatRate}%)</span>
                    <span className="font-semibold text-[#1A1A1A]">{vatAmount.toFixed(2).replace('.', ',')} €</span>
                  </div>
                ) : null}

                <div className="flex justify-between text-[13px]">
                  <span className="text-[#6B7280]">Livraison</span>
                  <span className={`font-semibold ${shippingFree ? 'text-green-600' : 'text-[#1A1A1A]'}`}>
                    {shippingFree ? 'Gratuite' : 'Calculée au checkout'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="px-5 py-4 border-b border-gray-50">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-[13px] font-bold text-[#1A1A1A] uppercase">
                    Total {displayHT ? 'HT' : 'TTC'}
                  </p>
                  {!displayHT && vatRate > 0 && (
                    <p className="text-[11px] text-[#6B7280]">TVA {vatRate}% incluse</p>
                  )}
                </div>
                <span className="text-[26px] font-black text-[#DB021D]">
                  {displayTotal.toFixed(2).replace('.', ',')} €
                </span>
              </div>
              {displayHT && vatRate > 0 && (
                <p className="text-[11px] text-[#6B7280] mt-1 text-right">
                  soit {totalTTC.toFixed(2).replace('.', ',')} € TTC
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="px-6 py-5 space-y-4">
              <button
                onClick={async () => {
                  if (!cart?.checkoutUrl) return;
                  setIsCheckingOut(true);
                  try {
                    if (isAuthenticated && customer?.email) {
                      await associateCustomer(customer.email, accessToken || undefined);
                    }
                    window.location.href = cart.checkoutUrl;
                  } catch {
                    setIsCheckingOut(false);
                  }
                }}
                disabled={isCheckingOut}
                className="group relative flex items-center justify-center gap-2.5 w-full h-14 bg-[#DB021D] hover:bg-[#B8011A] text-white text-[15px] lg:text-[16px] font-black uppercase tracking-[0.1em] rounded-xl active:scale-[0.98] transition-all disabled:opacity-70 overflow-hidden shadow-md shadow-[#DB021D]/20"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  {isCheckingOut ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Redirection...</>
                  ) : (
                    <>Valider la commande <ArrowRight className="w-5 h-5" /></>
                  )}
                </span>
              </button>

              {/* Reassurance */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Lock, label: 'Paiement\nsécurisé' },
                  { icon: RotateCcw, label: 'Retours\n14 jours' },
                  { icon: Phone, label: 'SAV\nMilwaukee' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-[#F9F9F9]">
                    <Icon className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                    <span className="text-[9px] text-[#6B7280] text-center whitespace-pre-line leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/collections"
                className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-gray-400 hover:text-[#DB021D] transition-colors py-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Continuer mes achats
              </Link>
            </div>
          </div>

          {/* Why ShopFelten */}
          <div className="mt-5 bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 hidden lg:block">
            <p className="text-[12px] font-black uppercase tracking-widest text-[#1A1A1A] mb-4">Pourquoi ShopFelten ?</p>
            <div className="space-y-3">
              {[
                { icon: Truck, text: 'Livraison express' },
                { icon: Shield, text: 'Garantie Milwaukee étendue' },
                { icon: Phone, text: 'SAV expert' },
                { icon: Zap, text: 'Revendeur officiel' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#DB021D] group-hover:text-white transition-colors text-gray-500">
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className="text-[13px] font-bold text-gray-600 group-hover:text-[#1A1A1A] transition-colors">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
