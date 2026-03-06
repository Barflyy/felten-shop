'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useCustomer } from '@/context/customer-context';

export default function InscriptionPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useCustomer();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/compte');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(email, password, firstName, lastName);

    if (result.success) {
      router.push('/compte');
    } else {
      setError(result.error || 'Une erreur est survenue lors de l\'inscription.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#DB021D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      {/* Header — Minimal */}
      <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="w-10 h-10 flex items-center justify-center -ml-2 text-[#1A1A1A] hover:bg-gray-50 rounded-full transition-colors" aria-label="Retour à l'accueil">
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </Link>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-black text-[#1A1A1A] tracking-tighter underline decoration-[#DB021D] decoration-2 underline-offset-4" style={{ fontFamily: 'var(--font-oswald)' }}>FELTEN</span>
            <span className="text-xl font-medium text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-oswald)' }}> SHOP</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 pb-12">
        <div className="w-full max-w-[460px]">

          <div className="mb-8 text-center">
            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#1A1A1A] mb-3 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              Inscription
            </h1>
            <p className="text-[15px] text-gray-500 font-medium max-w-sm mx-auto">
              Rejoignez Felten Shop pour un accès rapide à votre historique et un paiement simplifié.
            </p>
          </div>

          <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            {/* Subtle top border accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DB021D] to-[#990114]" />

            {error && (
              <div className="bg-red-50 border border-red-100 text-[#DB021D] text-[13px] font-bold px-4 py-3 rounded-lg mb-6 flex items-start gap-2.5">
                <span className="mt-0.5 text-base leading-none">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 focus-within:text-[#DB021D] transition-colors">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#1A1A1A] ml-1 transition-colors">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#DB021D] focus:bg-white focus:ring-1 focus:ring-[#DB021D] transition-all"
                    placeholder="Jean"
                  />
                </div>
                <div className="space-y-1.5 focus-within:text-[#DB021D] transition-colors">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#1A1A1A] ml-1 transition-colors">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#DB021D] focus:bg-white focus:ring-1 focus:ring-[#DB021D] transition-all"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div className="space-y-1.5 focus-within:text-[#DB021D] transition-colors">
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#1A1A1A] ml-1 transition-colors">
                  Adresse Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#DB021D] focus:bg-white focus:ring-1 focus:ring-[#DB021D] transition-all"
                  placeholder="nom@entreprise.com"
                />
              </div>

              <div className="space-y-1.5 focus-within:text-[#DB021D] transition-colors">
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#1A1A1A] ml-1 transition-colors">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#DB021D] focus:bg-white focus:ring-1 focus:ring-[#DB021D] transition-all"
                    placeholder="8 caractères minimum"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 bottom-0 px-4 text-gray-400 hover:text-[#1A1A1A] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <p className="text-[12px] font-medium text-gray-500 text-center leading-relaxed pt-2">
                En créant un compte, vous acceptez nos{' '}
                <Link href="/cgv" className="text-[#1A1A1A] underline hover:text-[#DB021D]">CGV</Link>
                {' '}et notre{' '}
                <Link href="/politique-de-confidentialite" className="text-[#1A1A1A] underline hover:text-[#DB021D]">politique de confidentialité</Link>.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full h-12 lg:h-14 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-[14px] lg:text-[15px] font-black uppercase tracking-[0.15em] rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#1A1A1A]/20 active:scale-[0.98] mt-6 flex items-center justify-center relative overflow-hidden"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Création...</span>
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-[14px] font-medium text-gray-500">
                Déjà un compte professionnel ?{' '}
                <Link href="/compte/connexion" className="text-[#DB021D] font-black hover:underline tracking-wide translate-y-[1px] inline-block">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
