'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Check } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section className="bg-[#1A1A1A]">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8 py-10 lg:py-16">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-[20px] lg:text-[28px] font-bold text-white mb-2 text-balance">
            Obtenez <span className="text-[#DB021D]">-10%</span> sur votre première commande
          </h2>
          <p className="text-white/40 text-[13px] lg:text-[14px] mb-6 lg:mb-8 leading-relaxed">
            Promos, nouveautés et ventes flash — directement dans votre boîte.<br />Pas de spam, juste du Milwaukee.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 py-4 text-emerald-400 text-[14px] font-semibold">
              <Check className="w-5 h-5" strokeWidth={2.5} />
              C&apos;est note ! Verifiez votre boite mail.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
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
                  className="w-full h-12 px-4 rounded-lg border border-white/10 bg-white/5 text-white text-[14px] placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#DB021D]/50 focus:border-[#DB021D]"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-6 bg-[#DB021D] text-white text-[13px] font-bold rounded-lg hover:bg-[#B8011A] transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer"
              >
                S&apos;inscrire
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </form>
          )}

          <p className="text-white/20 text-[10px] lg:text-[11px] mt-4">
            En vous inscrivant, vous acceptez notre{' '}
            <Link
              href="/politique-confidentialite"
              className="underline hover:text-white/40 transition-colors"
            >
              politique de confidentialite
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
