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
        // We assume the first product is the closest match
        const product = data.products[0];
        // Ensure variant exists and is available
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
    <section className="py-12 lg:py-20 bg-[#1A1A1A] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px)',
        }}
      />
      <div ref={ref} className="max-w-[1280px] mx-auto px-6 lg:px-8 relative z-10">
        <div className="md:flex md:items-center md:gap-12 lg:gap-16">
          {/* Left */}
          <div className="md:w-1/2 mb-10 md:mb-0">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#DB021D] text-white text-[10px] font-bold uppercase tracking-[0.12em] rounded-md mb-6"
            >
              ESPACE PROFESSIONNEL
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl lg:text-4xl font-black uppercase tracking-normal text-white mb-4 leading-tight"
            >
              VOUS ÊTES UN PRO ?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/60 text-[15px] mb-8 leading-relaxed max-w-prose"
            >
              Créez votre compte professionnel et bénéficiez d&apos;avantages exclusifs pour votre
              activité.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/inscription"
                className="group/btn relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#DB021D] text-white text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#B8011A] transition-colors active:scale-[0.97] overflow-hidden"
              >
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                CRÉER MON COMPTE PRO
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" strokeWidth={3} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white text-sm font-medium rounded-lg hover:border-white/40 transition-colors active:scale-[0.97]"
              >
                Demander un devis rapide
              </Link>
            </motion.div>

            {/* Quick Order Module */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 pt-6 border-t border-white/10 relative"
            >
              <h3 className="text-white text-[11px] font-black uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DB021D]" />
                COMMANDE RAPIDE PAR RÉFÉRENCE
              </h3>
              <form
                onSubmit={handleQuickOrder}
                className={`flex flex-col sm:flex-row bg-white/5 rounded-lg p-1 border overflow-hidden transition-colors ${status === 'error' ? 'border-[#DB021D]' :
                  status === 'not-found' ? 'border-orange-500' :
                    status === 'success' ? 'border-emerald-500' :
                      'border-white/10 focus-within:border-[#DB021D]/50'
                  }`}
              >
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex: FPD2-502X ou 4933464263"
                  disabled={isLoading}
                  className="bg-transparent border-none text-white text-[13px] px-4 py-2 w-full focus:outline-none placeholder:text-white/30 font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading || !reference.trim()}
                  className="w-full sm:w-auto mt-1 sm:mt-0 bg-[#DB021D] text-white px-5 py-2.5 sm:py-2 rounded text-[11px] font-black uppercase tracking-wider hover:bg-[#B8011A] transition-colors whitespace-nowrap shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : status === 'success' ? (
                    'AJOUTÉ'
                  ) : (
                    'AJOUTER'
                  )}
                </button>
              </form>

              {/* Feedback Message */}
              {status === 'not-found' && (
                <p className="absolute -bottom-6 left-0 text-[11px] text-orange-400 font-medium">
                  Référence introuvable.
                </p>
              )}
              {status === 'error' && (
                <p className="absolute -bottom-6 left-0 text-[11px] text-[#DB021D] font-medium">
                  Erreur lors de l&apos;ajout. Produit indisponible.
                </p>
              )}
              {status === 'success' && (
                <p className="absolute -bottom-6 left-0 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                  Produit ajouté au panier.
                </p>
              )}
            </motion.div>
          </div>

          {/* Right — 5 advantages with timeline */}
          <div className="md:w-1/2">
            <div className="relative space-y-4">
              {/* Animated timeline line */}
              <motion.div
                className="absolute left-[19px] top-5 bottom-5 w-[2px] bg-[#DB021D]/30 origin-top"
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
                    className="flex items-center gap-4 relative z-10 cursor-default"
                  >
                    <div className="w-10 h-10 bg-[#DB021D] rounded-lg border border-white/10 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white drop-shadow-md" strokeWidth={2.5} />
                    </div>
                    <p className="text-white text-[15px] font-medium">{item.text}</p>
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
