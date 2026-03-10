'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Lock, ShieldCheck, MapPin, Headphones, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const TOOLS = [
  { src: '/images/categories/outils-electroportatifs.webp', alt: 'Perceuse Milwaukee' },
  { src: '/images/categories/batteries-chargeurs.webp', alt: 'Batteries M18' },
  { src: '/images/ecosystems/m18.webp', alt: 'Ecosystème M18' },
  { src: '/images/categories/eclairage.webp', alt: 'Éclairage chantier' },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Garantie 3 ans',
    desc: 'Activée par nos soins, zéro paperasse.',
  },
  {
    icon: MapPin,
    title: 'Showroom Clervaux',
    desc: 'Venez tester vos futurs outils.',
  },
  {
    icon: Headphones,
    title: 'SAV Expert Local',
    desc: 'Florian vous répond directement.',
  },
];

export default function PasswordPage() {
  const router = useRouter();
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    const res = await fetch('/api/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  };

  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const handleEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setEmailLoading(true);
    setEmailError(false);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setEmailSent(true);
      } else {
        setEmailError(true);
      }
    } catch {
      setEmailError(true);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-[480px] mx-auto px-4 h-14 flex items-center justify-center">
          <span className="text-[1rem] tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">FELTEN</span>
            <span className="font-normal text-[#1A1A1A]"> SHOP</span>
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">

          {/* Badge */}
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DB021D] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DB021D]" />
            </span>
            <span className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-[0.15em]">
              Ouverture prochainement
            </span>
          </div>

          {/* Hero */}
          <div className="text-center mb-8">
            <h1 className="text-[26px] lg:text-[32px] font-bold text-[#1A1A1A] leading-[1.15] mb-2">
              Votre revendeur<br />
              <span className="text-[#DB021D]">Milwaukee</span> arrive.
            </h1>
            <p className="text-[14px] text-[#6B7280]">
              +450 outils pros. Luxembourg.
            </p>
          </div>

          {/* Action Zone */}
          <div className="w-full mb-10">
            {!isPasswordMode ? (
              <div>
                {!emailSent ? (
                  <>
                    <form onSubmit={handleEmail} className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Entrez votre e-mail"
                          className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-gray-200 bg-white text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!email || emailLoading}
                        className="w-full h-11 bg-[#DB021D] hover:bg-[#B8011A] disabled:opacity-40 text-white text-[14px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {emailLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Inscription...
                          </>
                        ) : (
                          <>
                            Me prévenir de l&apos;ouverture
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                    {emailError && (
                      <div className="bg-red-50 text-[#DB021D] text-[13px] font-medium px-4 py-3 rounded-lg mt-3">
                        Une erreur est survenue. Réessayez.
                      </div>
                    )}
                    <p className="text-[12px] text-[#9CA3AF] text-center mt-3">
                      Soyez informé dès l&apos;ouverture du site.
                    </p>
                    <div className="text-center mt-4">
                      <button
                        onClick={() => setIsPasswordMode(true)}
                        className="text-[12px] text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Lock className="w-3 h-3" />
                        Accès VIP / Pro
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center bg-[#F5F5F5] rounded-lg p-6">
                    <div className="w-10 h-10 rounded-full bg-[#DB021D]/10 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-5 h-5 text-[#DB021D]" />
                    </div>
                    <p className="text-[15px] font-semibold text-[#1A1A1A] mb-1">C&apos;est noté !</p>
                    <p className="text-[13px] text-[#6B7280]">
                      Vous serez prévenu dès l&apos;ouverture du site.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <form onSubmit={handlePassword} className="space-y-3">
                  <div>
                    <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(false); }}
                        placeholder="Mot de passe"
                        className={`w-full h-11 pl-10 pr-3.5 rounded-lg border bg-white text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none transition-colors ${
                          error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#1A1A1A]'
                        }`}
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="w-full h-11 bg-[#DB021D] hover:bg-[#B8011A] disabled:opacity-40 text-white text-[14px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      <>
                        Entrer sur le site
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
                {error && (
                  <div className="bg-red-50 text-[#DB021D] text-[13px] font-medium px-4 py-3 rounded-lg mt-3">
                    Mot de passe incorrect.
                  </div>
                )}
                <div className="text-center mt-4">
                  <button
                    onClick={() => { setIsPasswordMode(false); setError(false); }}
                    className="text-[12px] text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Retour
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tool Images */}
          <div className="flex justify-center gap-3 mb-10">
            {TOOLS.map((tool) => (
              <div
                key={tool.src}
                className="w-[80px] h-[80px] lg:w-[96px] lg:h-[96px] rounded-lg bg-[#F5F5F5] overflow-hidden relative"
              >
                <Image
                  src={tool.src}
                  alt={tool.alt}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center gap-2 bg-[#F5F5F5] rounded-lg p-4">
                <div className="w-9 h-9 rounded-lg bg-[#DB021D]/10 flex items-center justify-center">
                  <f.icon className="w-[18px] h-[18px] text-[#DB021D]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1A1A1A] mb-0.5">{f.title}</p>
                  <p className="text-[12px] text-[#6B7280] leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-6 pt-4 text-center border-t border-gray-100 mt-auto">
        <a
          href="https://wa.me/352621304952"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors"
        >
          Une question ? Contactez Florian &rarr;
        </a>
      </footer>
    </div>
  );
}
