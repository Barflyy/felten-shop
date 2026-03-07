'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, CheckCircle2, Clock } from 'lucide-react';
import { useCustomer } from '@/context/customer-context';

interface ProStatus {
  isPro: boolean;
  isPending: boolean;
  vatNumber: string | null;
  companyName: string | null;
  countryCode: string | null;
}

export default function ProfilPage() {
  const router = useRouter();
  const { customer, isLoading, isAuthenticated } = useCustomer();
  const [proStatus, setProStatus] = useState<ProStatus | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('shopfelten_pro_status_full');
      if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }
    return null;
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/compte/connexion');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch pro status (cached in localStorage for instant display)
  useEffect(() => {
    if (!customer?.email) return;
    fetch('/api/customer/pro-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customer.email }),
    })
      .then(r => r.json())
      .then(data => {
        setProStatus(data);
        localStorage.setItem('shopfelten_pro_status_full', JSON.stringify(data));
      })
      .catch(() => {});
  }, [customer?.email]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1A1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !customer) return null;

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || '—';
  const memberSince = new Date(customer.createdAt).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const rows = [
    { label: 'Nom complet', value: fullName },
    { label: 'Email', value: customer.email },
    ...(customer.phone ? [{ label: 'Téléphone', value: customer.phone }] : []),
    { label: 'Membre depuis', value: memberSince },
  ];

  const hasPro = proStatus?.isPro || proStatus?.isPending;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/compte" className="w-9 h-9 flex items-center justify-center -ml-1 text-[#1A1A1A]" aria-label="Retour">
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Link>
          <h1 className="text-[15px] font-semibold text-[#1A1A1A]">Mon profil</h1>
        </div>
      </header>

      <main className="flex-1 max-w-[640px] mx-auto w-full px-4 py-8">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
            <span className="text-[20px] font-bold text-[#1A1A1A]">
              {(customer.firstName?.[0] ?? customer.email[0]).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[18px] font-bold text-[#1A1A1A] truncate">{fullName}</p>
              {proStatus?.isPro && (
                <span className="text-[10px] font-bold bg-[#1A1A1A] text-white px-2 py-0.5 rounded flex-shrink-0">PRO</span>
              )}
              {proStatus?.isPending && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex-shrink-0">EN ATTENTE</span>
              )}
            </div>
            <p className="text-[13px] text-[#9CA3AF] truncate">{customer.email}</p>
          </div>
        </div>

        {/* Info rows */}
        <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden mb-6">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <span className="text-[13px] text-[#6B7280] flex-shrink-0">{row.label}</span>
              <span className="text-[13px] font-medium text-[#1A1A1A] truncate text-right">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Pro section */}
        {hasPro && (
          <div className="mb-6">
            <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Informations professionnelles</p>
            <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden">
              {/* Status */}
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-[13px] text-[#6B7280]">Statut</span>
                {proStatus?.isPro ? (
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Compte Pro actif
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-amber-600">
                    <Clock className="w-3.5 h-3.5" />
                    En attente de validation
                  </span>
                )}
              </div>

              {/* VAT Number */}
              {proStatus?.vatNumber && (
                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <span className="text-[13px] text-[#6B7280] flex-shrink-0">N° TVA</span>
                  <span className="text-[13px] font-medium text-[#1A1A1A] font-mono truncate">{proStatus.vatNumber}</span>
                </div>
              )}

              {/* Company */}
              {proStatus?.companyName && (
                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <span className="text-[13px] text-[#6B7280] flex-shrink-0">Entreprise</span>
                  <span className="text-[13px] font-medium text-[#1A1A1A] text-right truncate">{proStatus.companyName}</span>
                </div>
              )}

              {/* Country */}
              {proStatus?.countryCode && (
                <div className="flex items-center justify-between px-4 py-3.5">
                  <span className="text-[13px] text-[#6B7280]">Pays TVA</span>
                  <span className="text-[13px] font-medium text-[#1A1A1A]">{proStatus.countryCode}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Become pro CTA */}
        {!hasPro && proStatus !== null && (
          <div className="mb-6 bg-[#F5F5F5] rounded-lg px-4 py-4 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-[#6B7280] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A1A] mb-0.5">Vous êtes professionnel ?</p>
              <p className="text-[12px] text-[#6B7280] mb-2">
                Accédez aux prix HT, factures conformes et autoliquidation TVA.
              </p>
              <Link href="/contact" className="text-[12px] font-semibold text-[#DB021D] hover:underline">
                Contactez-nous pour activer votre compte Pro
              </Link>
            </div>
          </div>
        )}

        <div className="bg-[#F5F5F5] rounded-lg px-4 py-4">
          <p className="text-[13px] text-[#6B7280]">
            Pour modifier vos informations, contactez-nous via{' '}
            <Link href="/contact" className="font-medium text-[#1A1A1A] underline">notre formulaire</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
