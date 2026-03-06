'use client';

import { useVAT } from '@/context/vat-context';

interface PriceDisplayProps {
  /** Prix HT (hors taxes) depuis Shopify */
  priceHT: number;
  /** Afficher le label (HT/TTC) */
  showLabel?: boolean;
  /** Taille du texte */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Classe CSS additionnelle */
  className?: string;
  /** Afficher le prix barré (compareAt) */
  compareAtPriceHT?: number;
}

export function PriceDisplay({
  priceHT,
  showLabel = true,
  size = 'md',
  className = '',
  compareAtPriceHT,
}: PriceDisplayProps) {
  const { formatPriceWithLabel, getDisplayPrice } = useVAT();

  const { price, label } = formatPriceWithLabel(priceHT);
  const displayCompareAt = compareAtPriceHT ? getDisplayPrice(compareAtPriceHT) : null;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  };

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      {/* Compare at price (barré) */}
      {displayCompareAt && displayCompareAt > getDisplayPrice(priceHT) && (
        <span className="text-zinc-400 line-through text-sm">
          {displayCompareAt.toFixed(2).replace('.', ',')} €
        </span>
      )}

      {/* Main price */}
      <span className={`font-black text-[#DB021D] ${sizeClasses[size]}`}>
        {price} €
      </span>

      {/* Label */}
      {showLabel && (
        <span className="text-xs text-zinc-500 font-medium">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Composant simplifié pour afficher juste le prix formaté
 */
export function SimplePrice({ priceHT, className = '' }: { priceHT: number; className?: string }) {
  const { formatPrice, vatInfo } = useVAT();

  return (
    <span className={className}>
      {formatPrice(priceHT)} € {vatInfo.displayMode}
    </span>
  );
}

/**
 * Badge affichant le statut TVA actuel du client
 */
export function VATStatusBadge() {
  const { vatInfo } = useVAT();

  if (vatInfo.status === 'particulier') {
    return null; // Don't show badge for regular customers
  }

  const statusConfig = {
    pro_local: {
      label: 'Pro LU',
      sublabel: 'TVA 17%',
      color: 'bg-blue-100 text-blue-700',
    },
    pro_eu: {
      label: 'Pro UE',
      sublabel: 'Exonéré TVA',
      color: 'bg-green-100 text-green-700',
    },
    pro_non_eu: {
      label: 'Export',
      sublabel: 'Hors TVA',
      color: 'bg-purple-100 text-purple-700',
    },
  };

  const config = statusConfig[vatInfo.status as keyof typeof statusConfig];
  if (!config) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.color}`}>
      <span>{config.label}</span>
      <span className="opacity-70">•</span>
      <span className="opacity-70">{config.sublabel}</span>
    </div>
  );
}

/**
 * Récapitulatif TVA pour le panier/checkout
 */
export function VATSummary({ subtotalHT }: { subtotalHT: number }) {
  const { vatInfo, getDisplayPrice, getCheckoutPrice } = useVAT();

  const displaySubtotal = getDisplayPrice(subtotalHT);
  const checkoutTotal = getCheckoutPrice(subtotalHT);
  const vatAmount = checkoutTotal - subtotalHT;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-zinc-600">Sous-total HT</span>
        <span className="font-semibold">{subtotalHT.toFixed(2).replace('.', ',')} €</span>
      </div>

      {vatInfo.applicableVATRate > 0 ? (
        <div className="flex justify-between">
          <span className="text-zinc-600">TVA ({vatInfo.applicableVATRate}%)</span>
          <span className="font-semibold">{vatAmount.toFixed(2).replace('.', ',')} €</span>
        </div>
      ) : (
        <div className="flex justify-between text-green-600">
          <span>TVA</span>
          <span className="font-semibold">
            {vatInfo.reverseCharge ? 'Autoliquidation' : 'Exonéré'}
          </span>
        </div>
      )}

      <div className="flex justify-between pt-2 border-t border-zinc-200">
        <span className="font-bold text-[#1A1A1A]">Total</span>
        <span className="font-black text-lg text-[#1A1A1A]">
          {checkoutTotal.toFixed(2).replace('.', ',')} €
          <span className="text-xs font-normal text-zinc-500 ml-1">
            {vatInfo.applicableVATRate > 0 ? 'TTC' : 'HT'}
          </span>
        </span>
      </div>

      {vatInfo.reverseCharge && (
        <p className="text-xs text-zinc-500 italic mt-2">
          TVA non applicable - Article 196 de la Directive 2006/112/CE (Autoliquidation)
        </p>
      )}
    </div>
  );
}
