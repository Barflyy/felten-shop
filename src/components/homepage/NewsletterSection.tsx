'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gift, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');

  return (
    <section className="pt-14 pb-12 lg:pt-24 lg:pb-20 bg-[#F5F5F5]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#DB021D]/10 text-[#DB021D] text-[13px] font-bold rounded-full mb-6"
        >
          <Gift className="w-4 h-4" strokeWidth={2} />
          -10% sur votre première commande
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[1.75rem] lg:text-4xl font-black uppercase tracking-normal text-[#1A1A1A] mb-3"
        >
          RESTEZ INFORMÉ
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[#6B7280] text-[15px] mb-8 max-w-md mx-auto leading-relaxed"
        >
          Recevez nos promos exclusives Milwaukee en avant-première. Directement dans votre boîte
          mail.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={(e) => {
            e.preventDefault();
            setEmail('');
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <div className="flex-1">
            <label htmlFor="newsletter-email" className="sr-only">
              Votre adresse email
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              autoComplete="email"
              className="w-full h-12 px-4 rounded-lg border border-gray-200 text-[#1A1A1A] text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DB021D]/30 focus:border-[#DB021D] bg-white"
            />
          </div>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            className="h-12 px-6 bg-[#DB021D] text-white text-[13px] font-black uppercase tracking-wider rounded-lg hover:bg-[#B8011A] transition-colors whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
          >
            JE M&apos;INSCRIS
            <ChevronRight className="w-4 h-4" strokeWidth={3} />
          </motion.button>
        </motion.form>

        <p className="text-[#6B7280] text-[11px] mt-4">
          En vous inscrivant, vous acceptez notre{' '}
          <Link
            href="/politique-confidentialite"
            className="underline hover:text-[#1A1A1A] transition-colors"
          >
            politique de confidentialité
          </Link>
          . Désabonnement en 1 clic.
        </p>
      </div>
    </section>
  );
}
