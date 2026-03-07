'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft, Building2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
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
  const [proPending, setProPending] = useState(false);

  // Pro fields
  const [isPro, setIsPro] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [vatStatus, setVatStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [vatCompanyName, setVatCompanyName] = useState('');
  const [vatCountryCode, setVatCountryCode] = useState('');
  const [vatError, setVatError] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/compte');
    }
  }, [isLoading, isAuthenticated, router]);

  // Debounced VAT validation
  const validateVAT = useCallback(async (number: string) => {
    const cleaned = number.replace(/[\s.\-]/g, '').toUpperCase();
    if (cleaned.length < 4) {
      setVatStatus('idle');
      setVatCompanyName('');
      setVatCountryCode('');
      setVatError('');
      return;
    }

    setVatStatus('checking');
    setVatError('');

    try {
      const res = await fetch(`/api/vat/validate?vat_number=${encodeURIComponent(cleaned)}`);
      const data = await res.json();

      if (data.valid) {
        setVatStatus('valid');
        setVatCompanyName(data.company_name || '');
        setVatCountryCode(data.country_code || cleaned.substring(0, 2));
        if (data.company_name && !companyName) {
          setCompanyName(data.company_name);
        }
      } else {
        setVatStatus('invalid');
        setVatError(data.error || 'Numéro de TVA invalide');
        setVatCompanyName('');
        setVatCountryCode('');
      }
    } catch {
      setVatStatus('invalid');
      setVatError('Erreur de vérification. Réessayez.');
    }
  }, [companyName]);

  useEffect(() => {
    if (!vatNumber.trim()) {
      setVatStatus('idle');
      setVatCompanyName('');
      setVatError('');
      return;
    }

    const timeout = setTimeout(() => {
      validateVAT(vatNumber);
    }, 600);

    return () => clearTimeout(timeout);
  }, [vatNumber, validateVAT]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (isPro && vatStatus !== 'valid') {
      setError('Veuillez entrer un numéro de TVA valide pour un compte professionnel.');
      return;
    }

    setIsSubmitting(true);

    const vatData = isPro && vatStatus === 'valid'
      ? {
          vatNumber: vatNumber.replace(/[\s.\-]/g, '').toUpperCase(),
          countryCode: vatCountryCode,
          companyName: companyName || vatCompanyName,
          valid: true,
        }
      : undefined;

    const result = await register(email, password, firstName, lastName, vatData);

    if (result.success) {
      if (vatData) {
        // Pro account: show pending confirmation before redirecting
        setProPending(true);
        setIsSubmitting(false);
      } else {
        router.push('/compte');
      }
    } else {
      setError(result.error || 'Une erreur est survenue.');
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

  if (proPending) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
          <div className="max-w-[480px] mx-auto px-4 h-14 flex items-center justify-center">
            <Link href="/" className="text-[1rem] tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">FELTEN</span>
              <span className="font-normal text-[#1A1A1A]"> SHOP</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-[400px] text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-7 h-7 text-amber-600" />
            </div>
            <h1 className="text-[22px] font-bold text-[#1A1A1A] mb-2">
              Demande de compte Pro enregistrée
            </h1>
            <p className="text-[14px] text-[#6B7280] mb-2">
              Votre compte a été créé avec succès.
            </p>
            <p className="text-[14px] text-[#6B7280] mb-6">
              Votre statut professionnel est <span className="font-semibold text-amber-600">en attente de validation</span> par notre équipe. Vous recevrez une confirmation sous 24h ouvrées.
            </p>
            <div className="bg-[#F5F5F5] rounded-lg px-4 py-3 text-left mb-8">
              <p className="text-[12px] font-semibold text-[#1A1A1A] mb-1">TVA soumise</p>
              <p className="text-[13px] text-[#6B7280]">{vatNumber.replace(/[\s.\-]/g, '').toUpperCase()}</p>
              {(companyName || vatCompanyName) && (
                <p className="text-[13px] text-[#6B7280]">{companyName || vatCompanyName}</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/compte"
                className="w-full h-11 bg-[#1A1A1A] hover:bg-[#333] text-white text-[14px] font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                Accéder à mon compte
              </Link>
              <Link
                href="/"
                className="w-full h-11 bg-white border border-gray-200 hover:border-gray-300 text-[#1A1A1A] text-[14px] font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-[480px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/compte/connexion" className="w-9 h-9 flex items-center justify-center -ml-1 text-[#1A1A1A]" aria-label="Retour">
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
              Créer un compte
            </h1>
            <p className="text-[14px] text-[#6B7280]">
              Accédez à votre historique et simplifiez vos commandes.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-[#DB021D] text-[13px] font-medium px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account type toggle */}
            <div className="flex rounded-lg bg-[#F5F5F5] p-0.5">
              <button
                type="button"
                onClick={() => setIsPro(false)}
                className={`flex-1 h-9 rounded-md text-[13px] font-semibold transition-all ${
                  !isPro
                    ? 'bg-white text-[#1A1A1A] shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#6B7280]'
                }`}
              >
                Particulier
              </button>
              <button
                type="button"
                onClick={() => setIsPro(true)}
                className={`flex-1 h-9 rounded-md text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  isPro
                    ? 'bg-white text-[#1A1A1A] shadow-sm'
                    : 'text-[#9CA3AF] hover:text-[#6B7280]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Professionnel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">
                  Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  className="w-full h-11 px-3.5 rounded-lg border border-gray-200 bg-white text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                  className="w-full h-11 px-3.5 rounded-lg border border-gray-200 bg-white text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                  placeholder="Dupont"
                />
              </div>
            </div>

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
              <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">
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
                  className="w-full h-11 pl-3.5 pr-11 rounded-lg border border-gray-200 bg-white text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                  placeholder="8 caractères minimum"
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

            {/* Pro fields */}
            {isPro && (
              <div className="space-y-4 pt-2">
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-[13px] font-semibold text-[#1A1A1A] mb-3">
                    Informations professionnelles
                  </p>

                  {/* VAT Number */}
                  <div className="mb-3">
                    <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">
                      Numéro de TVA intracommunautaire
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={vatNumber}
                        onChange={(e) => setVatNumber(e.target.value)}
                        required={isPro}
                        className={`w-full h-11 pl-3.5 pr-11 rounded-lg border bg-white text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none transition-colors ${
                          vatStatus === 'valid'
                            ? 'border-emerald-400 focus:border-emerald-500'
                            : vatStatus === 'invalid'
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-gray-200 focus:border-[#1A1A1A]'
                        }`}
                        placeholder="Ex: LU12345678, BE0123456789"
                      />
                      <div className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center">
                        {vatStatus === 'checking' && (
                          <Loader2 className="w-4 h-4 text-[#9CA3AF] animate-spin" />
                        )}
                        {vatStatus === 'valid' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                        {vatStatus === 'invalid' && (
                          <XCircle className="w-4 h-4 text-[#DB021D]" />
                        )}
                      </div>
                    </div>

                    {/* Validation feedback */}
                    {vatStatus === 'valid' && vatCompanyName && (
                      <div className="mt-2 flex items-start gap-2 bg-emerald-50 rounded-lg px-3 py-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[12px] font-semibold text-emerald-800">TVA vérifiée via VIES</p>
                          <p className="text-[12px] text-emerald-700">{vatCompanyName}</p>
                        </div>
                      </div>
                    )}
                    {vatStatus === 'valid' && !vatCompanyName && (
                      <p className="mt-1.5 text-[12px] text-emerald-600 font-medium">
                        Numéro de TVA valide
                      </p>
                    )}
                    {vatStatus === 'invalid' && vatError && (
                      <p className="mt-1.5 text-[12px] text-[#DB021D] font-medium">
                        {vatError}
                      </p>
                    )}
                    {vatStatus === 'idle' && vatNumber.length === 0 && (
                      <p className="mt-1.5 text-[11px] text-[#9CA3AF]">
                        Vérification automatique via le système VIES de l&apos;UE
                      </p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">
                      Nom de l&apos;entreprise
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required={isPro}
                      className="w-full h-11 px-3.5 rounded-lg border border-gray-200 bg-white text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                      placeholder="Nom de votre société"
                    />
                  </div>
                </div>

                {/* Pro benefits */}
                <div className="bg-[#F5F5F5] rounded-lg px-4 py-3">
                  <p className="text-[12px] font-semibold text-[#1A1A1A] mb-1.5">Avantages compte Pro</p>
                  <ul className="space-y-1">
                    <li className="text-[12px] text-[#6B7280] flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#DB021D] rounded-full flex-shrink-0" />
                      Affichage des prix HT / TTC
                    </li>
                    <li className="text-[12px] text-[#6B7280] flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#DB021D] rounded-full flex-shrink-0" />
                      Factures avec TVA conforme
                    </li>
                    <li className="text-[12px] text-[#6B7280] flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#DB021D] rounded-full flex-shrink-0" />
                      Autoliquidation TVA pour l&apos;UE (hors LU)
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
              En créant un compte, vous acceptez nos{' '}
              <Link href="/cgv" className="underline hover:text-[#1A1A1A]">CGV</Link>
              {' '}et notre{' '}
              <Link href="/politique-de-confidentialite" className="underline hover:text-[#1A1A1A]">politique de confidentialité</Link>.
            </p>

            <button
              type="submit"
              disabled={isSubmitting || (isPro && vatStatus !== 'valid')}
              className="w-full h-11 bg-[#DB021D] hover:bg-[#B8011A] text-white text-[14px] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création...
                </>
              ) : isPro ? (
                'Créer mon compte Pro'
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-[13px] text-[#6B7280]">
              Déjà un compte ?{' '}
              <Link href="/compte/connexion" className="font-semibold text-[#1A1A1A] hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
