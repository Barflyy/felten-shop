'use client';

import Image from 'next/image';
import { HubProfile } from '@/lib/hub-data';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  UserPlus,
  ExternalLink,
} from 'lucide-react';

function saveContact(slug: string) {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);

  if (isIOS) {
    // iOS Safari: fetch vCard then open as data URI — triggers native "Add to Contacts" sheet
    fetch(`/api/contact?slug=${slug}`)
      .then((r) => r.text())
      .then((vcard) => {
        window.location.href =
          'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcard);
      });
  } else {
    // Android: open API route directly — browser downloads .vcf,
    // system prompts to open with Contacts app
    // Desktop: downloads .vcf file (user can double-click to open in Contacts)
    window.open(`/api/contact?slug=${slug}`, '_blank');
  }
}

function formatPhone(phone: string): string {
  // +352621304952 → +352 621 304 952
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('352')) {
    return `+352 ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
  }
  return phone;
}

// Simple SVG icons for socials (no dependency needed)
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export function HubPage({ profile }: { profile: HubProfile }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-[440px] mx-auto px-4 py-8 pb-12">

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Header band */}
          <div className="h-20 bg-[#1A1A1A] relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,#DB021D_0%,transparent_60%)]" />
          </div>

          {/* Avatar + Info */}
          <div className="px-6 pb-6 -mt-12 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full ring-4 ring-white overflow-hidden shadow-lg">
              <Image
                src={profile.avatar}
                alt={profile.name}
                fill
                className="object-cover"
                sizes="96px"
                priority
              />
            </div>

            {/* Logo */}
            <div className="mb-2">
              <span
                className="text-[1rem] tracking-tight leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">
                  FELTEN
                </span>
                <span className="font-normal text-[#1A1A1A]"> SHOP</span>
              </span>
            </div>

            <h1 className="text-[20px] font-bold text-[#1A1A1A]">
              {profile.name}
            </h1>
            <p className="text-[13px] font-medium text-[#DB021D] mt-0.5">
              {profile.title}
            </p>

            {profile.bio && (
              <p className="text-[13px] text-[#6B7280] mt-3 leading-relaxed max-w-[320px] mx-auto">
                {profile.bio}
              </p>
            )}

            {/* Save Contact Button */}
            <button
              onClick={() => saveContact(profile.slug)}
              className="mt-5 inline-flex items-center justify-center gap-2 w-full h-12 bg-[#1A1A1A] hover:bg-[#333] text-white text-[14px] font-semibold rounded-xl transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Ajouter aux contacts
            </button>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <a
            href={`tel:${profile.phone}`}
            className="flex flex-col items-center gap-2 bg-white rounded-xl py-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Phone className="w-4.5 h-4.5 text-emerald-600" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-[#1A1A1A]">Appeler</span>
          </a>

          <a
            href={`mailto:${profile.email}`}
            className="flex flex-col items-center gap-2 bg-white rounded-xl py-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Mail className="w-4.5 h-4.5 text-blue-600" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-[#1A1A1A]">Email</span>
          </a>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`${profile.address.street}, ${profile.address.city}, ${profile.address.country}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 bg-white rounded-xl py-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5 text-[#DB021D]" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-[#1A1A1A]">Itinéraire</span>
          </a>
        </div>

        {/* ── Contact Details ── */}
        <div className="mt-4 bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-50">
          <a
            href={`tel:${profile.phone}`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <Phone className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#1A1A1A]">
                {formatPhone(profile.phone)}
              </p>
              <p className="text-[11px] text-[#9CA3AF]">Mobile</p>
            </div>
          </a>

          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#1A1A1A]">
                {profile.email}
              </p>
              <p className="text-[11px] text-[#9CA3AF]">Email</p>
            </div>
          </a>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`${profile.address.street}, ${profile.address.city}, ${profile.address.country}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <MapPin className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#1A1A1A]">
                {profile.address.street}
              </p>
              <p className="text-[11px] text-[#9CA3AF]">
                {profile.address.city}, {profile.address.country}
              </p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#D1D5DB] flex-shrink-0" />
          </a>
        </div>

        {/* ── Links ── */}
        <div className="mt-4 space-y-3">
          {/* Website */}
          <a
            href={profile.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
              <Globe className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#1A1A1A]">
                Visiter le site web
              </p>
              <p className="text-[11px] text-[#9CA3AF]">felten-shop.com</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#D1D5DB] flex-shrink-0" />
          </a>

          {/* Instagram */}
          {profile.socials.instagram && (
            <a
              href={profile.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center flex-shrink-0">
                <InstagramIcon className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1A1A1A]">
                  Instagram
                </p>
                <p className="text-[11px] text-[#9CA3AF]">@feltenshop</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#D1D5DB] flex-shrink-0" />
            </a>
          )}

          {/* Facebook */}
          {profile.socials.facebook && (
            <a
              href={profile.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                <FacebookIcon className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1A1A1A]">
                  Facebook
                </p>
                <p className="text-[11px] text-[#9CA3AF]">Felten Shop</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#D1D5DB] flex-shrink-0" />
            </a>
          )}

          {/* TikTok */}
          {profile.socials.tiktok && (
            <a
              href={profile.socials.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-[#010101] flex items-center justify-center flex-shrink-0">
                <TikTokIcon className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1A1A1A]">
                  TikTok
                </p>
                <p className="text-[11px] text-[#9CA3AF]">@feltenshop</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[#D1D5DB] flex-shrink-0" />
            </a>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-[#9CA3AF]">
            Revendeur Autorisé Milwaukee — Luxembourg
          </p>
        </div>
      </div>
    </div>
  );
}
