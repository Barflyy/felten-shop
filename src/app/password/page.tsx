'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    const res = await fetch('/api/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[380px] text-center">
        {/* Logo */}
        <div className="mb-10">
          <span
            className="text-[1.6rem] tracking-tight leading-none"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="font-black text-[#1A1A1A] underline decoration-[#DB021D] decoration-2 underline-offset-2">
              FELTEN
            </span>
            <span className="font-normal text-[#1A1A1A]"> SHOP</span>
          </span>
        </div>

        <h1 className="text-[20px] font-bold text-[#1A1A1A] mb-2">
          Ouverture prochainement
        </h1>
        <p className="text-[14px] text-[#6B7280] mb-8">
          Entrez le mot de passe pour accéder à la boutique.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Mot de passe"
              className={`w-full h-12 px-4 bg-[#F5F5F5] rounded-lg text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none focus:ring-2 transition-all ${
                error ? 'ring-2 ring-red-300 focus:ring-red-300' : 'focus:ring-[#1A1A1A]/10'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-[12px] text-red-600 mt-1.5 text-left">Mot de passe incorrect.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-12 bg-[#1A1A1A] hover:bg-[#333] disabled:opacity-50 text-white text-[14px] font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Vérification...' : 'Entrer'}
          </button>
        </form>

        <p className="text-[12px] text-[#9CA3AF] mt-10">
          Revendeur agréé Milwaukee — Luxembourg
        </p>
      </div>
    </div>
  );
}
