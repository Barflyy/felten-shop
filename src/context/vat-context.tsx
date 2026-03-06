'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// VAT rates by country (standard rates)
const VAT_RATES: Record<string, number> = {
  FR: 20,
  DE: 19,
  BE: 21,
  IT: 22,
  ES: 21,
  NL: 21,
  LU: 17,
  AT: 20,
  PT: 23,
  IE: 23,
  PL: 23,
  // Add more as needed
};

// EU countries eligible for reverse charge
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

// Seller's country (your business location - Belgique)
const SELLER_COUNTRY = 'BE';
const SELLER_VAT_RATE = VAT_RATES[SELLER_COUNTRY] || 21;

export type CustomerVATStatus =
  | 'particulier'      // No VAT number - pays full VAT (21% BE)
  | 'pro_local'        // Belgian professional - sees HT, pays TTC (21% BE)
  | 'pro_eu'           // EU professional (non-BE) - sees HT, pays HT (reverse charge)
  | 'pro_non_eu';      // Non-EU professional - export, no VAT

export interface VATInfo {
  status: CustomerVATStatus;
  vatNumber: string | null;
  countryCode: string | null;
  companyName: string | null;
  isValid: boolean;
  // Display settings
  displayMode: 'HT' | 'TTC';
  // What VAT rate applies at checkout
  applicableVATRate: number;
  // Does customer benefit from reverse charge?
  reverseCharge: boolean;
}

interface VATContextType {
  vatInfo: VATInfo;
  setVATFromValidation: (data: {
    valid: boolean;
    vatNumber: string;
    countryCode: string;
    companyName?: string;
  }) => void;
  clearVAT: () => void;
  // Price formatting helpers
  formatPrice: (htAmount: number) => string;
  formatPriceWithLabel: (htAmount: number) => { price: string; label: string };
  getDisplayPrice: (htAmount: number) => number;
  getCheckoutPrice: (htAmount: number) => number;
}

const defaultVATInfo: VATInfo = {
  status: 'particulier',
  vatNumber: null,
  countryCode: null,
  companyName: null,
  isValid: false,
  displayMode: 'TTC',
  applicableVATRate: SELLER_VAT_RATE,
  reverseCharge: false,
};

const VATContext = createContext<VATContextType | undefined>(undefined);

const VAT_STORAGE_KEY = 'shopfelten_vat_info';

export function VATProvider({ children }: { children: ReactNode }) {
  const [vatInfo, setVatInfo] = useState<VATInfo>(defaultVATInfo);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(VAT_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setVatInfo(parsed);
        } catch (e) {
          console.error('Error parsing stored VAT info:', e);
        }
      }
    }
  }, []);

  // Save to localStorage when vatInfo changes
  useEffect(() => {
    if (typeof window !== 'undefined' && vatInfo.vatNumber) {
      localStorage.setItem(VAT_STORAGE_KEY, JSON.stringify(vatInfo));
    }
  }, [vatInfo]);

  const setVATFromValidation = (data: {
    valid: boolean;
    vatNumber: string;
    countryCode: string;
    companyName?: string;
  }) => {
    if (!data.valid) {
      // Invalid VAT - treat as particulier
      setVatInfo({
        ...defaultVATInfo,
        vatNumber: data.vatNumber,
        isValid: false,
      });
      return;
    }

    const countryCode = data.countryCode.toUpperCase();
    const isEU = EU_COUNTRIES.includes(countryCode);
    const isSameCountry = countryCode === SELLER_COUNTRY;

    let status: CustomerVATStatus;
    let displayMode: 'HT' | 'TTC';
    let applicableVATRate: number;
    let reverseCharge: boolean;

    if (isSameCountry) {
      // Belgian professional - sees HT, pays TTC (BE VAT 21%)
      status = 'pro_local';
      displayMode = 'HT';
      applicableVATRate = SELLER_VAT_RATE;
      reverseCharge = false;
    } else if (isEU) {
      // EU professional (non-FR) - reverse charge applies
      status = 'pro_eu';
      displayMode = 'HT';
      applicableVATRate = 0; // No VAT - reverse charge
      reverseCharge = true;
    } else {
      // Non-EU - export, no VAT
      status = 'pro_non_eu';
      displayMode = 'HT';
      applicableVATRate = 0;
      reverseCharge = false;
    }

    setVatInfo({
      status,
      vatNumber: data.vatNumber,
      countryCode,
      companyName: data.companyName || null,
      isValid: true,
      displayMode,
      applicableVATRate,
      reverseCharge,
    });
  };

  const clearVAT = () => {
    setVatInfo(defaultVATInfo);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(VAT_STORAGE_KEY);
    }
  };

  // Calculate TTC from HT
  const calculateTTC = (htAmount: number, vatRate: number = SELLER_VAT_RATE): number => {
    return htAmount * (1 + vatRate / 100);
  };

  // Get the price to display (based on displayMode)
  const getDisplayPrice = (htAmount: number): number => {
    if (vatInfo.displayMode === 'HT') {
      return htAmount;
    }
    return calculateTTC(htAmount);
  };

  // Get the price at checkout (based on applicable VAT)
  const getCheckoutPrice = (htAmount: number): number => {
    if (vatInfo.applicableVATRate === 0) {
      return htAmount; // No VAT
    }
    return calculateTTC(htAmount, vatInfo.applicableVATRate);
  };

  // Format price for display
  const formatPrice = (htAmount: number): string => {
    const displayPrice = getDisplayPrice(htAmount);
    return displayPrice.toFixed(2).replace('.', ',');
  };

  // Format price with appropriate label
  const formatPriceWithLabel = (htAmount: number): { price: string; label: string } => {
    const displayPrice = getDisplayPrice(htAmount);
    const formattedPrice = displayPrice.toFixed(2).replace('.', ',');

    let label: string;
    switch (vatInfo.status) {
      case 'pro_local':
        label = 'HT'; // Display HT, BE VAT (21%) will be added at checkout
        break;
      case 'pro_eu':
        label = 'HT (Exonéré)'; // No VAT - reverse charge / autoliquidation
        break;
      case 'pro_non_eu':
        label = 'HT (Export)'; // No VAT - export
        break;
      case 'particulier':
      default:
        label = 'TTC';
        break;
    }

    return { price: formattedPrice, label };
  };

  return (
    <VATContext.Provider
      value={{
        vatInfo,
        setVATFromValidation,
        clearVAT,
        formatPrice,
        formatPriceWithLabel,
        getDisplayPrice,
        getCheckoutPrice,
      }}
    >
      {children}
    </VATContext.Provider>
  );
}

export function useVAT() {
  const context = useContext(VATContext);
  if (context === undefined) {
    throw new Error('useVAT must be used within a VATProvider');
  }
  return context;
}

// Helper hook for simple price display
export function useFormattedPrice(htAmount: number) {
  const { formatPriceWithLabel } = useVAT();
  return formatPriceWithLabel(htAmount);
}
