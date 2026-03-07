'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Percent, FileText, CreditCard, Users, Truck } from 'lucide-react';
import { useCart } from '@/context/cart-context';

const ADVANTAGES = [
  { icon: Percent, text: 'Prix HT et gestion TVA intracommunautaire' },
  { icon: FileText, text: 'Factures automatiques téléchargeables' },
  { icon: CreditCard, text: 'Paiement par virement et conditions spéciales' },
  { icon: Users, text: 'Interlocuteur dédié pour vos commandes' },
  { icon: Truck, text: 'Livraison prioritaire sur chantier' },
];

export default function B2BSection() {
  const { addToCart } = useCart();
  const [reference, setReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | 'not-found' | null>(null);

  const handleQuickOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || isLoading) return;

    setIsLoading(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(reference.trim())}`);
      const data = await res.json();

      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        const variant = product.variants?.edges?.[0]?.node;

        if (variant?.id && variant?.availableForSale) {
          await addToCart(variant.id, 1);
          setStatus('success');
          setReference('');
        } else {
          setStatus('error');
        }
      } else {
        setStatus('not-found');
      }
    } catch (error) {
      console.error('Quick order error:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <section className="py-8 lg:py-16 bg-[#1A1A1A]">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8">
        <div className="md:flex md:items-center md:gap-12 lg:gap-16">
          {/* Left */}
          <div className="md:w-1/2 mb-8 md:mb-0">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#DB021D] text-white text-[10px] font-semibold uppercase tracking-wider rounded mb-4 lg:mb-6">
              Espace professionnel
            </span>
            <h2 className="text-[18px] lg:text-[26px] font-bold text-white mb-3 lg:mb-4 leading-tight">
              Vous êtes un pro ?
            </h2>
            <p className="text-white/50 text-[13px] lg:text-[15px] mb-6 lg:mb-8 leading-relaxed max-w-prose">
              Créez votre compte professionnel et bénéficiez d&apos;avantages exclusifs.
            </p>

            <div className="flex gap-2.5 lg:gap-3">
              <Link
                href="/inscription"
                className="inline-flex items-center justify-center gap-1.5 px-5 lg:px-8 py-3 lg:py-3.5 bg-white text-[#1A1A1A] text-[12px] lg:text-[13px] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Compte pro
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1.5 px-5 lg:px-8 py-3 lg:py-3.5 border border-white/20 text-white text-[12px] lg:text-[13px] font-medium rounded-lg hover:bg-white/5 transition-colors"
              >
                Devis rapide
              </Link>
            </div>

            {/* Quick Order */}
            <div className="mt-6 lg:mt-8 pt-5 lg:pt-6 border-t border-white/10 relative">
              <h3 className="text-white/70 text-[10px] lg:text-[11px] font-semibold uppercase tracking-wider mb-2.5">
                Commande rapide par référence
              </h3>
              <form
                onSubmit={handleQuickOrder}
                className={`flex bg-white/5 rounded-lg p-1 border overflow-hidden transition-colors ${
                  status === 'error' ? 'border-red-500' :
                  status === 'not-found' ? 'border-orange-500' :
                  status === 'success' ? 'border-emerald-500' :
                  'border-white/10 focus-within:border-white/30'
                }`}
              >
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex: FPD2-502X"
                  disabled={isLoading}
                  className="bg-transparent border-none text-white text-[12px] lg:text-[13px] px-3 py-2 w-full focus:outline-none placeholder:text-white/30 font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading || !reference.trim()}
                  className="bg-white text-[#1A1A1A] px-4 py-2 rounded text-[10px] lg:text-[11px] font-semibold uppercase tracking-wider hover:bg-gray-100 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-[#1A1A1A] rounded-full animate-spin" />
                  ) : status === 'success' ? (
                    'Ajouté'
                  ) : (
                    'Ajouter'
                  )}
                </button>
              </form>

              {status === 'not-found' && (
                <p className="absolute -bottom-5 left-0 text-[10px] text-orange-400 font-medium">
                  Référence introuvable.
                </p>
              )}
              {status === 'error' && (
                <p className="absolute -bottom-5 left-0 text-[10px] text-red-400 font-medium">
                  Erreur. Produit indisponible.
                </p>
              )}
              {status === 'success' && (
                <p className="absolute -bottom-5 left-0 text-[10px] text-emerald-400 font-medium">
                  Ajouté au panier.
                </p>
              )}
            </div>
          </div>

          {/* Right: advantages */}
          <div className="md:w-1/2">
            <div className="space-y-3 lg:space-y-4">
              {ADVANTAGES.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 lg:gap-4"
                  >
                    <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-[#DB021D]" strokeWidth={2} />
                    </div>
                    <p className="text-white/80 text-[13px] lg:text-[15px] font-medium">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
