'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, CheckCircle2, Clock, Pencil, X, Loader2, Eye, EyeOff, Check, ChevronDown } from 'lucide-react';
import { useCustomer } from '@/context/customer-context';
import { useVAT } from '@/context/vat-context';

const PHONE_PREFIXES = [
  { code: 'LU', prefix: '+352', flag: '🇱🇺' },
  { code: 'FR', prefix: '+33', flag: '🇫🇷' },
  { code: 'BE', prefix: '+32', flag: '🇧🇪' },
  { code: 'DE', prefix: '+49', flag: '🇩🇪' },
  { code: 'NL', prefix: '+31', flag: '🇳🇱' },
  { code: 'CH', prefix: '+41', flag: '🇨🇭' },
] as const;

function parsePhonePrefix(fullPhone: string): { prefix: string; number: string } {
  for (const p of PHONE_PREFIXES) {
    if (fullPhone.startsWith(p.prefix)) {
      return { prefix: p.prefix, number: fullPhone.slice(p.prefix.length).trim() };
    }
  }
  return { prefix: '+352', number: fullPhone.replace(/^\+?\d{1,3}\s?/, '').trim() };
}

interface ProStatus {
  isPro: boolean;
  isPending: boolean;
  vatNumber: string | null;
  companyName: string | null;
  countryCode: string | null;
}

