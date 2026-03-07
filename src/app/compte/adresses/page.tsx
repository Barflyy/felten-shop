'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useCustomer } from '@/context/customer-context';

export default function AdressesPage() {
  const router = useRouter();
  const { customer, isLoading, isAuthenticated } = useCustomer();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/compte/connexion');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-[#1A1A1A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !customer) return null;

  const addresses = customer.addresses.edges.map((e) => e.node);
  const defaultAddressId = customer.defaultAddress?.id;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/compte" className="w-9 h-9 flex items-center justify-center -ml-1 text-[#1A1A1A]" aria-label="Retour">
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </Link>
          <h1 className="text-[15px] font-semibold text-[#1A1A1A]">Mes adresses</h1>
        </div>
      </header>

      <main className="flex-1 max-w-[640px] mx-auto w-full px-4 py-8">
        {addresses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-5 h-5 text-[#9CA3AF]" strokeWidth={2} />
            </div>
            <p className="text-[15px] font-semibold text-[#1A1A1A] mb-1">Aucune adresse</p>
            <p className="text-[13px] text-[#9CA3AF] max-w-[260px] mx-auto">
              Vos adresses seront sauvegardées automatiquement lors de votre prochaine commande.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => {
              const isDefault = address.id === defaultAddressId;
              return (
                <div
                  key={address.id}
                  className="border border-gray-100 rounded-lg px-4 py-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-[14px] font-semibold text-[#1A1A1A]">
                      {address.firstName} {address.lastName}
                    </p>
                    {isDefault && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Par défaut
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-[#6B7280] space-y-0.5">
                    {address.company && (
                      <p className="font-medium text-[#1A1A1A]">{address.company}</p>
                    )}
                    <p>{address.address1}</p>
                    {address.address2 && <p>{address.address2}</p>}
                    <p>{address.zip} {address.city}{address.province ? `, ${address.province}` : ''}</p>
                    <p className="text-[#9CA3AF]">{address.country}</p>
                    {address.phone && (
                      <p className="mt-1.5 text-[12px] text-[#9CA3AF]">{address.phone}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {addresses.length > 0 && (
          <div className="mt-8 bg-[#F5F5F5] rounded-lg px-4 py-4">
            <p className="text-[13px] text-[#6B7280]">
              Pour modifier vos adresses, contactez-nous via{' '}
              <Link href="/contact" className="font-medium text-[#1A1A1A] underline">notre formulaire</Link>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
