import { Footer } from '@/components/footer';
import Link from 'next/link';

export const metadata = {
  title: 'Mentions Légales — Felten Shop',
  description: 'Mentions légales du site Felten Shop, revendeur agréé Milwaukee en Belgique.',
};

export default function MentionsLegalesPage() {
  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Header band */}
        <div className="bg-[#1A1A1A] py-12">
          <div className="max-w-[900px] mx-auto px-6 lg:px-8">
            <nav aria-label="Fil d'Ariane" className="mb-4">
              <ol className="flex items-center gap-2 text-[12px] text-white/40">
                <li><Link href="/" className="hover:text-[#DB021D] transition-colors">Accueil</Link></li>
                <li className="text-white/20">/</li>
                <li className="text-white/70">Mentions légales</li>
              </ol>
            </nav>
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
              MENTIONS LÉGALES
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[900px] mx-auto px-6 lg:px-8 py-12 space-y-0">

          {/* Section 1 */}
          <section className="py-8 border-b border-[#F5F5F5]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#DB021D] mb-4">
              1. Éditeur du site
            </h2>
            <div className="prose prose-sm max-w-none text-[#1A1A1A]/70 leading-relaxed space-y-2">
              <p><strong className="text-[#1A1A1A] font-semibold">Raison sociale :</strong> Felten Shop SPRL</p>
              <p><strong className="text-[#1A1A1A] font-semibold">Pays d&apos;établissement :</strong> Belgique</p>
              <p><strong className="text-[#1A1A1A] font-semibold">Numéro BCE :</strong> BE 0XXX.XXX.XXX</p>
              <p><strong className="text-[#1A1A1A] font-semibold">Numéro de TVA :</strong> BE 0XXX.XXX.XXX</p>
              <p>
                <strong className="text-[#1A1A1A] font-semibold">Email :</strong>{' '}
                <a href="mailto:contact@shopfelten.be" className="text-[#DB021D] hover:underline">
                  contact@shopfelten.be
                </a>
              </p>
              <p>
                <strong className="text-[#1A1A1A] font-semibold">Téléphone :</strong>{' '}
                <a href="tel:+32XXXXXXXXX" className="text-[#DB021D] hover:underline">
                  +32 XX XXX XX XX
                </a>
              </p>
              <p><strong className="text-[#1A1A1A] font-semibold">Directeur de la publication :</strong> Gérant de Felten Shop SPRL</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="py-8 border-b border-[#F5F5F5]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#DB021D] mb-4">
              2. Hébergement
            </h2>
            <div className="text-[#1A1A1A]/70 leading-relaxed space-y-2 text-sm">
              <p><strong className="text-[#1A1A1A] font-semibold">Hébergeur :</strong> Vercel Inc.</p>
              <p><strong className="text-[#1A1A1A] font-semibold">Adresse :</strong> 340 Pine Street, Suite 600, San Francisco, CA 94104, USA</p>
              <p><strong className="text-[#1A1A1A] font-semibold">Site web :</strong>{' '}
                <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#DB021D] hover:underline">
                  vercel.com
                </a>
              </p>
              <p>
                L&apos;infrastructure de Vercel est conforme aux normes SOC 2 Type 2 et ISO 27001. Les données sont
                hébergées dans des centres de données géographiquement distribués avec des mesures de sécurité avancées.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="py-8 border-b border-[#F5F5F5]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#DB021D] mb-4">
              3. Propriété intellectuelle
            </h2>
            <div className="text-[#1A1A1A]/70 leading-relaxed text-sm space-y-3">
              <p>
                L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, sons, logiciels, etc.)
                est la propriété exclusive de Felten Shop SPRL ou de ses partenaires et est protégé par les lois
                belges et internationales relatives à la propriété intellectuelle.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication, adaptation ou exploitation de tout
                ou partie du contenu du site, par quelque moyen ou procédé que ce soit, est interdite sans
                l&apos;autorisation préalable et écrite de Felten Shop SPRL, sauf disposition légale contraire.
              </p>
              <p>
                La marque <strong className="text-[#1A1A1A]">Milwaukee Tool</strong> et ses visuels sont la
                propriété de Milwaukee Electric Tool Corporation. Felten Shop est un revendeur agréé et utilise
                ces éléments dans le cadre de son activité commerciale autorisée.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="py-8 border-b border-[#F5F5F5]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#DB021D] mb-4">
              4. Responsabilité
            </h2>
            <div className="text-[#1A1A1A]/70 leading-relaxed text-sm space-y-3">
              <p>
                Felten Shop SPRL s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées
                sur ce site. Toutefois, Felten Shop SPRL ne peut garantir l&apos;exactitude, la précision ou
                l&apos;exhaustivité des informations mises à disposition sur ce site.
              </p>
              <p>
                En conséquence, Felten Shop SPRL décline toute responsabilité pour toute imprécision, inexactitude
                ou omission portant sur des informations disponibles sur ce site, ainsi que pour tous dommages
                résultant d&apos;une intrusion frauduleuse d&apos;un tiers ayant entraîné une modification des informations
                mises à disposition sur le site.
              </p>
              <p>
                Ce site peut contenir des liens hypertextes vers d&apos;autres sites. Felten Shop SPRL ne dispose
                d&apos;aucun moyen pour contrôler les sites en connexion avec son site Internet et ne répond pas de
                la disponibilité de tels sites et sources externes.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="py-8 border-b border-[#F5F5F5]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#DB021D] mb-4">
              5. Données personnelles
            </h2>
            <div className="text-[#1A1A1A]/70 leading-relaxed text-sm space-y-3">
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez de droits
                sur vos données personnelles. Pour en savoir plus, consultez notre{' '}
                <Link href="/politique-de-confidentialite" className="text-[#DB021D] hover:underline">
                  Politique de confidentialité
                </Link>.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="py-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#DB021D] mb-4">
              6. Droit applicable
            </h2>
            <div className="text-[#1A1A1A]/70 leading-relaxed text-sm">
              <p>
                Les présentes mentions légales sont soumises au droit belge. En cas de litige, les tribunaux
                compétents seront ceux de l&apos;arrondissement judiciaire du siège social de Felten Shop SPRL.
              </p>
            </div>
          </section>

          <p className="text-[11px] text-[#1A1A1A]/30 pt-4 border-t border-[#F5F5F5]">
            Dernière mise à jour : janvier 2026
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