export default function ProfilPage() {
  const router = useRouter();
  const { customer, isLoading, isAuthenticated, updateCustomer } = useCustomer();
  const { vatInfo } = useVAT();
  const [proStatus, setProStatus] = useState<ProStatus | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem('shopfelten_pro_status_full');
      if (cached) return JSON.parse(cached);
    } catch { /* ignore */ }
    return null;
  });

  // Edit states
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('+352');
  const [phonePrefixOpen, setPhonePrefixOpen] = useState(false);
  const [email, setEmail] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/compte/connexion');
    }
  }, [isLoading, isAuthenticated, router]);

  // Sync form fields when customer data loads
  useEffect(() => {
    if (customer) {
      setFirstName(customer.firstName || '');
      setLastName(customer.lastName || '');
      setEmail(customer.email || '');
      if (customer.phone) {
        const parsed = parsePhonePrefix(customer.phone);
        setPhonePrefix(parsed.prefix);
        setPhone(parsed.number);
      } else {
        setPhone('');
      }
    }
  }, [customer]);

  // Fetch pro status
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

  const startEdit = (field: string) => {
    setEditing(field);
    setError(null);
    setSuccess(null);
    if (field === 'password') {
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setError(null);
    setPhonePrefixOpen(false);
    // Reset fields to customer data
    if (customer) {
      setFirstName(customer.firstName || '');
      setLastName(customer.lastName || '');
      setEmail(customer.email || '');
      if (customer.phone) {
        const parsed = parsePhonePrefix(customer.phone);
        setPhonePrefix(parsed.prefix);
        setPhone(parsed.number);
      } else {
        setPhone('');
      }
    }
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setError(null);
    setSaving(true);

    let updateData: Record<string, string> = {};

    switch (editing) {
      case 'name':
        if (!firstName.trim()) { setError('Le prénom est requis.'); setSaving(false); return; }
        if (!lastName.trim()) { setError('Le nom est requis.'); setSaving(false); return; }
        updateData = { firstName: firstName.trim(), lastName: lastName.trim() };
        break;
      case 'email':
        if (!email.trim() || !email.includes('@')) { setError('Email invalide.'); setSaving(false); return; }
        updateData = { email: email.trim() };
        break;
      case 'phone':
        updateData = { phone: phone.trim() ? `${phonePrefix}${phone.trim()}` : '' };
        break;
      case 'password':
        if (newPassword.length < 8) { setError('Minimum 8 caractères.'); setSaving(false); return; }
        if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); setSaving(false); return; }
        updateData = { password: newPassword };
        break;
    }

    const result = await updateCustomer(updateData);

    setSaving(false);

    if (result.success) {
      setEditing(null);
      setSuccess(editing === 'password' ? 'Mot de passe modifié.' : 'Profil mis à jour.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || 'Erreur lors de la mise à jour.');
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

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || '—';
  const memberSince = new Date(customer.createdAt).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const hasPro = proStatus?.isPro || proStatus?.isPending;
  const hasProInfo = hasPro || proStatus?.vatNumber || proStatus?.companyName;

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

        {/* Success banner */}
        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200/60 rounded-lg px-4 py-3 flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-[13px] font-medium text-emerald-700">{success}</p>
          </div>
        )}

        {/* Editable fields */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Informations personnelles</p>
          <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden">

            {/* Name */}
            {editing === 'name' ? (
              <form onSubmit={handleSave} className="px-4 py-3.5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-semibold text-[#1A1A1A]">Nom complet</span>
                  <button type="button" onClick={cancelEdit} className="w-7 h-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Prénom"
                    className="flex-1 h-10 px-3 bg-[#F5F5F5] rounded-lg text-[13px] text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1A1A1A]/10"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Nom"
                    className="flex-1 h-10 px-3 bg-[#F5F5F5] rounded-lg text-[13px] text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1A1A1A]/10"
                  />
                </div>
                {error && <p className="text-[12px] text-red-600 mb-2">{error}</p>}
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-4 bg-[#1A1A1A] hover:bg-[#333] disabled:opacity-50 text-white text-[12px] font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Enregistrer
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <span className="text-[13px] text-[#6B7280] flex-shrink-0">Nom complet</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[13px] font-medium text-[#1A1A1A] truncate">{fullName}</span>
                  <button onClick={() => startEdit('name')} className="w-7 h-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors flex-shrink-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Email */}
            {editing === 'email' ? (
              <form onSubmit={handleSave} className="px-4 py-3.5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-semibold text-[#1A1A1A]">Email</span>
                  <button type="button" onClick={cancelEdit} className="w-7 h-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className="w-full h-10 px-3 bg-[#F5F5F5] rounded-lg text-[13px] text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 mb-2"
                  autoFocus
                />
                {error && <p className="text-[12px] text-red-600 mb-2">{error}</p>}
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-4 bg-[#1A1A1A] hover:bg-[#333] disabled:opacity-50 text-white text-[12px] font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Enregistrer
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <span className="text-[13px] text-[#6B7280] flex-shrink-0">Email</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[13px] font-medium text-[#1A1A1A] truncate">{customer.email}</span>
                  <button onClick={() => startEdit('email')} className="w-7 h-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors flex-shrink-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Phone */}
            {editing === 'phone' ? (
              <form onSubmit={handleSave} className="px-4 py-3.5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-semibold text-[#1A1A1A]">Téléphone</span>
                  <button type="button" onClick={cancelEdit} className="w-7 h-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mb-2">
                  {/* Prefix selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPhonePrefixOpen(v => !v)}
                      className="h-10 px-2.5 bg-[#F5F5F5] rounded-lg text-[13px] text-[#1A1A1A] flex items-center gap-1.5 whitespace-nowrap hover:bg-[#EFEFEF] transition-colors"
                    >
                      <span className="text-[15px] leading-none">{PHONE_PREFIXES.find(p => p.prefix === phonePrefix)?.flag}</span>
                      <span className="text-[12px] font-medium text-[#6B7280]">{phonePrefix}</span>
                      <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
                    </button>
                    {phonePrefixOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setPhonePrefixOpen(false)} />
                        <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 whitespace-nowrap">
                          {PHONE_PREFIXES.map((p) => (
                            <button
                              key={p.code}
                              type="button"
                              onClick={() => { setPhonePrefix(p.prefix); setPhonePrefixOpen(false); }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${
                                phonePrefix === p.prefix
                                  ? 'text-[#1A1A1A] font-semibold bg-[#F5F5F5]'
                                  : 'text-[#6B7280] hover:bg-[#F5F5F5]'
                              }`}
                            >
                              <span className="text-[15px]">{p.flag}</span>
                              <span>{p.prefix}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="621 000 000"
                    className="flex-1 h-10 px-3 bg-[#F5F5F5] rounded-lg text-[13px] text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1A1A1A]/10"
                    autoFocus
                  />
                </div>
                {error && <p className="text-[12px] text-red-600 mb-2">{error}</p>}
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-4 bg-[#1A1A1A] hover:bg-[#333] disabled:opacity-50 text-white text-[12px] font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Enregistrer
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <span className="text-[13px] text-[#6B7280] flex-shrink-0">Téléphone</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[13px] font-medium text-[#1A1A1A] truncate">{customer.phone || '—'}</span>
                  <button onClick={() => startEdit('phone')} className="w-7 h-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors flex-shrink-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Password */}
            {editing === 'password' ? (
              <form onSubmit={handleSave} className="px-4 py-3.5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-semibold text-[#1A1A1A]">Mot de passe</span>
                  <button type="button" onClick={cancelEdit} className="w-7 h-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative mb-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="w-full h-10 px-3 pr-10 bg-[#F5F5F5] rounded-lg text-[13px] text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1A1A1A]/10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  className="w-full h-10 px-3 bg-[#F5F5F5] rounded-lg text-[13px] text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 mb-2"
                />
                {error && <p className="text-[12px] text-red-600 mb-2">{error}</p>}
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-4 bg-[#1A1A1A] hover:bg-[#333] disabled:opacity-50 text-white text-[12px] font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Modifier le mot de passe
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <span className="text-[13px] text-[#6B7280] flex-shrink-0">Mot de passe</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[13px] font-medium text-[#1A1A1A]">••••••••</span>
                  <button onClick={() => startEdit('password')} className="w-7 h-7 flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors flex-shrink-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Member since (read-only) */}
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <span className="text-[13px] text-[#6B7280] flex-shrink-0">Membre depuis</span>
              <span className="text-[13px] font-medium text-[#1A1A1A] truncate text-right">{memberSince}</span>
            </div>
          </div>
        </div>

        {/* Pro / Business section */}
        {(() => {
          const vatNumber = proStatus?.vatNumber || vatInfo.vatNumber || null;
          const companyName = proStatus?.companyName || vatInfo.companyName || customer.defaultAddress?.company || null;
          const countryCode = proStatus?.countryCode || vatInfo.countryCode || null;
          const showProSection = hasProInfo || vatNumber || companyName;

          if (showProSection) {
            return (
              <div className="mb-6">
                <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Informations professionnelles</p>
                <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden">
                  {/* Status */}
                  {hasPro && (
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
                  )}
                  {companyName && (
                    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                      <span className="text-[13px] text-[#6B7280] flex-shrink-0">Entreprise</span>
                      <span className="text-[13px] font-medium text-[#1A1A1A] text-right truncate">{companyName}</span>
                    </div>
                  )}
                  {vatNumber && (
                    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                      <span className="text-[13px] text-[#6B7280] flex-shrink-0">N° TVA</span>
                      <span className="text-[13px] font-medium text-[#1A1A1A] font-mono truncate">{vatNumber}</span>
                    </div>
                  )}
                  {countryCode && (
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <span className="text-[13px] text-[#6B7280]">Pays TVA</span>
                      <span className="text-[13px] font-medium text-[#1A1A1A]">{countryCode}</span>
                    </div>
                  )}
                  {/* Reverse charge info */}
                  {vatInfo.reverseCharge && (
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <span className="text-[13px] text-[#6B7280]">Régime TVA</span>
                      <span className="text-[13px] font-medium text-emerald-600">Autoliquidation</span>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Become pro CTA for non-pro users
          if (proStatus !== null) {
            return (
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
            );
          }

          return null;
        })()}
      </main>
    </div>
  );
}
