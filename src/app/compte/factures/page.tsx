'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, FileText, Loader2 } from 'lucide-react';
import { useCustomer } from '@/context/customer-context';

export default function FacturesPage() {
  const router = useRouter();
  const { customer, isLoading, isAuthenticated } = useCustomer();
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/compte/connexion');
    }
  }, [isLoading, isAuthenticated, router]);

  const downloadInvoice = async (orderNumber: number) => {
    setDownloadingIds((prev) => new Set(prev).add(orderNumber));

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
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setDownloadingIds((prev) => {
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
          <h1 className="text-[15px] font-semibold text-[#1A1A1A]">Mes factures</h1>
        </div>
      </header>

      <main className="flex-1 max-w-[640px] mx-auto w-full px-4 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-5 h-5 text-[#9CA3AF]" strokeWidth={2} />
            </div>
            <p className="text-[15px] font-semibold text-[#1A1A1A] mb-1">Aucune facture</p>
            <p className="text-[13px] text-[#9CA3AF] mb-6">Vous n&apos;avez pas encore de facture disponible.</p>
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
              const isDownloading = downloadingIds.has(order.orderNumber);
              const date = new Date(order.processedAt).toLocaleDateString('fr-BE', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              });
              const amount = `${parseFloat(order.totalPrice.amount).toFixed(2)} ${order.totalPrice.currencyCode === 'EUR' ? '€' : order.totalPrice.currencyCode}`;

              return (
                <div
                  key={order.id}
                  className="border border-gray-100 rounded-lg px-4 py-3.5 flex items-center gap-4"
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-[#6B7280]" strokeWidth={2} />
                  </div>

                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#1A1A1A]">
                      Commande #{order.orderNumber}
                    </p>
                    <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                      {date} &middot; {amount}
                    </p>
                  </div>

                  {/* Download button */}
                  <button
                    onClick={() => downloadInvoice(order.orderNumber)}
                    disabled={isDownloading}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-[#F5F5F5] text-[#6B7280] hover:text-[#1A1A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    aria-label={`Télécharger la facture ${order.orderNumber}`}
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                    ) : (
                      <Download className="w-4 h-4" strokeWidth={2} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
