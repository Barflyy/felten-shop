'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  MapPin,
  User,
  LogOut,
  ChevronRight,
  ArrowLeft,
  ArrowRight,

  FileText,
  Download,
  Loader2,
  Building2,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import { useCustomer } from '@/context/customer-context';

function orderStatusLabel(status: string): { label: string; color: string } {
  switch (status.toLowerCase()) {
    case 'paid': return { label: 'Payée', color: 'bg-emerald-50 text-emerald-700' };
    case 'pending': return { label: 'En attente', color: 'bg-yellow-50 text-yellow-700' };
    case 'refunded': return { label: 'Remboursée', color: 'bg-gray-100 text-gray-600' };
    case 'partially_refunded': return { label: 'Partiel. remb.', color: 'bg-orange-50 text-orange-700' };
    default: return { label: status, color: 'bg-gray-100 text-gray-600' };
  }
}

function fulfillmentLabel(status: string): { label: string; icon: string } {
  switch (status.toLowerCase()) {
    case 'fulfilled': return { label: 'Expédiée', icon: 'text-emerald-600' };
    case 'unfulfilled': return { label: 'En préparation', icon: 'text-amber-600' };
    case 'partial': return { label: 'Partiellement expédiée', icon: 'text-orange-600' };
    default: return { label: status || 'En préparation', icon: 'text-[#6B7280]' };
  }
}

