'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useCustomer } from '@/context/customer-context';

export default function ConnexionPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useCustomer();

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
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      router.push('/compte');
    } else {
      setError(result.error || 'Email ou mot de passe incorrect.');
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
        <div className="w-full max-w-[420px]">

          <div className="mb-8 text-center">
            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#1A1A1A] mb-3 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              Connexion
            </h1>
            <p className="text-[15px] text-gray-500 font-medium">
              Heureux de vous revoir ! Connectez-vous pour accéder à votre espace pro.
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
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-[#1A1A1A] transition-colors">
                    Mot de passe
                  </label>
                  <a
                    href="mailto:florian@felten.lu?subject=Mot%20de%20passe%20oubli%C3%A9"
                    className="text-[11px] font-bold text-gray-400 hover:text-[#DB021D] transition-colors mr-1"
                  >
                    Oublié ?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-[15px] font-medium text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:border-[#DB021D] focus:bg-white focus:ring-1 focus:ring-[#DB021D] transition-all"
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full h-12 lg:h-14 bg-[#DB021D] hover:bg-[#B8011A] text-white text-[14px] lg:text-[15px] font-black uppercase tracking-[0.15em] rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#DB021D]/20 active:scale-[0.98] mt-6 flex items-center justify-center relative overflow-hidden"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Connexion...</span>
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-[13px] font-medium text-gray-500 mb-4">Pas encore de compte professionnel ?</p>
              <Link
                href="/compte/inscription"
                className="inline-flex items-center justify-center w-full h-12 border-2 border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-gray-100 text-[#1A1A1A] text-[12px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-[0.98]"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
