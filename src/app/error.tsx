'use client';

import { Wrench } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="w-20 h-20 bg-[#F5F5F5] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-10 h-10 text-[#DB021D]" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#1A1A1A] mb-3">
          Un problème est survenu
        </h1>

        {/* Message */}
        <p className="text-[#6B7280] text-[15px] leading-relaxed mb-8">
          Notre équipe technique est prévenue. Réessayez dans quelques instants.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="w-full sm:w-auto px-6 py-3 bg-[#DB021D] hover:bg-[#B8011A] text-white text-[13px] font-black uppercase rounded-xl transition-colors active:scale-[0.98]"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 border-2 border-[#1A1A1A] text-[#1A1A1A] text-[13px] font-black uppercase rounded-xl hover:border-[#DB021D] hover:text-[#DB021D] transition-colors text-center"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
