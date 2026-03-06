import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// Types pour les données de facture
export interface InvoiceLineItem {
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku?: string;
}

export interface InvoiceData {
  // Infos commande
  orderNumber: string;
  orderDate: string;

  // Client
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  customerVatNumber?: string;
  billingAddress: {
    address1?: string;
    address2?: string;
    city?: string;
    zip?: string;
    country?: string;
    phone?: string;
  };

  // Produits
  lineItems: InvoiceLineItem[];

  // Livraison
  shippingTitle?: string;
  shippingPrice: number;

  // Totaux
  subtotalHT: number;
  vatRate: number; // 0.17 for 17%, 0 for exempt
  vatAmount: number;
  totalTTC: number;

  // Statut TVA
  isTaxExempt: boolean;
}

// Styles PDF (Noir & Blanc, minimaliste)
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
  },
  logoSubtitle: {
    fontSize: 8,
    color: '#666666',
    marginTop: 2,
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 9,
    color: '#333333',
    lineHeight: 1.4,
  },

  // Invoice title
  invoiceTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // Info section
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoBlock: {
    width: '48%',
  },
  infoLabel: {
    fontSize: 8,
    color: '#666666',
    textTransform: 'uppercase',
    marginBottom: 5,
    letterSpacing: 1,
  },
  infoContent: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#000000',
  },
  infoBold: {
    fontFamily: 'Helvetica-Bold',
  },
  vatBadge: {
    marginTop: 5,
    fontSize: 8,
    color: '#666666',
    fontStyle: 'italic',
  },

  // Table
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    color: '#FFFFFF',
    padding: 8,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    padding: 10,
    fontSize: 9,
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  colQty: { width: '10%', textAlign: 'center' },
  colDesc: { width: '50%' },
  colUnit: { width: '20%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },

  // Totals
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  totalsBox: {
    width: '45%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 10,
    color: '#333333',
  },
  totalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  totalRowFinal: {
    backgroundColor: '#000000',
    marginTop: 5,
  },
  totalLabelFinal: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
  },
  totalValueFinal: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
  },
  vatExemptNote: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'right',
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
  vatRequired: {
    color: '#CC0000',
    fontFamily: 'Helvetica-Bold',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 1.6,
  },
  footerBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
  },
  thankYou: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
  },
});

// Formatage prix
const formatPrice = (amount: number): string => {
  return amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' €';
};

