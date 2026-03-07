'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Truck,
  Wrench,
  CheckCircle,
  Send,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Footer } from '@/components/footer';

const STEPS = [
  {
    number: '01',
    icon: <Phone className="w-5 h-5" strokeWidth={2} />,
    title: 'Contactez-nous',
    desc: 'Remplissez le formulaire SAV ci-dessous ou appelez-nous. Munissez-vous de votre numéro de commande.',
  },
  {
    number: '02',
    icon: <Truck className="w-5 h-5" strokeWidth={2} />,
    title: 'On récupère',
    desc: 'Nous organisons l\'enlèvement de votre produit à domicile. Aucun frais à votre charge.',
  },
  {
    number: '03',
    icon: <Wrench className="w-5 h-5" strokeWidth={2} />,
    title: 'Réparation',
    desc: 'Votre outil est pris en charge par un centre agréé Milwaukee. Délai : 5 à 10 jours ouvrés.',
  },
  {
    number: '04',
    icon: <CheckCircle className="w-5 h-5" strokeWidth={2} />,
    title: 'Retour',
    desc: 'Votre outil réparé ou remplacé vous est retourné à domicile, sans frais.',
  },
];

const FAQ_GARANTIE = [
  {
    q: 'Que couvre exactement la garantie 3 ans ?',
    a: 'La garantie couvre tous les défauts de fabrication et les vices de matériaux survenant dans des conditions d\'utilisation normales et professionnelles. Elle ne couvre pas l\'usure normale, les dommages dus à une mauvaise utilisation, des chutes ou des modifications non autorisées.',
  },
  {
    q: 'La garantie est-elle valable pour un usage intensif ?',
    a: 'Oui. Milwaukee conçoit ses outils pour un usage professionnel intensif. La garantie est valable pour tout usage conforme aux instructions du fabricant.',
  },
  {
    q: 'Ma garantie est-elle transférable ?',
    a: 'La garantie est attachée au produit. La preuve d\'achat originale (votre facture Felten Shop) est requise pour toute prise en charge.',
  },
  {
    q: 'Les batteries sont-elles couvertes ?',
    a: 'Les batteries bénéficient de la garantie standard de 3 ans. En les enregistrant sur Milwaukee ONE-KEY dans les 30 jours, vous pouvez bénéficier d\'une extension à 5 ans.',
  },
];

