'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Percent, FileText, CreditCard, Users, Truck } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useCart } from '@/context/cart-context';

const ADVANTAGES = [
  { icon: Percent, text: 'Prix HT et gestion TVA intracommunautaire' },
  { icon: FileText, text: 'Factures automatiques téléchargeables' },
  { icon: CreditCard, text: 'Paiement par virement et conditions spéciales' },
  { icon: Users, text: 'Interlocuteur dédié pour vos commandes' },
  { icon: Truck, text: 'Livraison prioritaire sur chantier' },
];

export default function B2BSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

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
    <section className="py-8 lg:py-20 bg-[#1A1A1A] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px)',
        }}
      />
      <div ref={ref} className="max-w-[1280px] mx-auto px-5 lg:px-8 relative z-10">
        <div className="md:flex md:items-center md:gap-12 lg:gap-16">
          {/* Left */}
          <div className="md:w-1/2 mb-8 md:mb-0">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#DB021D] text-white text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.12em] rounded-md mb-4 lg:mb-6"
            >
              ESPACE PROFESSIONNEL
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl lg:text-4xl font-black uppercase tracking-normal text-white mb-3 lg:mb-4 leading-tight"
            >
              VOUS ÊTES UN PRO ?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/55 text-[13px] lg:text-[15px] mb-6 lg:mb-8 leading-relaxed max-w-prose"
            >
              Créez votre compte professionnel et bénéficiez d&apos;avantages exclusifs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex gap-2.5 lg:gap-3"
            >
              <Link
                href="/inscription"
                className="group/btn relative inline-flex items-center justify-center gap-1.5 px-5 lg:px-8 py-3 lg:py-4 bg-[#DB021D] text-white text-[12px] lg:text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#B8011A] transition-colors active:scale-[0.97] overflow-hidden"
              >
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                COMPTE PRO
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" strokeWidth={3} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1.5 px-5 lg:px-8 py-3 lg:py-4 border border-white/20 text-white text-[12px] lg:text-sm font-medium rounded-lg hover:border-white/40 transition-colors active:scale-[0.97]"
              >
                Devis rapide
              </Link>
            </motion.div>

            {/* Quick Order */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 lg:mt-8 pt-5 lg:pt-6 border-t border-white/10 relative"
            >
              <h3 className="text-white text-[10px] lg:text-[11px] font-black uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DB021D]" />
                COMMANDE RAPIDE PAR RÉFÉRENCE
              </h3>
              <form
                onSubmit={handleQuickOrder}
                className={`flex bg-white/5 rounded-lg p-1 border overflow-hidden transition-colors ${status === 'error' ? 'border-[#DB021D]' :
                  status === 'not-found' ? 'border-orange-500' :
                    status === 'success' ? 'border-emerald-500' :
                      'border-white/10 focus-within:border-[#DB021D]/50'
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
                  className="bg-[#DB021D] text-white px-4 py-2 rounded text-[10px] lg:text-[11px] font-black uppercase tracking-wider hover:bg-[#B8011A] transition-colors whitespace-nowrap shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : status === 'success' ? (
                    'AJOUTÉ'
                  ) : (
                    'AJOUTER'
                  )}
                </button>
              </form>

              {status === 'not-found' && (
                <p className="absolute -bottom-5 left-0 text-[10px] text-orange-400 font-medium">
                  Référence introuvable.
                </p>
              )}
              {status === 'error' && (
                <p className="absolute -bottom-5 left-0 text-[10px] text-[#DB021D] font-medium">
                  Erreur. Produit indisponible.
                </p>
              )}
              {status === 'success' && (
                <p className="absolute -bottom-5 left-0 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Ajouté au panier.
                </p>
              )}
            </motion.div>
          </div>

          {/* Right: advantages */}
          <div className="md:w-1/2">
            <div className="relative space-y-3 lg:space-y-4">
              <motion.div
                className="absolute left-[17px] lg:left-[19px] top-5 bottom-5 w-[2px] bg-[#DB021D]/30 origin-top"
                initial={{ scaleY: 0 }}
                animate={isInView ? { scaleY: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
              {ADVANTAGES.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: 0.4 + i * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 lg:gap-4 relative z-10 cursor-default"
                  >
                    <div className="w-9 h-9 lg:w-10 lg:h-10 bg-[#DB021D] rounded-lg border border-white/10 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-white drop-shadow-md" strokeWidth={2.5} />
                    </div>
                    <p className="text-white text-[13px] lg:text-[15px] font-medium">{item.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