// Formatage date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Composant Facture PDF
export const InvoicePDF: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>FELTEN SHOP</Text>
          <Text style={styles.logoSubtitle}>Outillage Professionnel Milwaukee</Text>
        </View>
        <View style={styles.companyInfo}>
          <Text>Felten Shop SPRL</Text>
          <Text>Rue de Bruxelles 19</Text>
          <Text>6760 Virton, Belgique</Text>
          <Text>TVA: BE0795.434.203</Text>
          <Text>contact@shopfelten.com</Text>
        </View>
      </View>

      {/* Titre Facture */}
      <Text style={styles.invoiceTitle}>Facture</Text>

      {/* Infos Facture & Client */}
      <View style={styles.infoSection}>
        {/* Infos Facture */}
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Informations Facture</Text>
          <View style={styles.infoContent}>
            <Text>
              <Text style={styles.infoBold}>N° Facture : </Text>
              {data.orderNumber}
            </Text>
            <Text>
              <Text style={styles.infoBold}>Date : </Text>
              {formatDate(data.orderDate)}
            </Text>
          </View>
        </View>

        {/* Infos Client */}
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Facturer à</Text>
          <View style={styles.infoContent}>
            {/* Company name (if B2B) */}
            {data.customerCompany && (
              <Text style={styles.infoBold}>{data.customerCompany}</Text>
            )}

            {/* Customer name */}
            {data.customerName && <Text>{data.customerName}</Text>}

            {/* Full address */}
            {data.billingAddress.address1 && (
              <Text>{data.billingAddress.address1}</Text>
            )}
            {data.billingAddress.address2 && (
              <Text>{data.billingAddress.address2}</Text>
            )}
            {(data.billingAddress.zip || data.billingAddress.city) && (
              <Text>
                {[data.billingAddress.zip, data.billingAddress.city]
                  .filter(Boolean)
                  .join(' ')}
              </Text>
            )}
            {data.billingAddress.country && (
              <Text>{data.billingAddress.country}</Text>
            )}

            {/* Phone */}
            {data.billingAddress.phone && (
              <Text>Tél: {data.billingAddress.phone}</Text>
            )}

            {/* Email */}
            <Text>{data.customerEmail}</Text>

            {/* VAT Number - REQUIRED for tax exempt sales */}
            {data.customerVatNumber ? (
              <Text style={styles.vatBadge}>
                N° TVA Intracommunautaire : {data.customerVatNumber}
              </Text>
            ) : data.isTaxExempt ? (
              <Text style={[styles.vatBadge, styles.vatRequired]}>
                N° TVA : Non renseigné (requis pour exonération)
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Tableau Produits */}
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.colQty}>Qté</Text>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colUnit}>Prix Unit. HT</Text>
          <Text style={styles.colTotal}>Total HT</Text>
        </View>

        {/* Lignes produits */}
        {data.lineItems.map((item, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index % 2 === 1 ? styles.tableRowAlt : {},
            ]}
          >
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colDesc}>{item.title}</Text>
            <Text style={styles.colUnit}>{formatPrice(item.unitPrice)}</Text>
            <Text style={styles.colTotal}>{formatPrice(item.totalPrice)}</Text>
          </View>
        ))}

        {/* Ligne livraison */}
        {data.shippingPrice > 0 && (
          <View style={[styles.tableRow, data.lineItems.length % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={styles.colQty}>1</Text>
            <Text style={styles.colDesc}>
              Frais de livraison{data.shippingTitle ? ` (${data.shippingTitle})` : ''}
            </Text>
            <Text style={styles.colUnit}>{formatPrice(data.shippingPrice)}</Text>
            <Text style={styles.colTotal}>{formatPrice(data.shippingPrice)}</Text>
          </View>
        )}
      </View>

      {/* Totaux */}
      <View style={styles.totalsSection}>
        <View style={styles.totalsBox}>
          {/* Sous-total HT */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total HT</Text>
            <Text style={styles.totalValue}>{formatPrice(data.subtotalHT)}</Text>
          </View>

          {/* TVA Line */}
          <View style={styles.totalRow}>
            {data.isTaxExempt ? (
              <>
                <Text style={styles.totalLabel}>TVA (Exonération)</Text>
                <Text style={styles.totalValue}>0,00 €</Text>
              </>
            ) : (
              <>
                <Text style={styles.totalLabel}>
                  TVA ({(data.vatRate * 100).toFixed(0)}%)
                </Text>
                <Text style={styles.totalValue}>{formatPrice(data.vatAmount)}</Text>
              </>
            )}
          </View>

          {/* Total TTC */}
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={styles.totalLabelFinal}>
              {data.isTaxExempt ? 'TOTAL' : 'TOTAL TTC'}
            </Text>
            <Text style={styles.totalValueFinal}>{formatPrice(data.totalTTC)}</Text>
          </View>

          {/* Legal mention for tax exemption */}
          {data.isTaxExempt && (
            <Text style={styles.vatExemptNote}>
              Exonération de TVA - Livraison intracommunautaire{'\n'}
              Art. 39bis du Code TVA belge / Art. 262 ter I du CGI{'\n'}
              Autoliquidation : le client est redevable de la TVA
            </Text>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.thankYou}>Merci pour votre confiance !</Text>
        <Text style={styles.footerText}>
          <Text style={styles.footerBold}>Felten Shop SPRL</Text> - BCE: 0795.434.203 - TVA: BE0795.434.203
        </Text>
        <Text style={styles.footerText}>
          Rue de Bruxelles 19, 6760 Virton, Belgique | IBAN: BE00 0000 0000 0000
        </Text>
        <Text style={styles.footerText}>
          SAV : sav@shopfelten.com | Contact : contact@shopfelten.com | www.shopfelten.com
        </Text>
        <Text style={styles.footerText}>
          Cette facture tient lieu de preuve d'achat et de bon de garantie (3 ans Milwaukee).
        </Text>
        <Text style={styles.footerText}>
          Paiement effectué - Facture acquittée
        </Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
