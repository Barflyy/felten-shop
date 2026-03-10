import { Metadata } from 'next'
import ServantConfigurator from '@/components/configurateur/ServantConfigurator'
import SiteHeader from '@/components/SiteHeader'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Configurateur de Servante | Shop Felten',
  description:
    'Personnalisez votre servante Milwaukee TOOLGUARD\u2122. Choisissez votre mod\u00e8le, ajoutez un coffre sup\u00e9rieur et configurez chaque tiroir avec les inserts de votre choix.',
}

export default function ConfigurateurServantePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ServantConfigurator />
      </main>
      <Footer />
    </>
  )
}
