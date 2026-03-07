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
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
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

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#F5F5F5] border-b border-gray-100">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-12 lg:py-16 text-center">
            <span className="inline-flex items-center px-3 py-1 bg-[#DB021D]/10 text-[#DB021D] text-[12px] font-semibold rounded-lg mb-4">
              Service Client
            </span>
            <h1 className="text-[22px] lg:text-[32px] font-bold text-[#1A1A1A] mb-4">
              Contactez-nous
            </h1>
            <p className="text-[14px] lg:text-[16px] text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
              Une question sur un produit ? Besoin d&apos;un devis ? Notre équipe d&apos;experts est là pour vous accompagner.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-[1100px] mx-auto px-4 lg:px-8 py-10 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">

            {/* Left — Coordonnées */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-3">
                <a
                  href="tel:+352621304952"
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] text-[#1A1A1A] flex items-center justify-center group-hover:bg-[#DB021D] group-hover:text-white transition-colors">
                    <Phone className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">Téléphone</p>
                    <p className="text-[14px] font-semibold text-[#1A1A1A]">+352 621 304 952</p>
                  </div>
                </a>

                <a
                  href="mailto:florian@felten.lu"
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] text-[#1A1A1A] flex items-center justify-center group-hover:bg-[#DB021D] group-hover:text-white transition-colors">
                    <Mail className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">Email</p>
                    <p className="text-[14px] font-semibold text-[#1A1A1A]">florian@felten.lu</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] text-[#1A1A1A] flex items-center justify-center">
                    <Clock className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">Horaires</p>
                    <p className="text-[14px] font-semibold text-[#1A1A1A]">Lun – Ven, 8h – 18h</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="rounded-lg p-5 bg-[#25D366]/10 border border-[#25D366]/20">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  <p className="text-[14px] font-semibold text-[#1A1A1A]">Réponse rapide</p>
                </div>
                <p className="text-[13px] text-[#6B7280] mb-4 leading-relaxed">
                  Pour une réponse immédiate, contactez-nous sur WhatsApp.
                </p>
                <a
                  href="https://wa.me/352621304952"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white text-[13px] font-semibold px-5 py-3 rounded-lg hover:bg-[#1ebe5d] transition-colors"
                >
                  Ouvrir WhatsApp
                </a>
              </div>
            </div>

            {/* Right — Form */}
            <div className="lg:col-span-8">
              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-6">
                Envoyer un message
              </h2>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-[#F5F5F5] rounded-lg border border-gray-100 px-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle className="w-8 h-8" strokeWidth={2} />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2">Message envoyé</h3>
                  <p className="text-[14px] text-[#6B7280] max-w-md leading-relaxed mb-6">
                    Nous avons bien reçu votre demande. Notre équipe vous répondra dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ nom: '', email: '', telephone: '', sujet: '', message: '' }); }}
                    className="h-11 px-6 bg-[#1A1A1A] text-white text-[13px] font-semibold rounded-lg hover:bg-[#333] transition-colors"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">
                        Nom complet <span className="text-[#DB021D]">*</span>
                      </label>
                      <input
                        type="text"
                        name="nom"
                        required
                        value={form.nom}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                        className="w-full h-11 border border-gray-200 rounded-lg px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D]/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">
                        Email <span className="text-[#DB021D]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jean@exemple.be"
                        className="w-full h-11 border border-gray-200 rounded-lg px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D]/20 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        value={form.telephone}
                        onChange={handleChange}
                        placeholder="+352 621 304 952"
                        className="w-full h-11 border border-gray-200 rounded-lg px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D]/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">
                        Sujet <span className="text-[#DB021D]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="sujet"
                          required
                          value={form.sujet}
                          onChange={handleChange}
                          className="w-full h-11 border border-gray-200 rounded-lg px-4 text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D]/20 transition-colors appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Sélectionnez un sujet</option>
                          {SUBJECTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">
                      Message <span className="text-[#DB021D]">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Décrivez votre demande en détail..."
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D]/20 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[12px] text-[#9CA3AF]">
                      <span className="text-[#DB021D]">*</span> Champs obligatoires
                    </p>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 bg-[#DB021D] text-white text-[13px] font-semibold px-6 py-3 rounded-lg hover:bg-[#B8011A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          Envoyer
                          <Send className="w-4 h-4" strokeWidth={2} />
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
