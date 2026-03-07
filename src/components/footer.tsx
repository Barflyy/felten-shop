'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Globe,
  Instagram,
} from 'lucide-react';

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
        className="w-full flex items-center justify-between py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-[400px] pb-4' : 'max-h-0'}`}>
        {children}
      </div>
    </div>
  );
}

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

export function Footer() {
  return (
    <footer className="bg-[#2D2D2D] text-white">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-10 pb-6">

        {/* Desktop */}
        <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8 pb-8 border-b border-white/10">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-lg tracking-tight">
                <span className="font-black text-white underline decoration-[#DB021D] decoration-2 underline-offset-2">
                  FELTEN
                </span>
                <span className="font-normal text-white"> SHOP</span>
              </span>
            </Link>
            <p className="text-[12px] text-white/40 leading-relaxed mb-4">
              Revendeur Agréé Milwaukee au Luxembourg. Garantie 3 ans, SAV premium.
            </p>
            <ul className="space-y-2">
              <li>
                <a href="tel:+352621304952" className="flex items-center gap-2 text-[12px] text-white/40 hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5 text-[#DB021D] flex-shrink-0" strokeWidth={2} />
                  +352 621 304 952
                </a>
              </li>
              <li>
                <a href="mailto:florian@felten.lu" className="flex items-center gap-2 text-[12px] text-white/40 hover:text-white transition-colors">
                  <Mail className="w-3.5 h-3.5 text-[#DB021D] flex-shrink-0" strokeWidth={2} />
                  florian@felten.lu
                </a>
              </li>
              <li className="flex items-start gap-2 text-[12px] text-white/40">
                <MapPin className="w-3.5 h-3.5 text-[#DB021D] flex-shrink-0 mt-0.5" strokeWidth={2} />
                Bei der Kapell 10, L-9775 Weicherdange
              </li>
            </ul>
            <div className="flex items-center gap-4 mt-4">
              <a href="https://www.instagram.com/feltenshop/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[12px] text-white/40 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" strokeWidth={2} />
                @feltenshop
              </a>
              <a href="https://felten.lu" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[12px] text-white/40 hover:text-white transition-colors">
                <Globe className="w-4 h-4" strokeWidth={2} />
                felten.lu
              </a>
            </div>
          </div>

          {/* Catalogue */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-4">Catalogue</h3>
            <ul className="space-y-2">
              {catalogueLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[12px] text-white/50 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informations */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-4">Informations</h3>
            <ul className="space-y-2">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[12px] text-white/50 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mon compte */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-4">Mon compte</h3>
            <ul className="space-y-2">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[12px] text-white/50 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-4">Légal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[12px] text-white/50 hover:text-white transition-colors">{link.label}</Link>
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

        {/* Mobile */}
        <div className="lg:hidden">
          <div className="text-center mb-6 pb-6 border-b border-white/10">
            <Link href="/" className="inline-block mb-3">
              <span className="text-xl tracking-tight">
                <span className="font-black text-white underline decoration-[#DB021D] decoration-2 underline-offset-2">
                  FELTEN
                </span>
                <span className="font-normal text-white"> SHOP</span>
              </span>
            </Link>
            <p className="text-xs text-white/50 mb-4">
              Revendeur Agréé Milwaukee au Luxembourg
            </p>
            <div className="flex items-center justify-center gap-5">
              <a href="tel:+352621304952" className="flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-[#DB021D]" strokeWidth={2} />
                Appeler
              </a>
              <a href="mailto:florian@felten.lu" className="flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-[#DB021D]" strokeWidth={2} />
                Email
              </a>
              <a href="https://www.instagram.com/feltenshop/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white transition-colors">
                <Instagram className="w-3.5 h-3.5 text-[#DB021D]" strokeWidth={2} />
                Instagram
              </a>
              <a href="https://felten.lu" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white transition-colors">
                <Globe className="w-3.5 h-3.5 text-[#DB021D]" strokeWidth={2} />
                felten.lu
              </a>
            </div>
          </div>

          <FooterAccordion title="Catalogue">
            <ul className="space-y-3">
              {catalogueLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[13px] text-white/50 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          <FooterAccordion title="Informations">
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[13px] text-white/50 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          <FooterAccordion title="Mon compte">
            <ul className="space-y-3">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[13px] text-white/50 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </FooterAccordion>

          <FooterAccordion title="Légal">
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[13px] text-white/50 hover:text-white transition-colors">{link.label}</Link>
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

        {/* Bottom bar */}
        <div className="pt-5 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center justify-center lg:justify-start gap-1.5 flex-wrap">
            {['Bancontact', 'Visa', 'Mastercard', 'Virement'].map((method) => (
              <span key={method} className="border border-white/15 rounded px-2 py-1 text-[9px] font-medium text-white/40 uppercase tracking-wider">
                {method}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-center lg:justify-end lg:ml-auto gap-4">
            <p className="text-[11px] text-white/25 whitespace-nowrap">
              © 2026 Felten Shop — Revendeur Agréé Milwaukee
            </p>
            <div className="flex items-center gap-1 border border-white/10 rounded px-2 py-0.5">
              <Globe className="w-3 h-3 text-white/25" strokeWidth={2} />
              <select className="bg-transparent text-[11px] text-white/35 border-0 outline-none cursor-pointer" defaultValue="FR">
                <option value="FR">FR</option>
                <option value="NL">NL</option>
                <option value="DE">DE</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="safe-area-bottom bg-[#2D2D2D]" />
    </footer>
  );
}
