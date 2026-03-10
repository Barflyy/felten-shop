'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, ShieldCheck, MapPin, Headphones, Mail, ArrowLeft } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

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

  const handleEmail = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    // TODO: connect to newsletter API
    setEmailSent(true);
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-14 lg:py-20">
        <div className="w-full max-w-[440px] flex flex-col items-center">

          {/* ─── Logo ─── */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-5"
          >
            <span
              className="text-[1.6rem] lg:text-[1.8rem] tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="font-black text-white">FELTEN</span>
              <span className="text-[#db001c] text-[1.8rem] lg:text-[2rem] leading-none">.</span>
              <span className="font-normal text-neutral-400"> SHOP</span>
            </span>
          </motion.div>

          {/* ─── Badge ─── */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-2.5 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#db001c] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#db001c]" />
            </span>
            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-[0.2em]">
              Ouverture prochainement
            </span>
          </motion.div>

          {/* ─── Hero ─── */}
          <motion.h1
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center text-[28px] lg:text-[38px] font-bold text-white leading-[1.12] mb-3"
          >
            Votre revendeur
            <br />
            <span className="text-[#db001c]">Milwaukee</span> arrive.
          </motion.h1>

          <motion.p
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-[14px] lg:text-[15px] text-neutral-500 text-center mb-10"
          >
            +450 outils pros. Luxembourg.
          </motion.p>

          {/* ─── Action Zone ─── */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="w-full mb-12"
          >
            <AnimatePresence mode="wait">
              {!isPasswordMode ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {!emailSent ? (
                    <>
                      <form onSubmit={handleEmail} className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-neutral-600" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Entrez votre e-mail"
                            className="w-full h-11 pl-9 pr-3 bg-neutral-900 border border-neutral-800 rounded-lg text-[13px] text-white placeholder:text-neutral-600 outline-none focus:border-neutral-600 transition-colors"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!email}
                          className="h-11 px-5 bg-[#db001c] hover:bg-[#b8001a] disabled:opacity-30 text-white text-[13px] font-semibold rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                        >
                          Me prévenir
                        </button>
                      </form>
                      <p className="text-[11px] text-neutral-600 text-center mt-3">
                        Inscrivez-vous pour recevoir <span className="text-[#db001c] font-medium">-10%</span> le jour de l&apos;ouverture.
                      </p>
                      <div className="text-center mt-4">
                        <button
                          onClick={() => setIsPasswordMode(true)}
                          className="text-[11px] text-neutral-600 hover:text-neutral-400 hover:underline underline-offset-2 transition-colors cursor-pointer"
                        >
                          Accès VIP / Pro (Mot de passe)
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <div className="w-10 h-10 rounded-full bg-[#db001c]/10 flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-5 h-5 text-[#db001c]" />
                      </div>
                      <p className="text-[14px] font-medium text-white mb-1">C&apos;est noté !</p>
                      <p className="text-[12px] text-neutral-500">
                        Vous recevrez un e-mail avec votre code <span className="text-[#db001c]">-10%</span> à l&apos;ouverture.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handlePassword} className="flex gap-2">
                    <div className="relative flex-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-neutral-600" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(false); }}
                        placeholder="Mot de passe"
                        className={`w-full h-11 pl-9 pr-3 bg-neutral-900 border rounded-lg text-[13px] text-white placeholder:text-neutral-600 outline-none transition-colors ${
                          error ? 'border-red-500/50' : 'border-neutral-800 focus:border-neutral-600'
                        }`}
                        autoFocus
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !password}
                      className="h-11 px-5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-white text-[13px] font-semibold rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Entrer
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                  {error && (
                    <p className="text-[11px] text-red-400/70 mt-2 pl-1">Mot de passe incorrect.</p>
                  )}
                  <div className="text-center mt-4">
                    <button
                      onClick={() => { setIsPasswordMode(false); setError(false); }}
                      className="text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Retour
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ─── Tool Carousel ─── */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex justify-center gap-3 mb-12 w-full"
          >
            {TOOLS.map((tool) => (
              <div
                key={tool.src}
                className="w-[80px] h-[80px] lg:w-[96px] lg:h-[96px] rounded-xl bg-neutral-900 border border-neutral-800/60 overflow-hidden relative group transition-all duration-500 hover:-translate-y-1 hover:border-neutral-700/80 cursor-default"
              >
                <Image
                  src={tool.src}
                  alt={tool.alt}
                  fill
                  className="object-cover brightness-[0.4] group-hover:brightness-100 group-hover:opacity-100 opacity-50 transition-all duration-500"
                  sizes="96px"
                />
              </div>
            ))}
          </motion.div>

          {/* ─── Features ─── */}
          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-8 w-full"
          >
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center gap-2">
                <f.icon className="w-5 h-5 text-neutral-500" strokeWidth={1.5} />
                <div>
                  <p className="text-[13px] font-medium text-white mb-0.5">{f.title}</p>
                  <p className="text-[11px] text-neutral-600 leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="pb-6 pt-4 text-center"
      >
        <a
          href="https://wa.me/352621304952"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          Une question ? Contactez Florian &rarr;
        </a>
      </motion.footer>
    </div>
  );
}
