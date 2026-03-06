'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { Footer } from '@/components/footer';
import MobileMenu from '@/components/mobile/MobileMenu';
import { useCart } from '@/context/cart-context';
import { Product } from '@/lib/shopify/types';
import {
  ShieldCheck,
  Truck,
  Headphones,
  Search,
  ShoppingCart,
  Menu,
  ChevronRight,
  Star,
  X,
  ArrowUp,
  Package,
  Lock,
  Award,
  Warehouse,
  BadgeCheck,
  Gift,
  User,
  CheckCircle2,
  FileText,
  CreditCard,
  Percent,
  Users,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DATA CONSTANTS
   ───────────────────────────────────────────── */

const CATEGORIES = [
  {
    name: 'Outils électroportatifs',
    subtitle: 'Perceuses, visseuses, meuleuses...',
    handle: 'outils-electroportatifs',
    image: '/categories/outils-electroportatifs.png',
    count: 186,
  },
  {
    name: 'Batteries & Chargeurs',
    subtitle: 'M12, M18, MX FUEL',
    handle: 'batteries-chargeurs-et-generateurs',
    image: '/categories/batteries-chargeurs.png',
    count: 74,
  },
  {
    name: 'Aspirateurs',
    subtitle: 'Chantier & atelier',
    handle: 'aspirateurs',
    image: '/categories/aspirateurs.png',
    count: 32,
  },
  {
    name: 'Éclairage',
    subtitle: 'Projecteurs & lampes',
    handle: 'eclairage',
    image: '/categories/eclairage.png',
    count: 28,
  },
  {
    name: 'Instruments de mesure',
    subtitle: 'Lasers, détecteurs, mètres',
    handle: 'instruments-de-mesure',
    image: '/categories/instruments-mesure.png',
    count: 45,
  },
  {
    name: 'EPI & Vêtements',
    subtitle: 'Protection & confort',
    handle: 'epi-vetements',
    image: '/categories/epi.png',
    count: 38,
  },
  {
    name: 'Extérieurs & Espaces verts',
    subtitle: 'Taille-haies, souffleurs...',
    handle: 'exterieurs-et-espaces-verts',
    image: '/categories/exterieurs-espaces-verts.png',
    count: 41,
  },
  {
    name: 'Assainissement',
    subtitle: 'Déboucheurs & inspection',
    handle: 'assainissement-et-nettoyage',
    image: '/categories/assainissement.png',
    count: 22,
  },
];

const REVIEWS = [
  {
    name: 'Jean-Marc D.',
    job: 'Électricien indépendant',
    city: 'Liège',
    rating: 5,
    text: "J'ai commandé une perceuse M12 FUEL et reçu le lendemain matin. La garantie 3 ans enregistrée automatiquement, c'est un vrai plus.",
    product: 'Perceuse M12 FUEL',
    source: 'Google',
    date: 'il y a 2 semaines',
    verified: true,
  },
  {
    name: 'Thomas V.',
    job: 'Chef de chantier',
    city: 'Bruxelles',
    rating: 5,
    text: "45 Nm de couple, mandrin 13mm — j'ai trouvé exactement ce qu'il me fallait grâce aux fiches techniques détaillées. Livré en 24h comme promis.",
    product: 'Visseuse à chocs M18',
    source: 'Trustpilot',
    date: 'il y a 3 semaines',
    verified: true,
  },
  {
    name: 'Pierre M.',
    job: 'Plombier',
    city: 'Namur',
    rating: 5,
    text: 'SAV impeccable. Ma meuleuse est tombée en panne, ils sont venus la chercher, réparée et retournée en 4 jours. Service pro.',
    product: 'Meuleuse M18 FUEL',
    source: 'Google',
    date: 'il y a 1 mois',
    verified: true,
  },
  {
    name: 'Laurent B.',
    job: 'Artisan maçon',
    city: 'Charleroi',
    rating: 5,
    text: "Le conseil technique avant achat m'a fait gagner du temps. Ils connaissent vraiment chaque outil. Commande parfaite.",
    product: 'Perforateur SDS-Plus',
    source: 'Google',
    date: 'il y a 1 mois',
    verified: true,
  },
  {
    name: 'Sébastien K.',
    job: 'Menuisier',
    city: 'Luxembourg',
    rating: 5,
    text: 'Achat pro avec TVA correctement gérée, livraison rapide, produit Milwaukee de qualité. Je recommande sans hésiter.',
    product: 'Scie circulaire M18',
    source: 'Trustpilot',
    date: 'il y a 2 mois',
    verified: true,
  },
  {
    name: 'Frédéric N.',
    job: 'Paysagiste indépendant',
    city: 'Arlon',
    rating: 5,
    text: 'Le système M18 FUEL est une révolution pour mon activité. Achetés ici avec tous les conseils nécessaires.',
    product: 'Taille-haies M18 FUEL',
    source: 'Google',
    date: 'il y a 2 mois',
    verified: true,
  },
];

const RATING_DISTRIBUTION = [
  { stars: 5, percent: 87 },
  { stars: 4, percent: 9 },
  { stars: 3, percent: 3 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 0 },
];

const BESTSELLER_TABS = [
  { key: 'tous', label: 'TOUS' },
  { key: 'perceuses', label: 'PERCEUSES' },
  { key: 'visseuses', label: 'VISSEUSES' },
  { key: 'meuleuses', label: 'MEULEUSES' },
  { key: 'batteries', label: 'BATTERIES' },
] as const;

type TabKey = (typeof BESTSELLER_TABS)[number]['key'];

const SEARCH_PLACEHOLDERS = [
  'Rechercher un produit...',
  'Perceuse M18 FUEL...',
  'Batterie 5Ah...',
  'Meuleuse 125mm...',
];

function formatPrice(amount: string): string {
  return parseFloat(amount).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function filterProducts(products: Product[], tab: TabKey): Product[] {
  if (tab === 'tous') return products;
  const keywords: Record<Exclude<TabKey, 'tous'>, string[]> = {
    perceuses: ['perceuse', 'perforateur'],
    visseuses: ['visseuse', 'boulonneuse'],
    meuleuses: ['meuleuse'],
    batteries: ['batterie', 'chargeur'],
  };
  const terms = keywords[tab];
  return products.filter((p) => {
    const text = `${p.title} ${p.productType || ''}`.toLowerCase();
    return terms.some((t) => text.includes(t));
  });
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */

interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText: string | null };
  priceRange: { minVariantPrice: { amount: string } };
}

export default function HomePage({ products }: { products: Product[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('tous');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [email, setEmail] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [activeReviewSlide, setActiveReviewSlide] = useState(0);
  const reviewSliderRef = useRef<HTMLDivElement>(null);
  const { addToCart, cart, openCart } = useCart();

  const cartCount =
    cart?.lines?.edges?.reduce((sum, { node }) => sum + node.quantity, 0) ?? 0;

  /* Scroll: back-to-top button */
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Header scroll detection via Framer Motion */
  const { scrollY } = useScroll();
  const [headerScrolled, setHeaderScrolled] = useState(false);
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setHeaderScrolled(latest > 80);
  });

  /* Rotating search placeholder */
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /* Review slider scroll tracking */
  const handleReviewScroll = useCallback(() => {
    if (!reviewSliderRef.current) return;
    const { scrollLeft, offsetWidth } = reviewSliderRef.current;
    const cardWidth = offsetWidth * 0.85;
    setActiveReviewSlide(Math.round(scrollLeft / cardWidth));
  }, []);

  useEffect(() => {
    const el = reviewSliderRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleReviewScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleReviewScroll);
  }, [handleReviewScroll]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /* Filtered products for bestsellers */
  const filteredProducts = useMemo(
    () => filterProducts(products, activeTab).slice(0, 8),
    [products, activeTab]
  );

  /* Nouveautés: different slice */
  const nouveautes = useMemo(() => products.slice(8, 14), [products]);

  /* Live search — debounced 200ms */
  useEffect(() => {
    if (!searchOpen) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery.trim())}`
        );
        const data = await res.json();
        setSearchResults(data.products || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery, searchOpen]);

  /* ─── Product card component ─── */
  const ProductCard = ({
    product,
    badge,
    size = 'default',
  }: {
    product: Product;
    badge?: 'nouveau';
    size?: 'default' | 'large';
  }) => {
    const variantId = product.variants?.edges[0]?.node.id;
    const price = product.priceRange.minVariantPrice.amount;
    const comparePrice = product.compareAtPrice?.amount;
    const discount =
      comparePrice && parseFloat(comparePrice) > parseFloat(price)
        ? Math.round(
          ((parseFloat(comparePrice) - parseFloat(price)) /
            parseFloat(comparePrice)) *
          100
        )
        : null;
    const isFuel =
      product.title.toLowerCase().includes('fuel') ||
      (product.tags || []).some((t) => t.toLowerCase() === 'fuel');
    const isAdding = addingId === product.id;

    return (
      <article className={`flex-shrink-0 snap-start bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${size === 'large'
          ? 'w-[85%] min-[480px]:w-[60%] md:w-auto lg:w-auto'
          : 'w-[78%] min-[480px]:w-[55%] md:w-auto lg:w-auto'
        }`}>
        <Link href={`/produit/${product.handle}`} className="block">
          <div className="aspect-square bg-[#F8F8F8] relative overflow-hidden">
            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
              {discount && (
                <span className="bg-[#DB021D] text-white text-[11px] font-black px-2.5 py-1 rounded-md uppercase">
                  -{discount}%
                </span>
              )}
              {badge === 'nouveau' && (
                <span className="bg-[#16A34A] text-white text-[11px] font-black px-2.5 py-1 rounded-md uppercase">
                  NOUVEAU
                </span>
              )}
              {isFuel && !badge && (
                <span className="bg-[#1A1A1A] text-white text-[11px] font-black px-2.5 py-1 rounded-md uppercase">
                  FUEL
                </span>
              )}
            </div>
            {product.featuredImage ? (
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText || product.title}
                fill
                className="object-contain p-2"
                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 55vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-10 h-10 text-gray-300" />
              </div>
            )}
          </div>
        </Link>

        <div className="p-4 flex flex-col flex-grow">
          {product.productType && (
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
              {product.productType}
            </span>
          )}
          <Link href={`/produit/${product.handle}`}>
            <h3 className="text-[13px] font-bold text-[#1A1A1A] line-clamp-2 leading-snug mb-2 hover:text-[#DB021D] transition-colors">
              {product.title}
            </h3>
          </Link>
          <div className="flex-grow" />
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-black text-[#1A1A1A]">
              {formatPrice(price)} € <span className="text-[11px] font-semibold text-[#6B7280]">TTC</span>
            </span>
            {comparePrice &&
              parseFloat(comparePrice) > parseFloat(price) && (
                <span className="text-[12px] text-[#6B7280] line-through">
                  {formatPrice(comparePrice)} €
                </span>
              )}
          </div>
          {/* Stock indicator */}
          <p className="text-[11px] text-[#16A34A] font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full" />
            En stock · Expédition J+1
          </p>
          <button
            disabled={!variantId || isAdding}
            onClick={async () => {
              if (!variantId) return;
              setAddingId(product.id);
              await addToCart(variantId, 1);
              setAddingId(null);
            }}
            className="w-full mt-3 py-3.5 bg-[#DB021D] text-white text-[12px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:bg-[#B8011A] active:scale-[0.95] transition-all shadow-sm shadow-[#DB021D]/25 disabled:opacity-60"
          >
            <ShoppingCart className="w-3.5 h-3.5" strokeWidth={2.5} />
            {isAdding ? 'Ajout…' : 'AJOUTER AU PANIER'}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-[#DB021D] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
      >
        Aller au contenu principal
      </a>

      {/* ════════════════════════════════════════
          SECTION 0 — HEADER STICKY
          Outer div = sticky anchor (always top-0)
          Inner wrapper = adds padding when scrolled to create floating effect
          Header bar = bg/shadow/radius transitions
          ════════════════════════════════════════ */}
      <div className="sticky top-0 z-50">
        <div className={`transition-all duration-300 ease-out ${
          headerScrolled ? 'px-3 md:px-5 pt-2' : 'px-0 pt-0'
        }`}>
          <header
            role="banner"
            aria-label="En-tête du site"
            className={`transition-all duration-300 ease-out ${
              headerScrolled
                ? 'bg-white/85 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)]'
                : 'bg-white'
            }`}
          >
            {/* Mobile header (< md) */}
            <div className="md:hidden">
              {/* Line 1: Menu | Logo | Cart */}
              <div className={`flex items-center justify-between px-4 transition-all duration-300 ${
                headerScrolled ? 'h-12' : 'h-14'
              }`}>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="w-11 h-11 flex items-center justify-center -ml-1.5"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="w-6 h-6 text-[#1A1A1A]" strokeWidth={1.8} />
                </button>

                <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                  <span className="text-[1.1rem] tracking-tight">
                    <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">
                      FELTEN
                    </span>
                    <span className="font-normal text-[#1A1A1A]"> SHOP</span>
                  </span>
                </Link>

                <button
                  onClick={() => openCart()}
                  className="relative w-11 h-11 flex items-center justify-center -mr-1.5"
                  aria-label={`Panier — ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
                >
                  <ShoppingCart
                    className="w-[22px] h-[22px] text-[#1A1A1A]"
                    strokeWidth={1.8}
                  />
                  {cartCount > 0 && (
                    <span
                      aria-live="polite"
                      className="absolute top-1 right-0.5 w-[18px] h-[18px] bg-[#DB021D] text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Line 2: Search bar full width */}
              <div className={`px-4 transition-all duration-300 ${
                headerScrolled ? 'pb-2' : 'pb-3'
              }`}>
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-full flex items-center gap-2 h-10 px-3 bg-[#F5F5F5] rounded-lg text-[#6B7280] text-[13px]"
                  aria-label="Rechercher"
                >
                  <Search className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                  <span>{SEARCH_PLACEHOLDERS[placeholderIdx]}</span>
                </button>
              </div>
            </div>

            {/* Desktop header (md+) */}
            <div className="hidden md:block">
              <div className="max-w-[1280px] mx-auto px-8">
                <div className={`flex items-center justify-between transition-all duration-300 ${
                  headerScrolled ? 'h-[56px]' : 'h-[72px]'
                }`}>
                  {/* Logo + tagline */}
                  <div className="flex items-center gap-4">
                    <Link href="/">
                      <span className="text-[1.4rem] tracking-tight">
                        <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">
                          FELTEN
                        </span>
                        <span className="font-normal text-[#1A1A1A]"> SHOP</span>
                      </span>
                    </Link>
                    <span className="text-[11px] text-[#6B7280] font-medium uppercase tracking-wider border-l border-gray-200 pl-4">
                      Revendeur officiel Milwaukee
                    </span>
                  </div>

                  {/* Search bar — 40% center */}
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="flex items-center gap-2 px-4 h-10 border border-gray-200 rounded-lg text-[#6B7280] text-sm hover:border-[#DB021D] transition-colors w-[40%] max-w-md"
                    aria-label="Rechercher"
                  >
                    <Search className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
                    <span className="truncate">
                      {SEARCH_PLACEHOLDERS[placeholderIdx]}
                    </span>
                  </button>

                  {/* Mon compte + Panier */}
                  <div className="flex items-center gap-3">
                    <Link
                      href="/connexion"
                      className="flex items-center gap-2 px-4 h-10 text-[#1A1A1A] text-sm font-medium hover:text-[#DB021D] transition-colors"
                    >
                      <User className="w-4 h-4" strokeWidth={1.8} />
                      Mon compte
                    </Link>
                    <button
                      onClick={() => openCart()}
                      className="relative flex items-center gap-2 px-4 h-10 bg-[#1A1A1A] text-white rounded-lg text-sm font-semibold hover:bg-[#DB021D] transition-colors"
                      aria-label={`Panier — ${cartCount} article${cartCount !== 1 ? 's' : ''}`}
                    >
                      <ShoppingCart className="w-4 h-4" strokeWidth={2} />
                      Panier
                      {cartCount > 0 && (
                        <span
                          aria-live="polite"
                          className="w-5 h-5 bg-[#DB021D] text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                        >
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      <main id="main-content">
        {/* ════════════════════════════════════════
            SECTION 1 — HERO (split 60/40)
            ════════════════════════════════════════ */}
        <section className="bg-[#1A1A1A] relative">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-8 pb-5 md:pt-12 lg:pt-16 md:pb-12 lg:pb-20">

            {/* ── MOBILE (< md) ─────────────────────── */}
            <div className="md:hidden">
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#DB021D] text-white text-[10px] font-bold uppercase tracking-[0.12em] rounded-md mb-4">
                REVENDEUR OFFICIEL MILWAUKEE BELGIQUE
              </span>

              {/* H1 (left) + Product image (right) */}
              <div className="flex items-start gap-2 mb-5">
                <h1 className="flex-1 text-[1.65rem] leading-[0.95] font-black uppercase tracking-normal">
                  <span className="text-white block">LA QUALITÉ MILWAUKEE.</span>
                  <span className="text-[#DB021D] block">LE SERVICE FELTEN EN PLUS.</span>
                </h1>
                <div className="w-[40%] flex-shrink-0 relative h-[150px]">
                  <Image
                    src="/images/m18-fuel-drill.png"
                    alt="Milwaukee M18 FUEL"
                    fill
                    className="object-contain object-right-bottom"
                    sizes="40vw"
                    priority
                  />
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-white/60 text-[14px] mb-5">
                516 outils Milwaukee disponibles. Livraison 24-48h en Belgique et au Luxembourg.
              </p>

              {/* CTAs */}
              <div className="flex flex-col gap-3 mb-5">
                <Link
                  href="/catalogue"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#DB021D] text-white text-[14px] font-black uppercase tracking-wider rounded-lg hover:bg-[#B8011A] transition-colors shadow-lg shadow-[#DB021D]/30 active:scale-[0.97]"
                >
                  DÉCOUVRIR LE CATALOGUE
                  <ChevronRight className="w-5 h-5" strokeWidth={3} />
                </Link>
                <Link
                  href="/catalogue?promo=true"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-white/30 text-white text-[13px] font-black uppercase tracking-wider rounded-lg hover:bg-white hover:text-[#1A1A1A] transition-colors active:scale-[0.97]"
                >
                  OFFRES DU MOMENT
                </Link>
              </div>

              {/* Stats bar */}
              <div className="flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                    ))}
                  </div>
                  <div className="text-center">
                    <span className="text-base font-black text-white leading-none block">4.9/5</span>
                    <span className="text-[9px] text-white/50 leading-none">340 avis</span>
                  </div>
                </div>
                <div className="w-px h-7 bg-white/15 mx-4" />
                <div className="text-center">
                  <span className="text-base font-black text-white leading-none block">516</span>
                  <span className="text-[9px] text-white/50 leading-none">références</span>
                </div>
                <div className="w-px h-7 bg-white/15 mx-4" />
                <div className="text-center">
                  <span className="text-base font-black text-white leading-none block">24h</span>
                  <span className="text-[9px] text-white/50 leading-none">expédition</span>
                </div>
              </div>
            </div>

            {/* ── TABLET / DESKTOP (md+) ────────────── */}
            <div className="hidden md:flex md:items-center md:gap-12 lg:gap-16">
              {/* Left 60% */}
              <div className="md:w-[60%]">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#DB021D] text-white text-[10px] font-bold uppercase tracking-[0.12em] rounded-md mb-6">
                  REVENDEUR OFFICIEL MILWAUKEE BELGIQUE
                </span>
                <h1 className="text-[3.2rem] lg:text-[3.5rem] xl:text-[4rem] leading-[0.95] font-black uppercase tracking-normal mb-6 lg:mb-8">
                  <span className="text-white block">LA QUALITÉ MILWAUKEE.</span>
                  <span className="text-[#DB021D] block">LE SERVICE FELTEN EN PLUS.</span>
                </h1>
                <p className="text-white/60 text-[15px] lg:text-base mb-8">
                  516 outils Milwaukee disponibles. Livraison 24-48h en Belgique et au Luxembourg.
                </p>
                <div className="flex gap-3 mb-8">
                  <Link
                    href="/catalogue"
                    className="inline-flex items-center justify-center gap-2 px-10 py-[18px] bg-[#DB021D] text-white text-[15px] font-black uppercase tracking-wider rounded-lg hover:bg-[#B8011A] transition-colors shadow-lg shadow-[#DB021D]/30 active:scale-[0.97]"
                  >
                    DÉCOUVRIR LE CATALOGUE
                    <ChevronRight className="w-5 h-5" strokeWidth={3} />
                  </Link>
                  <Link
                    href="/catalogue?promo=true"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white text-sm font-black uppercase tracking-wider rounded-lg hover:bg-white hover:text-[#1A1A1A] transition-colors active:scale-[0.97]"
                  >
                    OFFRES DU MOMENT
                  </Link>
                </div>
                <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((i) => (
                        <Star key={i} className="w-4 h-4 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                      ))}
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-black text-white leading-none block">4.9/5</span>
                      <span className="text-[10px] text-white/50 leading-none">340 avis</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-white/15 mx-5" />
                  <div className="text-center">
                    <span className="text-lg font-black text-white leading-none block">516</span>
                    <span className="text-[10px] text-white/50 leading-none">références</span>
                  </div>
                  <div className="w-px h-8 bg-white/15 mx-5" />
                  <div className="text-center">
                    <span className="text-lg font-black text-white leading-none block">24h</span>
                    <span className="text-[10px] text-white/50 leading-none">expédition</span>
                  </div>
                </div>
              </div>
              {/* Right 40% */}
              <div className="md:w-[40%] relative">
                <div className="relative aspect-square">
                  <Image
                    src="/images/m18-fuel-drill.png"
                    alt="Milwaukee M18 FUEL — Perceuse-visseuse haute performance"
                    fill
                    className="object-contain"
                    sizes="40vw"
                    priority
                  />
                  <div className="absolute bottom-8 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-100">
                    <p className="text-[11px] font-black text-[#DB021D] uppercase tracking-wider">FUEL M18</p>
                    <p className="text-[12px] font-semibold text-[#1A1A1A]">Stock disponible</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 3 — CATEGORIES (with PNG images)
            ════════════════════════════════════════ */}
        <section className="py-12 lg:py-20 bg-white">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <h2 className="text-[1.75rem] lg:text-4xl font-black uppercase tracking-normal text-center mb-6 lg:mb-12">
              NOTRE CATALOGUE
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {CATEGORIES.map((cat, idx) => (
                <Link
                  key={cat.handle}
                  href={`/catalogue/${cat.handle}`}
                  className={`group relative overflow-hidden rounded-2xl block ${idx < 2
                      ? 'col-span-1 h-[175px] md:h-[220px] lg:h-[240px]'
                      : 'h-[135px] md:h-[180px] lg:h-[200px]'
                    }`}
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Gradient overlay — stronger for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  {/* Hover: red bottom border */}
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#DB021D] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                    <h3 className="text-white text-base lg:text-lg font-black uppercase leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-white/80 text-[13px] mt-1 leading-snug">
                      {cat.subtitle}
                    </p>
                    <p className="text-white/50 text-[12px] mt-1.5 font-medium">
                      {cat.count} produits →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 4 — BESTSELLERS (with filter tabs)
            ════════════════════════════════════════ */}
        <section className="pt-14 pb-12 lg:pt-24 lg:pb-20 bg-white">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h2 className="text-[1.75rem] lg:text-4xl font-black uppercase tracking-normal">
                NOS BESTSELLERS
              </h2>
              <Link
                href="/catalogue"
                className="text-[13px] font-semibold text-[#DB021D] hover:text-[#B8011A] transition-colors flex items-center gap-1"
              >
                Voir tout le catalogue
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar mb-8 pb-1">
              {BESTSELLER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2.5 min-h-[40px] rounded-lg text-[12px] font-black uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === tab.key
                      ? 'bg-[#1A1A1A] text-white'
                      : 'bg-[#F5F5F5] text-[#6B7280] hover:text-[#1A1A1A]'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 md:grid md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-[#6B7280]">
                  Aucun produit dans cette catégorie.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 6 — EXPERTISE / USPs
            ════════════════════════════════════════ */}
        <section className="py-12 lg:py-20 bg-[#F5F5F5]">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <h2 className="text-[1.75rem] lg:text-4xl font-black uppercase tracking-normal text-center mb-4">
              POURQUOI FELTEN SHOP ?
            </h2>
            <p className="text-[#6B7280] text-[15px] text-center mb-8 lg:mb-12 max-w-lg mx-auto">
              Un service pensé pour les pros du terrain.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 lg:gap-8">
              {[
                {
                  icon: Headphones,
                  stat: '516',
                  statLabel: 'références',
                  title: 'Conseils d\u2019experts',
                  text: 'Notre équipe connaît chaque référence Milwaukee. Un doute ? Appelez-nous.',
                },
                {
                  icon: Warehouse,
                  stat: '24h',
                  statLabel: 'expédition',
                  title: 'Stock réel en Belgique',
                  text: 'Pas de dropshipping. Votre commande part de notre entrepôt sous 24h.',
                },
                {
                  icon: BadgeCheck,
                  stat: '3 ans',
                  statLabel: 'garantie',
                  title: 'Revendeur agréé',
                  text: 'Garantie constructeur enregistrée automatiquement sur chaque machine.',
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#DB021D] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon
                          className="w-6 h-6 text-white"
                          strokeWidth={2}
                        />
                      </div>
                      <div>
                        <span className="text-2xl font-black text-[#1A1A1A] leading-none">{item.stat}</span>
                        <span className="text-[12px] text-[#6B7280] font-medium ml-1">{item.statLabel}</span>
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-[#1A1A1A] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[14px] text-[#6B7280] leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 7 — NOUVEAUTÉS
            ════════════════════════════════════════ */}
        <section className="pt-14 pb-12 lg:pt-24 lg:pb-20 bg-[#F5F5F5]">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h2 className="text-[1.75rem] lg:text-4xl font-black uppercase tracking-normal">
                NOUVEAUTÉS
              </h2>
              <Link
                href="/catalogue"
                className="text-[13px] font-semibold text-[#DB021D] hover:text-[#B8011A] transition-colors flex items-center gap-1"
              >
                Voir tout
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>

            {nouveautes.length >= 3 ? (
              <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 md:grid md:grid-cols-2 lg:grid-cols-3">
                {nouveautes.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    badge="nouveau"
                    size="large"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-[#6B7280]">
                  Nouvelles références bientôt disponibles.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 8 — AVIS CLIENTS (with aggregate)
            ════════════════════════════════════════ */}
        <section className="pt-14 pb-12 lg:pt-24 lg:pb-20 bg-white">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <h2 className="text-[1.75rem] lg:text-4xl font-black uppercase tracking-normal text-center mb-6 lg:mb-12">
              ILS NOUS FONT CONFIANCE
            </h2>

            <div className="md:flex md:gap-8 lg:gap-12">
              {/* Left 1/3: Aggregate */}
              <div className="md:w-1/3 mb-6 md:mb-0">
                {/* Mobile: compact inline bar */}
                <div className="md:hidden flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="text-center">
                    <span className="text-[40px] font-black text-[#1A1A1A] leading-none block">4.9</span>
                    <div className="flex gap-0.5 justify-center mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#1A1A1A]">340 avis vérifiés</p>
                    <div className="flex gap-2 mt-1.5">
                      <span className="text-[11px] text-[#6B7280] border border-gray-200 px-2 py-1 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] flex-shrink-0" />
                        Google
                      </span>
                      <span className="text-[11px] text-[#6B7280] border border-gray-200 px-2 py-1 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00B67A] flex-shrink-0" />
                        Trustpilot
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desktop: full block with distribution bars */}
                <div className="hidden md:block bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="text-center mb-4">
                    <span className="text-[72px] font-black text-[#1A1A1A] leading-none">
                      4.9
                    </span>
                    <div className="flex justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-5 h-5 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                      ))}
                    </div>
                    <p className="text-[13px] text-[#6B7280] mt-2">
                      Basé sur 340 avis vérifiés
                    </p>
                  </div>
                  <div className="space-y-2 mb-6">
                    {RATING_DISTRIBUTION.map((r) => (
                      <div key={r.stars} className="flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-[#1A1A1A] w-4 text-right">
                          {r.stars}
                        </span>
                        <Star className="w-3 h-3 text-[#FBBF24]" fill="#FBBF24" strokeWidth={0} />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FBBF24] rounded-full" style={{ width: `${r.percent}%` }} />
                        </div>
                        <span className="text-[11px] text-[#6B7280] w-8">{r.percent}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-3">
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                      Google
                    </span>
                    <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00B67A]" />
                      Trustpilot
                    </span>
                  </div>
                </div>
              </div>

              {/* Right 2/3: Reviews carousel */}
              <div className="md:w-2/3">
                <div
                  ref={reviewSliderRef}
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 md:grid md:grid-cols-2"
                >
                  {REVIEWS.map((review, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-[85%] min-[480px]:w-[65%] md:w-auto snap-start bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
                    >
                      {/* Stars */}
                      <div className="flex gap-0.5 mb-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-[18px] h-[18px] ${i <= review.rating ? 'text-[#F59E0B]' : 'text-gray-200'}`}
                            fill={i <= review.rating ? '#F59E0B' : '#e5e7eb'}
                            strokeWidth={0}
                          />
                        ))}
                      </div>
                      {/* Text */}
                      <p className="text-[14px] text-[#1A1A1A] leading-relaxed flex-grow mb-4">
                        &quot;{review.text}&quot;
                      </p>
                      {/* Product */}
                      <p className="text-[11px] text-[#6B7280] mb-3">
                        Produit : {review.product}
                      </p>
                      {/* Author */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[13px] font-bold text-[#1A1A1A] block">
                            {review.name}
                          </span>
                          <span className="text-[11px] text-[#6B7280]">
                            {review.job} — {review.city}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          {review.verified && (
                            <span className="text-[10px] font-semibold text-[#16A34A] flex items-center gap-0.5">
                              <CheckCircle2
                                className="w-3 h-3"
                                strokeWidth={2.5}
                              />
                              Vérifié
                            </span>
                          )}
                          <span className="text-[10px] text-[#6B7280] flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${review.source === 'Google' ? 'bg-[#4285F4]' : 'bg-[#00B67A]'}`} />
                            {review.source} · {review.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination dots (mobile only) */}
                <div className="md:hidden flex justify-center gap-2 mt-5">
                  {REVIEWS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${i === activeReviewSlide
                          ? 'bg-[#DB021D] w-6'
                          : 'bg-gray-300 w-2'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 9 — ESPACE B2B
            ════════════════════════════════════════ */}
        <section className="py-12 lg:py-20 bg-[#1A1A1A] relative overflow-hidden">
          {/* Diagonal stripes overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px)`,
            }}
          />
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 relative z-10">
            <div className="md:flex md:items-center md:gap-12 lg:gap-16">
              {/* Left */}
              <div className="md:w-1/2 mb-10 md:mb-0">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#DB021D] text-white text-[10px] font-bold uppercase tracking-[0.12em] rounded-md mb-6">
                  ESPACE PROFESSIONNEL
                </span>
                <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-normal text-white mb-4 leading-tight">
                  VOUS ÊTES UN PRO ?
                </h2>
                <p className="text-white/60 text-[15px] mb-8 leading-relaxed">
                  Créez votre compte professionnel et bénéficiez d&apos;avantages
                  exclusifs pour votre activité.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/inscription"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#DB021D] text-white text-sm font-black uppercase tracking-wider rounded-lg hover:bg-[#B8011A] transition-colors active:scale-[0.97]"
                  >
                    CRÉER MON COMPTE PRO
                    <ChevronRight className="w-5 h-5" strokeWidth={3} />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white text-sm font-medium rounded-lg hover:border-white/40 transition-colors active:scale-[0.97]"
                  >
                    Demander un devis rapide
                  </Link>
                </div>
                <p className="text-white/40 text-[13px] mt-4">
                  Activation sous 24h · Devis gratuit
                </p>
              </div>

              {/* Right — 5 advantages */}
              <div className="md:w-1/2">
                <div className="relative space-y-4">
                  {/* Timeline line */}
                  <div className="absolute left-[19px] top-5 bottom-5 w-[2px] border-l-2 border-dashed border-[#DB021D]/30" />
                  {[
                    {
                      icon: Percent,
                      text: 'Prix HT et gestion TVA intracommunautaire',
                    },
                    {
                      icon: FileText,
                      text: 'Factures automatiques téléchargeables',
                    },
                    {
                      icon: CreditCard,
                      text: 'Paiement par virement et conditions spéciales',
                    },
                    {
                      icon: Users,
                      text: 'Interlocuteur dédié pour vos commandes',
                    },
                    {
                      icon: Truck,
                      text: 'Livraison prioritaire sur chantier',
                    },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 bg-[#DB021D] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon
                            className="w-5 h-5 text-white"
                            strokeWidth={2}
                          />
                        </div>
                        <p className="text-white text-[15px] font-medium">
                          {item.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 10 — NEWSLETTER
            ════════════════════════════════════════ */}
        <section className="pt-14 pb-12 lg:pt-24 lg:pb-20 bg-[#F5F5F5]">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
            {/* Badge -10% */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#DB021D]/10 text-[#DB021D] text-[13px] font-bold rounded-full mb-6">
              <Gift className="w-4 h-4" strokeWidth={2} />
              -10% sur votre première commande
            </div>

            <h2 className="text-[1.75rem] lg:text-4xl font-black uppercase tracking-normal text-[#1A1A1A] mb-3">
              RESTEZ INFORMÉ
            </h2>
            <p className="text-[#6B7280] text-[15px] mb-8 max-w-md mx-auto">
              Recevez nos promos exclusives Milwaukee en avant-première.
              Directement dans votre boîte mail.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail('');
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="flex-1">
                <label htmlFor="newsletter-email" className="sr-only">
                  Votre adresse email
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 text-[#1A1A1A] text-[14px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DB021D]/30 focus:border-[#DB021D] bg-white"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-6 bg-[#DB021D] text-white text-[13px] font-black uppercase tracking-wider rounded-lg hover:bg-[#B8011A] transition-colors whitespace-nowrap flex items-center justify-center gap-2"
              >
                JE M&apos;INSCRIS
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
              </button>
            </form>

            <p className="text-[#6B7280] text-[11px] mt-4">
              En vous inscrivant, vous acceptez notre{' '}
              <Link
                href="/politique-confidentialite"
                className="underline hover:text-[#1A1A1A] transition-colors"
              >
                politique de confidentialité
              </Link>
              . Désabonnement en 1 clic.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Back to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 w-11 h-11 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-[#F5F5F5] transition-colors active:scale-95"
          aria-label="Retour en haut"
        >
          <ArrowUp className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2} />
        </button>
      )}

      {/* ════════════════════════════════════════
          SEARCH OVERLAY
          ════════════════════════════════════════ */}
      {searchOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100">
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              className="w-9 h-9 flex items-center justify-center text-[#1A1A1A]"
              aria-label="Fermer la recherche"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setSearchOpen(false);
                  window.location.href = `/recherche?q=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
              className="flex-1 flex items-center"
            >
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit ou SKU..."
                className="w-full h-10 px-3 text-[15px] text-[#1A1A1A] placeholder:text-gray-400 outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  type="submit"
                  className="flex-shrink-0 h-9 px-4 bg-[#DB021D] text-white text-[13px] font-black uppercase rounded-lg"
                >
                  OK
                </button>
              )}
            </form>
          </div>
          {/* Results or suggestions */}
          <div className="flex-1 overflow-y-auto">
            {searchQuery.trim().length >= 2 ? (
              <div>
                {isSearching ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-[#DB021D] rounded-full animate-spin" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="px-4 pt-4 pb-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                        {searchResults.length} résultat
                        {searchResults.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <ul>
                      {searchResults.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/produit/${product.handle}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                            className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 active:bg-gray-50"
                          >
                            <div className="w-12 h-12 flex-shrink-0 bg-[#F5F5F5] rounded-lg overflow-hidden relative">
                              {product.featuredImage?.url && (
                                <Image
                                  src={product.featuredImage.url}
                                  alt={
                                    product.featuredImage.altText ||
                                    product.title
                                  }
                                  fill
                                  className="object-contain p-1"
                                  sizes="48px"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-semibold text-[#1A1A1A] line-clamp-1">
                                {product.title}
                              </p>
                              <p className="text-[13px] font-black text-[#DB021D] mt-0.5">
                                {parseFloat(
                                  product.priceRange.minVariantPrice.amount
                                ).toFixed(2)}{' '}
                                €
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/recherche?q=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center justify-center gap-2 py-4 text-[13px] font-bold text-[#DB021D]"
                    >
                      Voir tous les résultats →
                    </Link>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <p className="text-[#1A1A1A] font-semibold mb-1">
                      Aucun résultat pour « {searchQuery} »
                    </p>
                    <p className="text-[#6B7280] text-[13px]">
                      Essayez un autre terme
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">
                  Recherches fréquentes
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Perceuse M18',
                    'Meuleuse FUEL',
                    'Batterie 5Ah',
                    'M12 visseuse',
                    'Éclairage chantier',
                    'Kit batteries',
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSearchQuery(s)}
                      className="px-3 py-1.5 bg-[#F5F5F5] text-[#1A1A1A] text-[13px] rounded-lg active:bg-gray-200 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
