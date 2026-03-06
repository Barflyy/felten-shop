'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, Clock, MessageCircle, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Footer } from '@/components/footer';

const SUBJECTS = [
  'Question technique',
  'Commande en cours',
  'SAV',
  'Devis',
  'Autre',
];

export default function ContactPage() {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate submission delay
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ── */}
      <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-20 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="w-10 h-10 flex items-center justify-center -ml-2 text-[#1A1A1A] hover:bg-gray-50 rounded-full transition-colors" aria-label="Retour à l'accueil">
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </Link>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-bold text-[#1A1A1A] tracking-tighter underline decoration-[#DB021D] decoration-2 underline-offset-4" style={{ fontFamily: 'var(--font-oswald)' }}>FELTEN</span>
            <span className="text-xl font-medium text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-oswald)' }}> SHOP</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* ── Hero ── */}
        <section className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16 lg:py-20 text-center">
            <p className="text-[13px] font-bold uppercase tracking-widest text-[#DB021D] mb-4 bg-[#DB021D]/5 inline-block px-3 py-1 rounded-full">
              Service Client
            </p>
            <h1 className="text-4xl lg:text-6xl font-black uppercase text-[#1A1A1A] tracking-tight mb-6" style={{ fontFamily: 'var(--font-oswald)' }}>
              Contactez-nous
            </h1>
            <p className="text-[16px] lg:text-[18px] text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
              Une question sur un produit ? Besoin d'un devis ? Notre équipe d'experts est là pour vous accompagner dans vos projets.
            </p>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="max-w-[1100px] mx-auto px-4 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">

            {/* Left — Coordonnées */}
            <div className="lg:col-span-4 space-y-8">
              <div>
                <h2 className="text-[14px] font-black uppercase tracking-wider text-[#1A1A1A] mb-6 flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-[#DB021D]"></span>
                  Nos coordonnées
                </h2>
                <div className="space-y-4">
                  <a
                    href="tel:+32XXXXXXXXX"
                    className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-50 text-[#1A1A1A] flex items-center justify-center group-hover:bg-[#DB021D] group-hover:text-white transition-colors">
                      <Phone className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Téléphone</p>
                      <p className="text-[15px] font-bold text-[#1A1A1A]">+32 XX XXX XX XX</p>
                    </div>
                  </a>

                  <a
                    href="mailto:contact@shopfelten.be"
                    className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-50 text-[#1A1A1A] flex items-center justify-center group-hover:bg-[#DB021D] group-hover:text-white transition-colors">
                      <Mail className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Email</p>
                      <p className="text-[15px] font-bold text-[#1A1A1A]">contact@shopfelten.be</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 text-[#1A1A1A] flex items-center justify-center">
                      <Clock className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Horaires</p>
                      <p className="text-[15px] font-bold text-[#1A1A1A]">Lun – Ven, 8h – 18h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="rounded-3xl p-6 bg-[#25D366]/10 border border-[#25D366]/20">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
                  <p className="text-[16px] font-bold text-[#1A1A1A]">Réponse rapide</p>
                </div>
                <p className="text-[14px] text-gray-600 mb-5 leading-relaxed font-medium">
                  Pour une réponse immédiate, contactez-nous directement sur WhatsApp.
                </p>
                <a
                  href="https://wa.me/32XXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white text-[13px] font-bold px-5 py-4 rounded-xl hover:bg-[#1ebe5d] transition-all shadow-lg shadow-[#25D366]/20 active:scale-[0.98]"
                >
                  OUVRIR WHATSAPP
                </a>
              </div>
            </div>

            {/* Right — Form */}
            <div className="lg:col-span-8 bg-white lg:pl-10">
              <h2 className="text-[14px] font-black uppercase tracking-wider text-[#1A1A1A] mb-8 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-[#DB021D]"></span>
                Envoyer un message
              </h2>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-3xl border border-gray-100 px-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10" strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-black uppercase text-[#1A1A1A] mb-3" style={{ fontFamily: 'var(--font-oswald)' }}>Message envoyé !</h3>
                  <p className="text-[16px] text-gray-500 max-w-md leading-relaxed font-medium mb-8">
                    Nous avons bien reçu votre demande. Notre équipe vous répondra dans les plus brefs délais (généralement sous 24h).
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ nom: '', email: '', telephone: '', sujet: '', message: '' }); }}
                    className="inline-flex items-center justify-center h-12 px-8 bg-[#1A1A1A] text-white text-[13px] font-bold uppercase tracking-wide rounded-xl hover:bg-black transition-all"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A] ml-1">
                        Nom complet <span className="text-[#DB021D]">*</span>
                      </label>
                      <input
                        type="text"
                        name="nom"
                        required
                        value={form.nom}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                        className="w-full h-14 border border-gray-200 rounded-xl px-5 text-[15px] text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D] transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A] ml-1">
                        Email <span className="text-[#DB021D]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jean@exemple.be"
                        className="w-full h-14 border border-gray-200 rounded-xl px-5 text-[15px] text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D] transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A] ml-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        value={form.telephone}
                        onChange={handleChange}
                        placeholder="+32 XX XXX XX XX"
                        className="w-full h-14 border border-gray-200 rounded-xl px-5 text-[15px] text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D] transition-all bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A] ml-1">
                        Sujet <span className="text-[#DB021D]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="sujet"
                          required
                          value={form.sujet}
                          onChange={handleChange}
                          className="w-full h-14 border border-gray-200 rounded-xl px-5 text-[15px] text-[#1A1A1A] focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D] transition-all bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Sélectionnez un sujet</option>
                          {SUBJECTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A] ml-1">
                      Message <span className="text-[#DB021D]">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande en détail..."
                      className="w-full border border-gray-200 rounded-xl px-5 py-4 text-[15px] text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D] transition-all bg-gray-50 focus:bg-white resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <p className="text-[13px] text-gray-500 font-medium">
                      <span className="text-[#DB021D]">*</span> Champs obligatoires
                    </p>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-3 bg-[#DB021D] text-white text-[14px] font-black uppercase tracking-wider px-10 py-4 rounded-xl hover:bg-[#b80019] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-xl shadow-[#DB021D]/20"
                    >
                      {loading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          ENVOYER LE MESSAGE
                          <Send className="w-4 h-4" strokeWidth={2.5} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
