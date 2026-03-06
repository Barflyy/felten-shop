'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  Search,
  ShoppingCart,
  ChevronRight,
  ChevronDown,
  Minus,
  Plus,
  Zap,
  Box,
  Weight,
  ShieldCheck,
  Truck,
  Headphones,
  Lock,
  Star,
  Package,
  Check,
} from 'lucide-react';
import { Footer } from '@/components/footer';

/* ─────────────────────────────────────────────
   MOCK DATA
   ───────────────────────────────────────────── */

const product = {
  title: 'M18 FUEL™ ASPIRATEUR 23 L CLASSE L',
  sku: 'M18FVCL-0',
  priceTTC: '459,00',
  priceHT: '392,31',
  images: [
    { id: 1, alt: 'M18 FUEL Aspirateur 23L - Vue principale' },
    { id: 2, alt: 'M18 FUEL Aspirateur 23L - Vue latérale' },
    { id: 3, alt: 'M18 FUEL Aspirateur 23L - Accessoires' },
    { id: 4, alt: 'M18 FUEL Aspirateur 23L - En situation' },
  ],
  badge: 'NOUVEAU',
  inStock: true,
  specs: [
    { icon: Zap, value: '18V', label: 'Voltage' },
    { icon: Box, value: '23L', label: 'Capacité' },
    { icon: Weight, value: '4.5kg', label: 'Poids' },
  ],
  description: `
    <p>L'aspirateur M18 FUEL™ 23 litres de classe L est conçu pour les professionnels les plus exigeants. Son moteur brushless POWERSTATE™ délivre une puissance d'aspiration constante jusqu'à la dernière goutte de batterie.</p>
    <ul>
      <li>Moteur brushless POWERSTATE™ pour une puissance et une durabilité accrues</li>
      <li>Technologie REDLINK PLUS™ pour une protection optimale de l'outil et de la batterie</li>
      <li>Système de filtration HEPA classe L pour les poussières fines</li>
      <li>Capacité de cuve de 23 litres (poussières) / 14 litres (liquides)</li>
      <li>Prise d'asservissement pour outils électriques</li>
      <li>Compatible avec toutes les batteries M18™ et M18 HIGH OUTPUT™</li>
    </ul>
  `,
  techSpecs: [
    { label: 'Tension', value: '18V' },
    { label: 'Capacité cuve', value: '23 L (sec) / 14 L (humide)' },
    { label: 'Dépression max.', value: '210 mbar' },
    { label: 'Débit d\'air', value: '68 L/s' },
    { label: 'Classe de filtration', value: 'Classe L' },
    { label: 'Niveau sonore', value: '72 dB(A)' },
    { label: 'Poids (nu)', value: '4.5 kg' },
    { label: 'Diamètre tuyau', value: '27/36 mm' },
  ],
  reviews: [
    { name: 'Thomas D.', city: 'Luxembourg', stars: 5, date: '12/01/2026', text: 'Aspiration puissante, bien meilleur que mon ancien filaire. La batterie 12Ah tient facilement une journée.', verified: true },
    { name: 'Marc L.', city: 'Bruxelles', stars: 5, date: '28/12/2025', text: 'Qualité Milwaukee, rien à redire. Le SAV Felten a enregistré la garantie 3 ans directement.', verified: true },
    { name: 'Julien R.', city: 'Metz', stars: 4, date: '15/11/2025', text: 'Très bon aspirateur. Un peu lourd avec la batterie 12Ah mais la puissance est là.', verified: true },
  ],
};

const crossSellProducts = [
  { id: '1', name: 'Batterie M18 HB12 12.0Ah', price: '189,00' },
  { id: '2', name: 'Chargeur Rapide M18 M12', price: '79,00' },
  { id: '3', name: 'Sacs Aspirateur (5 pcs)', price: '24,90' },
  { id: '4', name: 'Filtre HEPA Classe L', price: '34,90' },
];

