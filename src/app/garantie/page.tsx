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
    icon: <Phone className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Contactez-nous',
    desc: 'Remplissez le formulaire SAV ci-dessous ou appelez-nous. Munissez-vous de votre numéro de commande et d\'une description du problème.',
  },
  {
    number: '02',
    icon: <Truck className="w-6 h-6" strokeWidth={1.5} />,
    title: 'On récupère',
    desc: 'Nous organisons l\'enlèvement de votre produit à domicile via notre transporteur partenaire. Aucun frais à votre charge.',
  },
  {
    number: '03',
    icon: <Wrench className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Réparation',
    desc: 'Votre outil est pris en charge par un centre de réparation agréé Milwaukee. Délai de réparation : 5 à 10 jours ouvrés en moyenne.',
  },
  {
    number: '04',
    icon: <CheckCircle className="w-6 h-6" strokeWidth={1.5} />,
    title: 'Retour',
    desc: 'Votre outil réparé ou remplacé vous est retourné à domicile, sans frais. Vous recevez un rapport d\'intervention.',
  },
];

const FAQ_GARANTIE = [
  {
    q: 'Que couvre exactement la garantie 3 ans ?',
    a: 'La garantie couvre tous les défauts de fabrication et les vices de matériaux survenant dans des conditions d\'utilisation normales et professionnelles. Elle ne couvre pas l\'usure normale, les dommages dus à une mauvaise utilisation, des chutes, de l\'humidité excessive ou des modifications non autorisées.',
  },
  {
    q: 'La garantie est-elle valable pour un usage intensif en chantier ?',
    a: 'Oui. Milwaukee conçoit ses outils pour un usage professionnel intensif. La garantie est valable pour tout usage conforme aux instructions du fabricant, y compris un usage quotidien en chantier. C\'est précisément pourquoi Milwaukee offre 3 ans de garantie là où d\'autres marques n\'en offrent qu\'un.',
  },
  {
    q: 'Ma garantie est-elle transférable si je revends l\'outil ?',
    a: 'La garantie Milwaukee est attachée au produit et non à l\'acheteur initial. Cependant, la preuve d\'achat originale (votre facture Felten Shop) est requise pour toute prise en charge. Nous recommandons de conserver la facture et de la transmettre lors d\'une revente.',
  },
  {
    q: 'Les batteries sont-elles couvertes ?',
    a: 'Les batteries bénéficient de la garantie standard de 3 ans. En enregistrant vos batteries sur la plateforme Milwaukee ONE-KEY dans les 30 jours suivant l\'achat, vous pouvez bénéficier d\'une extension à 5 ans sur les batteries éligibles.',
  },
];

function FAQAccordion({ item, isOpen, onToggle }: { item: { q: string; a: string }; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className={`text-[14px] font-semibold leading-snug transition-colors ${isOpen ? 'text-[#DB021D]' : 'text-[#1A1A1A] group-hover:text-[#DB021D]'}`}>
          {item.q}
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-all duration-300 ${isOpen ? 'rotate-180 text-[#DB021D]' : 'text-[#6B7280] group-hover:text-[#DB021D]'}`}
          strokeWidth={2.5}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-[400px] pb-5' : 'max-h-0'}`}>
        <p className="text-[14px] text-[#6B7280] leading-relaxed">{item.a}</p>
      </div>
    </div>
  );
}

