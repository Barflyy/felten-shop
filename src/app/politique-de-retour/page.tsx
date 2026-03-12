import { Footer } from '@/components/footer';
import Link from 'next/link';
import { RotateCcw, CheckCircle, Clock, Mail } from 'lucide-react';

export const metadata = {
  title: 'Politique de retour — Felten Shop',
  description: 'Politique de retour et remboursement de Felten Shop, revendeur autorisé Milwaukee en Belgique.',
};

export default function PolitiqueRetourPage() {
  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Header band */}
        <div className="bg-[#1A1A1A] py-12">
          <div className="max-w-[900px] mx-auto px-6 lg:px-8">
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
              POLITIQUE DE RETOUR
            </h1>
          </div>
        </div>

        {/* Quick summary */}
        <div className="bg-[#F5F5F5] border-b border-gray-200">
          <div className="max-w-[900px] mx-auto px-6 lg:px-8 py-10">
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  icon: <RotateCcw className="w-6 h-6 text-[#DB021D]" strokeWidth={1.5} />,
                  title: '14 jours',
                  desc: 'Délai de rétractation légal à partir de la réception',
                },
                {
                  icon: <CheckCircle className="w-6 h-6 text-[#DB021D]" strokeWidth={1.5} />,
                  title: 'Produit intact',
                  desc: 'Non utilisé, dans son emballage d\'origine complet',
                },
                {
                  icon: <Clock className="w-6 h-6 text-[#DB021D]" strokeWidth={1.5} />,
                  title: 'Remboursement 14j',
                  desc: 'Après réception et vérification du retour',
                },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="mb-3">{item.icon}</div>
                  <p className="text-[14px] font-black text-[#1A1A1A] uppercase mb-1">{item.title}</p>
                  <p className="text-[13px] text-[#6B7280] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[900px] mx-auto px-6 lg:px-8 py-12 space-y-0">

          <section className="py-8 border-b border-[#F5F5F5]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#DB021D] mb-4">
              1. Droit de rétractation
            </h2>
            <div className="text-[#1A1A1A]/70 leading-relaxed text-sm space-y-3">
              <p>
                Conformément à la Directive européenne 2011/83/UE et à la législation belge, vous disposez
                d&apos;un délai de <strong className="text-[#1A1A1A]">14 jours calendaires</strong> à compter
                de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à
                justifier de motifs ni à payer de pénalités.
              </p>
              <p>
                Ce droit s&apos;applique aux <strong className="text-[#1A1A1A]">particuliers</strong> uniquement.
                Les professionnels achetant dans le cadre de leur activité ne bénéficient pas du droit de
                rétractation légal.
              </p>
            </div>
          </section>

          <section className="py-8 border-b border-[#F5F5F5]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#DB021D] mb-4">
              2. Conditions du retour
            </h2>
            <div className="text-[#1A1A1A]/70 leading-relaxed text-sm space-y-3">
              <p>Pour être accepté, le produit retourné doit :</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Être dans son emballage d&apos;origine, complet (accessoires, documentation, câbles, etc.)</li>
                <li>Ne pas avoir été utilisé (hors essai raisonnable pour évaluer le produit)</li>
                <li>Être en parfait état, sans dommage ni trace d&apos;usure</li>
                <li>Inclure la preuve d&apos;achat (numéro de commande)</li>
              </ul>
              <p>
                <strong className="text-[#1A1A1A]">Produits exclus du droit de rétractation :</strong>
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Produits personnalisés ou réalisés sur mesure</li>
                <li>Logiciels descellés</li>
                <li>Produits manifestement utilisés ou endommagés par l&apos;acheteur</li>
                <li>Consommables (lames, disques, accessoires d&apos;usure) déjà utilisés</li>
              </ul>
            </div>
          </section>

          <section className="py-8 border-b border-[#F5F5F5]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#DB021D] mb-4">
              3. Procédure de retour
            </h2>
            <div className="text-[#1A1A1A]/70 leading-relaxed text-sm space-y-3">
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>
                  Notifiez votre décision de rétractation <strong className="text-[#1A1A1A]">avant l&apos;expiration du délai de 14 jours</strong>{' '}
                  en nous contactant par email à{' '}
                  <a href="mailto:florian@felten.lu" className="text-[#DB021D] hover:underline">
                    florian@felten.lu
                  </a>{' '}
                  en indiquant votre numéro de commande et le(s) produit(s) concerné(s).
                </li>
                <li>
                  Nous vous communiquerons l&apos;adresse de retour et, le cas échéant, un bon de retour.
                </li>
                <li>
                  Renvoyez le produit dans les <strong className="text-[#1A1A1A]">14 jours</strong> suivant
                  votre notification, soigneusement emballé.
                </li>
                <li>
                  Après réception et vérification, nous procédons au remboursement dans un délai de{' '}
                  <strong className="text-[#1A1A1A]">14 jours</strong>.
                </li>
              </ol>
            </div>
          </section>

          <section className="py-8 border-b border-[#F5F5F5]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#DB021D] mb-4">
              4. Frais de retour
            </h2>
            <div className="text-[#1A1A1A]/70 leading-relaxed text-sm space-y-3">
              <p>
                Les frais de retour sont à la charge du Client, sauf dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Produit défectueux à réception</li>
                <li>Erreur de notre part (mauvais produit expédié)</li>
                <li>Produit endommagé lors du transport (sur présentation de photos)</li>
              </ul>
              <p>
                Dans ces cas, Felten Shop prend en charge les frais de retour et organisera la collecte ou
                vous fournira un bon de retour prépayé.
              </p>
            </div>
          </section>

          <section className="py-8 border-b border-[#F5F5F5]">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#DB021D] mb-4">
              5. Remboursement
            </h2>
            <div className="text-[#1A1A1A]/70 leading-relaxed text-sm space-y-3">
              <p>
                Le remboursement est effectué dans les <strong className="text-[#1A1A1A]">14 jours</strong>{' '}
                suivant la réception du retour, <strong className="text-[#1A1A1A]">sur le même moyen de
                paiement</strong> que celui utilisé lors de la commande (carte bancaire, Bancontact ou virement).
              </p>
              <p>
                Le montant remboursé inclut le prix du produit et les frais de livraison initiaux (hors
                frais de retour à la charge du Client).
              </p>
              <p>
                Si le produit retourné présente des traces d&apos;utilisation au-delà d&apos;un essai raisonnable,
                nous nous réservons le droit d&apos;effectuer une décote correspondant à la dépréciation constatée.
              </p>
            </div>
          </section>

          <section className="py-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#DB021D] mb-4">
              6. Contact SAV
            </h2>
            <div className="text-[#1A1A1A]/70 leading-relaxed text-sm">
              <p className="mb-4">
                Pour toute demande de retour ou question relative à la garantie, notre équipe est disponible :
              </p>
              <div className="bg-[#F5F5F5] rounded-2xl p-5 flex items-start gap-4">
                <Mail className="w-5 h-5 text-[#DB021D] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-[13px] font-bold text-[#1A1A1A] mb-1">
                    <a href="mailto:florian@felten.lu" className="text-[#DB021D] hover:underline">
                      florian@felten.lu
                    </a>
                  </p>
                  <p className="text-[12px] text-[#6B7280]">
                    Réponse sous 24–48h ouvrables. Mentionnez votre numéro de commande.
                  </p>
                </div>
              </div>
              <p className="mt-4">
                Voir aussi :{' '}
                <Link href="/garantie" className="text-[#DB021D] hover:underline">Garantie Milwaukee</Link>
                {' | '}
                <Link href="/cgv" className="text-[#DB021D] hover:underline">CGV — Article 6 Rétractation</Link>
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
