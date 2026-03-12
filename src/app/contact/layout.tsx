import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Felten Shop | Revendeur Milwaukee Luxembourg',
  description: 'Contactez Felten Shop, votre revendeur agréé Milwaukee au Luxembourg. Téléphone, email, WhatsApp. Lun-Ven 8h-18h.',
  alternates: { canonical: 'https://felten.shop/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
