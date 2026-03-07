'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gift, ChevronRight } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');

  return (
    <section className="py-8 lg:py-16 bg-[#F5F5F5]">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#DB021D]/10 text-[#DB021D] text-[12px] font-semibold rounded-lg mb-4 lg:mb-6">
          <Gift className="w-4 h-4" strokeWidth={2} />
          -10% sur votre première commande
        </div>

        <h2 className="text-[18px] lg:text-[26px] font-bold text-[#1A1A1A] mb-2 lg:mb-3">
          Restez informé
        </h2>
        <p className="text-[#6B7280] text-[13px] lg:text-[15px] mb-5 lg:mb-8 max-w-md mx-auto leading-relaxed">
          Recevez nos promos exclusives Milwaukee en avant-première.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setEmail('');
          }}
          className="flex gap-2 max-w-md mx-auto"
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
              className="w-full h-11 lg:h-12 px-4 rounded-lg border border-gray-200 text-[#1A1A1A] text-[13px] lg:text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DB021D]/20 focus:border-[#DB021D] bg-white"
            />
          </div>
          <button
            type="submit"
            className="h-11 lg:h-12 px-5 lg:px-6 bg-[#DB021D] text-white text-[12px] lg:text-[13px] font-semibold rounded-lg hover:bg-[#B8011A] transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer"
          >
            OK
            <ChevronRight className="w-4 h-4 hidden lg:block" strokeWidth={2} />
          </button>
        </form>

        <p className="text-[#6B7280] text-[10px] lg:text-[11px] mt-3 lg:mt-4">
          En vous inscrivant, vous acceptez notre{' '}
          <Link
            href="/politique-confidentialite"
            className="underline hover:text-[#1A1A1A] transition-colors"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
