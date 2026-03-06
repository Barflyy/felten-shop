'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  MapPin,
  User,
  LogOut,
  ShoppingCart,
  ChevronRight,
  Star,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { useCustomer } from '@/context/customer-context';
import { Footer } from '@/components/footer';

function orderStatusLabel(status: string): { label: string; color: string } {
  switch (status.toLowerCase()) {
    case 'paid': return { label: 'Payée', color: 'bg-green-100 text-green-700' };
    case 'pending': return { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' };
    case 'refunded': return { label: 'Remboursée', color: 'bg-gray-100 text-gray-600' };
    case 'partially_refunded': return { label: 'Partiel. remb.', color: 'bg-orange-100 text-orange-700' };
    default: return { label: status, color: 'bg-gray-100 text-gray-600' };
  }
}

function AccountHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 h-14 flex items-center gap-3">
        <Link href="/" className="w-9 h-9 flex items-center justify-center -ml-1 text-[#1A1A1A]" aria-label="Retour à la boutique">
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
        </Link>
        <Link href="/" className="flex items-baseline gap-0 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <span className="text-[1rem] font-black text-[#1A1A1A] tracking-tight underline decoration-[#DB021D] decoration-2 underline-offset-2">FELTEN</span>
          <span className="text-[1rem] font-normal text-[#1A1A1A] tracking-tight"> SHOP</span>
        </Link>
        <span className="hidden lg:block text-[#6B7280] text-[13px] ml-2">/ Mon espace</span>
      </div>
    </header>
  );
}

export default function ComptePage() {
  const router = useRouter();
  const { customer, isLoading, isAuthenticated, logout } = useCustomer();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/compte/connexion');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-[#DB021D] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !customer) return null;

  const firstName = customer.firstName || customer.email.split('@')[0];
  const totalOrders = customer.orders.totalCount;
  const lastOrder = customer.orders.edges[0]?.node;

  const SHORTCUTS = [
    { href: '/compte/commandes', label: 'Mes commandes', desc: 'Suivre vos colis', icon: Package },
    { href: '/compte/adresses', label: 'Carnet d\'adresses', desc: 'Livraison & facturation', icon: MapPin },
    { href: '/compte/profil', label: 'Mon profil', desc: 'Informations personnelles', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      {/* ─────────────────────────────────────────────
          HEADER — Clean & Premium
          ───────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="w-10 h-10 flex items-center justify-center -ml-2 text-[#1A1A1A] hover:bg-gray-50 rounded-full transition-colors" aria-label="Retour à la boutique">
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </Link>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-black text-[#1A1A1A] tracking-tighter underline decoration-[#DB021D] decoration-2 underline-offset-4" style={{ fontFamily: 'var(--font-oswald)' }}>FELTEN</span>
            <span className="text-xl font-medium text-[#1A1A1A] tracking-tighter" style={{ fontFamily: 'var(--font-oswald)' }}> SHOP</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          MAIN CONTENT
          ───────────────────────────────────────────── */}
      <main className="flex-1 px-6 pt-24 pb-20 max-w-[640px] mx-auto w-full">

        {/* Welcome Area */}
        <div className="flex flex-col items-center justify-center text-center mb-10 mt-4">
          <div className="w-24 h-24 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-5 relative">
            <span className="text-4xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-oswald)' }}>
              {(firstName[0] || 'C').toUpperCase()}
            </span>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#DB021D] rounded-full border-[3px] border-[#F9F9F9] flex items-center justify-center shadow-sm">
              <Star className="w-3.5 h-3.5 text-white fill-white" />
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#1A1A1A] mb-1.5 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            {firstName} {customer.lastName}
          </h1>
          <p className="text-gray-500 text-[14px] font-medium px-4 py-1.5 bg-gray-100 rounded-full inline-block">{customer.email}</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/compte/commandes" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-1 active:scale-[0.98] hover:shadow-md hover:border-gray-200 transition-all group">
            <span className="text-4xl font-black text-[#1A1A1A] leading-none mb-1 group-hover:text-[#DB021D] transition-colors" style={{ fontFamily: 'var(--font-oswald)' }}>
              {totalOrders}
            </span>
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Commandes</span>
          </Link>
          <Link href="/collections" className="bg-[#1A1A1A] p-6 rounded-2xl shadow-md border border-[#1A1A1A] flex flex-col items-center justify-center gap-2.5 active:scale-[0.98] hover:bg-[#2A2A2A] transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <ShoppingCart className="w-8 h-8 text-white relative z-10" strokeWidth={2} />
            <span className="text-[11px] font-black text-white/90 uppercase tracking-widest relative z-10">Boutique</span>
          </Link>
        </div>

        {/* Latest Order Ticket */}
        {lastOrder && (
          <div className="mb-10">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4 pl-2">Dernière activité</h2>
            <Link href="/compte/commandes" className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group active:scale-[0.99] hover:shadow-md hover:border-gray-200 transition-all">
              <div className="p-6 border-b border-gray-100 flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-[#1A1A1A] group-hover:bg-[#DB021D] group-hover:text-white group-hover:border-[#DB021D] transition-colors">
                  <Package className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[16px] font-bold text-[#1A1A1A] group-hover:text-[#DB021D] transition-colors">
                      Commande <span style={{ fontFamily: 'var(--font-oswald)' }}>#{lastOrder.orderNumber}</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${orderStatusLabel(lastOrder.financialStatus).color}`}>
                      {orderStatusLabel(lastOrder.financialStatus).label}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 font-medium">
                    {new Date(lastOrder.processedAt).toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="font-bold text-[#1A1A1A]">{parseFloat(lastOrder.totalPrice.amount).toFixed(2)} €</span>
                  </p>
                </div>
              </div>
              <div className="bg-gray-50/50 px-6 py-4 flex items-center justify-between text-[12px] font-black text-[#1A1A1A] uppercase tracking-wider group-hover:text-[#DB021D] transition-colors">
                <span>Voir les détails</span>
                <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        )}

        {/* Navigation Shortcuts */}
        <div className="mb-10">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4 pl-2">Menu</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {SHORTCUTS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-5 p-5 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-gray-100 text-gray-400 flex items-center justify-center group-hover:border-[#DB021D] group-hover:text-[#DB021D] transition-colors shadow-sm">
                  <item.icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold text-[#1A1A1A] mb-0.5 uppercase tracking-wide">{item.label}</p>
                  <p className="text-[13px] text-gray-500 font-medium">{item.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#DB021D] group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Support Links */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Link href="/garantie" className="bg-white h-14 rounded-xl border border-gray-200 shadow-sm text-[12px] font-black uppercase tracking-wider text-[#1A1A1A] flex items-center justify-center gap-2.5 hover:border-[#1A1A1A] hover:bg-gray-50 transition-all active:scale-[0.98]">
            <RotateCcw className="w-4 h-4" />
            SAV & Retours
          </Link>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="bg-white h-14 rounded-xl border border-red-100 shadow-sm text-[12px] font-black uppercase tracking-wider text-[#DB021D] flex items-center justify-center gap-2.5 hover:bg-red-50 hover:border-red-200 transition-all active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}
