'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Download, Loader2, RefreshCw } from 'lucide-react';
import { useCustomer } from '@/context/customer-context';

function orderStatusLabel(status: string): { label: string; color: string } {
  switch (status.toLowerCase()) {
    case 'paid': return { label: 'Payée', color: 'bg-emerald-50 text-emerald-700' };
    case 'pending': return { label: 'En attente', color: 'bg-yellow-50 text-yellow-700' };
    case 'refunded': return { label: 'Remboursée', color: 'bg-gray-100 text-gray-600' };
    case 'partially_refunded': return { label: 'Partiel. remb.', color: 'bg-orange-50 text-orange-700' };
    case 'authorized': return { label: 'Autorisée', color: 'bg-blue-50 text-blue-700' };
    default: return { label: status, color: 'bg-gray-100 text-gray-600' };
  }
}

function fulfillmentLabel(status: string): { label: string; color: string } {
  switch (status.toLowerCase()) {
    case 'fulfilled': return { label: 'Expédiée', color: 'text-emerald-600' };
    case 'unfulfilled': return { label: 'En préparation', color: 'text-amber-600' };
    case 'partial': return { label: 'Partiellement expédiée', color: 'text-orange-600' };
    default: return { label: status || 'En préparation', color: 'text-[#6B7280]' };
  }
}

export default function CommandesPage() {
  const router = useRouter();
  const { customer, isLoading, isAuthenticated } = useCustomer();
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/compte/connexion');
    }
  }, [isLoading, isAuthenticated, router]);

  const downloadInvoice = async (orderNumber: number) => {
    setDownloadingIds(prev => new Set(prev).add(orderNumber));
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
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(orderNumber);
        return next;
      });
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

  const orders = customer.orders.edges.map((e) => e.node);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/compte" className="w-9 h-9 flex items-center justify-center -ml-1 text-[#1A1A1A]" aria-label="Retour">
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Link>
          <h1 className="text-[15px] font-semibold text-[#1A1A1A]">Mes commandes</h1>
        </div>
      </header>

      <main className="flex-1 max-w-[640px] mx-auto w-full px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-5 h-5 text-[#9CA3AF]" strokeWidth={2} />
            </div>
            <p className="text-[15px] font-semibold text-[#1A1A1A] mb-1">Aucune commande</p>
            <p className="text-[13px] text-[#9CA3AF] mb-6">Vous n&apos;avez pas encore passé de commande.</p>
            <Link
              href="/collections"
              className="inline-flex items-center justify-center h-11 px-6 bg-[#1A1A1A] hover:bg-[#333] text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              Découvrir le catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const payStatus = orderStatusLabel(order.financialStatus);
              const shipStatus = fulfillmentLabel(order.fulfillmentStatus);
              const lineItems = order.lineItems.edges.map((e) => e.node);
              const firstImage = lineItems[0]?.variant?.image?.url || lineItems[0]?.variant?.product?.featuredImage?.url;
              const isDownloading = downloadingIds.has(order.orderNumber);
              const isPaid = order.financialStatus.toLowerCase() === 'paid';

              return (
                <div key={order.id} className="border border-gray-100 rounded-lg overflow-hidden">
                  {/* Order header */}
                  <div className="px-4 py-3 flex items-center justify-between bg-[#F5F5F5]">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-[#1A1A1A]">
                          #{order.orderNumber}
                        </p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${payStatus.color}`}>
                          {payStatus.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                        {new Date(order.processedAt).toLocaleDateString('fr-BE', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <p className="text-[14px] font-semibold text-[#1A1A1A] flex-shrink-0">
                      {parseFloat(order.totalPrice.amount).toFixed(2)} €
                    </p>
                  </div>

                  {/* Order body */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    {firstImage ? (
                      <div className="w-12 h-12 bg-white border border-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image src={firstImage} alt="" fill className="object-contain p-1" sizes="48px" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-[#F5F5F5] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1A1A1A] line-clamp-1">
                        {lineItems[0]?.title}
                        {lineItems.length > 1 && (
                          <span className="text-[#9CA3AF]"> +{lineItems.length - 1}</span>
                        )}
                      </p>
                      {/* Fulfillment status */}
                      <p className={`text-[11px] font-medium mt-1 ${shipStatus.color}`}>
                        {shipStatus.label}
                      </p>
                    </div>
                  </div>

                  {/* Invoice download + Reorder */}
                  <div className="border-t border-gray-100 px-4 py-2.5 flex items-center gap-4">
                    {isPaid && (
                      <button
                        onClick={() => downloadInvoice(order.orderNumber)}
                        disabled={isDownloading}
                        className="flex items-center gap-2 text-[12px] font-medium text-[#6B7280] hover:text-[#1A1A1A] transition-colors disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        Facture
                      </button>
                    )}
                    {lineItems[0]?.variant?.product?.handle && (
                      <Link
                        href={`/produit/${lineItems[0].variant.product.handle}`}
                        className="flex items-center gap-1.5 text-[12px] font-medium text-[#DB021D] hover:text-[#B8011A] transition-colors ml-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Recommander
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