export default function GarantiePage() {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    commande: '',
    produit: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<Record<number, boolean>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
              Sérénité totale
            </span>
            <h1 className="text-[22px] lg:text-[32px] font-bold text-[#1A1A1A] mb-4">
              Garantie & SAV
            </h1>
            <p className="text-[14px] lg:text-[16px] text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
              Profitez de la garantie constructeur 3 ans Milwaukee sur tous vos outils.
              Un service après-vente premium géré directement par nos experts.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-[1280px] mx-auto px-6 lg:px-8 -mt-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { value: '3 ans', label: 'Garantie outils' },
              { value: '5 ans', label: 'Garantie batteries*' },
              { value: '0€', label: 'Frais de retour' },
              { value: '24h', label: 'Prise en charge' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg p-5 text-center border border-gray-100 shadow-sm">
                <p className="text-[22px] font-bold text-[#DB021D] mb-0.5">{stat.value}</p>
                <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Intro cards */}
        <section className="max-w-[1000px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center mb-10">
            <h2 className="text-[20px] lg:text-[26px] font-bold text-[#1A1A1A] mb-3">
              La promesse Milwaukee
            </h2>
            <p className="text-[14px] text-[#6B7280] leading-relaxed max-w-2xl mx-auto">
              Milwaukee Tool conçoit des outils pour durer. En tant que revendeur agréé, Felten Shop vous assure l&apos;authenticité et une prise en charge complète.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-100">
              <ShieldCheck className="w-8 h-8 text-[#DB021D] mb-4" strokeWidth={2} />
              <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-2">Couverture complète</h3>
              <p className="text-[13px] text-[#6B7280] leading-relaxed">
                Défauts de fabrication, vices de matériaux, pannes électroniques... Votre outil est couvert à 100% pour un usage professionnel.
              </p>
            </div>
            <div className="bg-[#1A1A1A] text-white rounded-lg p-6">
              <Wrench className="w-8 h-8 text-[#DB021D] mb-4" strokeWidth={2} />
              <h3 className="text-[16px] font-semibold text-white mb-2">Réparation certifiée</h3>
              <p className="text-[13px] text-white/50 leading-relaxed">
                Toutes les réparations sont effectuées dans les centres agréés Milwaukee avec des pièces d&apos;origine.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-[#F5F5F5] border-y border-gray-100">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
            <div className="text-center mb-10">
              <span className="text-[12px] font-semibold text-[#DB021D] mb-2 block">Processus simplifié</span>
              <h2 className="text-[20px] lg:text-[26px] font-bold text-[#1A1A1A]">
                Votre SAV en 4 étapes
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step) => (
                <div key={step.number} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#DB021D] mb-4">
                    {step.icon}
                  </div>
                  <span className="text-[11px] font-medium text-[#9CA3AF] mb-1.5">Étape {step.number}</span>
                  <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-2">{step.title}</h3>
                  <p className="text-[12px] text-[#6B7280] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Claim Form */}
        <section className="max-w-[1000px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-20">
                <h2 className="text-[20px] font-bold text-[#1A1A1A] mb-4">
                  Déclarer un incident
                </h2>
                <p className="text-[14px] text-[#6B7280] leading-relaxed mb-6">
                  Un problème avec votre outil ? Remplissez ce formulaire et notre équipe prendra le relais sous 24h.
                </p>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-[12px] font-semibold text-amber-800">Important</span>
                  </div>
                  <p className="text-[12px] text-amber-700 leading-relaxed">
                    Préparez votre <strong>numéro de commande</strong> et le numéro de série de l&apos;outil pour accélérer le traitement.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-[#F5F5F5] rounded-lg border border-gray-100 px-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle className="w-8 h-8" strokeWidth={2} />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2">Demande reçue</h3>
                  <p className="text-[14px] text-[#6B7280] mb-6">
                    Un ticket SAV a été ouvert. Vous recevrez les instructions de retour par email.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ nom: '', email: '', commande: '', produit: '', description: '' }); }}
                    className="h-11 px-6 bg-[#1A1A1A] text-white text-[13px] font-semibold rounded-lg hover:bg-[#333] transition-colors"
                  >
                    Nouvelle demande
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">Nom complet</label>
                      <input type="text" name="nom" required value={form.nom} onChange={handleChange}
                        className="w-full h-11 border border-gray-200 rounded-lg px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D]/20 transition-colors"
                        placeholder="Jean Dupont" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">Email</label>
                      <input type="email" name="email" required value={form.email} onChange={handleChange}
                        className="w-full h-11 border border-gray-200 rounded-lg px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D]/20 transition-colors"
                        placeholder="jean@exemple.be" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">Numéro de commande</label>
                    <input type="text" name="commande" required value={form.commande} onChange={handleChange}
                      className="w-full h-11 border border-gray-200 rounded-lg px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D]/20 transition-colors"
                      placeholder="#10001" />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">Produit concerné</label>
                    <input type="text" name="produit" required value={form.produit} onChange={handleChange}
                      className="w-full h-11 border border-gray-200 rounded-lg px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D]/20 transition-colors"
                      placeholder="Ex: Visseuse M18 FUEL" />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#6B7280] mb-1.5">Description du problème</label>
                    <textarea name="description" required rows={4} value={form.description} onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D]/20 transition-colors resize-none"
                      placeholder="Décrivez les symptômes ou codes d'erreur..." />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={loading}
                      className="inline-flex items-center gap-2 bg-[#DB021D] text-white text-[13px] font-semibold px-6 py-3 rounded-lg hover:bg-[#B8011A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Traitement...</>
                      ) : (
                        <>Soumettre<Send className="w-4 h-4" strokeWidth={2} /></>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Conditions */}
        <section className="bg-[#F5F5F5] border-t border-gray-100 py-12 lg:py-16">
          <div className="max-w-[1000px] mx-auto px-6 lg:px-8">
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-8 text-center">
              Conditions de prise en charge
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg border border-emerald-100">
                <h3 className="text-[13px] font-semibold text-emerald-700 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" strokeWidth={2} />
                  Couvert par la garantie
                </h3>
                <ul className="space-y-3">
                  {['Défauts de fabrication & vices de matériaux', 'Pannes électroniques & moteur brushless', 'Problèmes de batterie (hors usure)', 'Chargeurs défectueux'].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-[#6B7280]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg border border-red-100">
                <h3 className="text-[13px] font-semibold text-red-700 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" strokeWidth={2} />
                  Non couvert
                </h3>
                <ul className="space-y-3">
                  {['Pièces d\'usure (charbons, lames, mandrins...)', 'Dommages par chute, choc ou immersion', 'Oxydation due à l\'humidité', 'Réparations par un tiers non agréé'].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-[#6B7280]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-[800px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-6 text-center">
            Questions fréquentes
          </h2>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            {FAQ_GARANTIE.map((item, i) => (
              <div key={i} className="bg-white">
                <button
                  onClick={() => setOpenFAQ((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className={`text-[14px] font-medium ${openFAQ[i] ? 'text-[#1A1A1A]' : 'text-[#6B7280]'}`}>
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${openFAQ[i] ? 'rotate-180 text-[#DB021D]' : 'text-[#9CA3AF]'}`}
                    strokeWidth={2}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${openFAQ[i] ? 'max-h-[300px]' : 'max-h-0'}`}>
                  <p className="px-5 pb-4 text-[13px] text-[#6B7280] leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