// ... imports remain the same, just removing unused ones if any ...

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

  function toggleFAQ(i: number) {
    setOpenFAQ((prev) => ({ ...prev, [i]: !prev[i] }));
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
              Sérénité Totale
            </p>
            <h1 className="text-4xl lg:text-6xl font-black uppercase text-[#1A1A1A] tracking-tight mb-6" style={{ fontFamily: 'var(--font-oswald)' }}>
              Garantie & SAV
            </h1>
            <p className="text-[16px] lg:text-[18px] text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
              Profitez de la garantie constructeur 3 ans Milwaukee sur tous vos outils.
              Un service après-vente premium géré directement par nos experts.
            </p>
          </div>
        </section>

        {/* ── Visual Stats ── */}
        <section className="max-w-[1280px] mx-auto px-6 lg:px-8 -mt-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: '3 ans', label: 'Garantie outils' },
              { value: '5 ans', label: 'Garantie batteries*' },
              { value: '0€', label: 'Frais de retour' },
              { value: '24h', label: 'Prise en charge' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-xl shadow-gray-100/50">
                <p className="text-3xl font-black text-[#DB021D] mb-1" style={{ fontFamily: 'var(--font-oswald)' }}>{stat.value}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Introduction ── */}
        <section className="max-w-[1000px] mx-auto px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black uppercase text-[#1A1A1A] mb-6" style={{ fontFamily: 'var(--font-oswald)' }}>
              La promesse Milwaukee
            </h2>
            <p className="text-[16px] text-gray-500 leading-relaxed max-w-2xl mx-auto font-medium">
              Milwaukee Tool conçoit des outils pour durer. En tant que revendeur agréé, Felten Shop vous assure l'authenticité de vos produits et une prise en charge complète en cas de pépin.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#DB021D]/5 rounded-bl-[100px] transition-transform group-hover:scale-110" />
              <ShieldCheck className="w-10 h-10 text-[#DB021D] mb-6" strokeWidth={1.5} />
              <h3 className="text-[18px] font-black uppercase text-[#1A1A1A] mb-3">Couverture Complète</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Défauts de fabrication, vices de matériaux, pannes électroniques... Votre outil est couvert à 100% pour un usage professionnel.
              </p>
            </div>

            <div className="bg-[#111] text-white rounded-3xl p-8 border border-gray-800 relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#DB021D] blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity" />
              <Wrench className="w-10 h-10 text-[#DB021D] mb-6" strokeWidth={1.5} />
              <h3 className="text-[18px] font-black uppercase text-white mb-3">Réparation Certifiée</h3>
              <p className="text-[14px] text-gray-400 leading-relaxed">
                Toutes les réparations sont effectuées dans les centres agréés Milwaukee avec des pièces d'origine, garantissant la performance initiale.
              </p>
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="bg-[#F9F9F9] border-y border-gray-100">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
              <span className="text-[12px] font-bold uppercase tracking-widest text-[#DB021D] mb-2 block">Processus Simplifié</span>
              <h2 className="text-3xl font-black uppercase text-[#1A1A1A]" style={{ fontFamily: 'var(--font-oswald)' }}>
                Votre SAV en 4 étapes
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map((step, i) => (
                <div key={step.number} className="relative group">
                  {/* Connector (Desktop) */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gray-200" />
                  )}

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#DB021D] mb-6 group-hover:scale-110 group-hover:border-[#DB021D] transition-all duration-300">
                      {step.icon}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-300 mb-2">Étape {step.number}</span>
                    <h3 className="text-[16px] font-black uppercase text-[#1A1A1A] mb-3">{step.title}</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed px-4">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Claim Form ── */}
        <section className="max-w-[1000px] mx-auto px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-12 gap-12">

            {/* Left Info */}
            <div className="lg:col-span-5">
              <div className="sticky top-24">
                <h2 className="text-3xl font-black uppercase text-[#1A1A1A] mb-6" style={{ fontFamily: 'var(--font-oswald)' }}>
                  Déclarer un incident
                </h2>
                <div className="space-y-6">
                  <p className="text-[15px] text-gray-500 leading-relaxed font-medium">
                    Un problème avec votre outil ? Remplissez ce formulaire et notre équipe technique prendra le relais sous 24h.
                  </p>

                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-[13px] font-black uppercase text-amber-800">Important</span>
                    </div>
                    <p className="text-[13px] text-amber-700 leading-relaxed">
                      Préparez votre <strong>numéro de commande</strong> et, si possible, le numéro de série de l'outil pour accélérer le traitement.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-7 bg-white">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-3xl border border-gray-100 px-8">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10" strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-black uppercase text-[#1A1A1A] mb-3">Demande reçue !</h3>
                  <p className="text-[15px] text-gray-500 mb-8">
                    Nous avons bien reçu votre déclaration. Un ticket SAV a été ouvert et vous recevrez les instructions de retour par email.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ nom: '', email: '', commande: '', produit: '', description: '' }); }}
                    className="inline-flex items-center justify-center h-12 px-8 bg-[#1A1A1A] text-white text-[13px] font-bold uppercase tracking-wide rounded-xl hover:bg-black transition-all"
                  >
                    Nouvelle demande
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A] ml-1">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        name="nom"
                        required
                        value={form.nom}
                        onChange={handleChange}
                        className="w-full h-14 border border-gray-200 rounded-xl px-5 text-[15px] text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D] transition-all bg-gray-50 focus:bg-white"
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A] ml-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="w-full h-14 border border-gray-200 rounded-xl px-5 text-[15px] text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D] transition-all bg-gray-50 focus:bg-white"
                        placeholder="jean@exemple.be"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A] ml-1">
                      Numéro de commande
                    </label>
                    <input
                      type="text"
                      name="commande"
                      required
                      value={form.commande}
                      onChange={handleChange}
                      className="w-full h-14 border border-gray-200 rounded-xl px-5 text-[15px] text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D] transition-all bg-gray-50 focus:bg-white"
                      placeholder="#10001"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A] ml-1">
                      Produit concerné
                    </label>
                    <input
                      type="text"
                      name="produit"
                      required
                      value={form.produit}
                      onChange={handleChange}
                      className="w-full h-14 border border-gray-200 rounded-xl px-5 text-[15px] text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D] transition-all bg-gray-50 focus:bg-white"
                      placeholder="Ex: Visseuse M18 FUEL"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A] ml-1">
                      Description du problème
                    </label>
                    <textarea
                      name="description"
                      required
                      rows={5}
                      value={form.description}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl px-5 py-4 text-[15px] text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#DB021D] focus:ring-1 focus:ring-[#DB021D] transition-all bg-gray-50 focus:bg-white resize-none"
                      placeholder="Décrivez les symptômes ou les codes d'erreur..."
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-3 bg-[#DB021D] text-white text-[14px] font-black uppercase tracking-wider px-10 py-4 rounded-xl hover:bg-[#b80019] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-xl shadow-[#DB021D]/20"
                    >
                      {loading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          SOUMETTRE LE DOSSIER
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

        {/* ── Conditions ── */}
        <section className="bg-[#F5F5F5] border-t border-gray-200 py-20">
          <div className="max-w-[1000px] mx-auto px-6 lg:px-8">
            <h2 className="text-[20px] font-black uppercase text-[#1A1A1A] mb-10 text-center" style={{ fontFamily: 'var(--font-oswald)' }}>
              Conditions de Prise en Charge
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-green-100">
                <h3 className="text-[14px] font-black uppercase tracking-wider text-green-700 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                  Couvert par la garantie
                </h3>
                <ul className="space-y-4">
                  {[
                    'Défauts de fabrication & vices de matériaux',
                    'Pannes électroniques & moteur brushless',
                    'Problèmes de batterie (hors usure normale)',
                    'Chargeurs défectueux',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[14px] text-gray-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100">
                <h3 className="text-[14px] font-black uppercase tracking-wider text-red-700 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                  Non couvert
                </h3>
                <ul className="space-y-4">
                  {[
                    'Pièces d\'usure (charbons, lames, mandrins...)',
                    'Dommages par chute, choc ou immersion',
                    'Oxydation due à l\'humidité',
                    'Réparations par un tiers non agréé',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[14px] text-gray-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-[800px] mx-auto px-6 lg:px-8 py-20">
          <h2 className="text-[20px] font-black uppercase text-[#1A1A1A] mb-8 text-center" style={{ fontFamily: 'var(--font-oswald)' }}>
            Questions Fréquentes
          </h2>
          <div className="space-y-4">
            {FAQ_GARANTIE.map((item, i) => (
              <div key={i} className={`border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 ${openFAQ[i] ? 'bg-gray-50 border-gray-300' : 'bg-white'}`}>
                <button
                  onClick={() => toggleFAQ(i)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                >
                  <span className={`text-[15px] font-bold ${openFAQ[i] ? 'text-[#1A1A1A]' : 'text-gray-600'}`}>
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${openFAQ[i] ? 'rotate-180 text-[#DB021D]' : 'text-gray-400'}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFAQ[i] ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="px-6 pb-6 text-[14px] text-gray-500 leading-relaxed">
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
