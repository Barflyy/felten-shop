'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/* ─────────────────────────────────────────────
   ACCORDION (Mobile only)
   ───────────────────────────────────────────── */

function FooterAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5 xl:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
        aria-expanded={open}
      >
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white/60">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform duration-300 ${open ? 'rotate-180 text-[#DB021D]' : ''
            }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5">
              {/* Optional staggered fade-in for children could be added here */}
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────── */

const catalogueLinks = [
  { label: 'Outils électroportatifs', href: '/collections/outils-electroportatifs' },
  { label: 'Batteries & Chargeurs', href: '/collections/batteries-chargeurs-et-generateurs' },
  { label: 'Aspirateurs', href: '/collections/aspirateurs' },
  { label: 'Éclairage', href: '/collections/eclairage' },
  { label: 'Instruments de mesure', href: '/collections/instruments-de-mesure' },
  { label: 'EPI & Vêtements', href: '/collections/epi-vetements' },
  { label: 'Extérieurs & Espaces verts', href: '/collections/exterieurs-et-espaces-verts' },
  { label: 'Assainissement', href: '/collections/assainissement-et-nettoyage' },
];

const infoLinks = [
  { label: 'À propos', href: '/a-propos' },
  { label: 'Livraison', href: '/livraison' },
  { label: 'Garantie & SAV', href: '/garantie' },
  { label: 'Contact', href: '/contact' },
];

const accountLinks = [
  { label: 'Connexion', href: '/compte/connexion' },
  { label: 'Inscription', href: '/compte/inscription' },
  { label: 'Mes commandes', href: '/compte/commandes' },
  { label: 'Mes adresses', href: '/compte/adresses' },
];

const legalLinks = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'CGV', href: '/cgv' },
  { label: 'Confidentialité', href: '/politique-de-confidentialite' },
  { label: 'Retours', href: '/politique-de-retour' },
];

const COOKIE_STORAGE_KEY = 'shopfelten_cookies';

/* ─────────────────────────────────────────────
   FOOTER COMPONENT
   ───────────────────────────────────────────── */

export function Footer() {
  return (
    <footer className="bg-[#2D2D2D] text-white">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10 pb-6">

        {/* ════════════════════════════════════
            DESKTOP — Dense 5-column grid
            ════════════════════════════════════ */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8 pb-8 border-b border-white/10">

          {/* Col 1 — Brand */}
          <div>
            <Link href="/" className="inline-block mb-4 group">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-lg tracking-tight inline-block"
              >
                <span className="font-black text-white underline decoration-[#DB021D] decoration-2 underline-offset-2 group-hover:text-[#DB021D] transition-colors">
                  FELTEN
                </span>
                <span className="font-normal text-white"> SHOP</span>
              </motion.span>
            </Link>
            <p className="text-[12px] text-white/40 leading-relaxed mb-4">
              Revendeur Agréé Milwaukee en Belgique. Garantie 3 ans, SAV premium.
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="tel:+32XXXXXXXXX"
                  className="flex items-center gap-2 text-[12px] text-white/40 hover:text-[#DB021D] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#DB021D] flex-shrink-0" strokeWidth={2} />
                  +32 XX XXX XX XX
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@shopfelten.be"
                  className="flex items-center gap-2 text-[12px] text-white/40 hover:text-[#DB021D] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#DB021D] flex-shrink-0" strokeWidth={2} />
                  contact@shopfelten.be
                </a>
              </li>
              <li className="flex items-center gap-2 text-[12px] text-white/40">
                <MapPin className="w-3.5 h-3.5 text-[#DB021D] flex-shrink-0" strokeWidth={2} />
                Belgique
              </li>
            </ul>
          </div>

          {/* Col 2 — Catalogue */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 mb-4">
              Catalogue
            </h3>
            <ul className="space-y-2">
              {catalogueLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[12px] text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Informations */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 mb-4">
              Informations
            </h3>
            <ul className="space-y-2">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[12px] text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Mon compte */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 mb-4">
              Mon compte
            </h3>
            <ul className="space-y-2">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[12px] text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 — Légal */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 mb-4">
              Légal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[12px] text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem(COOKIE_STORAGE_KEY);
                      window.location.reload();
                    }
                  }}
                  className="text-[12px] text-white/50 hover:text-white transition-colors"
                >
                  Gérer les cookies
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* ════════════════════════════════════
            MOBILE layout
            ════════════════════════════════════ */}
        <div className="lg:hidden">
          <div className="text-center mb-6 pb-6 border-b border-white/10">
            <Link href="/" className="inline-block mb-3 group">
              <motion.span
                whileTap={{ scale: 0.95 }}
                className="text-xl tracking-tight inline-block"
              >
                <span className="font-black text-white underline decoration-[#DB021D] decoration-2 underline-offset-2 group-active:text-[#DB021D] transition-colors">
                  FELTEN
                </span>
                <span className="font-normal text-white"> SHOP</span>
              </motion.span>
            </Link>
            <p className="text-xs text-white/50 mb-4">
              Revendeur Agréé Milwaukee en Belgique
            </p>
            <div className="flex items-center justify-center gap-5">
              <a href="tel:+32XXXXXXXXX" className="flex items-center gap-1.5 text-[12px] text-white/50 hover:text-[#DB021D] transition-colors">
                <Phone className="w-3.5 h-3.5 text-[#DB021D]" strokeWidth={2} />
                Appeler
              </a>
              <a href="mailto:contact@shopfelten.be" className="flex items-center gap-1.5 text-[12px] text-white/50 hover:text-[#DB021D] transition-colors">
                <Mail className="w-3.5 h-3.5 text-[#DB021D]" strokeWidth={2} />
                Email
              </a>
            </div>
          </div>

          <FooterAccordion title="Catalogue">
            <ul className="space-y-3">
              {catalogueLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[13px] text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          <FooterAccordion title="Informations">
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[13px] text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          <FooterAccordion title="Mon compte">
            <ul className="space-y-3">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[13px] text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          <FooterAccordion title="Légal">
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[13px] text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem(COOKIE_STORAGE_KEY);
                      window.location.reload();
                    }
                  }}
                  className="text-[13px] text-white/50 hover:text-white transition-colors"
                >
                  Gérer les cookies
                </button>
              </li>
            </ul>
          </FooterAccordion>
        </div>

        {/* ════════════════════════════════════
            BOTTOM BAR — compact
            ════════════════════════════════════ */}
        <div className="pt-5 flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Payment icons */}
          <div className="flex items-center justify-center lg:justify-start gap-1.5 flex-wrap">
            {['Bancontact', 'Visa', 'Mastercard', 'Virement'].map((method) => (
              <span
                key={method}
                className="border border-white/15 rounded px-2 py-1 text-[9px] font-bold text-white/40 uppercase tracking-wider"
              >
                {method}
              </span>
            ))}
          </div>

          {/* Copyright + Language */}
          <div className="flex items-center justify-center lg:justify-end lg:ml-auto gap-4">
            <p className="text-[11px] text-white/25 whitespace-nowrap">
              © 2026 Felten Shop — Revendeur Agréé Milwaukee
            </p>
            <div className="flex items-center gap-1 border border-white/10 rounded px-2 py-0.5">
              <Globe className="w-3 h-3 text-white/25" strokeWidth={2} />
              <select
                className="bg-transparent text-[11px] text-white/35 border-0 outline-none cursor-pointer"
                defaultValue="FR"
              >
                <option value="FR">FR</option>
                <option value="NL">NL</option>
                <option value="DE">DE</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* iOS safe area */}
      <div className="safe-area-bottom bg-[#2D2D2D]" />
    </footer>
  );
}
