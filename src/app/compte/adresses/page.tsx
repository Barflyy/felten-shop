'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import { useCustomer } from '@/context/customer-context';
import { Footer } from '@/components/footer';

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
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#DB021D] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !customer) return null;

  const addresses = customer.addresses.edges.map((e) => e.node);
  const defaultAddressId = customer.defaultAddress?.id;

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
              Mes adresses
            </span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 max-w-[680px] mx-auto w-full px-6 pt-24 pb-20">
        {addresses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100 shadow-sm">
              <MapPin className="w-7 h-7 text-[#DB021D]" strokeWidth={2} />
            </div>
            <p className="text-[20px] font-black uppercase tracking-tight text-[#1A1A1A] mb-2" style={{ fontFamily: 'var(--font-display)' }}>Aucune adresse</p>
            <p className="text-[14px] font-medium text-gray-500 max-w-[280px] mx-auto">
              Vos adresses de livraison seront automatiquement sauvegardées lors de votre prochaine commande.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {addresses.map((address) => {
              const isDefault = address.id === defaultAddressId;
              return (
                <div key={address.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all">
                  <div className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#DB021D]" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <p className="text-[16px] font-black uppercase tracking-wide text-[#1A1A1A] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                          {address.firstName} {address.lastName}
                        </p>
                        {isDefault && (
                          <span className="inline-flex items-center w-max gap-1.5 text-[10px] font-black text-[#DB021D] bg-red-50 border border-red-100 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                            <Star className="w-3 h-3 fill-current" />
                            Par défaut
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 mt-3">
                        {address.company && (
                          <p className="text-[14px] font-bold text-[#1A1A1A]">{address.company}</p>
                        )}
                        <p className="text-[14px] font-medium text-gray-600">{address.address1}</p>
                        {address.address2 && (
                          <p className="text-[14px] font-medium text-gray-600">{address.address2}</p>
                        )}
                        <p className="text-[14px] font-medium text-gray-600">
                          {address.zip} {address.city}
                          {address.province ? `, ${address.province}` : ''}
                        </p>
                        <p className="text-[14px] font-bold text-gray-400 uppercase tracking-wider">{address.country}</p>
                        {address.phone && (
                          <p className="text-[13px] font-medium text-gray-500 mt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            {address.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center bg-gray-100/50 p-6 rounded-2xl border border-gray-100">
          <p className="text-[13px] font-medium text-gray-500">
            Pour modifier vos adresses à ce stade, effectuez une nouvelle commande{' '}
            <span className="block mt-1">ou contactez-nous via <Link href="/contact" className="text-[#1A1A1A] font-bold underline hover:text-[#DB021D]">notre formulaire</Link>.</span>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
