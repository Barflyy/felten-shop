'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Phone, Calendar } from 'lucide-react';
import { useCustomer } from '@/context/customer-context';
import { Footer } from '@/components/footer';

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 bg-[#F5F5F5] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-[#DB021D]" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] mb-0.5">{label}</p>
        <p className="text-[14px] font-semibold text-[#1A1A1A]">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilPage() {
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

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || '—';
  const memberSince = new Date(customer.createdAt).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

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
              Mon profil
            </span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 max-w-[680px] mx-auto w-full px-6 pt-24 pb-20">
        {/* Avatar Setup */}
        <div className="flex flex-col items-center mb-10 mt-2">
          <div className="w-24 h-24 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4 relative">
            <span className="text-4xl font-black text-[#1A1A1A]" style={{ fontFamily: 'var(--font-oswald)' }}>
              {(customer.firstName?.[0] ?? customer.email[0]).toUpperCase()}
            </span>
          </div>
          <p className="text-[26px] font-black uppercase tracking-tight text-[#1A1A1A] leading-none mb-2" style={{ fontFamily: 'var(--font-display)' }}>{fullName}</p>
          <p className="text-[14px] font-medium text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full">{customer.email}</p>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#1A1A1A]">Informations personnelles</p>
          </div>
          <div className="divide-y divide-gray-50">
            <InfoRow icon={User} label="Nom complet" value={fullName} />
            <InfoRow icon={Mail} label="Adresse email" value={customer.email} />
            {customer.phone && (
              <InfoRow icon={Phone} label="Téléphone" value={customer.phone} />
            )}
            <InfoRow icon={Calendar} label="Membre depuis" value={memberSince} />
          </div>
        </div>

        <div className="mt-8 text-center bg-gray-100/50 p-6 rounded-2xl border border-gray-100">
          <p className="text-[13px] font-medium text-gray-500">
            Pour modifier vos informations, veuillez nous contacter{' '}
            <span className="block mt-1">via <Link href="/contact" className="text-[#1A1A1A] font-bold underline hover:text-[#DB021D]">notre formulaire en ligne</Link>.</span>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
