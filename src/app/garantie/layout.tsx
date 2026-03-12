import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Garantie & SAV — Felten Shop | Revendeur Milwaukee Luxembourg',
  description: 'Garantie 3 ans sur tous les outils Milwaukee. SAV collecte & retour gratuit au Luxembourg. Service après-vente réactif.',
  alternates: { canonical: 'https://felten.shop/garantie' },
}

export default function GarantieLayout({ children }: { children: React.ReactNode }) {
  return children
}
