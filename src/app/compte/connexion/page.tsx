'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1A1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-[480px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="w-9 h-9 flex items-center justify-center -ml-1 text-[#1A1A1A]" aria-label="Retour">
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Link>
          <Link href="/" className="text-[1rem] tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">FELTEN</span>
            <span className="font-normal text-[#1A1A1A]"> SHOP</span>
          </Link>
          <div className="w-9" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-[22px] font-bold text-[#1A1A1A] mb-1">
              Connexion
            </h1>
            <p className="text-[14px] text-[#6B7280]">
              Connectez-vous pour accéder à votre espace.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-[#DB021D] text-[13px] font-medium px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full h-11 px-3.5 rounded-lg border border-gray-200 bg-white text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                placeholder="nom@entreprise.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-medium text-[#6B7280]">
                  Mot de passe
                </label>
                <a
                  href="mailto:florian@felten.lu?subject=Mot%20de%20passe%20oubli%C3%A9"
                  className="text-[11px] font-medium text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full h-11 pl-3.5 pr-11 rounded-lg border border-gray-200 bg-white text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 px-3.5 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#DB021D] hover:bg-[#B8011A] text-white text-[14px] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-[13px] text-[#6B7280]">
              Pas encore de compte ?{' '}
              <Link href="/compte/inscription" className="font-semibold text-[#1A1A1A] hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
