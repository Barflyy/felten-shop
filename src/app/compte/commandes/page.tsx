'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCustomer } from '@/context/customer-context';
import { Footer } from '@/components/footer';

function orderStatusLabel(status: string): { label: string; color: string } {
  switch (status.toLowerCase()) {
    case 'paid': return { label: 'Payée', color: 'bg-green-100 text-green-700' };
    case 'pending': return { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' };
    case 'refunded': return { label: 'Remboursée', color: 'bg-gray-100 text-gray-600' };
    case 'partially_refunded': return { label: 'Partiel. remb.', color: 'bg-orange-100 text-orange-700' };
    case 'authorized': return { label: 'Autorisée', color: 'bg-blue-100 text-blue-700' };
    default: return { label: status, color: 'bg-gray-100 text-gray-600' };
  }
}

function fulfillmentLabel(status: string): { label: string; color: string } {
  switch (status.toLowerCase()) {
    case 'fulfilled': return { label: 'Expédiée', color: 'text-green-600' };
    case 'unfulfilled': return { label: 'En préparation', color: 'text-yellow-600' };
    case 'partial': return { label: 'Partiellement expédiée', color: 'text-orange-600' };
    default: return { label: status, color: 'text-gray-500' };
  }
}

export default function CommandesPage() {
  const router = useRouter();
  const { customer, isLoading, isAuthenticated } = useCustomer();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/compte/connexion');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#DB021D] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !customer) return null;

  const orders = customer.orders.edges.map((e) => e.node);

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      {/* Header — Clean & Premium */}
      <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/compte" className="w-10 h-10 flex items-center justify-center -ml-2 text-[#1A1A1A] hover:bg-gray-50 rounded-full transition-colors" aria-label="Retour à mon espace">
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </Link>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[17px] font-black uppercase tracking-tight text-[#1A1A1A]" style={{ fontFamily: 'var(--font-display)' }}>
              Mes commandes
            </span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 max-w-[680px] mx-auto w-full px-6 pt-24 pb-20">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100 shadow-sm">
              <ShoppingBag className="w-7 h-7 text-[#DB021D]" strokeWidth={2} />
            </div>
            <p className="text-[20px] font-black uppercase tracking-tight text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>Aucune commande</p>
            <p className="text-[14px] font-medium text-gray-500 mb-8 max-w-[250px] mx-auto">Vous n&apos;avez pas encore passé de commande sur Felten Shop.</p>
            <Link
              href="/collections"
              className="group inline-flex items-center justify-center h-12 px-8 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-[13px] font-black uppercase tracking-[0.1em] rounded-xl transition-all shadow-md active:scale-[0.98] overflow-hidden relative"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2">Découvrir le catalogue</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const payStatus = orderStatusLabel(order.financialStatus);
              const shipStatus = fulfillmentLabel(order.fulfillmentStatus);
              const lineItems = order.lineItems.edges.map((e) => e.node);
              const firstImage = lineItems[0]?.variant?.image?.url || lineItems[0]?.variant?.product?.featuredImage?.url;

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all group cursor-pointer active:scale-[0.99]">
                  {/* Order header */}
                  <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div>
                      <p className="text-[14px] font-bold text-[#1A1A1A] mb-0.5">Commande <span style={{ fontFamily: 'var(--font-oswald)' }}>#{order.orderNumber}</span></p>
                      <p className="text-[12px] font-medium text-gray-500">
                        {new Date(order.processedAt).toLocaleDateString('fr-BE', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${payStatus.color}`}>
                      {payStatus.label}
                    </span>
                  </div>

                  {/* Order body */}
                  <div className="p-5 flex items-center gap-4">
                    {firstImage ? (
                      <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm p-1.5 relative">
                        <Image src={firstImage} alt="" fill className="object-contain p-1" sizes="64px" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#1A1A1A] leading-snug line-clamp-2">
                        {lineItems[0]?.title}
                        {lineItems.length > 1 && <span className="text-gray-400 font-medium ml-1">+{lineItems.length - 1} autre{lineItems.length > 2 ? 's' : ''}</span>}
                      </p>
                      <p className={`text-[12px] font-bold mt-1.5 flex items-center gap-1.5 uppercase tracking-wide ${shipStatus.color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {shipStatus.label}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0 flex flex-col items-end justify-center">
                      <p className="text-[15px] font-black text-[#1A1A1A] mb-1">
                        {parseFloat(order.totalPrice.amount).toFixed(2)} €
                      </p>
                      <div className="w-7 h-7 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-[#DB021D] group-hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