export default function ComptePage() {
  const router = useRouter();
  const { customer, isLoading, isAuthenticated, logout } = useCustomer();
  const [proStatus, setProStatus] = useState<{ isPro: boolean; isPending: boolean }>(() => {
    if (typeof window === 'undefined') return { isPro: false, isPending: false };
    try {
      const cached = localStorage.getItem('shopfelten_pro_status');
      if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }
    return { isPro: false, isPending: false };
  });
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

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
        const status = { isPro: data.isPro, isPending: data.isPending };
        setProStatus(status);
        localStorage.setItem('shopfelten_pro_status', JSON.stringify(status));
      })
      .catch(() => {});
  }, [customer?.email]);

  const downloadInvoice = async (orderNumber: number) => {
    setDownloadingInvoice(true);
    try {
      const token = localStorage.getItem('shopify_customer_token');
      const res = await fetch(`/api/invoice/${orderNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-ShopFelten-${orderNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Invoice download error:', e);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1A1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !customer) return null;

  const firstName = customer.firstName || customer.email.split('@')[0];
  const totalOrders = customer.orders.totalCount;
  const lastOrder = customer.orders.edges[0]?.node;
  const isPro = proStatus?.isPro || false;
  const isPending = proStatus?.isPending || false;

  const NAV_ITEMS = [
    { href: '/compte/commandes', label: 'Mes commandes', desc: `${totalOrders} commande${totalOrders !== 1 ? 's' : ''}`, icon: Package },
...(isPro || isPending ? [{ href: '/compte/factures', label: 'Mes factures', desc: 'Télécharger vos factures', icon: FileText }] : []),
    { href: '/compte/adresses', label: 'Adresses', desc: 'Livraison & facturation', icon: MapPin },
    { href: '/compte/profil', label: 'Mon profil', desc: 'Informations personnelles', icon: User },
    { href: '/contact', label: 'Besoin d\u2019aide ?', desc: 'SAV & assistance Florian', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="w-9 h-9 flex items-center justify-center -ml-1 text-[#1A1A1A]" aria-label="Retour à la boutique">
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Link>
          <Link href="/" className="text-[1rem] tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">FELTEN</span>
            <span className="font-normal text-[#1A1A1A]"> SHOP</span>
          </Link>
          <div className="w-9" />
        </div>
      </header>

      <main className="flex-1 max-w-[640px] mx-auto w-full px-4 py-8">
        {/* Welcome + CTA */}
        <div className="flex items-start justify-between gap-3 mb-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[22px] font-bold text-[#1A1A1A] truncate">
                Bonjour, {firstName}
              </h1>
              {isPro && (
                <span className="text-[10px] font-bold bg-[#1A1A1A] text-white px-2 py-0.5 rounded flex-shrink-0">PRO</span>
              )}
              {isPending && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded flex-shrink-0">PRO EN ATTENTE</span>
              )}
            </div>
            <p className="text-[14px] text-[#9CA3AF] mt-0.5 truncate">{customer.email}</p>
          </div>
          <Link
            href="/collections"
            className="flex items-center gap-1.5 h-9 px-3.5 bg-[#F5F5F5] hover:bg-gray-200 text-[12px] font-semibold text-[#1A1A1A] rounded-lg transition-colors flex-shrink-0"
          >
            Catalogue
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Last Order */}
        {lastOrder && (
          <div className="mb-6">
            <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Dernière commande</p>
            <div className="bg-[#F5F5F5] rounded-lg overflow-hidden">
              <Link
                href="/compte/commandes"
                className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[14px] font-semibold text-[#1A1A1A]">
                      #{lastOrder.orderNumber}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${orderStatusLabel(lastOrder.financialStatus).color}`}>
                      {orderStatusLabel(lastOrder.financialStatus).label}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6B7280]">
                    {new Date(lastOrder.processedAt).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' '}&middot;{' '}
                    {parseFloat(lastOrder.totalPrice.amount).toFixed(2)} €
                  </p>
                  {/* Fulfillment status */}
                  <p className={`text-[11px] font-medium mt-1.5 ${fulfillmentLabel(lastOrder.fulfillmentStatus).icon}`}>
                    {fulfillmentLabel(lastOrder.fulfillmentStatus).label}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
              </Link>

              {/* Invoice download + Reorder */}
              <div className="border-t border-gray-200/60 px-4 py-2.5 flex items-center gap-4">
                {lastOrder.financialStatus.toLowerCase() === 'paid' && (
                  <button
                    onClick={() => downloadInvoice(lastOrder.orderNumber)}
                    disabled={downloadingInvoice}
                    className="flex items-center gap-2 text-[12px] font-medium text-[#6B7280] hover:text-[#1A1A1A] transition-colors disabled:opacity-50"
                  >
                    {downloadingInvoice ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    Facture
                  </button>
                )}
                <Link
                  href={`/produit/${lastOrder.lineItems?.edges?.[0]?.node?.variant?.product?.handle || ''}`}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#DB021D] hover:text-[#B8011A] transition-colors ml-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Recommander
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Pro pending banner */}
        {isPending && (
          <div className="mb-6 bg-amber-50 border border-amber-200/60 rounded-lg px-4 py-3 flex items-start gap-3">
            <Building2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-amber-800">Compte Pro en attente</p>
              <p className="text-[12px] text-amber-700 mt-0.5">Votre demande de compte professionnel est en cours de validation.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mb-8">
          <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-4 py-4 hover:bg-[#F5F5F5] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-[#6B7280]" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1A1A1A]">{item.label}</p>
                  <p className="text-[12px] text-[#9CA3AF]">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#D1D5DB]" />
              </Link>
            ))}
          </div>
        </div>

        {/* SAV — Florian */}
        <div className="mb-8 bg-[#F5F5F5] rounded-lg px-4 py-4 flex items-center gap-3.5">
          <Image
            src="/images/florian-avatar.png"
            alt="Florian"
            width={44}
            height={44}
            className="rounded-full flex-shrink-0 object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1A1A1A]">Un souci avec une commande ?</p>
            <p className="text-[12px] text-[#6B7280] mt-0.5">Florian vous répond personnellement.</p>
          </div>
          <a
            href="https://wa.me/352621304952"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 h-9 px-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[12px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/collections"
            className="flex-1 h-11 bg-[#1A1A1A] hover:bg-[#333] text-white text-[13px] font-semibold rounded-lg flex items-center justify-center transition-colors"
          >
            Continuer mes achats
          </Link>
          <button
            onClick={() => { localStorage.removeItem('shopfelten_pro_status'); localStorage.removeItem('shopfelten_pro_status_full'); logout(); router.push('/'); }}
            className="h-11 px-5 border border-gray-200 hover:border-gray-300 text-[#6B7280] hover:text-[#1A1A1A] text-[13px] font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </main>
    </div>
  );
}