/* ─────────────────────────────────────────────
   ACCORDION COMPONENT
   ───────────────────────────────────────────── */

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm font-black uppercase tracking-wide text-[#111]">
          {title}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
            open ? 'rotate-180 text-[#D5101D]' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? 'max-h-[800px] pb-5' : 'max-h-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCT PAGE COMPONENT
   ───────────────────────────────────────────── */

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  /* ── Gallery scroll tracking ── */
  const handleGalleryScroll = useCallback(() => {
    if (!galleryRef.current) return;
    const { scrollLeft, offsetWidth } = galleryRef.current;
    setActiveImage(Math.round(scrollLeft / offsetWidth));
  }, []);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleGalleryScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleGalleryScroll);
  }, [handleGalleryScroll]);

  /* ── Sticky bar: show when CTA scrolls out ── */
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Add to cart handler ── */
  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════════════════════════════════
          1. HEADER
          ═══════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-100">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            className="w-11 h-11 flex items-center justify-center -ml-1.5"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6 text-zinc-900" strokeWidth={1.8} />
          </button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span className="text-[1.15rem] font-black tracking-tight">
              <span className="text-[#D5101D]">FELTEN</span>
              <span className="text-zinc-900"> SHOP</span>
            </span>
          </Link>
          <div className="flex items-center gap-0.5">
            <button
              className="w-11 h-11 flex items-center justify-center"
              aria-label="Rechercher"
            >
              <Search className="w-[22px] h-[22px] text-zinc-900" strokeWidth={1.8} />
            </button>
            <button
              className="relative w-11 h-11 flex items-center justify-center -mr-1.5"
              aria-label="Panier"
            >
              <ShoppingCart className="w-[22px] h-[22px] text-zinc-900" strokeWidth={1.8} />
              <span className="absolute top-1 right-0.5 w-[18px] h-[18px] bg-[#D5101D] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Breadcrumb ── */}
      <nav className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100" aria-label="Fil d'ariane">
        <ol className="flex items-center gap-1.5 text-[11px] text-zinc-400 overflow-x-auto no-scrollbar">
          <li>
            <Link href="/" className="hover:text-[#D5101D] transition-colors">
              Accueil
            </Link>
          </li>
          <li><ChevronRight className="w-3 h-3 flex-shrink-0" /></li>
          <li>
            <Link href="/collections/aspirateurs" className="hover:text-[#D5101D] transition-colors">
              Aspirateurs
            </Link>
          </li>
          <li><ChevronRight className="w-3 h-3 flex-shrink-0" /></li>
          <li className="text-zinc-700 font-semibold truncate max-w-[180px]">
            M18 FUEL™ Aspirateur 23L
          </li>
        </ol>
      </nav>

      <main data-product-page="true">
        {/* ═══════════════════════════════════════════
            2. GALERIE PRODUIT
            ═══════════════════════════════════════════ */}
        <section className="relative bg-white">
          {/* Badge */}
          <span className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-[#111] text-white text-[10px] font-black uppercase tracking-wider rounded-lg">
            {product.badge}
          </span>

          {/* Image carousel */}
          <div
            ref={galleryRef}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
          >
            {product.images.map((img, i) => (
              <div
                key={img.id}
                className="flex-shrink-0 w-full snap-center aspect-square bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-8"
              >
                <Package className="w-24 h-24 text-zinc-200" />
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  galleryRef.current?.scrollTo({ left: i * (galleryRef.current?.offsetWidth || 0), behavior: 'smooth' });
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeImage
                    ? 'bg-[#D5101D] w-5'
                    : 'bg-zinc-300'
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            3. BLOC HERO PRODUIT
            ═══════════════════════════════════════════ */}
        <section className="px-5 pt-5 pb-6">
          {/* Title */}
          <h1 className="text-xl min-[375px]:text-[1.4rem] font-black uppercase tracking-tight text-[#111] leading-tight mb-2">
            {product.title}
          </h1>

          {/* SKU */}
          <p className="text-[11px] text-zinc-400 font-mono mb-4">
            Réf. {product.sku}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-black text-[#D5101D] leading-none">
              {product.priceTTC} €
            </span>
            <span className="text-xs text-zinc-400 font-medium">TTC</span>
            <span className="text-xs text-zinc-400">
              ({product.priceHT} € HT)
            </span>
          </div>

          {/* Stock badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            {product.inStock && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200/60">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                En Stock
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 text-amber-700 text-[11px] font-bold rounded-lg border border-amber-200/60">
              <Truck className="w-3.5 h-3.5" />
              Expédié sous 24h
            </span>
          </div>

          {/* Tech Specs Grid */}
          <div className="grid grid-cols-3 gap-2">
            {product.specs.map((spec, i) => {
              const Icon = spec.icon;
              return (
                <div
                  key={i}
                  className="bg-zinc-100 rounded-xl py-3 px-2 flex flex-col items-center text-center gap-1.5"
                >
                  <Icon className="w-5 h-5 text-[#111]" strokeWidth={2} />
                  <span className="text-sm font-black text-[#111]">
                    {spec.value}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold">
                    {spec.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            4. ACTIONS (CONVERSION)
            ═══════════════════════════════════════════ */}
        <section className="px-5 pb-6">
          {/* Quantity selector */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Quantité
            </span>
            <div className="flex items-center bg-[#111] rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-11 h-11 flex items-center justify-center text-white hover:bg-zinc-800 active:scale-90 transition-all"
                aria-label="Diminuer"
              >
                <Minus className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <span className="w-12 text-center text-white font-black text-sm tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(99, quantity + 1))}
                className="w-11 h-11 flex items-center justify-center text-white hover:bg-zinc-800 active:scale-90 transition-all"
                aria-label="Augmenter"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Main CTA */}
          <button
            ref={ctaRef}
            onClick={handleAddToCart}
            className={`w-full h-14 rounded-lg text-white text-base font-black uppercase tracking-wider flex items-center justify-center gap-2.5 active:scale-[0.97] transition-all duration-200 shadow-lg ${
              addedToCart
                ? 'bg-emerald-500 shadow-emerald-500/25'
                : 'bg-[#D5101D] shadow-[#D5101D]/25'
            }`}
          >
            {addedToCart ? (
              <>
                <Check className="w-5 h-5" strokeWidth={3} />
                AJOUTÉ AU PANIER !
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                AJOUTER AU PANIER
              </>
            )}
          </button>

          {/* Reassurance */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { icon: ShieldCheck, label: 'Garantie 3 Ans' },
              { icon: Lock, label: 'Paiement Sécurisé' },
              { icon: Headphones, label: 'SAV Pro' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center text-center gap-1.5 py-3 px-1 bg-zinc-50 rounded-xl"
                >
                  <Icon className="w-4 h-4 text-[#D5101D]" strokeWidth={2.5} />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide leading-tight">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Separator */}
        <div className="h-2 bg-zinc-100" />

        {/* ═══════════════════════════════════════════
            5. CONTENU TECHNIQUE (Accordéons)
            ═══════════════════════════════════════════ */}
        <section className="px-5">
          {/* Description */}
          <Accordion title="Description" defaultOpen>
            <div className="text-sm text-zinc-600 leading-relaxed space-y-3">
              <p>
                L&apos;aspirateur M18 FUEL™ 23 litres de classe L est conçu pour les
                professionnels les plus exigeants. Son moteur brushless
                POWERSTATE™ délivre une puissance d&apos;aspiration constante
                jusqu&apos;à la dernière goutte de batterie.
              </p>
              <ul className="space-y-2 pl-1">
                {[
                  'Moteur brushless POWERSTATE™ pour une puissance et une durabilité accrues',
                  'Technologie REDLINK PLUS™ pour une protection optimale',
                  'Système de filtration HEPA classe L pour les poussières fines',
                  'Capacité de cuve de 23 L (poussières) / 14 L (liquides)',
                  'Prise d\'asservissement pour outils électriques',
                  'Compatible avec toutes les batteries M18™ et M18 HIGH OUTPUT™',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#D5101D] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Accordion>

          {/* Tech Specs */}
          <Accordion title="Caractéristiques Techniques">
            <div className="rounded-xl overflow-hidden border border-zinc-200">
              {product.techSpecs.map((spec, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 text-sm ${
                    i % 2 === 0 ? 'bg-zinc-50' : 'bg-white'
                  }`}
                >
                  <span className="text-zinc-500 font-medium">{spec.label}</span>
                  <span className="text-[#111] font-bold text-right">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </Accordion>

          {/* Reviews */}
          <Accordion title={`Avis Clients (${product.reviews.length})`}>
            <div className="space-y-4">
              {/* Average */}
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= 4.7 ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 fill-zinc-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-black text-[#111]">4.7/5</span>
                <span className="text-xs text-zinc-400">
                  ({product.reviews.length} avis)
                </span>
              </div>

              {/* Individual reviews */}
              {product.reviews.map((review, i) => (
                <div key={i} className="pb-4 border-b border-zinc-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#D5101D]/10 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-black text-[#D5101D]">
                          {review.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111]">{review.name}</p>
                        <p className="text-[10px] text-zinc-400">{review.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {review.verified && (
                        <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Vérifié
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-400">{review.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= review.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-200 fill-zinc-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </Accordion>
        </section>

        {/* Separator */}
        <div className="h-2 bg-zinc-100 mt-2" />

        {/* ═══════════════════════════════════════════
            6. CROSS-SELL
            ═══════════════════════════════════════════ */}
        <section className="px-5 py-8">
          <h2 className="text-lg font-black uppercase tracking-tight text-[#111] mb-5">
            LES PROS{' '}
            <span className="text-[#D5101D]">ACHÈTENT AUSSI</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {crossSellProducts.map((p) => (
              <article
                key={p.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 flex flex-col"
              >
                {/* Image placeholder */}
                <div className="aspect-square bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center p-4">
                  <Package className="w-10 h-10 text-zinc-300" />
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="text-[11px] font-bold uppercase text-zinc-900 line-clamp-2 min-h-[30px] leading-snug">
                    {p.name}
                  </h3>
                  <div className="flex-grow" />
                  <p className="text-base font-black text-zinc-900 mt-2 leading-none">
                    {p.price}{' '}
                    <span className="text-[10px] font-medium text-zinc-400">
                      € TTC
                    </span>
                  </p>
                  <button className="w-full mt-3 py-3.5 bg-[#D5101D] text-white text-xs font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 active:scale-[0.95] transition-transform duration-150 shadow-md shadow-[#D5101D]/25">
                    <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
                    AJOUTER
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════
          8. FOOTER
          ═══════════════════════════════════════════ */}
      <Footer />

      {/* ═══════════════════════════════════════════
          7. STICKY BOTTOM BAR
          ═══════════════════════════════════════════ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-transform duration-300 safe-area-bottom ${
          stickyVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Product thumbnail */}
          <div className="w-11 h-11 bg-zinc-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-zinc-300" />
          </div>

          {/* Price */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500 font-medium truncate">
              {product.title}
            </p>
            <p className="text-base font-black text-[#D5101D] leading-none mt-0.5">
              {product.priceTTC} €
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            className={`px-5 py-3 rounded-lg text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 active:scale-[0.95] transition-all duration-200 flex-shrink-0 ${
              addedToCart
                ? 'bg-emerald-500'
                : 'bg-[#D5101D]'
            }`}
          >
            {addedToCart ? (
              <Check className="w-4 h-4" strokeWidth={3} />
            ) : (
              <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
            )}
            {addedToCart ? 'AJOUTÉ' : 'AJOUTER'}
          </button>
        </div>
      </div>
    </div>
  );
}
